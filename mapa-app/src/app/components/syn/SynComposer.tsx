import React from 'react';
import { Layers, Plus, RefreshCw, Workflow } from 'lucide-react';

import { GlassCard } from '../GlassCard';
import { useSynContext } from './SynContext';

const WIDGET_PATTERNS = [
  {
    id: 'PAT-WIDGET-001',
    label: 'KPI Widget',
    description: 'Cards de indicador com foco em métricas executivas de curto ciclo.',
  },
  {
    id: 'PAT-WIDGET-002',
    label: 'Chart Widget',
    description: 'Visualizações temporais e comparativas para leitura narrativa.',
  },
  {
    id: 'PAT-WIDGET-003',
    label: 'Matrix Widget',
    description: 'Mapas de calor e matrizes para correlação setorial/regional.',
  },
  {
    id: 'PAT-WIDGET-004',
    label: 'Narrative Widget',
    description: 'Lista priorizada de insights e recomendações acionáveis.',
  },
  {
    id: 'PAT-WIDGET-005',
    label: 'Lead Widget',
    description: 'Componente de lead correlacionado com score, status e impacto.',
  },
];

export function SynComposer() {
  const { refreshAll, analyticsStatus } = useSynContext();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-[#1A1A1A]"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 600 }}
          >
            Composer Analítico
          </h1>
          <p
            className="text-[13px] text-[#717182] mt-1"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Catálogo canônico de widgets para composição avançada sem regressão visual.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refreshAll()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/65 border border-white/40 text-[#1A1A1A] hover:bg-white/80 transition-all"
          style={{
            backdropFilter: 'blur(24px) saturate(150%)',
            fontFamily: "'Inter', sans-serif",
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          <RefreshCw size={14} />
          Recarregar Dados
        </button>
      </div>

      {analyticsStatus.error && (
        <GlassCard className="!p-4 mb-5">
          <p className="text-[12px] text-[#C64928]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
            Falha parcial de analytics: {analyticsStatus.error}
          </p>
        </GlassCard>
      )}

      <div className="grid grid-cols-[1.4fr_1fr] gap-5">
        <GlassCard className="!p-6">
          <div className="flex items-center gap-2 mb-4">
            <Workflow size={15} className="text-[#C64928]" />
            <h2 className="text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 600 }}>
              Patterns Canônicos
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {WIDGET_PATTERNS.map((pattern) => (
              <div
                key={pattern.id}
                className="rounded-2xl border border-white/50 bg-white/65 px-4 py-3"
                style={{ backdropFilter: 'blur(24px) saturate(150%)' }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[13px] text-[#1A1A1A]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>
                    {pattern.label}
                  </p>
                  <span className="text-[10px] text-[#717182]" style={{ fontFamily: "'Space Mono', monospace" }}>
                    {pattern.id}
                  </span>
                </div>
                <p className="text-[12px] text-[#717182] mt-1" style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>
                  {pattern.description}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="!p-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={15} className="text-[#C64928]" />
            <h2 className="text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 600 }}>
              Binding
            </h2>
          </div>

          <p className="text-[12px] text-[#717182] mb-4" style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
            O binding final desta composição segue contrato idempotente versionado no backend (`api_syn_*_v1`) e não altera token visual.
          </p>

          <button
            type="button"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-white"
            style={{
              background: '#C64928',
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            <Plus size={14} />
            Vincular Widget ao Domínio
          </button>
        </GlassCard>
      </div>
    </div>
  );
}
