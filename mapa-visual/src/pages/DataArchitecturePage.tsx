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

      <MermaidDiagram
        title="Fluxo canônico"
        definition={snapshot.dataArchitecture.mermaid}
        verticalDefinition={snapshot.dataArchitecture.mermaidVertical}
        sankeyDefinition={snapshot.dataArchitecture.mermaidSankey}
      />

      <section className="glass-panel p-5">
        <h2 className="text-xl/7 font-semibold text-foreground">Componentes fundamentais da arquitetura de dados</h2>
        <p className="mt-2 text-sm/6 text-muted-foreground">
          Leitura executiva dos blocos que sustentam ingestão, sumarização e governança de contratos na camada de dados.
        </p>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <article className="rounded-xl border-2 border-[#2e4c3b]/45 bg-[#e9f3ed] p-4">
            <p className="text-xs/5 font-semibold tracking-[0.08em] text-[#1f3b2d] uppercase">Supabase</p>
            <h3 className="mt-1 text-lg/7 font-semibold text-[#1f3b2d]">Fonte de verdade transacional (SoR)</h3>
            <p className="mt-1 text-sm/6 text-[#2d4a3b]">
              Mantém contratos RPC authenticated e consistência operacional para o consumo no MAPA Syn.
            </p>
          </article>

          <article className="rounded-xl border-[1.8px] border-[#5b6170]/45 bg-[#edf0f4] p-4">
            <p className="text-xs/5 font-semibold tracking-[0.08em] text-[#2f3848] uppercase">Syn Middleware</p>
            <h3 className="mt-1 text-lg/7 font-semibold text-[#2f3848]">Orquestração e segregação de acesso</h3>
            <p className="mt-1 text-sm/6 text-[#3a4454]">
              Isola a UI da camada analítica, aplica guardrails e expõe o summary semântico via endpoint idempotente.
            </p>
          </article>

          <article className="rounded-xl border-2 border-[#c64928]/45 bg-[#fdebe4] p-4">
            <p className="text-xs/5 font-semibold tracking-[0.08em] text-[#7f2f1a] uppercase">ClickHouse</p>
            <h3 className="mt-1 text-lg/7 font-semibold text-[#7f2f1a]">Camada de performance analítica</h3>
            <p className="mt-1 text-sm/6 text-[#8f3a20]">
              Sustenta sumarização e leitura de sinais semânticos com alto desempenho para uso executivo.
            </p>
          </article>

          <article className="rounded-xl border-2 border-dashed border-[#c64928]/60 bg-[#fff8ec] p-4">
            <p className="text-xs/5 font-semibold tracking-[0.08em] text-[#7f2f1a] uppercase">Contratos PAT-SYN</p>
            <h3 className="mt-1 text-lg/7 font-semibold text-[#7f2f1a]">Governança de integração</h3>
            <p className="mt-1 text-sm/6 text-[#8f3a20]">
              Delimitam acoplamento permitido entre fontes, middleware e UI, reduzindo drift entre releases.
            </p>
          </article>
        </div>
      </section>

      <ArchitectureCanvas title="Organograma estrutural" nodes={snapshot.dataArchitecture.nodes} edges={snapshot.dataArchitecture.edges} />

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
