import { MermaidDiagram } from '@/components/MermaidDiagram';
import { snapshot } from '@/data/snapshot';

export function AppDataArchitecturePage() {
  return (
    <section className="space-y-5">
      <header className="space-y-2">
        <p className="text-xs/5 font-semibold tracking-[0.08em] text-accent uppercase">Vista 3</p>
        <h1 className="text-3xl/10 font-semibold text-foreground">mapa-app x Dados</h1>
        <p className="max-w-3xl text-base/7 text-muted-foreground">
          Visão executiva dos bindings entre áreas da UI, endpoints de analytics e contratos canônicos.
        </p>
      </header>

      <MermaidDiagram
        title="Fluxo UI → dados"
        definition={snapshot.appDataArchitecture.mermaid}
        verticalDefinition={snapshot.appDataArchitecture.mermaidVertical}
      />

      <section className="glass-panel p-5">
        <h2 className="text-xl/7 font-semibold text-foreground">Correlação end-to-end e idempotência</h2>
        <p className="mt-2 text-sm/6 text-muted-foreground">
          A visão consolida chamadas por endpoint para eliminar leitura fragmentada por widget e explicita o fluxo idempotente
          do summary semântico (GET via middleware) antes do retorno para a UI.
        </p>
      </section>

      <section className="glass-panel overflow-hidden p-0">
        <header className="border-b border-white/80 bg-white/75 px-5 py-4">
          <h2 className="text-xl/7 font-semibold text-foreground">Matriz de bindings</h2>
        </header>
        <div className="overflow-auto">
          <table className="min-w-full text-left text-sm/6">
            <thead className="bg-white/80 text-xs/5 uppercase tracking-[0.08em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">View</th>
                <th className="px-4 py-3">Área UI</th>
                <th className="px-4 py-3">Fonte</th>
                <th className="px-4 py-3">Endpoint</th>
                <th className="px-4 py-3">Contratos</th>
                <th className="px-4 py-3">Risco</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.appDataArchitecture.bindings.map((binding) => (
                <tr key={`${binding.viewPath}-${binding.endpoint}`} className="border-t border-white/70 bg-white/65 align-top">
                  <td className="px-4 py-3 font-semibold text-foreground">{binding.viewPath}</td>
                  <td className="px-4 py-3 text-muted-foreground">{binding.uiArea}</td>
                  <td className="px-4 py-3 text-muted-foreground">{binding.sourceType}</td>
                  <td className="px-4 py-3 font-mono text-xs/5 text-foreground">{binding.endpoint}</td>
                  <td className="px-4 py-3 text-xs/5 text-muted-foreground">{binding.contractRefs.join(', ')}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs/5 font-semibold uppercase ${binding.riskLevel === 'high' ? 'bg-accent/15 text-accent' : binding.riskLevel === 'medium' ? 'bg-[#f59e0b]/15 text-[#965600]' : 'bg-success/15 text-success'}`}>
                      {binding.riskLevel}
                    </span>
                    <p className="mt-2 text-xs/5 text-muted-foreground">{binding.failureModes.join(' · ')}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
