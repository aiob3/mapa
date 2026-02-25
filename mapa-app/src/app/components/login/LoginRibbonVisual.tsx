import { useEffect, useMemo, useRef, useState } from "react";

const SHAPE_W = 72;
const SHAPE_H = 29;
const SKEW_X = SHAPE_W / 4;
const SKEW_Y = SHAPE_H / 2;
const SHIFT_X = SHAPE_W * 0.35;
const BASE_W = Math.ceil(SHAPE_W + SHIFT_X);

const GAP = 6;
const TILE_W = BASE_W + GAP;
const EROSION = 1.5;
const SPEED = 0.28;
const FONT_PX = 9;
const CHAR_W = FONT_PX * 0.6;
const COLORS = ["rgba(198,73,40,0.78)", "rgba(245,245,247,0.20)"];

const TOKENS = {
  primary: "#1A1A1A",
};

function inOctagon(x: number, y: number): boolean {
  if (x < 0 || x > SHAPE_W || y < 0 || y > SHAPE_H) {
    return false;
  }
  const t = y <= SKEW_Y ? 1 - y / SKEW_Y : 1 - (SHAPE_H - y) / SKEW_Y;
  return x >= SKEW_X * t && x <= SHAPE_W - SKEW_X * t;
}

function inRibbonShape(x: number, y: number): boolean {
  if (x < 0 || x > BASE_W || y < 0 || y > SHAPE_H) {
    return false;
  }
  if (y <= SHAPE_H / 2) {
    return inOctagon(x, y);
  }
  return inOctagon(x - SHIFT_X, y);
}

function buildDistanceGrid(): number[][] {
  const cols = BASE_W + 2;
  const rows = SHAPE_H + 2;
  const distances: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(-1));
  const queue: Array<[number, number]> = [];
  const directions: Array<[number, number]> = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (inRibbonShape(x, y) && directions.some(([dx, dy]) => !inRibbonShape(x + dx, y + dy))) {
        distances[y][x] = 0;
        queue.push([x, y]);
      }
    }
  }

  let i = 0;
  while (i < queue.length) {
    const [x, y] = queue[i++];
    const d = distances[y][x];

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (inRibbonShape(nx, ny) && distances[ny]?.[nx] === -1) {
        distances[ny][nx] = d + 1;
        queue.push([nx, ny]);
      }
    }
  }

  return distances;
}

const NOISE_SVG =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")";

export function LoginRibbonVisual() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const distances = useMemo(() => buildDistanceGrid(), []);
  const [cols, setCols] = useState(300);

  useEffect(() => {
    if (!wrapperRef.current) {
      return;
    }

    const measure = () => {
      if (!wrapperRef.current) {
        return;
      }
      const px = wrapperRef.current.getBoundingClientRect().width;
      setCols(Math.max(120, Math.ceil(px / CHAR_W) + 4));
    };

    const observer = new ResizeObserver(measure);
    observer.observe(wrapperRef.current);
    measure();

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!cols || !preRef.current) {
      return;
    }

    const clones = Math.ceil(cols / TILE_W) + 2;
    const stripWidth = TILE_W * clones;
    const rows = SHAPE_H + 8;
    const offsetY = Math.floor((rows - SHAPE_H) / 2);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frameStep = reducedMotion ? 0 : SPEED;

    let frame = 0;
    let raf = 0;

    const render = () => {
      if (!preRef.current) {
        return;
      }

      const grid: string[][] = Array.from({ length: rows }, () => new Array(cols).fill(" "));
      const scroll = Math.floor(frame * frameStep) % stripWidth;

      for (let clone = 0; clone < clones; clone++) {
        const rawX = clone * TILE_W - scroll;
        for (const startX of [rawX, rawX + stripWidth]) {
          for (let y = 0; y < SHAPE_H; y++) {
            for (let x = 0; x < BASE_W; x++) {
              if (!inRibbonShape(x, y)) {
                continue;
              }

              const rx = startX + x;
              const ry = offsetY + y;

              if (rx < 0 || rx >= cols || ry < 0 || ry >= rows) {
                continue;
              }

              const d = distances[y]?.[x] ?? 0;
              if (d > EROSION + 1) {
                grid[ry][rx] = "1";
              } else if (d > EROSION - 1) {
                const pulse = Math.sin(x * 0.72 + y * 0.83 + frame * 0.09);
                grid[ry][rx] = pulse > 0 ? "1" : "0";
              } else {
                grid[ry][rx] = "0";
              }
            }
          }
        }
      }

      let html = "";
      for (let y = 0; y < rows; y++) {
        let segment = "";
        let lastColor = "";
        const flush = () => {
          if (!segment) {
            return;
          }
          html += lastColor
            ? `<span style="color:${lastColor};text-shadow:0 0 8px ${lastColor}55">${segment}</span>`
            : segment;
          segment = "";
        };

        for (let x = 0; x < cols; x++) {
          const slot = (x + scroll) % stripWidth;
          const colorIndex = Math.floor(slot / TILE_W) % 2;
          const color = grid[y][x] === " " ? "" : COLORS[colorIndex];
          if (color !== lastColor) {
            flush();
            lastColor = color;
          }
          segment += grid[y][x];
        }

        flush();
        html += "<br>";
      }

      preRef.current.innerHTML = html;
      frame++;
      raf = requestAnimationFrame(render);
    };

    if (reducedMotion) {
      render();
      return;
    }

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [cols, distances]);

  return (
    <div
      ref={wrapperRef}
      className="absolute inset-0 overflow-hidden"
      style={{
        background: `linear-gradient(150deg, #0f0f10 0%, ${TOKENS.primary} 56%, #121213 100%)`,
      }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: NOISE_SVG }} />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(880px 460px at 72% 16%, rgba(198,73,40,0.20), transparent 62%), radial-gradient(760px 520px at 16% 84%, rgba(255,255,255,0.06), transparent 66%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 30%, rgba(0,0,0,0.16) 100%)",
        }}
      />
      <div className="absolute inset-0 flex items-center px-4 sm:px-6">
        <pre
          ref={preRef}
          className="m-0 select-none whitespace-pre text-left leading-[1.15]"
          style={{
            fontFamily: "'Space Mono', 'Courier New', monospace",
            fontSize: `${FONT_PX}px`,
            letterSpacing: "0.1em",
          }}
        />
      </div>
    </div>
  );
}
