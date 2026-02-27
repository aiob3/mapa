import { useMemo, useState } from 'react';
import { ArchitectureCanvas } from '@/components/ArchitectureCanvas';
import { MermaidDiagram } from '@/components/MermaidDiagram';
import { TechnicalMindmap, type TechnicalLevel, type TechnicalOrientation } from '@/components/TechnicalMindmap';
import { snapshot } from '@/data/snapshot';

type TechnicalRenderer = 'mindmap' | 'mermaid';

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

function buildExecutiveFlow(orientation: 'LR' | 'TB') {
  const lines = [`flowchart ${orientation}`, '  APP["MAPA-App<br/>Top-menu"]'];
  const modules = snapshot.appArchitecture.modules;
  modules.forEach((module, index) => {
    const nodeId = `EM${index}`;
    lines.push(`  ${nodeId}["${module.label}"]`);
    lines.push(`  APP --> ${nodeId}`);
  });

  const synModule = modules.find((item) => item.path === '/syn');
  const teamModule = modules.find((item) => item.path === '/team');
  const synNodeId = synModule ? `EM${modules.findIndex((item) => item.id === synModule.id)}` : 'EM0';
  const teamNodeId = teamModule ? `EM${modules.findIndex((item) => item.id === teamModule.id)}` : 'EM0';
  lines.push('  SYN_AREAS["MAPA Syn<br/>Sub-áreas"]');
  lines.push('  TEAM_AREAS["Team Hub<br/>Sub-áreas"]');
  lines.push(`  ${synNodeId} --> SYN_AREAS`);
  lines.push(`  ${teamNodeId} --> TEAM_AREAS`);

  const uniqueSyn = uniqueBy(
    snapshot.appArchitecture.sidebars.filter((item) => item.context === 'mapa-syn'),
    (item) => item.path,
  );
  const uniqueTeam = uniqueBy(
    snapshot.appArchitecture.sidebars.filter((item) => item.context === 'team-hub'),
    (item) => item.path,
  );

  uniqueSyn.slice(0, 5).forEach((item, index) => {
    lines.push(`  ES${index}["${item.subLabel || item.label}"]`);
    lines.push(`  SYN_AREAS --> ES${index}`);
  });

  uniqueTeam.slice(0, 5).forEach((item, index) => {
    lines.push(`  ET${index}["${item.subLabel || item.label}"]`);
    lines.push(`  TEAM_AREAS --> ET${index}`);
  });

  return lines.join('\n');
}

function buildTechnicalFlow(level: TechnicalLevel, orientation: 'LR' | 'TB') {
  const lines = [`flowchart ${orientation}`, '  APP["MAPA-App<br/>Top-menu"]'];
  const modules = snapshot.appArchitecture.modules;
  const uniqueSidebars = uniqueBy(snapshot.appArchitecture.sidebars, (item) => `${item.context}:${item.path}`);

  modules.forEach((module, index) => {
    const nodeId = `TM${index}`;
    const label = level === 'L3' ? `${module.label}<br/>${module.path}` : module.label;
    lines.push(`  ${nodeId}["${label}"]`);
    lines.push(`  APP --> ${nodeId}`);
  });

  const synModuleIndex = modules.findIndex((item) => item.path === '/syn');
  const teamModuleIndex = modules.findIndex((item) => item.path === '/team');
  const synNodeId = `TM${synModuleIndex >= 0 ? synModuleIndex : 0}`;
  const teamNodeId = `TM${teamModuleIndex >= 0 ? teamModuleIndex : 0}`;

  lines.push('  SYN_AREAS["MAPA Syn<br/>Sub-áreas"]');
  lines.push('  TEAM_AREAS["Team Hub<br/>Sub-áreas"]');
  lines.push(`  ${synNodeId} --> SYN_AREAS`);
  lines.push(`  ${teamNodeId} --> TEAM_AREAS`);

  if (level === 'L2' || level === 'L3') {
    uniqueSidebars.slice(0, 10).forEach((item, index) => {
      const label = level === 'L3' ? `${item.subLabel || item.label}<br/>${item.path}` : item.subLabel || item.label;
      lines.push(`  TS${index}["${label}"]`);
      if (item.context === 'mapa-syn') {
        lines.push(`  SYN_AREAS --> TS${index}`);
      } else {
        lines.push(`  TEAM_AREAS --> TS${index}`);
      }
    });
  }

  if (level === 'L3') {
    const modulePaths = new Set(modules.map((module) => module.path));
    const sidebarPaths = new Set(uniqueSidebars.map((item) => item.path));
    const technicalRoutes = [...new Set(snapshot.appArchitecture.routes)]
      .filter((route) => route !== '/' && route !== '*' && !modulePaths.has(route) && !sidebarPaths.has(route))
      .filter((route) => route.startsWith('/syn') || route.startsWith('/analytics') || route.startsWith('/team'))
      .slice(0, 10);

    technicalRoutes.forEach((route, index) => {
      lines.push(`  TR${index}["${route}"]`);
      if (route.startsWith('/team')) {
        lines.push(`  TEAM_AREAS --> TR${index}`);
      } else {
        lines.push(`  SYN_AREAS --> TR${index}`);
      }
    });
  }

  return lines.join('\n');
}

