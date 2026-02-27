import { ArchitectureCanvas } from '@/components/ArchitectureCanvas';
import { MermaidDiagram } from '@/components/MermaidDiagram';
import { snapshot } from '@/data/snapshot';

const guardrails = [
  'Ingestão canônica backend-only (service_role) para RPCs de gravação.',
  'SYN_MIDDLEWARE_TOKEN obrigatório por padrão em dev/homolog/prod.',
  'Frontend consome apenas middleware para semantic summary, nunca ClickHouse direto.',
  'Separação SoR (Supabase) e camada de performance semântica (ClickHouse).',
];

export function DataArchitecturePage() {
  return (
    <section className="space-y-5">
      <header className="space-y-2">
        <p className="text-xs/5 font-semibold tracking-[0.08em] text-accent uppercase">Vista 1</p>
        <h1 className="text-3xl/10 font-semibold text-foreground">Arquitetura de Dados</h1>
        <p className="max-w-3xl text-base/7 text-muted-foreground">
          Blueprint da operação vigente entre Supabase, middleware Syn e ClickHouse para suportar ingestão,
          normalização semântica e consumo executivo.
        </p>
      </header>

      <div className="grid gap-5 xl:grid-cols-2">
        <MermaidDiagram
          title="Fluxo canônico"
          definition={snapshot.dataArchitecture.mermaid}
          verticalDefinition={snapshot.dataArchitecture.mermaidVertical}
          sankeyDefinition={snapshot.dataArchitecture.mermaidSankey}
        />
        <ArchitectureCanvas title="Organograma estrutural" nodes={snapshot.dataArchitecture.nodes} edges={snapshot.dataArchitecture.edges} />
      </div>

      <section className="glass-panel p-5">
        <h2 className="text-xl/7 font-semibold text-foreground">Guardrails mandatórios</h2>
        <ul className="mt-3 grid gap-2 text-sm/6 text-muted-foreground md:grid-cols-2">
          {guardrails.map((rule) => (
            <li key={rule} className="rounded-xl border border-white/80 bg-white/70 px-4 py-3">
              {rule}
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
