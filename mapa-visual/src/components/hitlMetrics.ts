import type { Edge, Node } from '@xyflow/react';
import type { MindmapLayoutMeta, MindmapNodeKind, TechnicalLevel, TechnicalOrientation } from '@/components/mindmapLayout';

export type HitlTraceEventTypeV2 =
  | 'AutoLoad'
  | 'AutoFitView'
  | 'ManualPositionLog'
  | 'CollisionScan'
  | 'LaneValidation'
  | 'CheckpointDE'
  | 'CheckpointPARA';

export interface HitlNodePositionV2 {
  id: string;
  x: number;
  y: number;
}

export interface HitlLayoutMetricsV2 {
  nodeOverlapCount: number;
  edgeCrossingEstimate: number;
  laneViolationCount: number;
  clusterDensityScore: number;
}

export interface HitlTraceEventV2 {
  id: string;
  ts: string;
  eventType: HitlTraceEventTypeV2;
  attention: boolean;
  level: TechnicalLevel;
  orientation: TechnicalOrientation;
  nodeCount: number;
  details?: string;
  positions?: HitlNodePositionV2[];
}

export interface HitlCheckpointV2 {
  label: 'DE' | 'PARA';
  nodes: HitlNodePositionV2[];
  metrics: HitlLayoutMetricsV2;
}

export interface HitlPersistedStateV2 {
  version: 'HITL-V2';
  level: TechnicalLevel;
  orientation: TechnicalOrientation;
  positions: Record<string, { x: number; y: number }>;
  trace: HitlTraceEventV2[];
  checkpointDE?: HitlCheckpointV2;
  checkpointPARA?: HitlCheckpointV2;
}

export interface HitlDiffRowV2 {
  nodeId: string;
  xBefore: number;
  yBefore: number;
  xAfter: number;
  yAfter: number;
  delta: number;
}

export interface HitlDiffResultV2 {
  rows: HitlDiffRowV2[];
  movedCount: number;
  avgDelta: number;
  maxDelta: number;
}

interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

const NODE_SIZE_BY_KIND: Record<MindmapNodeKind, { width: number; height: number }> = {
  root: { width: 220, height: 68 },
  module: { width: 220, height: 64 },
  area: { width: 220, height: 64 },
  sidebar: { width: 240, height: 72 },
  route: { width: 220, height: 62 },
};

