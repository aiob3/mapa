import { ArchitectureCanvas } from '@/components/ArchitectureCanvas';
import { MermaidDiagram } from '@/components/MermaidDiagram';
import { snapshot } from '@/data/snapshot';

export function AppArchitecturePage() {
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

      <div className="grid gap-5 xl:grid-cols-2">
        <MermaidDiagram
          title="Mapa de módulos e rotas"
          definition={snapshot.appArchitecture.mermaid}
          verticalDefinition={snapshot.appArchitecture.mermaidVertical}
          sankeyDefinition={snapshot.appArchitecture.mermaidSankey}
        />
        <ArchitectureCanvas
          title="Segmentação por áreas"
          nodes={canvasNodes}
          edges={canvasEdges}
        />
      </div>

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
