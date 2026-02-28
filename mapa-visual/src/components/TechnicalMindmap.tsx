import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Background,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { ArchitectureSnapshotV1 } from '@/types/architecture';
import {
  buildMindmapLayout,
  type L4LayoutVariant,
  type TechnicalLevel,
  type TechnicalOrientation,
} from '@/components/mindmapLayout';
import {
  buildHitlLayoutMetrics,
  buildHitlSummary,
  compareCheckpoints,
  createHitlTraceEvent,
  formatNodePositions,
  formatTraceEventForConsole,
  toNodePositionArray,
  toNodePositionMap,
  type HitlCheckpointV2,
  type HitlPersistedStateV2,
  type HitlTraceEventTypeV2,
  type HitlTraceEventV2,
} from '@/components/hitlMetrics';

export type { L4LayoutVariant, TechnicalLevel, TechnicalOrientation } from '@/components/mindmapLayout';

interface TechnicalMindmapProps {
  snapshot: ArchitectureSnapshotV1;
  level: TechnicalLevel;
  orientation: TechnicalOrientation;
  l4Variant?: L4LayoutVariant;
}

interface Point {
  x: number;
  y: number;
}

type OrientationPositionMemory = Record<TechnicalOrientation, Record<TechnicalLevel, Record<string, Point>>>;

const FIT_VIEW_OPTIONS = {
  padding: 0.22,
  minZoom: 0.4,
  maxZoom: 1.35,
  duration: 320,
};

const TRACE_LIMIT = 100;
const EDGE_PAGE_SIZE = 8;
const STORAGE_PREFIX = 'mapa_visual_hitl_v4::';
const STORAGE_PREFIX_FAMILY = 'mapa_visual_hitl_';
const RESET_PERSISTENCE_ON_BOOT = true;