export function toNodePositionArray(nodes: Node[]): HitlNodePositionV2[] {
  return [...nodes]
    .map((node) => ({
      id: node.id,
      x: Math.round(node.position.x),
      y: Math.round(node.position.y),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function toNodePositionMap(nodes: Node[]): Record<string, { x: number; y: number }> {
  const map: Record<string, { x: number; y: number }> = {};
  toNodePositionArray(nodes).forEach((position) => {
    map[position.id] = { x: position.x, y: position.y };
  });
  return map;
}

export function formatNodePositions(positions: HitlNodePositionV2[]): string {
  return positions
    .map((position) => `${position.id}: (${position.x}, ${position.y})`)
    .join('\n');
}

function rectsIntersect(a: Rect, b: Rect): boolean {
  return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
}

function buildNodeRect(node: Node, kind: MindmapNodeKind): Rect {
  const size = NODE_SIZE_BY_KIND[kind];
  return {
    left: node.position.x - size.width / 2,
    right: node.position.x + size.width / 2,
    top: node.position.y - size.height / 2,
    bottom: node.position.y + size.height / 2,
  };
}

function orientationTimestamp() {
  return new Date().toLocaleTimeString('pt-BR', { hour12: false });
}

function lineIntersectionCount(segments: Array<{ p1: { x: number; y: number }; p2: { x: number; y: number }; key: string }>): number {
  function cross(
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number },
  ) {
    return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
  }

  function intersects(
    a1: { x: number; y: number },
    a2: { x: number; y: number },
    b1: { x: number; y: number },
    b2: { x: number; y: number },
  ) {
    const d1 = cross(a1, a2, b1);
    const d2 = cross(a1, a2, b2);
    const d3 = cross(b1, b2, a1);
    const d4 = cross(b1, b2, a2);
    return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
  }

  let count = 0;
  for (let i = 0; i < segments.length; i += 1) {
    for (let j = i + 1; j < segments.length; j += 1) {
      const left = segments[i];
      const right = segments[j];
      const [leftSource, leftTarget] = left.key.split('->');
      const [rightSource, rightTarget] = right.key.split('->');
      if (
        leftSource === rightSource ||
        leftSource === rightTarget ||
        leftTarget === rightSource ||
        leftTarget === rightTarget
      ) {
        continue;
      }
      if (intersects(left.p1, left.p2, right.p1, right.p2)) {
        count += 1;
      }
    }
  }
  return count;
}

export function buildHitlLayoutMetrics(
  nodes: Node[],
  edges: Edge[],
  meta: MindmapLayoutMeta,
): HitlLayoutMetricsV2 {
  const nodeRects = nodes.map((node) => {
    const kind = meta.kindByNodeId[node.id] ?? 'module';
    return {
      node,
      rect: buildNodeRect(node, kind),
    };
  });

  let nodeOverlapCount = 0;
  for (let i = 0; i < nodeRects.length; i += 1) {
    for (let j = i + 1; j < nodeRects.length; j += 1) {
      if (rectsIntersect(nodeRects[i].rect, nodeRects[j].rect)) {
        nodeOverlapCount += 1;
      }
    }
  }

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const segments = edges
    .map((edge) => {
      const source = nodeById.get(edge.source);
      const target = nodeById.get(edge.target);
      if (!source || !target) {
        return null;
      }
      return {
        p1: { x: source.position.x, y: source.position.y },
        p2: { x: target.position.x, y: target.position.y },
        key: `${edge.source}->${edge.target}`,
      };
    })
    .filter((segment): segment is { p1: { x: number; y: number }; p2: { x: number; y: number }; key: string } => Boolean(segment));
  const edgeCrossingEstimate = lineIntersectionCount(segments);

  let laneViolationCount = 0;
  nodes.forEach((node) => {
    const laneMeta = meta.laneByNodeId[node.id];
    if (!laneMeta) {
      return;
    }
    const axisValue = laneMeta.axis === 'x' ? node.position.x : node.position.y;
    if (axisValue < laneMeta.min || axisValue > laneMeta.max) {
      laneViolationCount += 1;
    }
  });

  const xValues = nodes.map((node) => node.position.x);
  const yValues = nodes.map((node) => node.position.y);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const bboxArea = Math.max(1, (maxX - minX + 1) * (maxY - minY + 1));
  const occupiedArea = nodeRects.reduce((sum, entry) => {
    return sum + (entry.rect.right - entry.rect.left) * (entry.rect.bottom - entry.rect.top);
  }, 0);
  const clusterDensityScore = Number((Math.min(1, occupiedArea / bboxArea) * 100).toFixed(1));

  return {
    nodeOverlapCount,
    edgeCrossingEstimate,
    laneViolationCount,
    clusterDensityScore,
  };
}

export function createHitlTraceEvent(
  eventType: HitlTraceEventTypeV2,
  level: TechnicalLevel,
  orientation: TechnicalOrientation,
  nodes: Node[],
  attention = false,
  details?: string,
): HitlTraceEventV2 {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ts: orientationTimestamp(),
    eventType,
    attention,
    level,
    orientation,
    nodeCount: nodes.length,
    details,
    positions: toNodePositionArray(nodes),
  };
}

export function formatTraceEventForConsole(event: HitlTraceEventV2): string {
  const attentionFlag = event.attention ? '[ATENCAO] ' : '';
  const detailSuffix = event.details ? ` | ${event.details}` : '';
  const header = `${attentionFlag}[${event.ts}] ${event.eventType} | level=${event.level} | orientation=${event.orientation} | nodes=${event.nodeCount}${detailSuffix}`;
  const payload = event.positions ? formatNodePositions(event.positions) : '';
  return payload ? `${header}\n${payload}` : header;
}

export function compareCheckpoints(
  checkpointDE: HitlCheckpointV2 | null,
  checkpointPARA: HitlCheckpointV2 | null,
): HitlDiffResultV2 {
  if (!checkpointDE || !checkpointPARA) {
    return { rows: [], movedCount: 0, avgDelta: 0, maxDelta: 0 };
  }

  const deMap = new Map(checkpointDE.nodes.map((node) => [node.id, node]));
  const paraMap = new Map(checkpointPARA.nodes.map((node) => [node.id, node]));
  const ids = [...new Set([...deMap.keys(), ...paraMap.keys()])].sort((a, b) => a.localeCompare(b));

  const rows = ids.map((id) => {
    const before = deMap.get(id) ?? { id, x: 0, y: 0 };
    const after = paraMap.get(id) ?? { id, x: 0, y: 0 };
    const delta = Math.round(Math.sqrt((after.x - before.x) ** 2 + (after.y - before.y) ** 2));
    return {
      nodeId: id,
      xBefore: before.x,
      yBefore: before.y,
      xAfter: after.x,
      yAfter: after.y,
      delta,
    };
  });

  const moved = rows.filter((row) => row.delta > 0);
  const movedCount = moved.length;
  const avgDelta = movedCount > 0 ? Number((moved.reduce((sum, row) => sum + row.delta, 0) / movedCount).toFixed(2)) : 0;
  const maxDelta = movedCount > 0 ? Math.max(...moved.map((row) => row.delta)) : 0;

  return { rows, movedCount, avgDelta, maxDelta };
}

export function buildHitlSummary(params: {
  generatedAt: string;
  level: TechnicalLevel;
  orientation: TechnicalOrientation;
  carryover: string;
  metrics: HitlLayoutMetricsV2;
  diff: HitlDiffResultV2;
  traceCount: number;
  attentionEvents: number;
}) {
  const { generatedAt, level, orientation, carryover, metrics, diff, traceCount, attentionEvents } = params;
  return [
    `HITL Summary`,
    `timestamp=${generatedAt}`,
    `level=${level} | orientation=${orientation}`,
    `carryover=${carryover}`,
    `overlap=${metrics.nodeOverlapCount} | crossings=${metrics.edgeCrossingEstimate} | laneViolations=${metrics.laneViolationCount} | density=${metrics.clusterDensityScore}`,
    `moved=${diff.movedCount} | avgDelta=${diff.avgDelta} | maxDelta=${diff.maxDelta}`,
    `traceCount=${traceCount} | attentionEvents=${attentionEvents}`,
  ].join('\n');
}
