import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import type { ArchitectureEdge, ArchitectureNode } from '@/types/architecture';

interface ArchitectureCanvasProps {
  title: string;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
}

interface Point {
  x: number;
  y: number;
}

interface NodeDragState {
  nodeId: string;
  start: Point;
  base: Point;
}

function toNodePositionMap(nodes: ArchitectureNode[]) {
  const map = new Map<string, Point>();
  nodes.forEach((node) => {
    map.set(node.id, { x: node.x, y: node.y });
  });
  return map;
}

export function ArchitectureCanvas({ title, nodes, edges }: ArchitectureCanvasProps) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 24, y: 24 });
  const [viewportHeight, setViewportHeight] = useState(560);
  const [dragState, setDragState] = useState<{ active: boolean; start: Point; base: Point }>({
    active: false,
    start: { x: 0, y: 0 },
    base: { x: 24, y: 24 },
  });
  const [nodePositions, setNodePositions] = useState<Map<string, Point>>(() => toNodePositionMap(nodes));
  const [nodeDragState, setNodeDragState] = useState<NodeDragState | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setNodePositions(toNodePositionMap(nodes));
  }, [nodes]);

  const positionedNodes = useMemo(
    () =>
      nodes.map((node) => {
        const position = nodePositions.get(node.id) || { x: node.x, y: node.y };
        return { ...node, x: position.x, y: position.y };
      }),
    [nodePositions, nodes],
  );

  const nodeMap = useMemo(() => new Map(positionedNodes.map((node) => [node.id, node])), [positionedNodes]);

  const graphBounds = useMemo(() => {
    if (positionedNodes.length === 0) {
      return { width: 1280, height: 720 };
    }
    const maxX = Math.max(...positionedNodes.map((node) => node.x)) + 320;
    const maxY = Math.max(...positionedNodes.map((node) => node.y)) + 220;
    return { width: Math.max(1280, maxX), height: Math.max(720, maxY) };
  }, [positionedNodes]);

  function fitToView() {
    const host = containerRef.current;
    if (!host) {
      return;
    }

    const hostWidth = host.clientWidth;
    const hostHeight = host.clientHeight;
    if (hostWidth === 0 || hostHeight === 0) {
      return;
    }

    const padding = 28;
    const fitScale = Math.min(
      (hostWidth - padding * 2) / graphBounds.width,
      (hostHeight - padding * 2) / graphBounds.height,
      1,
    );
    const normalizedScale = Math.max(0.55, Math.min(1.8, Number(fitScale.toFixed(2))));
    const nextOffset = {
      x: Math.round((hostWidth - graphBounds.width * normalizedScale) / 2),
      y: Math.round((hostHeight - graphBounds.height * normalizedScale) / 2),
    };

    setScale(normalizedScale);
    setOffset(nextOffset);
    setDragState((prev) => ({ ...prev, base: nextOffset }));
  }

  useEffect(() => {
    fitToView();
    const host = containerRef.current;
    if (!host || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => {
      fitToView();
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, [graphBounds.width, graphBounds.height]);

  useEffect(() => {
    const host = containerRef.current;
    if (!host) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setScale((prev) => {
        const next = prev + (event.deltaY < 0 ? 0.08 : -0.08);
        return Math.max(0.55, Math.min(1.8, Number(next.toFixed(2))));
      });
    };

    host.addEventListener('wheel', onWheel, { passive: false });
    return () => host.removeEventListener('wheel', onWheel);
  }, []);

  function onCanvasMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (nodeDragState) {
      return;
    }

    setDragState({
      active: true,
      start: { x: event.clientX, y: event.clientY },
      base: offset,
    });
  }

  function onNodeMouseDown(event: MouseEvent<HTMLElement>, node: ArchitectureNode) {
    event.preventDefault();
    event.stopPropagation();
    setNodeDragState({
      nodeId: node.id,
      start: { x: event.clientX, y: event.clientY },
      base: { x: node.x, y: node.y },
    });
  }

  function onMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (nodeDragState) {
      const dx = (event.clientX - nodeDragState.start.x) / scale;
      const dy = (event.clientY - nodeDragState.start.y) / scale;
      setNodePositions((prev) => {
        const next = new Map(prev);
        next.set(nodeDragState.nodeId, {
          x: Math.round(nodeDragState.base.x + dx),
          y: Math.round(nodeDragState.base.y + dy),
        });
        return next;
      });
      return;
    }

    if (!dragState.active) {
      return;
    }

    const dx = event.clientX - dragState.start.x;
    const dy = event.clientY - dragState.start.y;
    setOffset({ x: dragState.base.x + dx, y: dragState.base.y + dy });
  }

  function stopDrag() {
    setDragState((prev) => ({ ...prev, active: false }));
    setNodeDragState(null);
  }

  function updateViewportHeight(nextHeight: number) {
    const normalized = Math.max(380, Math.min(980, nextHeight));
    setViewportHeight(normalized);
  }

  return (
    <section className="glass-panel flex h-full min-h-[30rem] flex-col gap-4 p-5">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-xl/7 font-semibold text-foreground">{title}</h2>
        <span className="rounded-full border border-white/80 bg-white/70 px-3 py-1 text-xs/5 font-semibold tracking-[0.08em] text-success uppercase">
          Canvas
        </span>
      </header>

      <div className="flex items-center justify-between gap-2 rounded-xl border border-white/80 bg-white/60 px-3 py-2 text-xs/5 text-muted-foreground">
        <p>Wheel fixa zoom no canvas. Drag no fundo move visão; drag no card move o nó.</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg bg-white/80 px-2.5 py-1 font-semibold text-foreground transition hover:bg-white"
            onClick={() => updateViewportHeight(viewportHeight - 40)}
            title="Reduzir altura do canvas"
          >
            -
          </button>
          <input
            type="range"
            min={380}
            max={980}
            step={20}
            value={viewportHeight}
            onChange={(event) => updateViewportHeight(Number(event.target.value))}
            className="w-24 accent-[var(--color-accent)]"
            aria-label="Altura do canvas"
          />
          <button
            type="button"
            className="rounded-lg bg-white/80 px-2.5 py-1 font-semibold text-foreground transition hover:bg-white"
            onClick={() => updateViewportHeight(viewportHeight + 40)}
            title="Aumentar altura do canvas"
          >
            +
          </button>
          <button
            type="button"
            className="rounded-lg bg-white/80 px-2.5 py-1 font-semibold text-foreground transition hover:bg-white"
            onClick={fitToView}
          >
            Ajustar
          </button>
          <p className="font-semibold tracking-[0.08em] uppercase">Altura: {viewportHeight}px</p>
          <p className="font-semibold tracking-[0.08em] uppercase">Zoom: {Math.round(scale * 100)}%</p>
        </div>
      </div>

      <div
        ref={containerRef}
        className="canvas-shell relative overflow-hidden rounded-xl border border-white/80 bg-white/70"
        style={{ height: `${viewportHeight}px` }}
        onMouseDown={onCanvasMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        <div
          className="absolute inset-0 origin-top-left"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            width: `${graphBounds.width}px`,
            height: `${graphBounds.height}px`,
          }}
        >
          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            {edges.map((edge) => {
              const from = nodeMap.get(edge.from);
              const to = nodeMap.get(edge.to);
              if (!from || !to) {
                return null;
              }

              const x1 = from.x + 140;
              const y1 = from.y + 64;
              const x2 = to.x + 140;
              const y2 = to.y + 64;
              const direction = x2 >= x1 ? 1 : -1;
              const curve = Math.max(90, Math.abs(x2 - x1) * 0.35);
              const c1x = x1 + curve * direction;
              const c1y = y1;
              const c2x = x2 - curve * direction;
              const c2y = y2;
              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2;

              return (
                <g key={edge.id}>
                  <path
                    d={`M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`}
                    stroke="rgba(68,75,90,0.72)"
                    strokeWidth="2.2"
                    fill="none"
                  />
                  <circle cx={x2} cy={y2} r="3.5" fill="#c64928" />
                  {edge.label ? (
                    <text
                      x={mx}
                      y={my - 6}
                      textAnchor="middle"
                      fill="#3f4653"
                      fontSize="12"
                      fontWeight={600}
                      stroke="rgba(255,255,255,0.9)"
                      strokeWidth="3"
                      paintOrder="stroke"
                    >
                      {edge.label}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>

          {positionedNodes.map((node) => (
            <article
              key={node.id}
              className="absolute w-72 cursor-grab select-none rounded-2xl border border-white/80 bg-white/85 p-4 shadow-[0_14px_30px_rgba(0,0,0,0.08)] active:cursor-grabbing"
              style={{ left: `${node.x}px`, top: `${node.y}px` }}
              onMouseDown={(event) => onNodeMouseDown(event, node)}
            >
              <p className="text-[11px]/5 font-semibold tracking-[0.08em] text-accent uppercase">{node.group}</p>
              <h3 className="mt-1 text-base/6 font-semibold text-foreground">{node.label}</h3>
              <p className="mt-2 text-sm/6 text-muted-foreground">{node.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
