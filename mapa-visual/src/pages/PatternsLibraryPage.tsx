import { ArchitectureCanvas } from '@/components/ArchitectureCanvas';

export function PatternsLibraryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="glass-panel p-6 space-y-4">
        <h2 className="text-2xl font-semibold">UI Components & Pattern Catalog</h2>
        <p className="text-base/7 text-muted-foreground">
          Este catálogo interativo apresenta os componentes disponíveis nos repositórios <code className="text-xs bg-white/70 px-1.5 py-0.5 rounded">mapa-visual</code> e <code className="text-xs bg-white/70 px-1.5 py-0.5 rounded">mapa-app</code>. 
          Eles devem ser utilizados como blocos fundamentais ao estruturar novos recursos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Layout */}
        <section className="glass-panel p-6 space-y-4">
          <h3 className="text-lg font-semibold border-b border-white/20 pb-2">Layout & Arquitetura</h3>
          <ul className="space-y-3 text-sm/6">
            <li>
              <strong className="text-foreground">ArchitectureCanvas</strong>
              <p className="text-muted-foreground">Componente de canvas para diagramação de infraestrutura. <br/> <em className="text-xs">Props chaves: title, nodes, edges</em>.</p>
            </li>
            <li>
              <strong className="text-foreground">ExecutiveSummaryPanel</strong>
              <p className="text-muted-foreground">Painel de leitura de metadados focados em visões macro de componentes técnicos.</p>
            </li>
            <li>
              <strong className="text-foreground">MermaidDiagram</strong>
              <p className="text-muted-foreground">Visualizador de linguagem Mermaid encapsulado para fluxos da arquitetura.</p>
            </li>
            <li>
              <strong className="text-foreground">AppLayout (mapa-app)</strong>
              <p className="text-muted-foreground">Contêiner mestre com as áreas de topo e barra lateral.</p>
            </li>
          </ul>
        </section>

        {/* HITL / Mindmap */}
        <section className="glass-panel p-6 space-y-4">
          <h3 className="text-lg font-semibold border-b border-white/20 pb-2">Mapas Cognitivos & HITL</h3>
          <ul className="space-y-3 text-sm/6">
            <li>
              <strong className="text-foreground">TechnicalMindmap</strong>
              <p className="text-muted-foreground">Componente raiz para organizacão de mapas mentais e injetar score semântico por nó.</p>
            </li>
            <li>
              <strong className="text-foreground">HitlMetrics Engine</strong>
              <p className="text-muted-foreground">Core para cálculo de checkpoints (snapshot, diff, positions).</p>
            </li>
            <li>
              <strong className="text-foreground">Mindmap Layout</strong>
              <p className="text-muted-foreground">Motor de distribuição espacial em árvore, horizontal ou vertical (L1-L4).</p>
            </li>
          </ul>
        </section>

        {/* Funcionais e Analíticos */}
        <section className="glass-panel p-6 space-y-4">
          <h3 className="text-lg font-semibold border-b border-white/20 pb-2">Negócio Analítico (mapa-app)</h3>
          <ul className="space-y-3 text-sm/6">
            <li>
              <strong className="text-foreground">SynComposer / SynHeader</strong>
              <p className="text-muted-foreground">Interfaces do motor interativo para ações guiadas.</p>
            </li>
            <li>
              <strong className="text-foreground">BoardViewModal / PresentationModal</strong>
              <p className="text-muted-foreground">Modais macro que encerram fluxos (kanban / relatórios).</p>
            </li>
            <li>
              <strong className="text-foreground">StrategicHeatmap / SectorAnalysis</strong>
              <p className="text-muted-foreground">Gráficos de análise avançada de CRM.</p>
            </li>
          </ul>
        </section>

        {/* Shadcn UI */}
        <section className="glass-panel p-6 space-y-4">
          <h3 className="text-lg font-semibold border-b border-white/20 pb-2">Shadcn UI Core (mapa-app)</h3>
          <p className="text-sm/6 text-muted-foreground">Primitivas disponíveis para compor a interface interagível do usuário.</p>
          <div className="flex flex-wrap gap-2 pt-2">
            {['Button', 'Card', 'Dialog', 'Dropdown', 'Input', 'Select', 'Table', 'Tabs', 'Accordion', 'Sheet', 'Badge'].map(cmp => (
              <span key={cmp} className="bg-white/60 text-foreground px-2 py-0.5 rounded text-xs font-semibold">{cmp}</span>
            ))}
            <span className="bg-white/40 text-foreground px-2 py-0.5 rounded text-xs font-semibold">+ 35 outros primitivos</span>
          </div>
        </section>
      </div>
      
      {/* Live Preview / Mock Showcase */}
      <section className="mt-8 space-y-6">
        <h3 className="text-xl font-semibold">Showcase Dinâmico</h3>
        <ArchitectureCanvas 
          title="Component Composition Example" 
          nodes={[
            { id: '1', label: 'Pattern Catalog', kind: 'System', group: 'docs', description: 'Interactive Document', x: 200, y: 100 },
            { id: '2', label: 'mapa-visual', kind: 'Subsystem', group: 'app', description: 'Host environment', x: 100, y: 200 },
            { id: '3', label: 'mapa-app', kind: 'Subsystem', group: 'app', description: 'Primary component source', x: 300, y: 200 }
          ]} 
          edges={[
            { id: 'e1', from: '2', to: '1', label: 'Renders' },
            { id: 'e2', from: '3', to: '1', label: 'Provides context' }
          ]}
        />
      </section>
    </div>
  );
}