export function AppArchitecturePage() {
  const [technicalLevel, setTechnicalLevel] = useState<TechnicalLevel>('L1');
  const [technicalRenderer, setTechnicalRenderer] = useState<TechnicalRenderer>('mindmap');
  const [technicalOrientation, setTechnicalOrientation] = useState<TechnicalOrientation>('horizontal');
  const executiveFlow = useMemo(() => buildExecutiveFlow('LR'), []);
  const executiveFlowVertical = useMemo(() => buildExecutiveFlow('TB'), []);
  const technicalFlow = useMemo(
    () => buildTechnicalFlow(technicalLevel, technicalOrientation === 'horizontal' ? 'LR' : 'TB'),
    [technicalLevel, technicalOrientation],
  );

  const moduleNodes = snapshot.appArchitecture.modules.map((module, index) => ({
    id: module.id,
    label: module.label,
    kind: 'module',
    description: `Rota base ${module.path} · módulo primário ${module.primaryModule}.`,
    group: 'Top Navigation',
    x: 60 + (index % 3) * 340,
    y: 90 + Math.floor(index / 3) * 190,
  }));

  const sidebarNodes = snapshot.appArchitecture.sidebars.slice(0, 8).map((item, index) => ({
    id: `sidebar-${index}`,
    label: item.label,
    kind: 'sidebar-item',
    description: `${item.path} · ${item.subLabel}`,
    group: item.context === 'mapa-syn' ? 'Sidebar MAPA Syn' : 'Sidebar Team Hub',
    x: 80 + (index % 4) * 300,
    y: 430 + Math.floor(index / 4) * 170,
  }));

  const canvasNodes = [...moduleNodes, ...sidebarNodes];
  const synModule = snapshot.appArchitecture.modules.find((item) => item.path === '/syn')?.id || snapshot.appArchitecture.modules[0]?.id || 'module-syn';
  const teamModule = snapshot.appArchitecture.modules.find((item) => item.path === '/team')?.id || snapshot.appArchitecture.modules[0]?.id || 'module-team';
  const canvasEdges = sidebarNodes.map((node, index) => ({
    id: `module-sidebar-${index}`,
    from: node.group.includes('MAPA Syn') ? synModule : teamModule,
    to: node.id,
    label: 'navegação contextual',
  }));

  return (
    <section className="space-y-5">
      <header className="space-y-2">
        <p className="text-xs/5 font-semibold tracking-[0.08em] text-accent uppercase">Vista 2</p>
        <h1 className="text-3xl/10 font-semibold text-foreground">Arquitetura do mapa-app</h1>
        <p className="max-w-3xl text-base/7 text-muted-foreground">
          Segmentação de módulos, rotas e navegações laterais reais extraídas do estado implementado no app.
        </p>
      </header>

      <div className="space-y-5">
        <MermaidDiagram
          title="Mapa executivo de módulos"
          definition={executiveFlow}
          verticalDefinition={executiveFlowVertical}
          sankeyDefinition={snapshot.appArchitecture.mermaidSankey}
          initialMode="sankey"
        />

        <section className="glass-panel p-5">
          <header className="space-y-2">
            <h2 className="text-xl/7 font-semibold text-foreground">Mapa técnico</h2>
            <p className="text-sm/6 text-muted-foreground">
              Leitura progressiva com um único ponto de controle: nível de profundidade, renderer e orientação.
            </p>
          </header>

          <div className="mt-4 grid gap-3 rounded-xl border border-white/80 bg-white/60 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs/5 font-semibold tracking-[0.08em] text-muted-foreground uppercase">Nível</p>
              {(['L1', 'L2', 'L3'] as TechnicalLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`rounded-lg px-3 py-1.5 text-xs/5 font-semibold tracking-[0.06em] uppercase transition ${technicalLevel === level ? 'bg-accent text-white' : 'bg-white/80 text-foreground hover:bg-white'}`}
                  onClick={() => setTechnicalLevel(level)}
                >
                  {level}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs/5 font-semibold tracking-[0.08em] text-muted-foreground uppercase">Renderer</p>
              <button
                type="button"
                className={`rounded-lg px-3 py-1.5 text-xs/5 font-semibold tracking-[0.06em] uppercase transition ${technicalRenderer === 'mindmap' ? 'bg-accent text-white' : 'bg-white/80 text-foreground hover:bg-white'}`}
                onClick={() => setTechnicalRenderer('mindmap')}
              >
                Mindmap
              </button>
              <button
                type="button"
                className={`rounded-lg px-3 py-1.5 text-xs/5 font-semibold tracking-[0.06em] uppercase transition ${technicalRenderer === 'mermaid' ? 'bg-accent text-white' : 'bg-white/80 text-foreground hover:bg-white'}`}
                onClick={() => setTechnicalRenderer('mermaid')}
              >
                Mermaid fallback
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs/5 font-semibold tracking-[0.08em] text-muted-foreground uppercase">Orientação</p>
              <button
                type="button"
                className={`rounded-lg px-3 py-1.5 text-xs/5 font-semibold tracking-[0.06em] uppercase transition ${technicalOrientation === 'horizontal' ? 'bg-accent text-white' : 'bg-white/80 text-foreground hover:bg-white'}`}
                onClick={() => setTechnicalOrientation('horizontal')}
              >
                Horizontal
              </button>
              <button
                type="button"
                className={`rounded-lg px-3 py-1.5 text-xs/5 font-semibold tracking-[0.06em] uppercase transition ${technicalOrientation === 'vertical' ? 'bg-accent text-white' : 'bg-white/80 text-foreground hover:bg-white'}`}
                onClick={() => setTechnicalOrientation('vertical')}
              >
                Vertical
              </button>
            </div>
          </div>

          <p className="mt-3 text-xs/5 text-muted-foreground">
            Padrão inicial: mindmap. Em caso de revisão técnica ou regressão visual, alternar para Mermaid fallback sem perder o mesmo estado de nível/orientação.
          </p>

          <div className="mt-4">
            {technicalRenderer === 'mindmap' ? (
              <TechnicalMindmap snapshot={snapshot} level={technicalLevel} orientation={technicalOrientation} />
            ) : (
              <MermaidDiagram
                title={`Mapa técnico (${technicalLevel})`}
                definition={technicalFlow}
                showControls={false}
                showModeControls={false}
                showOrientationControls={false}
              />
            )}
          </div>
        </section>

        <ArchitectureCanvas
          title="Segmentação por áreas"
          nodes={canvasNodes}
          edges={canvasEdges}
        />
      </div>

      <section className="glass-panel p-5">
        <h2 className="text-xl/7 font-semibold text-foreground">Critérios de reversão e revisão</h2>
        <ul className="mt-3 grid gap-2 text-sm/6 text-muted-foreground">
          <li className="rounded-xl border border-white/80 bg-white/70 px-4 py-3">
            Reverter para leitura técnica completa (`L3`) se qualquer detalhe de rota crítica deixar de ficar evidente na homologação.
          </li>
          <li className="rounded-xl border border-white/80 bg-white/70 px-4 py-3">
            Revisar o plano se houver divergência entre `routes.ts` e o diagrama técnico em duas execuções consecutivas de `visual:refresh`.
          </li>
          <li className="rounded-xl border border-white/80 bg-white/70 px-4 py-3">
            Manter Sankey como inicial somente se o operador confirmar ganho de entendimento em até 30 segundos de leitura.
          </li>
        </ul>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="glass-panel p-5">
          <h2 className="text-xl/7 font-semibold text-foreground">Módulos TopNav</h2>
          <ul className="mt-3 space-y-2 text-sm/6 text-muted-foreground">
            {snapshot.appArchitecture.modules.map((module) => (
              <li key={module.id} className="rounded-xl border border-white/80 bg-white/70 px-4 py-3">
                <p className="font-semibold text-foreground">{module.label}</p>
                <p>{module.path}</p>
                <p className="text-xs/5 uppercase tracking-[0.08em]">Módulo primário: {module.primaryModule}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="glass-panel p-5">
          <h2 className="text-xl/7 font-semibold text-foreground">Menus laterais por contexto</h2>
          <ul className="mt-3 space-y-2 text-sm/6 text-muted-foreground">
            {snapshot.appArchitecture.sidebars.map((sidebar) => (
              <li key={`${sidebar.context}-${sidebar.path}`} className="rounded-xl border border-white/80 bg-white/70 px-4 py-3">
                <p className="font-semibold text-foreground">{sidebar.label}</p>
                <p>{sidebar.path}</p>
                <p className="text-xs/5 uppercase tracking-[0.08em]">Contexto: {sidebar.context}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </section>
  );
}