function canUseLocalStorage() {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const probe = '__mapa_hitl_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

function readPersistedState(storageKey: string): HitlPersistedStateV2 | null {
  if (!canUseLocalStorage()) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as HitlPersistedStateV2;
    if (parsed.version !== 'HITL-V2') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writePersistedState(storageKey: string, state: HitlPersistedStateV2) {
  if (!canUseLocalStorage()) {
    return;
  }
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Ignore quota/unavailable storage errors in degraded mode.
  }
}

export function TechnicalMindmap({
  snapshot,
  level,
  orientation,
  l4Variant = 'top-down',
}: TechnicalMindmapProps) {
  const effectiveL4Variant: L4LayoutVariant = orientation === 'horizontal' ? 'top-down' : l4Variant;
  const graph = useMemo(
    () => buildMindmapLayout(snapshot, level, orientation, { l4Variant: effectiveL4Variant }),
    [snapshot, level, orientation, effectiveL4Variant],
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(graph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges);
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance<Node, Edge> | null>(null);
  const [fitViewRequestId, setFitViewRequestId] = useState(0);
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [traceEvents, setTraceEvents] = useState<HitlTraceEventV2[]>([]);
  const [checkpointDE, setCheckpointDE] = useState<HitlCheckpointV2 | null>(null);
  const [checkpointPARA, setCheckpointPARA] = useState<HitlCheckpointV2 | null>(null);
  const [edgePage, setEdgePage] = useState(0);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [bootReady, setBootReady] = useState(!RESET_PERSISTENCE_ON_BOOT);
  const positionMemoryRef = useRef<OrientationPositionMemory>({
    horizontal: { L1: {}, L2: {}, L3: {} },
    vertical: { L1: {}, L2: {}, L3: {} },
  });
  const didBootstrapResetRef = useRef(false);
  const persistedSnapshotRef = useRef<HitlPersistedStateV2 | null>(null);
  const latestNodesRef = useRef<Node[]>(nodes);
  const storageKey = useMemo(
    () => `${STORAGE_PREFIX}${orientation}::${level}::${effectiveL4Variant}`,
    [orientation, level, effectiveL4Variant],
  );

  const layoutMetrics = useMemo(() => buildHitlLayoutMetrics(nodes, edges, graph.meta), [nodes, edges, graph.meta]);
  const livePositionState = useMemo(() => formatNodePositions(toNodePositionArray(nodes)), [nodes]);
  const traceConsoleText = useMemo(
    () => traceEvents.map((event) => formatTraceEventForConsole(event)).join('\n\n--------------------\n\n'),
    [traceEvents],
  );
  const edgeRows = useMemo(() => edges.map((edge) => `${edge.source} -> ${edge.target}`), [edges]);
  const edgePageCount = Math.max(1, Math.ceil(edgeRows.length / EDGE_PAGE_SIZE));
  const pagedEdgeRows = useMemo(() => {
    const start = edgePage * EDGE_PAGE_SIZE;
    return edgeRows.slice(start, start + EDGE_PAGE_SIZE);
  }, [edgePage, edgeRows]);
  const diffResult = useMemo(() => compareCheckpoints(checkpointDE, checkpointPARA), [checkpointDE, checkpointPARA]);
  const attentionEvents = useMemo(() => traceEvents.filter((event) => event.attention).length, [traceEvents]);
  const viewportHeightRem = useMemo(() => {
    if (level === 'L3' && orientation === 'horizontal') {
      return 58;
    }
    if (level === 'L3') {
      return 56;
    }
    if (level === 'L2' && orientation === 'horizontal') {
      return 52;
    }
    if (level === 'L2') {
      return 50;
    }
    return 44;
  }, [level, orientation]);
  const carryoverSummary = useMemo(() => {
    const lastAutoLoad = traceEvents.find((event) => event.eventType === 'AutoLoad');
    if (!lastAutoLoad?.details) {
      return 'n/a';
    }
    const carryoverChunk = lastAutoLoad.details
      .split('|')
      .map((chunk) => chunk.trim())
      .find((chunk) => chunk.startsWith('carryover='));
    return carryoverChunk ?? 'n/a';
  }, [traceEvents]);

  const appendTrace = useCallback(
    (eventType: HitlTraceEventTypeV2, currentNodes: Node[], attention = false, details?: string) => {
      const event = createHitlTraceEvent(eventType, level, orientation, currentNodes, attention, details);
      setTraceEvents((prev) => [event, ...prev].slice(0, TRACE_LIMIT));
    },
    [level, orientation],
  );

  function toMetricsDetails() {
    return `overlap=${layoutMetrics.nodeOverlapCount} | crossings=${layoutMetrics.edgeCrossingEstimate} | laneViolations=${layoutMetrics.laneViolationCount} | density=${layoutMetrics.clusterDensityScore}`;
  }

  function createCheckpoint(label: 'DE' | 'PARA', currentNodes: Node[]): HitlCheckpointV2 {
    return {
      label,
      nodes: toNodePositionArray(currentNodes),
      metrics: buildHitlLayoutMetrics(currentNodes, edges, graph.meta),
    };
  }

  useEffect(() => {
    if (!RESET_PERSISTENCE_ON_BOOT || didBootstrapResetRef.current) {
      setBootReady(true);
      return;
    }
    didBootstrapResetRef.current = true;
    if (canUseLocalStorage()) {
      Object.keys(window.localStorage)
        .filter((key) => key.startsWith(STORAGE_PREFIX_FAMILY))
        .forEach((key) => window.localStorage.removeItem(key));
    }
    positionMemoryRef.current = {
      horizontal: { L1: {}, L2: {}, L3: {} },
      vertical: { L1: {}, L2: {}, L3: {} },
    };
    persistedSnapshotRef.current = null;
    setBootReady(true);
  }, []);

  useEffect(() => {
    if (!bootReady) {
      return;
    }
    const persisted = readPersistedState(storageKey);
    persistedSnapshotRef.current = persisted;
    setTraceEvents(persisted?.trace?.slice(0, TRACE_LIMIT) ?? []);
    setCheckpointDE(persisted?.checkpointDE ?? null);
    setCheckpointPARA(persisted?.checkpointPARA ?? null);
    setEdgePage(0);
    setCopyStatus('idle');
  }, [bootReady, storageKey]);

  useEffect(() => {
    if (!bootReady) {
      return;
    }
    const persistedPositions = persistedSnapshotRef.current?.positions ?? {};
    const allowCrossLevelCarryover = false;
    const persistedL3Positions: Record<string, Point> = {};
    const checkpointParaPositions: Record<string, Point> = {};
    let reusedPersisted = 0;
    let reusedL3 = 0;
    let reusedL3Checkpoint = 0;
    const hydratedNodes = graph.nodes.map((node) => {
      if (allowCrossLevelCarryover && level !== 'L3') {
        const fromL3Checkpoint = checkpointParaPositions[node.id];
        if (fromL3Checkpoint) {
          reusedL3Checkpoint += 1;
          return {
            ...node,
            position: fromL3Checkpoint,
          };
        }
        const fromL3 = persistedL3Positions[node.id];
        if (fromL3) {
          reusedL3 += 1;
          return {
            ...node,
            position: { x: fromL3.x, y: fromL3.y },
          };
        }
      }

      const persistedPosition = persistedPositions[node.id];
      if (persistedPosition) {
        reusedPersisted += 1;
        return {
          ...node,
          position: { x: persistedPosition.x, y: persistedPosition.y },
        };
      }
      return node;
    });

    const loadMetrics = buildHitlLayoutMetrics(hydratedNodes, graph.edges, graph.meta);
    setNodes(hydratedNodes);
    setEdges(graph.edges);
    setFitViewRequestId((prev) => prev + 1);
    appendTrace(
      'AutoLoad',
      hydratedNodes,
      false,
      `carryover=${reusedPersisted + reusedL3 + reusedL3Checkpoint}/${
        hydratedNodes.length
      } | canonicalV1=0 | canonicalCarryover=disabled | persisted=${reusedPersisted} | session=0 | fromL3=${reusedL3} | fromL3Checkpoint=${reusedL3Checkpoint} | crossLevelCarryover=disabled | l3Canonical=layout-physics | horizontalProfile=${
        orientation === 'horizontal' ? 'layout-current' : 'n/a'
      } | l4Variant=${effectiveL4Variant} | fitView=queued | viewportHeight=${viewportHeightRem}rem`,
    );
    appendTrace(
      'CollisionScan',
      hydratedNodes,
      loadMetrics.nodeOverlapCount > 0,
      `overlap=${loadMetrics.nodeOverlapCount} | crossings=${loadMetrics.edgeCrossingEstimate}`,
    );
    appendTrace(
      'LaneValidation',
      hydratedNodes,
      loadMetrics.laneViolationCount > 0,
      `laneViolations=${loadMetrics.laneViolationCount} | density=${loadMetrics.clusterDensityScore}`,
    );

    if (!persistedSnapshotRef.current?.checkpointDE) {
      const autoCheckpoint = createCheckpoint('DE', hydratedNodes);
      setCheckpointDE(autoCheckpoint);
      appendTrace('CheckpointDE', hydratedNodes, false, 'auto-baseline=initial-load');
    }
  }, [appendTrace, bootReady, effectiveL4Variant, graph, orientation, setEdges, setNodes, viewportHeightRem]);

  useEffect(() => {
    latestNodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    if (!flowInstance || fitViewRequestId === 0) {
      return;
    }
    const timer = window.setTimeout(() => {
      void flowInstance.fitView(FIT_VIEW_OPTIONS);
      appendTrace('AutoFitView', latestNodesRef.current, false, `request=${fitViewRequestId}`);
    }, 80);
    return () => window.clearTimeout(timer);
  }, [appendTrace, flowInstance, fitViewRequestId]);

  useEffect(() => {
    setEdgePage((current) => Math.min(current, Math.max(0, edgePageCount - 1)));
  }, [edgePageCount]);

  useEffect(() => {
    if (!bootReady) {
      return;
    }
    const persistedState: HitlPersistedStateV2 = {
      version: 'HITL-V2',
      level,
      orientation,
      positions: toNodePositionMap(nodes),
      trace: traceEvents.slice(0, TRACE_LIMIT),
      checkpointDE: checkpointDE ?? undefined,
      checkpointPARA: checkpointPARA ?? undefined,
    };
    writePersistedState(storageKey, persistedState);
    persistedSnapshotRef.current = persistedState;
  }, [bootReady, checkpointDE, checkpointPARA, level, nodes, orientation, storageKey, traceEvents]);

  function handleCheckpointDE() {
    const checkpoint = createCheckpoint('DE', nodes);
    setCheckpointDE(checkpoint);
    appendTrace('CheckpointDE', nodes, false, toMetricsDetails());
  }

  function handlePositionLog() {
    const checkpoint = createCheckpoint('PARA', nodes);
    setCheckpointPARA(checkpoint);
    appendTrace('ManualPositionLog', nodes, true, 'operator-intervention');
    appendTrace('CheckpointPARA', nodes, true, toMetricsDetails());
  }

  function handleClearTrace() {
    setTraceEvents([]);
  }

  function handleResetPersistence() {
    if (canUseLocalStorage()) {
      Object.keys(window.localStorage)
        .filter((key) => key.startsWith(STORAGE_PREFIX_FAMILY))
        .forEach((key) => window.localStorage.removeItem(key));
    }
    positionMemoryRef.current = {
      horizontal: { L1: {}, L2: {}, L3: {} },
      vertical: { L1: {}, L2: {}, L3: {} },
    };
    persistedSnapshotRef.current = null;
    setTraceEvents([]);
    setCheckpointDE(null);
    setCheckpointPARA(null);
    setNodes(graph.nodes);
    setEdges(graph.edges);
    setFitViewRequestId((prev) => prev + 1);
  }

  function handleExportJson() {
    const payload = {
      version: 'HITL-V2',
      exportedAt: new Date().toISOString(),
      level,
      orientation,
      metrics: layoutMetrics,
      diff: diffResult,
      checkpointDE,
      checkpointPARA,
      trace: traceEvents.slice(0, TRACE_LIMIT),
      positions: toNodePositionMap(nodes),
      edges: edgeRows,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hitl-${level}-${orientation}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function handleCopySummary() {
    const summary = buildHitlSummary({
      generatedAt: new Date().toISOString(),
      level,
      orientation,
      carryover: carryoverSummary,
      metrics: layoutMetrics,
      diff: diffResult,
      traceCount: traceEvents.length,
      attentionEvents,
    });
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      setCopyStatus('error');
      return;
    }
    try {
      await navigator.clipboard.writeText(summary);
      setCopyStatus('copied');
      window.setTimeout(() => setCopyStatus('idle'), 1800);
    } catch {
      setCopyStatus('error');
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/80 bg-white/70 px-3 py-2">
        <p className="text-xs/5 font-semibold tracking-[0.08em] text-muted-foreground uppercase">HITL Debug Mode</p>
        <button
          type="button"
          className={`rounded-lg px-3 py-1.5 text-xs/5 font-semibold tracking-[0.06em] uppercase transition ${debugEnabled ? 'bg-accent text-white' : 'border border-white/80 bg-white/80 text-foreground hover:bg-white'}`}
          onClick={() => setDebugEnabled((prev) => !prev)}
        >
          {debugEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      <div
        className="relative overflow-hidden rounded-xl border border-white/80 bg-white/70"
        style={{ height: `${viewportHeightRem}rem` }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onInit={setFlowInstance}
          minZoom={0.3}
          maxZoom={1.9}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
          panOnDrag
          defaultEdgeOptions={{ type: 'smoothstep', animated: false }}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={24} size={1} color="rgba(23,30,45,0.08)" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      {debugEnabled ? (
        <section className="space-y-3 rounded-xl border border-white/80 bg-white/70 p-3">
          <header className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm/6 font-semibold tracking-[0.06em] text-foreground uppercase">
              HITL Console - Trace Dialog
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-white/80 bg-white/80 px-3 py-1.5 text-xs/5 font-semibold tracking-[0.06em] text-foreground uppercase transition hover:bg-white"
                onClick={handleCheckpointDE}
              >
                Checkpoint DE
              </button>
              <button
                type="button"
                className="rounded-lg bg-accent px-3 py-1.5 text-xs/5 font-semibold tracking-[0.06em] text-white uppercase transition hover:brightness-105"
                onClick={handlePositionLog}
              >
                Position Log
              </button>
              <button
                type="button"
                className="rounded-lg border border-white/80 bg-white/80 px-3 py-1.5 text-xs/5 font-semibold tracking-[0.06em] text-foreground uppercase transition hover:bg-white"
                onClick={handleClearTrace}
              >
                Clear
              </button>
              <button
                type="button"
                className="rounded-lg border border-white/80 bg-white/80 px-3 py-1.5 text-xs/5 font-semibold tracking-[0.06em] text-foreground uppercase transition hover:bg-white"
                onClick={handleResetPersistence}
              >
                Reset Persistência
              </button>
              <button
                type="button"
                className="rounded-lg border border-white/80 bg-white/80 px-3 py-1.5 text-xs/5 font-semibold tracking-[0.06em] text-foreground uppercase transition hover:bg-white"
                onClick={handleExportJson}
              >
                Export HITL JSON
              </button>
              <button
                type="button"
                className="rounded-lg border border-white/80 bg-white/80 px-3 py-1.5 text-xs/5 font-semibold tracking-[0.06em] text-foreground uppercase transition hover:bg-white"
                onClick={() => void handleCopySummary()}
              >
                Copy HITL Summary
              </button>
            </div>
          </header>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-lg border border-white/80 bg-white/80 p-2">
              <p className="text-[11px]/5 font-semibold tracking-[0.08em] text-muted-foreground uppercase">Node overlap</p>
              <p className="text-sm/6 font-semibold text-foreground">{layoutMetrics.nodeOverlapCount}</p>
            </article>
            <article className="rounded-lg border border-white/80 bg-white/80 p-2">
              <p className="text-[11px]/5 font-semibold tracking-[0.08em] text-muted-foreground uppercase">Edge crossings</p>
              <p className="text-sm/6 font-semibold text-foreground">{layoutMetrics.edgeCrossingEstimate}</p>
            </article>
            <article className="rounded-lg border border-white/80 bg-white/80 p-2">
              <p className="text-[11px]/5 font-semibold tracking-[0.08em] text-muted-foreground uppercase">Lane violations</p>
              <p className="text-sm/6 font-semibold text-foreground">{layoutMetrics.laneViolationCount}</p>
            </article>
            <article className="rounded-lg border border-white/80 bg-white/80 p-2">
              <p className="text-[11px]/5 font-semibold tracking-[0.08em] text-muted-foreground uppercase">Cluster density</p>
              <p className="text-sm/6 font-semibold text-foreground">{layoutMetrics.clusterDensityScore}</p>
            </article>
          </div>

          <div className="rounded-lg border border-white/80 bg-white/80 p-2">
            <header className="flex items-center justify-between">
              <p className="text-[11px]/5 font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Arestas ativas
              </p>
              <p className="text-[11px]/5 text-muted-foreground">
                Página {edgePage + 1}/{edgePageCount}
              </p>
            </header>
            <pre className="mt-1 max-h-28 overflow-auto whitespace-pre-wrap font-mono text-[11px]/4 text-foreground">
              {pagedEdgeRows.length > 0 ? pagedEdgeRows.join('\n') : 'Sem arestas.'}
            </pre>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                className="rounded-md border border-white/80 bg-white px-2 py-1 text-[10px]/4 font-semibold uppercase disabled:opacity-50"
                onClick={() => setEdgePage((prev) => Math.max(0, prev - 1))}
                disabled={edgePage === 0}
              >
                Prev
              </button>
              <button
                type="button"
                className="rounded-md border border-white/80 bg-white px-2 py-1 text-[10px]/4 font-semibold uppercase disabled:opacity-50"
                onClick={() => setEdgePage((prev) => Math.min(edgePageCount - 1, prev + 1))}
                disabled={edgePage >= edgePageCount - 1}
              >
                Next
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-white/80 bg-white/80 p-2">
            <p className="text-[11px]/5 font-semibold tracking-[0.08em] text-muted-foreground uppercase">Compare DE / PARA</p>
            <p className="text-[11px]/5 text-muted-foreground">
              moved={diffResult.movedCount} | avgDelta={diffResult.avgDelta} | maxDelta={diffResult.maxDelta}
            </p>
            <div className="mt-2 max-h-40 overflow-auto rounded-md border border-white/80 bg-white/80">
              <table className="w-full border-collapse text-left text-[11px]/4">
                <thead className="sticky top-0 bg-white/95 text-muted-foreground">
                  <tr>
                    <th className="px-2 py-1">Node</th>
                    <th className="px-2 py-1">DE (x,y)</th>
                    <th className="px-2 py-1">PARA (x,y)</th>
                    <th className="px-2 py-1">Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {diffResult.rows.length > 0 ? (
                    diffResult.rows.map((row) => (
                      <tr key={row.nodeId} className="border-t border-white/80">
                        <td className="px-2 py-1 font-semibold text-foreground">{row.nodeId}</td>
                        <td className="px-2 py-1 text-foreground">
                          ({row.xBefore}, {row.yBefore})
                        </td>
                        <td className="px-2 py-1 text-foreground">
                          ({row.xAfter}, {row.yAfter})
                        </td>
                        <td className="px-2 py-1 text-foreground">{row.delta}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-2 py-1 text-muted-foreground" colSpan={4}>
                        Defina checkpoints DE e PARA para habilitar comparação.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-2 lg:grid-cols-2">
            <article className="rounded-lg border border-white/80 bg-white/80 p-2">
              <p className="text-[11px]/5 font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Estado Atual (Realtime)
              </p>
              <pre className="mt-1 max-h-52 overflow-auto font-mono text-[11px]/4 text-foreground">
                {livePositionState || 'Aguardando nodes...'}
              </pre>
            </article>
            <article className="rounded-lg border border-white/80 bg-white/80 p-2">
              <p className="text-[11px]/5 font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Histórico de Trace
              </p>
              <pre className="mt-1 max-h-52 overflow-auto whitespace-pre-wrap font-mono text-[11px]/4 text-foreground">
                {traceConsoleText || 'Sem registros ainda.'}
              </pre>
            </article>
          </div>

          {copyStatus === 'copied' ? (
            <p className="text-xs/5 text-emerald-700">Resumo HITL copiado para a área de transferência.</p>
          ) : null}
          {copyStatus === 'error' ? (
            <p className="text-xs/5 text-red-700">Não foi possível copiar automaticamente; tente novamente.</p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
