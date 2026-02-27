import { useEffect, useMemo, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  title: string;
  definition: string;
  verticalDefinition?: string;
  sankeyDefinition?: string;
  initialMode?: MermaidMode;
  initialOrientation?: MermaidOrientation;
  showControls?: boolean;
  showModeControls?: boolean;
  showOrientationControls?: boolean;
}

type MermaidMode = 'flow' | 'sankey';
type MermaidOrientation = 'horizontal' | 'vertical';

export function MermaidDiagram({
  title,
  definition,
  verticalDefinition,
  sankeyDefinition,
  initialMode = 'flow',
  initialOrientation = 'horizontal',
  showControls = true,
  showModeControls = true,
  showOrientationControls = true,
}: MermaidDiagramProps) {
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<MermaidMode>(initialMode);
  const [orientation, setOrientation] = useState<MermaidOrientation>(initialOrientation);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const id = useMemo(() => `mapa-mermaid-${Math.random().toString(36).slice(2, 10)}`, []);
  const supportsVertical = Boolean(verticalDefinition);
  const supportsSankey = Boolean(sankeyDefinition);
  const activeDefinition = mode === 'sankey'
    ? sankeyDefinition || definition
    : orientation === 'vertical' && verticalDefinition
      ? verticalDefinition
      : definition;

  useEffect(() => {
    if (mode === 'sankey' && !supportsSankey) {
      setMode('flow');
    }
  }, [mode, supportsSankey]);

  useEffect(() => {
    if (orientation === 'vertical' && !supportsVertical) {
      setOrientation('horizontal');
    }
  }, [orientation, supportsVertical]);

  useEffect(() => {
    let mounted = true;

    async function renderDiagram() {
      if (!hostRef.current) {
        return;
      }

      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          securityLevel: 'loose',
          fontFamily: 'Manrope, sans-serif',
          themeVariables: {
            primaryColor: '#ffffff',
            primaryTextColor: '#1a1a1a',
            primaryBorderColor: '#d8d8dc',
            lineColor: '#444b5a',
            tertiaryColor: '#f3f3f5',
          },
        });

        const { svg } = await mermaid.render(`${id}-${mode}-${orientation}`, activeDefinition);
        if (!mounted || !hostRef.current) {
          return;
        }
        hostRef.current.innerHTML = svg;
        setError(null);
      } catch (renderError) {
        if (!mounted) {
          return;
        }
        setError(renderError instanceof Error ? renderError.message : 'Falha ao renderizar Mermaid.');
      }
    }

    void renderDiagram();

    return () => {
      mounted = false;
    };
  }, [activeDefinition, id, mode, orientation]);

  return (
    <section className="glass-panel flex h-full min-h-[22rem] flex-col gap-4 p-5">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-xl/7 font-semibold text-foreground">{title}</h2>
        <span className="rounded-full border border-white/80 bg-white/70 px-3 py-1 text-xs/5 font-semibold tracking-[0.08em] text-accent uppercase">
          Mermaid
        </span>
      </header>

      {showControls ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/80 bg-white/60 px-3 py-2 text-xs/5 text-muted-foreground">
          {showModeControls ? (
            <>
              <p className="font-semibold tracking-[0.08em] uppercase">Visão</p>
              <button
                type="button"
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${mode === 'flow' ? 'bg-accent text-white' : 'bg-white/80 text-foreground hover:bg-white'}`}
                onClick={() => setMode('flow')}
              >
                Flowchart
              </button>
            </>
          ) : null}
          {showModeControls && supportsSankey ? (
            <button
              type="button"
              className={`rounded-lg px-2.5 py-1 font-semibold transition ${mode === 'sankey' ? 'bg-accent text-white' : 'bg-white/80 text-foreground hover:bg-white'}`}
              onClick={() => setMode('sankey')}
            >
              Sankey
            </button>
          ) : null}

          {showOrientationControls ? (
            <>
              <p className="ml-2 font-semibold tracking-[0.08em] uppercase">Orientação</p>
              <button
                type="button"
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${orientation === 'horizontal' ? 'bg-accent text-white' : 'bg-white/80 text-foreground hover:bg-white'}`}
                onClick={() => setOrientation('horizontal')}
                disabled={mode === 'sankey'}
              >
                Horizontal
              </button>
              <button
                type="button"
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${orientation === 'vertical' ? 'bg-accent text-white' : 'bg-white/80 text-foreground hover:bg-white'} disabled:cursor-not-allowed disabled:opacity-50`}
                onClick={() => setOrientation('vertical')}
                disabled={mode === 'sankey' || !supportsVertical}
              >
                Vertical
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-accent/30 bg-accent/8 p-4 text-sm/6 text-accent">
          <p className="font-semibold">Falha no diagrama</p>
          <p>{error}</p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-white/70 p-3 text-xs/5 text-foreground">{activeDefinition}</pre>
        </div>
      ) : (
        <div ref={hostRef} className="mermaid-shell flex-1 overflow-auto rounded-xl bg-white/70 p-3" />
      )}
    </section>
  );
}
