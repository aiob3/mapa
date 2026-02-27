import type { ArchitectureSnapshotV1 } from '@/types/architecture';

interface ExecutiveSummaryPanelProps {
  snapshot: ArchitectureSnapshotV1;
}

function statusClass(status: ArchitectureSnapshotV1['executivePillars'][number]['status']) {
  if (status === 'critical') {
    return 'bg-accent/15 text-accent border-accent/30';
  }
  if (status === 'attention') {
    return 'bg-[#f59e0b]/15 text-[#a16100] border-[#f59e0b]/30';
  }
  return 'bg-success/15 text-success border-success/30';
}

export function ExecutiveSummaryPanel({ snapshot }: ExecutiveSummaryPanelProps) {
  return (
    <aside className="glass-panel sticky top-6 flex h-fit flex-col gap-4 p-5">
      <header className="space-y-2">
        <p className="text-xs/5 font-semibold tracking-[0.08em] text-accent uppercase">Resumo Executivo</p>
        <h2 className="text-xl/7 font-semibold text-foreground">Arquitetura vigente</h2>
        <p className="text-sm/6 text-muted-foreground">
          Snapshot versionado para homologação incremental das fundações.
        </p>
      </header>

      <div className="rounded-xl border border-white/80 bg-white/70 p-4 text-sm/6 text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">Versão:</span> {snapshot.version}
        </p>
        <p>
          <span className="font-semibold text-foreground">Gerado em:</span>{' '}
          {new Date(snapshot.generatedAt).toLocaleString('pt-BR')}
        </p>
        <p>
          <span className="font-semibold text-foreground">Fontes:</span> {snapshot.sourceFiles.length}
        </p>
      </div>

      <section className="space-y-3">
        <h3 className="text-sm/6 font-semibold tracking-[0.08em] text-foreground uppercase">Pilares críticos</h3>
        {snapshot.executivePillars.map((pillar) => (
          <article key={pillar.id} className="rounded-xl border border-white/80 bg-white/75 p-4">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm/6 font-semibold text-foreground">{pillar.title}</h4>
              <span className={`rounded-full border px-2.5 py-1 text-[11px]/4 font-semibold uppercase ${statusClass(pillar.status)}`}>
                {pillar.status}
              </span>
            </div>
            <p className="mt-2 text-sm/6 text-muted-foreground">{pillar.description}</p>
            <ul className="mt-3 space-y-1 text-xs/5 text-muted-foreground">
              {pillar.evidenceRefs.map((ref) => (
                <li key={ref}>• {ref}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-white/80 bg-white/70 p-4">
        <h3 className="text-sm/6 font-semibold tracking-[0.08em] text-foreground uppercase">Source files</h3>
        <ul className="mt-2 space-y-1 text-xs/5 text-muted-foreground">
          {snapshot.sourceFiles.map((sourceFile) => (
            <li key={sourceFile} className="font-mono">
              {sourceFile}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-accent/25 bg-accent/10 p-4">
        <p className="text-xs/5 font-semibold tracking-[0.08em] text-accent uppercase">Comando de refresh</p>
        <code className="mt-2 block rounded-lg bg-white/80 px-3 py-2 text-xs/5 text-foreground">npm run visual:refresh</code>
      </section>
    </aside>
  );
}
