import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  Background,
  Controls,
  MarkerType,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { ArchitectureSnapshotV1 } from '@/types/architecture';

export type TechnicalLevel = 'L1' | 'L2' | 'L3';
export type TechnicalOrientation = 'horizontal' | 'vertical';

interface TechnicalMindmapProps {
  snapshot: ArchitectureSnapshotV1;
  level: TechnicalLevel;
  orientation: TechnicalOrientation;
}

interface Point {
  x: number;
  y: number;
}

type NodeKind = 'root' | 'module' | 'area' | 'sidebar' | 'route';

const nodeStyleByKind: Record<NodeKind, CSSProperties> = {
  root: {
    border: '2px solid #c64928',
    background: '#fff4ef',
    borderRadius: '12px',
    color: '#7f2f1a',
    fontWeight: 700,
    boxShadow: '0 10px 24px rgba(198, 73, 40, 0.15)',
  },
  module: {
    border: '1.8px solid #3f4653',
    background: '#eef1f5',
    borderRadius: '12px',
    color: '#2f3848',
    fontWeight: 600,
  },
  area: {
    border: '2px solid #c64928',
    background: '#fff8ec',
    borderRadius: '12px',
    color: '#7f2f1a',
    fontWeight: 700,
  },
  sidebar: {
    border: '1.5px solid #d8d8dc',
    background: '#ffffff',
    borderRadius: '12px',
    color: '#3f4653',
    fontWeight: 600,
  },
  route: {
    border: '1.5px dashed #5b6170',
    background: '#f6f7f9',
    borderRadius: '12px',
    color: '#2f3848',
    fontFamily: 'var(--font-data)',
    fontSize: '12px',
    fontWeight: 600,
  },
};

function uniqueBy<T>(values: T[], keySelector: (value: T) => string) {
  const map = new Map<string, T>();
  values.forEach((value) => {
    const key = keySelector(value);
    if (!map.has(key)) {
      map.set(key, value);
    }
  });
  return [...map.values()];
}

function labelNode(title: string, subtitle?: string) {
  return (
    <div className="text-left leading-5">
      <p className="text-sm font-semibold">{title}</p>
      {subtitle ? <p className="text-xs opacity-75">{subtitle}</p> : null}
    </div>
  );
}

function axisPositions(orientation: TechnicalOrientation) {
  if (orientation === 'horizontal') {
    return {
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };
  }
  return {
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  };
}

function createNode(
  id: string,
  title: string,
  subtitle: string | undefined,
  kind: NodeKind,
  position: Point,
  orientation: TechnicalOrientation,
): Node {
  const { sourcePosition, targetPosition } = axisPositions(orientation);
  return {
    id,
    position,
    draggable: true,
    sourcePosition,
    targetPosition,
    data: { label: labelNode(title, subtitle) },
    style: {
      ...nodeStyleByKind[kind],
      width: kind === 'sidebar' ? 240 : 220,
      padding: kind === 'root' ? '12px' : '10px',
    },
  };
}

function createEdge(id: string, source: string, target: string, color: string, dashed = false): Edge {
  return {
    id,
    source,
    target,
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color },
    style: {
      stroke: color,
      strokeWidth: color === '#c64928' ? 2 : 1.7,
      strokeDasharray: dashed ? '5 4' : undefined,
    },
  };
}

function gridPoint(index: number, columns: number, startX: number, startY: number, gapX: number, gapY: number): Point {
  return {
    x: startX + (index % columns) * gapX,
    y: startY + Math.floor(index / columns) * gapY,
  };
}

