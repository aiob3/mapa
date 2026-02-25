import { useEffect, useRef, useMemo, useState } from "react";

const W     = 72;
const H     = 29;
const Sx    = W / 4;
const Sy    = H / 2;
const SHIFT = W * 0.35;
const BW    = Math.ceil(W + SHIFT);

function inOctagon(x: number, y: number): boolean {
  if (x < 0 || x > W || y < 0 || y > H) return false;
  const t = y <= Sy ? 1 - y / Sy : 1 - (H - y) / Sy;
  return x >= Sx * t && x <= W - Sx * t;
}

function inShape(x: number, y: number): boolean {
  if (x < 0 || x > BW || y < 0 || y > H) return false;
  if (y <= H / 2) return inOctagon(x, y);
  return inOctagon(x - SHIFT, y);
}

function buildDist(): number[][] {
  const cols = BW + 2, rows = H + 2;
  const dist: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(-1));
  const q: [number,number][] = [];
  const dirs: [number,number][] = [[1,0],[-1,0],[0,1],[0,-1]];
  for (let gy = 0; gy < rows; gy++)
    for (let gx = 0; gx < cols; gx++)
      if (inShape(gx, gy) && dirs.some(([dx,dy]) => !inShape(gx+dx, gy+dy)))
        { dist[gy][gx] = 0; q.push([gx, gy]); }
  let i = 0;
  while (i < q.length) {
    const [gx, gy] = q[i++];
    const d = dist[gy][gx];
    for (const [dx,dy] of dirs) {
      const nx = gx+dx, ny = gy+dy;
      if (inShape(nx, ny) && dist[ny]?.[nx] === -1)
        { dist[ny][nx] = d+1; q.push([nx, ny]); }
    }
  }
  return dist;
}

const GAP     = 6;
const TILE_W  = BW + GAP;
const EROSION = 1.5;
const SPEED   = 0.35;
const FONT_PX = 9;
const CHAR_W  = FONT_PX * 0.6;   // approx monospace char width
const COLORS  = ["#00ff88","#00ccff"];

export default function SPRibbon() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const preRef  = useRef<HTMLPreElement>(null);
  const dist    = useMemo(() => buildDist(), []);
  const [cols, setCols] = useState(300);

  // measure real pixel width → derive COLS
  useEffect(() => {
    const measure = () => {
      if (wrapRef.current) {
        const px = wrapRef.current.getBoundingClientRect().width;
        setCols(Math.ceil(px / CHAR_W) + 4);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (!cols) return;
    const CLONES  = Math.ceil(cols / TILE_W) + 2;
    const STRIP_W = TILE_W * CLONES;
    const ROWS    = H + 8;
    const OY      = Math.floor((ROWS - H) / 2);

    let frame = 0;
    let raf: number;

    function tick() {
      if (!preRef.current) return;

      const grid: string[][] = Array.from({ length: ROWS }, () =>
        new Array(cols).fill(" ")
      );

      const scroll = Math.floor(frame * SPEED) % STRIP_W;

      for (let c = 0; c < CLONES; c++) {
        const rawX = c * TILE_W - scroll;
        for (const startX of [rawX, rawX + STRIP_W]) {
          for (let gy = 0; gy < H; gy++) {
            for (let gx = 0; gx < BW; gx++) {
              if (!inShape(gx, gy)) continue;
              const rx = startX + gx;
              const ry = OY + gy;
              if (rx < 0 || rx >= cols || ry < 0 || ry >= ROWS) continue;
              const d = dist[gy]?.[gx] ?? 0;
              if (d > EROSION + 1)      grid[ry][rx] = "1";
              else if (d > EROSION - 1) grid[ry][rx] = Math.random() > 0.5 ? "1" : "0";
              else                      grid[ry][rx] = "0";
            }
          }
        }
      }

      let html = "";
      for (let ry = 0; ry < ROWS; ry++) {
        let seg = "", lastCol = "";
        const flush = () => {
          if (seg) html += lastCol
            ? `<span style="color:${lastCol};text-shadow:0 0 5px ${lastCol}55">${seg}</span>`
            : seg;
          seg = "";
        };
        for (let rx = 0; rx < cols; rx++) {
          const slot = ((rx + scroll) % STRIP_W);
          const ci   = Math.floor(slot / TILE_W) % 2;
          const col  = grid[ry][rx] === " " ? "" : COLORS[ci];
          if (col !== lastCol) { flush(); lastCol = col; }
          seg += grid[ry][rx];
        }
        flush();
        html += "<br>";
      }

      preRef.current.innerHTML = html;
      frame++;
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [dist, cols]);

  return (
    <div ref={wrapRef} style={{
      background: "#0a0a0a",
      minHeight: "100vh",
      width: "100vw",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "center",
      overflow: "hidden",
      boxSizing: "border-box",
    }}>
      <pre ref={preRef} style={{
        fontFamily: "'Courier New', monospace",
        fontSize: FONT_PX,
        lineHeight: 1.15,
        letterSpacing: "0.1em",
        userSelect: "none",
        whiteSpace: "pre",
        margin: 0,
        padding: 0,
      }} />
      <div style={{
        color: "#ffffff15", fontFamily: "monospace",
        fontSize: 10, letterSpacing: "0.3em",
        textTransform: "uppercase", paddingLeft: 8,
      }}>
        SP · letreiro ribbon
      </div>
    </div>
  );
}
