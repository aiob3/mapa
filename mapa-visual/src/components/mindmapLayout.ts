import { MarkerType, Position, type Edge, type Node } from '@xyflow/react';
import type { CSSProperties } from 'react';
import type { ArchitectureSnapshotV1 } from '../types/architecture';

export type TechnicalLevel = 'L1' | 'L2' | 'L3';
export type TechnicalOrientation = 'horizontal' | 'vertical';
export type L4LayoutVariant = 'top-down' | 'centered';
export type MindmapNodeKind = 'root' | 'module' | 'area' | 'sidebar' | 'route';
export type MindmapLaneId =
  | 'root'
  | 'modules'
  | 'areas'
  | 'syn-sidebar'
  | 'team-sidebar'
  | 'syn-endpoint'
  | 'team-endpoint'
  | 'shared-endpoint';

interface Point {
  x: number;
  y: number;
}

interface LaneBounds {
  axis: 'x' | 'y';
  min: number;
  max: number;
  laneId: MindmapLaneId;
}

export interface MindmapLayoutMeta {
  kindByNodeId: Record<string, MindmapNodeKind>;
  laneByNodeId: Record<string, LaneBounds>;
}

export interface MindmapLayoutResult {
  nodes: Node[];
  edges: Edge[];
  meta: MindmapLayoutMeta;
}

interface LaneSpec {
  id: MindmapLaneId;
  center: number;
  tolerance: number;
}

