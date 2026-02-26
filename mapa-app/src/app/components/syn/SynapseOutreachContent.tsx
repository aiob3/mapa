import React from 'react';
import { Search, Calendar, SlidersHorizontal, TrendingUp, Sparkles, ArrowUpRight } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';

import { GlassCard } from '../GlassCard';
import { useSynContext } from './SynContext';

export function SynapseOutreachContent() {
  const { analytics, analyticsStatus } = useSynContext();
  const chartData = analytics.outreach.chartData;
  const radarData = analytics.outreach.radarData;
  const leads = analytics.outreach.leads;
  const globalConversionRate = analytics.outreach.globalConversionRate;
  const globalConversionDelta = analytics.outreach.globalConversionDelta;
  const scriptsGenerated = analytics.outreach.scriptsGenerated;
  const toneInsights = analytics.outreach.toneInsights;

  return (
    <div className="max-w-7xl mx-auto">
        {analyticsStatus.loading && (
          <GlassCard className="!p-4 mb-5">
            <p className="text-[12px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>
              Carregando dados de outreach...
            </p>
          </GlassCard>
        )}

        {analyticsStatus.error && (
          <GlassCard className="!p-4 mb-5">
            <p className="text-[12px] text-[#C64928]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
              Falha parcial de analytics: {analyticsStatus.error}
            </p>
          </GlassCard>
        )}

        <div className="flex items-center justify-between mb-8">
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 600, fontStyle: 'italic' }}>
            Análise de Outreach
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/65 backdrop-blur-[24px] border border-white/40 shadow-sm w-[260px]">
              <Search size={16} className="text-[#717182]" />
              <input
                type="text"
                placeholder="Buscar por consultor..."
                className="bg-transparent outline-none text-[13px] flex-1 placeholder:text-[#717182]/60"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>
            <button className="p-2.5 rounded-full bg-white/65 backdrop-blur-[24px] border border-white/40 shadow-sm">
              <Calendar size={16} className="text-[#717182]" />
            </button>
            <button className="p-2.5 rounded-full bg-white/65 backdrop-blur-[24px] border border-white/40 shadow-sm">
              <SlidersHorizontal size={16} className="text-[#717182]" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[340px_1fr_280px] gap-5">
          <div className="flex flex-col gap-5">
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 600, lineHeight: 1.3 }}>
                  Performance de Conversão
                </h3>
                <TrendingUp size={16} className="text-[#717182]" />
              </div>
              <p className="text-[12px] text-[#717182] mb-6" style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
                Comparativo de eficácia entre scripts gerados por IA e abordagem padrão.
              </p>

              <div className="flex items-end gap-3 mb-2">
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '42px', fontWeight: 400, color: '#C64928' }}>
                  {globalConversionRate}
                </span>
                <span className="flex items-center gap-1 text-[#2E4C3B] text-[13px] mb-2" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                  <ArrowUpRight size={14} /> {globalConversionDelta}
                </span>
              </div>
              <span className="text-[10px] text-[#717182] tracking-[0.1em] uppercase" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                TAXA DE CONVERSÃO GLOBAL (IA)
              </span>

              <div className="mt-6 h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C64928" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#C64928" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#717182', fontFamily: "'Inter', sans-serif" }} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(26, 26, 26, 0.9)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '8px 12px',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '12px',
                        color: 'white',
                      }}
                      formatter={(value: number) => [`Pico IA: ${value}%`, '']}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#C64928"
                      strokeWidth={2}
                      fill="url(#colorValue)"
                      dot={{ fill: '#C64928', r: 3 }}
                      activeDot={{ r: 5, fill: '#C64928' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#717182] tracking-[0.1em] uppercase" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                    SCRIPTS GERADOS
                  </span>
                  <div className="mt-1">
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '36px', fontWeight: 700, color: '#1A1A1A' }}>
                      {scriptsGenerated}
                    </span>
                  </div>
                </div>
                <Sparkles size={20} className="text-[#C64928]" />
              </div>
            </GlassCard>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 600 }}>
                Engajamento por Lead
              </h3>
              <button className="text-[12px] text-[#C64928]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                VER TODOS
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {leads.map((lead) => (
                <GlassCard key={lead.name} className="!p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-[11px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                          {lead.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[14px] text-[#1A1A1A]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                          {lead.name}
                        </span>
                        <p className="text-[11px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>{lead.sector}</p>
                      </div>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-white text-[9px] tracking-[0.1em]"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, background: lead.toneColor }}
                    >
                      {lead.tone}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-[9px] text-[#717182] tracking-[0.1em] uppercase" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                        TAXA DE ABERTURA
                      </span>
                      <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '18px', fontWeight: 700, color: '#1A1A1A' }} className="mt-1">
                        {lead.openRate}
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#717182] tracking-[0.1em] uppercase" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                        TAXA DE CLIQUE
                      </span>
                      <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '18px', fontWeight: 700, color: '#1A1A1A' }} className="mt-1">
                        {lead.clickRate}
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#717182] tracking-[0.1em] uppercase" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                        SCORE IA
                      </span>
                      <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '18px', fontWeight: 700, color: lead.scoreColor }} className="mt-1">
                        {lead.scoreIA}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          <div>
            <GlassCard>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 600 }} className="mb-1">
                Insights de Tom
              </h3>
              <p className="text-[12px] text-[#717182] mb-4" style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
                O tom <span className="text-[#4A6FA5]" style={{ fontWeight: 600 }}>Analítico</span> apresenta +34% de engajamento no setor financeiro, enquanto{' '}
                <span className="text-[#C64928]" style={{ fontWeight: 600 }}>Provocativo</span> lidera no varejo.
              </p>

              <div className="h-[220px] -mx-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%">
                    <PolarGrid stroke="rgba(0,0,0,0.06)" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fontSize: 10, fill: '#717182', fontFamily: "'Inter', sans-serif" }}
                    />
                    <Radar
                      dataKey="A"
                      stroke="#C64928"
                      fill="#C64928"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                {toneInsights.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-[12px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>{item.label}</span>
                    <span className="text-[12px]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, color: item.color }}>
                      {item.tone} {item.score}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
    </div>
  );
}
