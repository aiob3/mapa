import React, { useEffect, useState } from "react";
import { GlassCard } from "../GlassCard";
import { motion } from "motion/react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Cell,
} from "recharts";
import {
  FileText,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  Download,
  ChevronRight,
} from "lucide-react";
import { PresentationModal } from "./PresentationModal";
import { useSynContext } from "./SynContext";

export function SectorAnalysis() {
  const { analytics, analyticsStatus } = useSynContext();
  const [presentationOpen, setPresentationOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState<string>("Varejo");
  const scatterData = analytics.sector.scatterData;
  const conversionInsights = analytics.sector.conversionInsights;
  const aiRecommendations = analytics.sector.aiRecommendations;
  const radarComparative = analytics.sector.radarComparative;
  const boardSynthesis = analytics.sector.boardSynthesis;
  const sectorKpis = analytics.sector.kpiCards;
  const radarLegend = analytics.sector.radarLegend;
  const selectedSectorReport = analytics.sector.sectorReportByName[selectedSector];
  const semanticSummary = analytics.sector.semanticSignalsSummary;
  const semanticSummaryRows = semanticSummary?.rows || [];
  const semanticSummaryTotals = semanticSummary?.totals || null;
  const semanticGeneratedAtLabel = semanticSummary?.generatedAt
    ? new Date(semanticSummary.generatedAt).toLocaleString("pt-BR")
    : null;

  useEffect(() => {
    if (scatterData.length === 0) {
      return;
    }
    const exists = scatterData.some((item) => item.name === selectedSector);
    if (!exists) {
      setSelectedSector(scatterData[0].name);
    }
  }, [scatterData, selectedSector]);

  return (
    <div className="max-w-7xl mx-auto">
      {analyticsStatus.loading && (
        <GlassCard className="!p-4 mb-5">
          <p className="text-[12px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>
            Carregando análise setorial...
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

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "28px",
              fontWeight: 600,
              lineHeight: 1.3,
            }}
            className="text-[#1A1A1A]"
          >
            Análise Detalhada por Setor
          </h1>
          <p
            className="text-[13px] text-[#717182] mt-1"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Performance, conversão e recomendações por indústria — Visão Board of Directors
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/65 border border-white/40 text-[#1A1A1A] hover:bg-white/80 transition-all"
          style={{
            backdropFilter: "blur(24px) saturate(150%)",
            fontFamily: "'Inter', sans-serif",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase" as const,
          }}
        >
          <FileText size={14} />
          BOARD SUMMARY
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {sectorKpis.map((kpi) => (
          <GlassCard key={kpi.label} className="!p-5">
            <p
              className="text-[10px] text-[#717182] tracking-wider uppercase mb-2"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
            >
              {kpi.label}
            </p>
            <p
              className="text-[#1A1A1A]"
              style={{
                fontFamily: (kpi as any).isHighlight
                  ? "'Playfair Display', serif"
                  : "'Space Mono', monospace",
                fontSize: (kpi as any).isHighlight ? "22px" : "24px",
                fontWeight: (kpi as any).isHighlight ? 600 : 400,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {kpi.value}
            </p>
            {kpi.change && (
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight size={12} className="text-[#2E4C3B]" />
                <span
                  className="text-[11px] text-[#2E4C3B]"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
                >
                  {kpi.change}
                </span>
              </div>
            )}
            {(kpi as any).isHighlight && (
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp size={12} className="text-[#2E4C3B]" />
                <Sparkles size={12} className="text-[#F59E0B]" />
              </div>
            )}
          </GlassCard>
        ))}
        {sectorKpis.length === 0 && (
          <GlassCard className="!p-5 col-span-4">
            <p className="text-[12px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>
              Nenhum KPI setorial disponível para o usuário atual.
            </p>
          </GlassCard>
        )}
      </div>

      {/* Main Content: Scatter + Insights + AI Advisor */}
      <div className="grid grid-cols-[1fr_1fr_300px] gap-5 mb-8">
        {/* Performance Heatmap */}
        <GlassCard className="!p-6">
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "18px",
              fontWeight: 600,
            }}
            className="mb-0.5"
          >
            Performance Heatmap
          </h3>
          <p
            className="text-[11px] text-[#717182] mb-4"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            ROI vs Engajamento por setor
          </p>

          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <XAxis
                  type="number"
                  dataKey="roi"
                  name="ROI"
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fill: "#717182",
                    fontFamily: "'Space Mono', monospace",
                  }}
                  label={{
                    value: "ROI (%)",
                    position: "insideBottomRight",
                    offset: -5,
                    style: {
                      fontSize: 10,
                      fill: "#717182",
                      fontFamily: "'Inter', sans-serif",
                    },
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="engagement"
                  name="Engajamento"
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fill: "#717182",
                    fontFamily: "'Space Mono', monospace",
                  }}
                  label={{
                    value: "Engajamento (%)",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                    style: {
                      fontSize: 10,
                      fill: "#717182",
                      fontFamily: "'Inter', sans-serif",
                    },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(26, 26, 26, 0.9)",
                    border: "none",
                    borderRadius: "12px",
                    padding: "8px 14px",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "12px",
                    color: "white",
                  }}
                  formatter={(value: number, name: string) => [
                    `${value}%`,
                    name,
                  ]}
                />
                <Scatter data={scatterData} onClick={(data: any) => setSelectedSector(data.name)}>
                  {scatterData.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                      opacity={selectedSector === entry.name ? 1 : 0.6}
                      r={entry.size / 10}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Insights de Conversão */}
        <GlassCard className="!p-6">
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "18px",
              fontWeight: 600,
            }}
            className="mb-4"
          >
            Insights de Conversão
          </h3>

          <div className="flex flex-col gap-3.5">
            {conversionInsights.map((insight, i) => (
              <motion.div
                key={insight.sector}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: i * 0.08,
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[12px] text-[#1A1A1A]"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      {insight.sector}
                    </span>
                    <span className="text-[10px] text-[#717182]">•</span>
                    <span
                      className="text-[10px] text-[#717182]"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {insight.metric}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowUpRight
                      size={11}
                      style={{ color: insight.changeColor }}
                    />
                    <span
                      className="text-[11px]"
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontWeight: 400,
                        color: insight.changeColor,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {insight.change}
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-5 rounded-full bg-black/5 overflow-hidden relative">
                  <motion.div
                    className="h-full rounded-full flex items-center justify-end pr-2"
                    style={{ background: insight.barColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${insight.value}%` }}
                    transition={{
                      duration: 0.8,
                      delay: 0.2 + i * 0.1,
                      type: "spring",
                      stiffness: 100,
                      damping: 20,
                    }}
                  >
                    <span
                      className="text-[9px] text-white"
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {insight.value}%
                    </span>
                  </motion.div>
                  {insight.tags.length > 0 && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {insight.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] text-[#717182]"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* AI Advisor */}
        <GlassCard className="!p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-[#C64928]" />
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "18px",
                fontWeight: 600,
              }}
            >
              AI Advisor
            </h3>
          </div>
          <p
            className="text-[11px] text-[#717182] mb-4"
            style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}
          >
            Recomendações táticas por setor
          </p>

          <div className="flex flex-col gap-3 flex-1">
            {aiRecommendations.map((rec, i) => (
              <motion.div
                key={rec.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                className="p-3 rounded-2xl border border-white/40"
                style={{ background: `${rec.levelColor}08` }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="px-2 py-0.5 rounded-full text-[8px] tracking-wider"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 700,
                      background: `${rec.levelColor}15`,
                      color: rec.levelColor,
                    }}
                  >
                    {rec.level}
                  </span>
                  <span
                    className="text-[10px] text-[#717182]"
                    style={{ fontFamily: "'Inter', sans-serif", fontStyle: "italic" }}
                  >
                    {rec.sector}
                  </span>
                </div>
                <p
                  className="text-[12px] text-[#1A1A1A] mb-1"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
                >
                  {rec.title}
                </p>
                <p
                  className="text-[10px] text-[#717182]"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    lineHeight: 1.5,
                  }}
                >
                  {rec.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.button
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full text-white mt-4"
            style={{
              background: "#C64928",
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase" as const,
            }}
            whileHover={{
              y: -2,
              boxShadow: "0 12px 24px -6px rgba(198,73,40,0.35)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles size={14} />
            GERAR RELATÓRIO COMPLETO
          </motion.button>
        </GlassCard>
      </div>

      {/* Bottom Row: Retail Report + Comparative + Board Synthesis */}
      <div className="grid grid-cols-[1fr_1fr_320px] gap-5">
        {/* Relatório: Varejo */}
        <GlassCard className="!p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "18px",
                  fontWeight: 600,
                }}
              >
                Relatório: {selectedSector}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-[10px] text-[#2E4C3B]"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
                >
                  Sentimento: {selectedSectorReport?.sentimento || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <span
                className="text-[9px] text-[#717182] tracking-wider uppercase"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
              >
                Revenue
              </span>
              <p
                className="text-[#2E4C3B] mt-0.5"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "18px",
                  fontWeight: 400,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {selectedSectorReport?.revenue || "N/A"}
              </p>
            </div>
            <div>
              <span
                className="text-[9px] text-[#717182] tracking-wider uppercase"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
              >
                Growth
              </span>
              <p
                className="text-[#2E4C3B] mt-0.5"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "18px",
                  fontWeight: 400,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {selectedSectorReport?.growth || "N/A"}
              </p>
            </div>
            <div>
              <span
                className="text-[9px] text-[#717182] tracking-wider uppercase"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
              >
                ROI
              </span>
              <p
                className="text-[#1A1A1A] mt-0.5"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "18px",
                  fontWeight: 400,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {selectedSectorReport?.roi || "N/A"}
              </p>
            </div>
            <div>
              <span
                className="text-[9px] text-[#717182] tracking-wider uppercase"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
              >
                Deals Ativos
              </span>
              <p
                className="text-[#1A1A1A] mt-0.5"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "18px",
                  fontWeight: 400,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {selectedSectorReport?.dealsAtivos || "N/A"}
              </p>
            </div>
          </div>

          <motion.button
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white/60 border border-white/40 text-[#1A1A1A] hover:bg-white/80 transition-all"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase" as const,
            }}
            whileHover={{ y: -1 }}
          >
            <ExternalLink size={13} />
            VER RELATÓRIO COMPLETO PARA BOARD
          </motion.button>
        </GlassCard>

        {/* Comparativo Setorial Radar */}
        <GlassCard className="!p-6">
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "18px",
              fontWeight: 600,
            }}
            className="mb-4"
          >
            Comparativo Setorial
          </h3>

          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarComparative} cx="50%" cy="50%">
                <PolarGrid stroke="rgba(0,0,0,0.06)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{
                    fontSize: 10,
                    fill: "#717182",
                    fontFamily: "'Inter', sans-serif",
                  }}
                />
                <Radar
                  dataKey="Varejo"
                  stroke="#C64928"
                  fill="#C64928"
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
                <Radar
                  dataKey="Financeiro"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.08}
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                />
                <Radar
                  dataKey="Tecnologia"
                  stroke="#6366F1"
                  fill="#6366F1"
                  fillOpacity={0.06}
                  strokeWidth={1}
                  strokeDasharray="6 3"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-5 mt-3">
            {radarLegend.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: item.color }}
                />
                <span
                  className="text-[10px] text-[#717182]"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Síntese para Board */}
        <GlassCard className="!p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-[#C64928]" />
            <div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
              >
                Síntese para Board
              </h3>
              <p
                className="text-[10px] text-[#717182]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Sumário executivo — Varejo
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 flex-1">
            {semanticSummaryTotals && (semanticSummaryRows.length > 0 || semanticSummary?.generatedAt) && (
              <div
                className="p-3 rounded-2xl border border-white/40"
                style={{ background: "rgba(198,73,40,0.06)" }}
              >
                <span
                  className="text-[10px] tracking-wider mb-2 block"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    color: "#C64928",
                  }}
                >
                  LENTE SEMÂNTICA (CLICKHOUSE)
                </span>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="text-[10px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Eventos: <strong className="text-[#1A1A1A]">{semanticSummaryTotals.events}</strong>
                  </div>
                  <div className="text-[10px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Inflexões: <strong className="text-[#1A1A1A]">{semanticSummaryTotals.inflectionPoints}</strong>
                  </div>
                  <div className="text-[10px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Causalidade: <strong className="text-[#1A1A1A]">{semanticSummaryTotals.causalitySignals}</strong>
                  </div>
                  <div className="text-[10px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Conflitos: <strong className="text-[#1A1A1A]">{semanticSummaryTotals.relationalConflicts}</strong>
                  </div>
                </div>
                {semanticSummaryRows.length > 0 && (
                  <div className="flex flex-col gap-1">
                    {semanticSummaryRows.slice(0, 3).map((row) => (
                      <div
                        key={row.entityKind}
                        className="text-[10px] text-[#717182] flex items-center justify-between"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        <span>{row.entityKind}</span>
                        <span className="text-[#1A1A1A]">{row.inflectionPoints} inflexões</span>
                      </div>
                    ))}
                  </div>
                )}
                {semanticGeneratedAtLabel && (
                  <p className="text-[9px] text-[#717182] mt-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Atualizado em {semanticGeneratedAtLabel}
                  </p>
                )}
              </div>
            )}

            {boardSynthesis.map((item, i) => (
              <motion.div
                key={item.type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.15,
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                className="p-3 rounded-2xl border border-white/40"
                style={{ background: `${item.typeColor}08` }}
              >
                <span
                  className="text-[10px] tracking-wider mb-1 block"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    color: item.typeColor,
                  }}
                >
                  {item.type}
                </span>
                <p
                  className="text-[11px] text-[#1A1A1A]"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 400,
                    lineHeight: 1.6,
                  }}
                >
                  {item.content}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.button
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full text-white mt-4"
            style={{
              background: "#C64928",
              fontFamily: "'Inter', sans-serif",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase" as const,
            }}
            whileHover={{
              y: -2,
              boxShadow: "0 12px 24px -6px rgba(198,73,40,0.35)",
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPresentationOpen(true)}
          >
            <ExternalLink size={13} />
            EXPORTAR PARA APRESENTAÇÃO
          </motion.button>
        </GlassCard>
      </div>

      {/* Presentation Modal */}
      <PresentationModal
        isOpen={presentationOpen}
        onClose={() => setPresentationOpen(false)}
      />
    </div>
  );
}