const NODE_STYLE_BY_KIND: Record<MindmapNodeKind, CSSProperties> = {
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

const KIND_SEPARATION_BONUS: Record<MindmapNodeKind, number> = {
  root: 18,
  module: 14,
  area: 14,
  sidebar: 10,
  route: 8,
};

const NODE_SIDE_PADDING_PX = 10;
const NODE_CEILING_GAP_PX = 5;
const NODE_FLOOR_GAP_PX = 1;
const NODE_LINE_HEIGHT_PX = 18;
const NODE_TEXT_CHAR_WIDTH_PX = 7;
const NODE_MIN_HEIGHT_PX = 44;

const FORCE_CONFIG_BY_ORIENTATION: Record<
  TechnicalOrientation,
  {
    iterations: number;
    centerForce: number;
    repelForce: number;
    linkForce: number;
    linkDistanceFactor: number;
    damping: number;
    maxStep: number;
    recenterFactor: number;
  }
> = {
  horizontal: {
    iterations: 120,
    centerForce: 0.06,
    repelForce: 0.6,
    linkForce: 0.2,
    linkDistanceFactor: 1,
    damping: 0.82,
    maxStep: 18,
    recenterFactor: 0.8,
  },
  vertical: {
    iterations: 110,
    centerForce: 0.05,
    repelForce: 0.55,
    linkForce: 0.18,
    linkDistanceFactor: 1,
    damping: 0.84,
    maxStep: 16,
    recenterFactor: 0.75,
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

function labelNode(title: string, subtitle?: string) {
  return subtitle ? `${title}\n${subtitle}` : title;
}

function toNodeKind(nodeId: string): MindmapNodeKind {
  if (nodeId === 'ROOT') {
    return 'root';
  }
  if (nodeId.startsWith('M-')) {
    return 'module';
  }
  if (nodeId === 'SYN_AREAS' || nodeId === 'TEAM_AREAS') {
    return 'area';
  }
  if (nodeId.startsWith('SS-') || nodeId.startsWith('TS-')) {
    return 'sidebar';
  }
  return 'route';
}

function createNode(
  id: string,
  title: string,
  subtitle: string | undefined,
  kind: MindmapNodeKind,
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
      ...NODE_STYLE_BY_KIND[kind],
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

function buildRouteOffsets(count: number, gap: number, variant: L4LayoutVariant) {
  if (count <= 0) {
    return [];
  }
  if (variant === 'centered') {
    const start = -((count - 1) * gap) / 2;
    return Array.from({ length: count }, (_, index) => start + index * gap);
  }
  return Array.from({ length: count }, (_, index) => index * gap);
}

function deconflictNodes(nodes: Node[], edges: Edge[], meta: MindmapLayoutMeta, orientation: TechnicalOrientation) {
  const secondaryAxis = orientation === 'horizontal' ? 'y' : 'x';
  const grouped = new Map<MindmapLaneId, Node[]>();
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const forceConfig = FORCE_CONFIG_BY_ORIENTATION[orientation];

  const parseSize = (value: unknown, fallback: number) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = Number.parseFloat(value.replace('px', '').trim());
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
    return fallback;
  };

  const parsePadding = (value: unknown) => {
    if (typeof value === 'number') {
      return { top: value, bottom: value };
    }
    if (typeof value === 'string') {
      const tokens = value
        .split(/\s+/)
        .map((token) => Number.parseFloat(token.replace('px', '').trim()))
        .filter((token) => Number.isFinite(token));
      if (tokens.length === 1) {
        return { top: tokens[0], bottom: tokens[0] };
      }
      if (tokens.length === 2) {
        return { top: tokens[0], bottom: tokens[0] };
      }
      if (tokens.length === 3) {
        return { top: tokens[0], bottom: tokens[2] };
      }
      if (tokens.length >= 4) {
        return { top: tokens[0], bottom: tokens[2] };
      }
    }
    return { top: NODE_SIDE_PADDING_PX, bottom: NODE_SIDE_PADDING_PX };
  };

  const estimateNodeSize = (node: Node) => {
    const style = node.style ?? {};
    const width = parseSize(style.width, 220);
    const { top, bottom } = parsePadding(style.padding);
    const rawLabel = typeof node.data?.label === 'string' ? node.data.label : '';
    const lines = rawLabel.split('\n');
    const usableWidth = Math.max(80, width - NODE_SIDE_PADDING_PX * 2);
    const charsPerLine = Math.max(8, Math.floor(usableWidth / NODE_TEXT_CHAR_WIDTH_PX));
    const wrappedLineCount = Math.max(
      1,
      lines.reduce((acc, line) => acc + Math.max(1, Math.ceil(line.length / charsPerLine)), 0),
    );
    const estimatedHeight = Math.max(NODE_MIN_HEIGHT_PX, top + bottom + wrappedLineCount * NODE_LINE_HEIGHT_PX);
    return { width, height: estimatedHeight };
  };

  const sizeByNodeId = new Map<string, { width: number; height: number }>();
  nodes.forEach((node) => {
    sizeByNodeId.set(node.id, estimateNodeSize(node));
  });

  const halfSize = (nodeId: string) => {
    const nodeSize = sizeByNodeId.get(nodeId) ?? { width: 220, height: NODE_MIN_HEIGHT_PX };
    return (orientation === 'horizontal' ? nodeSize.height : nodeSize.width) / 2;
  };

  const structuralGap = (aId: string, bId: string) => {
    const kindA = meta.kindByNodeId[aId] ?? toNodeKind(aId);
    const kindB = meta.kindByNodeId[bId] ?? toNodeKind(bId);
    const separationBonus = Math.max(KIND_SEPARATION_BONUS[kindA], KIND_SEPARATION_BONUS[kindB]);
    const axisBuffer =
      secondaryAxis === 'y' ? NODE_CEILING_GAP_PX + NODE_FLOOR_GAP_PX : NODE_SIDE_PADDING_PX * 2;
    return axisBuffer + separationBonus;
  };

  const minDistance = (aId: string, bId: string) =>
    (halfSize(aId) + halfSize(bId) + structuralGap(aId, bId)) * forceConfig.linkDistanceFactor;

  nodes.forEach((node) => {
    const laneMeta = meta.laneByNodeId[node.id];
    if (!laneMeta) {
      return;
    }
    const current = grouped.get(laneMeta.laneId) ?? [];
    current.push(node);
    grouped.set(laneMeta.laneId, current);
  });

  grouped.forEach((laneNodes) => {
    const laneNodeIds = new Set(laneNodes.map((node) => node.id));
    const laneEdges = edges.filter((edge) => laneNodeIds.has(edge.source) && laneNodeIds.has(edge.target));
    const positions = new Map<string, number>();
    const targets = new Map<string, number>();
    const velocities = new Map<string, number>();

    laneNodes.forEach((node) => {
      const value = node.position[secondaryAxis];
      positions.set(node.id, value);
      targets.set(node.id, value);
      velocities.set(node.id, 0);
    });

    for (let iteration = 0; iteration < forceConfig.iterations; iteration += 1) {
      laneNodes.forEach((node) => {
        const current = positions.get(node.id) ?? 0;
        const target = targets.get(node.id) ?? current;
        const velocity = velocities.get(node.id) ?? 0;
        velocities.set(node.id, velocity + (target - current) * forceConfig.centerForce);
      });

      for (let index = 0; index < laneNodes.length; index += 1) {
        for (let compared = index + 1; compared < laneNodes.length; compared += 1) {
          const firstId = laneNodes[index].id;
          const secondId = laneNodes[compared].id;
          const firstPos = positions.get(firstId) ?? 0;
          const secondPos = positions.get(secondId) ?? 0;
          const diff = secondPos - firstPos;
          const distance = Math.max(0.0001, Math.abs(diff));
          const minimum = minDistance(firstId, secondId);
          if (distance < minimum) {
            const overlap = minimum - distance;
            const push = overlap * forceConfig.repelForce;
            const direction = diff >= 0 ? 1 : -1;
            velocities.set(firstId, (velocities.get(firstId) ?? 0) - direction * push * 0.5);
            velocities.set(secondId, (velocities.get(secondId) ?? 0) + direction * push * 0.5);
          }
        }
      }

      laneEdges.forEach((edge) => {
        const sourceId = edge.source;
        const targetId = edge.target;
        const sourcePos = positions.get(sourceId);
        const targetPos = positions.get(targetId);
        if (sourcePos === undefined || targetPos === undefined) {
          return;
        }
        const diff = targetPos - sourcePos;
        const distance = Math.max(0.0001, Math.abs(diff));
        const desired = minDistance(sourceId, targetId);
        const spring = (distance - desired) * forceConfig.linkForce;
        const direction = diff >= 0 ? 1 : -1;
        velocities.set(sourceId, (velocities.get(sourceId) ?? 0) + direction * spring * 0.5);
        velocities.set(targetId, (velocities.get(targetId) ?? 0) - direction * spring * 0.5);
      });

      laneNodes.forEach((node) => {
        const velocity = (velocities.get(node.id) ?? 0) * forceConfig.damping;
        const clampedVelocity = Math.max(-forceConfig.maxStep, Math.min(forceConfig.maxStep, velocity));
        const next = (positions.get(node.id) ?? 0) + clampedVelocity;
        positions.set(node.id, next);
        velocities.set(node.id, clampedVelocity);
      });
    }

    const sortedByPosition = [...laneNodes].sort((a, b) => (positions.get(a.id) ?? 0) - (positions.get(b.id) ?? 0));
    for (let index = 1; index < sortedByPosition.length; index += 1) {
      const previousId = sortedByPosition[index - 1].id;
      const currentId = sortedByPosition[index].id;
      const previousPos = positions.get(previousId) ?? 0;
      const currentPos = positions.get(currentId) ?? 0;
      const minimum = previousPos + minDistance(previousId, currentId);
      if (currentPos < minimum) {
        positions.set(currentId, minimum);
      }
    }

    const averageCurrent =
      laneNodes.reduce((acc, node) => acc + (positions.get(node.id) ?? 0), 0) / Math.max(1, laneNodes.length);
    const averageTarget =
      laneNodes.reduce((acc, node) => acc + (targets.get(node.id) ?? 0), 0) / Math.max(1, laneNodes.length);
    const shift = (averageTarget - averageCurrent) * forceConfig.recenterFactor;
    laneNodes.forEach((node) => {
      const current = positions.get(node.id) ?? node.position[secondaryAxis];
      positions.set(node.id, current + shift);
    });

    laneNodes.forEach((node) => {
      const current = positions.get(node.id);
      if (current === undefined) {
        return;
      }
      const originalNode = nodeById.get(node.id) ?? node;
      originalNode.position = {
        ...originalNode.position,
        [secondaryAxis]: current,
      };
    });
  });

  if (orientation === 'horizontal') {
    const nodeIdsByLane = (laneId: MindmapLaneId) => (grouped.get(laneId) ?? []).map((node) => node.id);

    const clusterBoundsByIds = (nodeIds: string[]) => {
      if (nodeIds.length === 0) {
        return null;
      }
      const nodesInCluster = nodeIds
        .map((nodeId) => nodeById.get(nodeId))
        .filter((node): node is Node => Boolean(node));
      if (nodesInCluster.length === 0) {
        return null;
      }
      const top = Math.min(...nodesInCluster.map((node) => node.position.y - halfSize(node.id)));
      const bottom = Math.max(...nodesInCluster.map((node) => node.position.y + halfSize(node.id)));
      return { top, bottom };
    };

    const shiftNodeIds = (nodeIds: string[], delta: number) => {
      if (delta === 0 || nodeIds.length === 0) {
        return;
      }
      nodeIds.forEach((nodeId) => {
        const node = nodeById.get(nodeId);
        if (!node) {
          return;
        }
        node.position = {
          ...node.position,
          y: node.position.y + delta,
        };
      });
    };

    const centerAreaByGroup = (areaId: string, groupNodeIds: string[]) => {
      const areaNode = nodeById.get(areaId);
      if (!areaNode || groupNodeIds.length === 0) {
        return;
      }
      const bounds = clusterBoundsByIds(groupNodeIds);
      if (!bounds) {
        return;
      }
      areaNode.position = {
        ...areaNode.position,
        y: (bounds.top + bounds.bottom) / 2,
      };
    };

    const enforceRoutesAboveSidebars = (routeIds: string[], sidebarIds: string[], gap = 24) => {
      if (routeIds.length === 0 || sidebarIds.length === 0) {
        return;
      }
      const routeBounds = clusterBoundsByIds(routeIds);
      const sidebarBounds = clusterBoundsByIds(sidebarIds);
      if (!routeBounds || !sidebarBounds) {
        return;
      }
      const desiredSidebarTop = routeBounds.bottom + gap;
      if (sidebarBounds.top < desiredSidebarTop) {
        shiftNodeIds(sidebarIds, desiredSidebarTop - sidebarBounds.top);
      }
    };

    const synRouteIds = edges
      .filter((edge) => edge.source === 'SYN_AREAS' && edge.target.startsWith('R-'))
      .map((edge) => edge.target);
    const teamRouteIds = edges
      .filter((edge) => edge.source === 'TEAM_AREAS' && edge.target.startsWith('R-'))
      .map((edge) => edge.target);
    const synSidebarIds = nodeIdsByLane('syn-sidebar');
    const teamSidebarIds = nodeIdsByLane('team-sidebar');

    // Dentro de cada grupo: L4 (routes) inicia o bloco; L3 (sidebars) vem abaixo.
    enforceRoutesAboveSidebars(synRouteIds, synSidebarIds, 24);
    enforceRoutesAboveSidebars(teamRouteIds, teamSidebarIds, 24);

    // Entre grupos: TEAM inteiro abaixo de SYN com folga estrutural.
    const synGroupIds = [...synRouteIds, ...synSidebarIds];
    const teamGroupIds = [...teamRouteIds, ...teamSidebarIds];

    // L2 (área) acompanha o centro do respectivo grupo L3.
    centerAreaByGroup('SYN_AREAS', synGroupIds);
    centerAreaByGroup('TEAM_AREAS', teamGroupIds);

    const synGroupBounds = clusterBoundsByIds(synGroupIds);
    const teamGroupBounds = clusterBoundsByIds(teamGroupIds);
    if (synGroupBounds && teamGroupBounds) {
      const requiredTeamTop = synGroupBounds.bottom + 40;
      if (teamGroupBounds.top < requiredTeamTop) {
        shiftNodeIds([...teamGroupIds, 'TEAM_AREAS'], requiredTeamTop - teamGroupBounds.top);
      }
    }

    // Reaplica centralização após possíveis deslocamentos de grupo.
    centerAreaByGroup('SYN_AREAS', synGroupIds);
    centerAreaByGroup('TEAM_AREAS', teamGroupIds);
  }

  if (orientation === 'vertical') {
    const nodeIdsByLane = (laneId: MindmapLaneId) => (grouped.get(laneId) ?? []).map((node) => node.id);

    const clusterBoundsByIds = (nodeIds: string[]) => {
      if (nodeIds.length === 0) {
        return null;
      }
      const nodesInCluster = nodeIds
        .map((nodeId) => nodeById.get(nodeId))
        .filter((node): node is Node => Boolean(node));
      if (nodesInCluster.length === 0) {
        return null;
      }
      const left = Math.min(...nodesInCluster.map((node) => node.position.x - halfSize(node.id)));
      const right = Math.max(...nodesInCluster.map((node) => node.position.x + halfSize(node.id)));
      return { left, right };
    };

    const shiftNodeIds = (nodeIds: string[], delta: number) => {
      if (delta === 0 || nodeIds.length === 0) {
        return;
      }
      nodeIds.forEach((nodeId) => {
        const node = nodeById.get(nodeId);
        if (!node) {
          return;
        }
        node.position = {
          ...node.position,
          x: node.position.x + delta,
        };
      });
    };

    const centerAreaByGroup = (areaId: string, groupNodeIds: string[]) => {
      const areaNode = nodeById.get(areaId);
      if (!areaNode || groupNodeIds.length === 0) {
        return;
      }
      const bounds = clusterBoundsByIds(groupNodeIds);
      if (!bounds) {
        return;
      }
      areaNode.position = {
        ...areaNode.position,
        x: (bounds.left + bounds.right) / 2,
      };
    };

    const enforceRoutesBeforeSidebars = (routeIds: string[], sidebarIds: string[], gap = 24) => {
      if (routeIds.length === 0 || sidebarIds.length === 0) {
        return;
      }
      const routeBounds = clusterBoundsByIds(routeIds);
      const sidebarBounds = clusterBoundsByIds(sidebarIds);
      if (!routeBounds || !sidebarBounds) {
        return;
      }
      const desiredSidebarLeft = routeBounds.right + gap;
      if (sidebarBounds.left < desiredSidebarLeft) {
        shiftNodeIds(sidebarIds, desiredSidebarLeft - sidebarBounds.left);
      }
    };

    const synRouteIds = edges
      .filter((edge) => edge.source === 'SYN_AREAS' && edge.target.startsWith('R-'))
      .map((edge) => edge.target);
    const teamRouteIds = edges
      .filter((edge) => edge.source === 'TEAM_AREAS' && edge.target.startsWith('R-'))
      .map((edge) => edge.target);
    const synSidebarIds = nodeIdsByLane('syn-sidebar');
    const teamSidebarIds = nodeIdsByLane('team-sidebar');

    // Dentro de cada grupo (eixo invertido): L4 (routes) inicia à esquerda; L3 (sidebars) segue à direita.
    enforceRoutesBeforeSidebars(synRouteIds, synSidebarIds, 24);
    enforceRoutesBeforeSidebars(teamRouteIds, teamSidebarIds, 24);

    // Entre grupos: TEAM inteiro à direita de SYN com folga estrutural.
    const synGroupIds = [...synRouteIds, ...synSidebarIds];
    const teamGroupIds = [...teamRouteIds, ...teamSidebarIds];

    centerAreaByGroup('SYN_AREAS', synGroupIds);
    centerAreaByGroup('TEAM_AREAS', teamGroupIds);

    const synGroupBounds = clusterBoundsByIds(synGroupIds);
    const teamGroupBounds = clusterBoundsByIds(teamGroupIds);
    if (synGroupBounds && teamGroupBounds) {
      const requiredTeamLeft = synGroupBounds.right + 40;
      if (teamGroupBounds.left < requiredTeamLeft) {
        shiftNodeIds([...teamGroupIds, 'TEAM_AREAS'], requiredTeamLeft - teamGroupBounds.left);
      }
    }

    centerAreaByGroup('SYN_AREAS', synGroupIds);
    centerAreaByGroup('TEAM_AREAS', teamGroupIds);
  }
}

function registerLane(
  meta: MindmapLayoutMeta,
  nodeId: string,
  nodeKind: MindmapNodeKind,
  orientation: TechnicalOrientation,
  lane: LaneSpec,
) {
  meta.kindByNodeId[nodeId] = nodeKind;
  meta.laneByNodeId[nodeId] = {
    axis: orientation === 'horizontal' ? 'x' : 'y',
    min: lane.center - lane.tolerance,
    max: lane.center + lane.tolerance,
    laneId: lane.id,
  };
}

function routeLaneId(route: string): MindmapLaneId {
  if (route.startsWith('/team')) {
    return 'team-endpoint';
  }
  if (route.startsWith('/syn')) {
    return 'syn-endpoint';
  }
  return 'shared-endpoint';
}

export function buildMindmapLayout(
  snapshot: ArchitectureSnapshotV1,
  level: TechnicalLevel,
  orientation: TechnicalOrientation,
  options?: { l4Variant?: L4LayoutVariant },
): MindmapLayoutResult {
  const l4Variant: L4LayoutVariant = options?.l4Variant ?? 'top-down';
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const meta: MindmapLayoutMeta = {
    kindByNodeId: {},
    laneByNodeId: {},
  };
  const modules = snapshot.appArchitecture.modules;
  const uniqueSidebars = uniqueBy(snapshot.appArchitecture.sidebars, (item) => `${item.context}:${item.path}`);
  const synSidebars = uniqueSidebars.filter((item) => item.context === 'mapa-syn').slice(0, 6);
  const teamSidebars = uniqueSidebars.filter((item) => item.context === 'team-hub').slice(0, 6);
  const modulePaths = new Set(modules.map((module) => module.path));
  const sidebarPaths = new Set(uniqueSidebars.map((item) => item.path));
  const technicalRoutes = [...new Set(snapshot.appArchitecture.routes)]
    .filter((route) => route !== '/' && route !== '*' && !modulePaths.has(route) && !sidebarPaths.has(route))
    .filter((route) => route.startsWith('/syn') || route.startsWith('/analytics') || route.startsWith('/team'))
    .slice(0, 10);

  const synModuleIndex = modules.findIndex((item) => item.path === '/syn');
  const teamModuleIndex = modules.findIndex((item) => item.path === '/team');

  if (orientation === 'horizontal') {
    const lanes: Record<MindmapLaneId, LaneSpec> = {
      root: { id: 'root', center: 80, tolerance: 90 },
      modules: { id: 'modules', center: 360, tolerance: 110 },
      areas: { id: 'areas', center: 630, tolerance: 120 },
      'syn-sidebar': { id: 'syn-sidebar', center: 1040, tolerance: 160 },
      'team-sidebar': { id: 'team-sidebar', center: 1040, tolerance: 160 },
      'syn-endpoint': { id: 'syn-endpoint', center: 1040, tolerance: 160 },
      'team-endpoint': { id: 'team-endpoint', center: 1040, tolerance: 160 },
      'shared-endpoint': { id: 'shared-endpoint', center: 1040, tolerance: 160 },
    };

    const root = createNode('ROOT', 'MAPA-App', 'Top-menu', 'root', { x: lanes.root.center, y: 320 }, orientation);
    nodes.push(root);
    registerLane(meta, 'ROOT', 'root', orientation, lanes.root);

    const moduleStartY = 70;
    const moduleGap = 128;
    modules.forEach((module, index) => {
      const id = `M-${module.id}`;
      const moduleNode = createNode(
        id,
        module.label,
        undefined,
        'module',
        { x: lanes.modules.center, y: moduleStartY + index * moduleGap },
        orientation,
      );
      nodes.push(moduleNode);
      registerLane(meta, id, 'module', orientation, lanes.modules);
      edges.push(createEdge(`E-ROOT-${id}`, 'ROOT', id, '#7b8394'));
    });

    const synY = moduleStartY + (synModuleIndex >= 0 ? synModuleIndex : 1) * moduleGap;
    const teamY = moduleStartY + (teamModuleIndex >= 0 ? teamModuleIndex : 3) * moduleGap;

    const synAreaNode = createNode('SYN_AREAS', 'MAPA Syn', 'Sub-áreas', 'area', { x: lanes.areas.center, y: synY }, orientation);
    const teamAreaNode = createNode('TEAM_AREAS', 'Team Hub', 'Sub-áreas', 'area', { x: lanes.areas.center, y: teamY }, orientation);
    nodes.push(synAreaNode, teamAreaNode);
    registerLane(meta, 'SYN_AREAS', 'area', orientation, lanes.areas);
    registerLane(meta, 'TEAM_AREAS', 'area', orientation, lanes.areas);

    if (synModuleIndex >= 0) {
      edges.push(createEdge('E-SYN', `M-${modules[synModuleIndex].id}`, 'SYN_AREAS', '#c64928'));
    }
    if (teamModuleIndex >= 0) {
      edges.push(createEdge('E-TEAM', `M-${modules[teamModuleIndex].id}`, 'TEAM_AREAS', '#c64928'));
    }

    if (level === 'L2' || level === 'L3') {
      synSidebars.forEach((item, index) => {
        const nodeId = `SS-${index}`;
        nodes.push(
          createNode(
            nodeId,
            item.subLabel || item.label,
            undefined,
            'sidebar',
            { x: lanes['syn-sidebar'].center, y: synY - 140 + index * 100 },
            orientation,
          ),
        );
        registerLane(meta, nodeId, 'sidebar', orientation, lanes['syn-sidebar']);
        edges.push(createEdge(`E-SYN-S-${index}`, 'SYN_AREAS', nodeId, '#7b8394'));
      });

      teamSidebars.forEach((item, index) => {
        const nodeId = `TS-${index}`;
        nodes.push(
          createNode(
            nodeId,
            item.subLabel || item.label,
            undefined,
            'sidebar',
            { x: lanes['team-sidebar'].center, y: teamY - 140 + index * 100 },
            orientation,
          ),
        );
        registerLane(meta, nodeId, 'sidebar', orientation, lanes['team-sidebar']);
        edges.push(createEdge(`E-TEAM-S-${index}`, 'TEAM_AREAS', nodeId, '#7b8394'));
      });
    }

    if (level === 'L3') {
      const routePriority = (route: string) => {
        if (route.startsWith('/team') && route.endsWith('*')) {
          return 0;
        }
        if (route.startsWith('/syn') && route.endsWith('*')) {
          return 0;
        }
        if (route.endsWith('/*')) {
          return 1;
        }
        if (route.includes('/analytics')) {
          return 2;
        }
        return 3;
      };

      const sortRoutes = (routes: string[]) =>
        [...routes].sort((left, right) => {
          const priorityDelta = routePriority(left) - routePriority(right);
          if (priorityDelta !== 0) {
            return priorityDelta;
          }
          return left.localeCompare(right);
        });

      const routeGroups = [
        {
          sourceArea: 'SYN_AREAS',
          laneId: 'syn-endpoint' as const,
          baseCenter: synY,
          routes: sortRoutes(technicalRoutes.filter((route) => !route.startsWith('/team'))),
        },
        {
          sourceArea: 'TEAM_AREAS',
          laneId: 'team-endpoint' as const,
          baseCenter: teamY,
          routes: sortRoutes(technicalRoutes.filter((route) => route.startsWith('/team'))),
        },
      ];

      let routeIndex = 0;
      routeGroups.forEach((group) => {
        const offsets = buildRouteOffsets(group.routes.length, 92, l4Variant);
        const routeStartY = group.baseCenter - 230;
        group.routes.forEach((route, index) => {
          const routeId = `R-${routeIndex}`;
          nodes.push(
            createNode(
              routeId,
              route,
              undefined,
              'route',
              { x: lanes[group.laneId].center, y: routeStartY + offsets[index] },
              orientation,
            ),
          );
          registerLane(meta, routeId, 'route', orientation, lanes[group.laneId]);
          edges.push(createEdge(`E-R-${routeIndex}`, group.sourceArea, routeId, '#5b6170', true));
          routeIndex += 1;
        });
      });
    }
  } else {
    const lanes: Record<MindmapLaneId, LaneSpec> = {
      root: { id: 'root', center: 70, tolerance: 100 },
      modules: { id: 'modules', center: 210, tolerance: 110 },
      areas: { id: 'areas', center: 360, tolerance: 120 },
      'syn-sidebar': { id: 'syn-sidebar', center: 640, tolerance: 180 },
      'team-sidebar': { id: 'team-sidebar', center: 640, tolerance: 180 },
      'syn-endpoint': { id: 'syn-endpoint', center: 510, tolerance: 180 },
      'team-endpoint': { id: 'team-endpoint', center: 510, tolerance: 180 },
      'shared-endpoint': { id: 'shared-endpoint', center: 510, tolerance: 220 },
    };

    nodes.push(createNode('ROOT', 'MAPA-App', 'Top-menu', 'root', { x: 740, y: lanes.root.center }, orientation));
    registerLane(meta, 'ROOT', 'root', orientation, lanes.root);

    const moduleStartX = 190;
    const moduleGap = 250;
    modules.forEach((module, index) => {
      const id = `M-${module.id}`;
      nodes.push(
        createNode(
          id,
          module.label,
          undefined,
          'module',
          { x: moduleStartX + index * moduleGap, y: lanes.modules.center },
          orientation,
        ),
      );
      registerLane(meta, id, 'module', orientation, lanes.modules);
      edges.push(createEdge(`E-ROOT-${id}`, 'ROOT', id, '#7b8394'));
    });

    const synAreaX = moduleStartX + (synModuleIndex >= 0 ? synModuleIndex : 1) * moduleGap;
    const teamAreaX = moduleStartX + (teamModuleIndex >= 0 ? teamModuleIndex : 3) * moduleGap;
    nodes.push(createNode('SYN_AREAS', 'MAPA Syn', 'Sub-áreas', 'area', { x: synAreaX, y: lanes.areas.center }, orientation));
    nodes.push(createNode('TEAM_AREAS', 'Team Hub', 'Sub-áreas', 'area', { x: teamAreaX, y: lanes.areas.center }, orientation));
    registerLane(meta, 'SYN_AREAS', 'area', orientation, lanes.areas);
    registerLane(meta, 'TEAM_AREAS', 'area', orientation, lanes.areas);

    if (synModuleIndex >= 0) {
      edges.push(createEdge('E-SYN', `M-${modules[synModuleIndex].id}`, 'SYN_AREAS', '#c64928'));
    }
    if (teamModuleIndex >= 0) {
      edges.push(createEdge('E-TEAM', `M-${modules[teamModuleIndex].id}`, 'TEAM_AREAS', '#c64928'));
    }

    if (level === 'L2' || level === 'L3') {
      synSidebars.forEach((item, index) => {
        const nodeId = `SS-${index}`;
        nodes.push(
          createNode(
            nodeId,
            item.subLabel || item.label,
            undefined,
            'sidebar',
            { x: synAreaX - 140 + index * 252, y: lanes['syn-sidebar'].center },
            orientation,
          ),
        );
        registerLane(meta, nodeId, 'sidebar', orientation, lanes['syn-sidebar']);
        edges.push(createEdge(`E-SYN-S-${index}`, 'SYN_AREAS', nodeId, '#7b8394'));
      });

      teamSidebars.forEach((item, index) => {
        const nodeId = `TS-${index}`;
        nodes.push(
          createNode(
            nodeId,
            item.subLabel || item.label,
            undefined,
            'sidebar',
            { x: teamAreaX - 140 + index * 252, y: lanes['team-sidebar'].center },
            orientation,
          ),
        );
        registerLane(meta, nodeId, 'sidebar', orientation, lanes['team-sidebar']);
        edges.push(createEdge(`E-TEAM-S-${index}`, 'TEAM_AREAS', nodeId, '#7b8394'));
      });
    }

    if (level === 'L3') {
      const routePriority = (route: string) => {
        if (route.startsWith('/team') && route.endsWith('*')) {
          return 0;
        }
        if (route.startsWith('/syn') && route.endsWith('*')) {
          return 0;
        }
        if (route.endsWith('/*')) {
          return 1;
        }
        if (route.includes('/analytics')) {
          return 2;
        }
        return 3;
      };

      const sortRoutes = (routes: string[]) =>
        [...routes].sort((left, right) => {
          const priorityDelta = routePriority(left) - routePriority(right);
          if (priorityDelta !== 0) {
            return priorityDelta;
          }
          return left.localeCompare(right);
        });

      const routeGroups = [
        {
          sourceArea: 'SYN_AREAS',
          laneId: 'syn-endpoint' as const,
          baseCenter: synAreaX,
          routes: sortRoutes(technicalRoutes.filter((route) => !route.startsWith('/team'))),
        },
        {
          sourceArea: 'TEAM_AREAS',
          laneId: 'team-endpoint' as const,
          baseCenter: teamAreaX,
          routes: sortRoutes(technicalRoutes.filter((route) => route.startsWith('/team'))),
        },
      ];

      let routeIndex = 0;
      routeGroups.forEach((group) => {
        const offsets = buildRouteOffsets(group.routes.length, 252, l4Variant);
        const routeStartX = group.baseCenter - 230;
        group.routes.forEach((route, index) => {
          const routeId = `R-${routeIndex}`;
          nodes.push(
            createNode(
              routeId,
              route,
              undefined,
              'route',
              { x: routeStartX + offsets[index], y: lanes[group.laneId].center },
              orientation,
            ),
          );
          registerLane(meta, routeId, 'route', orientation, lanes[group.laneId]);
          edges.push(createEdge(`E-R-${routeIndex}`, group.sourceArea, routeId, '#5b6170', true));
          routeIndex += 1;
        });
      });
    }
  }

  deconflictNodes(nodes, edges, meta, orientation);
  return { nodes, edges, meta };
}