function buildMindmapGraph(
  snapshot: ArchitectureSnapshotV1,
  level: TechnicalLevel,
  orientation: TechnicalOrientation,
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const modules = snapshot.appArchitecture.modules;
  const uniqueSidebars = uniqueBy(snapshot.appArchitecture.sidebars, (item) => `${item.context}:${item.path}`);
  const synSidebars = uniqueSidebars.filter((item) => item.context === 'mapa-syn').slice(0, 6);
  const teamSidebars = uniqueSidebars.filter((item) => item.context === 'team-hub').slice(0, 6);
  const modulePaths = new Set(modules.map((module) => module.path));
  const sidebarPaths = new Set(uniqueSidebars.map((item) => item.path));
  const technicalRoutes = [...new Set(snapshot.appArchitecture.routes)]
    .filter((route) => route !== '/' && route !== '*' && !modulePaths.has(route) && !sidebarPaths.has(route))
    .filter((route) => route.startsWith('/syn') || route.startsWith('/analytics') || route.startsWith('/team'))
    .slice(0, 8);

  if (orientation === 'horizontal') {
    const rootPos = { x: 80, y: 320 };
    const moduleX = 360;
    const moduleStartY = 70;
    const moduleGap = 128;

    nodes.push(createNode('ROOT', 'MAPA-App', 'Top-menu', 'root', rootPos, orientation));

    modules.forEach((module, index) => {
      const id = `M-${module.id}`;
      const position = { x: moduleX, y: moduleStartY + index * moduleGap };
      nodes.push(createNode(id, module.label, level === 'L3' ? module.path : undefined, 'module', position, orientation));
      edges.push(createEdge(`E-ROOT-${id}`, 'ROOT', id, '#7b8394'));
    });

    const synModuleIndex = modules.findIndex((item) => item.path === '/syn');
    const teamModuleIndex = modules.findIndex((item) => item.path === '/team');
    const synY = moduleStartY + (synModuleIndex >= 0 ? synModuleIndex : 1) * moduleGap;
    const teamY = moduleStartY + (teamModuleIndex >= 0 ? teamModuleIndex : 3) * moduleGap;

    nodes.push(createNode('SYN_AREAS', 'MAPA Syn', 'Sub-áreas', 'area', { x: 710, y: synY }, orientation));
    nodes.push(createNode('TEAM_AREAS', 'Team Hub', 'Sub-áreas', 'area', { x: 710, y: teamY }, orientation));

    if (synModuleIndex >= 0) {
      edges.push(createEdge('E-SYN', `M-${modules[synModuleIndex].id}`, 'SYN_AREAS', '#c64928'));
    }
    if (teamModuleIndex >= 0) {
      edges.push(createEdge('E-TEAM', `M-${modules[teamModuleIndex].id}`, 'TEAM_AREAS', '#c64928'));
    }

    if (level === 'L2' || level === 'L3') {
      const sidebarX = 1040;
      synSidebars.forEach((item, index) => {
        const nodeId = `SS-${index}`;
        nodes.push(
          createNode(
            nodeId,
            item.subLabel || item.label,
            level === 'L3' ? item.path : undefined,
            'sidebar',
            { x: sidebarX, y: synY - 160 + index * 94 },
            orientation,
          ),
        );
        edges.push(createEdge(`E-SYN-S-${index}`, 'SYN_AREAS', nodeId, '#7b8394'));
      });

      teamSidebars.forEach((item, index) => {
        const nodeId = `TS-${index}`;
        nodes.push(
          createNode(
            nodeId,
            item.subLabel || item.label,
            level === 'L3' ? item.path : undefined,
            'sidebar',
            { x: sidebarX, y: teamY - 160 + index * 94 },
            orientation,
          ),
        );
        edges.push(createEdge(`E-TEAM-S-${index}`, 'TEAM_AREAS', nodeId, '#7b8394'));
      });
    }

    if (level === 'L3') {
      technicalRoutes.forEach((route, index) => {
        const routeId = `R-${index}`;
        nodes.push(createNode(routeId, route, undefined, 'route', { x: 1390, y: 110 + index * 92 }, orientation));
        edges.push(createEdge(`E-R-${index}`, route.startsWith('/team') ? 'TEAM_AREAS' : 'SYN_AREAS', routeId, '#5b6170', true));
      });
    }
    return { nodes, edges };
  }

  const rootPos = { x: 640, y: 60 };
  nodes.push(createNode('ROOT', 'MAPA-App', 'Top-menu', 'root', rootPos, orientation));

  const moduleStartX = 190;
  const moduleY = 250;
  const moduleGap = 260;

  modules.forEach((module, index) => {
    const id = `M-${module.id}`;
    const position = { x: moduleStartX + index * moduleGap, y: moduleY };
    nodes.push(createNode(id, module.label, level === 'L3' ? module.path : undefined, 'module', position, orientation));
    edges.push(createEdge(`E-ROOT-${id}`, 'ROOT', id, '#7b8394'));
  });

  const synModuleIndex = modules.findIndex((item) => item.path === '/syn');
  const teamModuleIndex = modules.findIndex((item) => item.path === '/team');
  const synAreaX = moduleStartX + (synModuleIndex >= 0 ? synModuleIndex : 1) * moduleGap;
  const teamAreaX = moduleStartX + (teamModuleIndex >= 0 ? teamModuleIndex : 3) * moduleGap;
  const areaY = 520;

  nodes.push(createNode('SYN_AREAS', 'MAPA Syn', 'Sub-áreas', 'area', { x: synAreaX, y: areaY }, orientation));
  nodes.push(createNode('TEAM_AREAS', 'Team Hub', 'Sub-áreas', 'area', { x: teamAreaX, y: areaY }, orientation));

  if (synModuleIndex >= 0) {
    edges.push(createEdge('E-SYN', `M-${modules[synModuleIndex].id}`, 'SYN_AREAS', '#c64928'));
  }
  if (teamModuleIndex >= 0) {
    edges.push(createEdge('E-TEAM', `M-${modules[teamModuleIndex].id}`, 'TEAM_AREAS', '#c64928'));
  }

  if (level === 'L2' || level === 'L3') {
    const synSidebarStartX = synAreaX - 240;
    const teamSidebarStartX = teamAreaX - 240;
    const sidebarsY = 790;

    synSidebars.forEach((item, index) => {
      const nodeId = `SS-${index}`;
      const position = gridPoint(index, 3, synSidebarStartX, sidebarsY, 220, 120);
      nodes.push(createNode(nodeId, item.subLabel || item.label, level === 'L3' ? item.path : undefined, 'sidebar', position, orientation));
      edges.push(createEdge(`E-SYN-S-${index}`, 'SYN_AREAS', nodeId, '#7b8394'));
    });

    teamSidebars.forEach((item, index) => {
      const nodeId = `TS-${index}`;
      const position = gridPoint(index, 3, teamSidebarStartX, sidebarsY, 220, 120);
      nodes.push(createNode(nodeId, item.subLabel || item.label, level === 'L3' ? item.path : undefined, 'sidebar', position, orientation));
      edges.push(createEdge(`E-TEAM-S-${index}`, 'TEAM_AREAS', nodeId, '#7b8394'));
    });
  }

  if (level === 'L3') {
    const routesY = 1120;
    technicalRoutes.forEach((route, index) => {
      const routeId = `R-${index}`;
      const position = gridPoint(index, 4, 130, routesY, 300, 110);
      nodes.push(createNode(routeId, route, undefined, 'route', position, orientation));
      edges.push(createEdge(`E-R-${index}`, route.startsWith('/team') ? 'TEAM_AREAS' : 'SYN_AREAS', routeId, '#5b6170', true));
    });
  }

  return { nodes, edges };
}

export function TechnicalMindmap({ snapshot, level, orientation }: TechnicalMindmapProps) {
  const graph = useMemo(() => buildMindmapGraph(snapshot, level, orientation), [snapshot, level, orientation]);
  const [nodes, setNodes, onNodesChange] = useNodesState(graph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges);
  const [traceLines, setTraceLines] = useState<string[]>([]);
  const [livePositionState, setLivePositionState] = useState<string>('');

  function toPositionLog(currentNodes: Node[]) {
    const ordered = [...currentNodes].sort((a, b) => a.id.localeCompare(b.id));
    return ordered
      .map((node) => `${node.id}: (${Math.round(node.position.x)}, ${Math.round(node.position.y)})`)
      .join('\n');
  }

  function appendTrace(tag: string, currentNodes: Node[], attention = false) {
    const stamp = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    const flag = attention ? '[ATENCAO] ' : '';
    const header = `${flag}[${stamp}] ${tag} | level=${level} | orientation=${orientation} | nodes=${currentNodes.length}`;
    const payload = toPositionLog(currentNodes);
    const entry = `${header}\n${payload}`;
    setTraceLines((prev) => [entry, ...prev].slice(0, 18));
  }

  useEffect(() => {
    setNodes(graph.nodes);
    setEdges(graph.edges);
  }, [graph, setEdges, setNodes]);

  useEffect(() => {
    const live = toPositionLog(nodes);
    setLivePositionState(live);
  }, [nodes]);

  useEffect(() => {
    appendTrace('AutoLoad', graph.nodes);
  }, [graph.nodes, level, orientation]);

  return (
    <div className="space-y-3">
      <div className="relative h-[44rem] overflow-hidden rounded-xl border border-white/80 bg-white/70">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.22, minZoom: 0.4, maxZoom: 1.35 }}
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

      <section className="rounded-xl border border-white/80 bg-white/70 p-3">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm/6 font-semibold tracking-[0.06em] text-foreground uppercase">
            HITL Console - Trace Dialog
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg bg-accent px-3 py-1.5 text-xs/5 font-semibold tracking-[0.06em] text-white uppercase transition hover:brightness-105"
              onClick={() => appendTrace('Manual Position Log', nodes, true)}
            >
              Position Log
            </button>
            <button
              type="button"
              className="rounded-lg border border-white/80 bg-white/80 px-3 py-1.5 text-xs/5 font-semibold tracking-[0.06em] text-foreground uppercase transition hover:bg-white"
              onClick={() => setTraceLines([])}
            >
              Clear
            </button>
          </div>
        </header>

        <div className="mt-2 grid gap-2 lg:grid-cols-2">
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
              {traceLines.length > 0 ? traceLines.join('\n\n--------------------\n\n') : 'Sem registros ainda.'}
            </pre>
          </article>
        </div>
      </section>
    </div>
  );
}
