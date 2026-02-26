import React, { useState } from "react";
import { GlassCard } from "../GlassCard";
import { motion, AnimatePresence } from "motion/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Star,
  GitBranch,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Zap,
  X,
} from "lucide-react";
import { useSynContext } from "./SynContext";
import { BoardViewModal } from "./BoardViewModal";

interface HeatmapCell {
  value: number;
  intensity: "critico" | "atencao" | "estavel" | "forte";
}

interface RegionData {
  name: string;
  metrics: HeatmapCell[];
}

const getHeatmapColor = (intensity: string) => {
  switch (intensity) {
    case "forte":
      return { bg: "#2E4C3B", text: "#FFFFFF" };
    case "estavel":
      return { bg: "#A7C4A0", text: "#1A1A1A" };
    case "atencao":
      return { bg: "#F5D0A9", text: "#1A1A1A" };
    case "critico":
      return { bg: "#E8A090", text: "#1A1A1A" };
    default:
      return { bg: "#E8E8EC", text: "#717182" };
  }
};

type TimeFilter = "presente" | "proximo_mes" | "trimestre" | "semestre";
type HeatmapFilter = "regiao" | "segmento" | "estado";

export function StrategicHeatmap() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("presente");
  const [heatmapFilter, setHeatmapFilter] = useState<HeatmapFilter>("regiao");
  const [boardOpen, setBoardOpen] = useState(false);

  const { mirrorLeadId, setMirrorLeadId, analytics, analyticsStatus } = useSynContext();
  const leadsRegistry = analytics.leadsRegistry;
  const heatmapMetrics = analytics.heatmap.heatmapMetrics;
  const heatmapData = analytics.heatmap.heatmapData;
  const pipelineData = analytics.heatmap.pipelineData;
  const narrativeItems = analytics.heatmap.narrativeItems;
  const strategicActions = analytics.heatmap.strategicActions;
  const kpiCards = analytics.heatmap.kpiCards;
  const kpiIconByKey = {
    star: Star,
    "git-branch": GitBranch,
    clock: Clock,
    "check-circle": CheckCircle2,
    "alert-triangle": AlertTriangle,
    "trending-up": TrendingUp,
    activity: Zap,
    users: Star,
    "file-text": Star,
    target: Star,
  } as const;

  // Resolve which region to highlight from the mirrored lead
  const mirrorLead = mirrorLeadId ? leadsRegistry.find((l) => l.id === mirrorLeadId) : null;
  const mirrorRegion = mirrorLead?.region ?? null;

  return (
    <div className="max-w-7xl mx-auto">
      <BoardViewModal isOpen={boardOpen} onClose={() => setBoardOpen(false)} />

      {analyticsStatus.loading && (
        <GlassCard className="!p-4 mb-5">
          <p className="text-[12px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>
            Carregando camada analítica...
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

      {/* Strategic Mirror Banner */}
      <AnimatePresence>
        {mirrorLead && (
          <motion.div
            key="mirror-banner"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="mb-5 flex items-center gap-3 px-5 py-3 rounded-2xl border"
            style={{
              background: "rgba(198,73,40,0.06)",
              borderColor: "rgba(198,73,40,0.25)",
              backdropFilter: "blur(12px)",
            }}
          >
            <GitBranch size={15} className="text-[#C64928] shrink-0" />
            <div className="flex-1">
              <span className="text-[12px] text-[#C64928]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
                Strategic Mirror Ativo
              </span>
              <span className="text-[12px] text-[#1A1A1A] ml-2" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                Exibindo impacto de{" "}
                <strong>{mirrorLead.name}</strong> ({mirrorLead.company} · {mirrorLead.value}) na região{" "}
                <strong>{mirrorLead.region}</strong>
              </span>
            </div>
            <button
              onClick={() => setMirrorLeadId(null)}
              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#C64928]/10 transition-colors"
              aria-label="Desativar Strategic Mirror"
            >
              <X size={13} className="text-[#C64928]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
            MAPA Syn — Mapa de Calor Estratégico
          </h1>
          <p
            className="text-[13px] text-[#717182] mt-1"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Strategic Mirror — Visualização em tempo real de insights sincronizados com o CRM
          </p>
        </div>

        {/* Time Filters */}
        <div className="flex items-center gap-2">
          {(
            [
              { key: "presente", label: "PRESENTE" },
              { key: "proximo_mes", label: "PRÓX. MÊS" },
              { key: "trimestre", label: "TRIMESTRE" },
              { key: "semestre", label: "SEMESTRE" },
            ] as const
          ).map((tf) => (
            <button
              key={tf.key}
              onClick={() => setTimeFilter(tf.key)}
              className={`px-4 py-2 rounded-full text-[12px] transition-all duration-200 ${
                timeFilter === tf.key
                  ? "bg-[#C64928]/15 border border-[#C64928] text-[#C64928]"
                  : "bg-white/50 border border-black/8 text-[#717182] hover:bg-white/70"
              }`}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase" as const,
              }}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Status Cards */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {kpiCards.map((kpi) => {
          const Icon = kpiIconByKey[kpi.iconKey] || Star;
          return (
          <GlassCard
            key={kpi.label}
            className="!p-4"
            borderColor={undefined}
          >
            <div
              className="flex items-center gap-2 mb-2"
              style={{ color: kpi.color }}
            >
              <Icon size={14} />
              <span
                className="text-[12px]"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  color: kpi.color,
                }}
              >
                {kpi.label}
              </span>
            </div>
            <p
              className="text-[#1A1A1A]"
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "24px",
                fontWeight: 400,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {kpi.value}
            </p>
            <p
              className="text-[11px] text-[#717182] mt-0.5"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {kpi.amount}
            </p>
          </GlassCard>
          );
        })}
      </div>

      {/* Main Grid: Heatmap + Narrative */}
      <div className="grid grid-cols-[1fr_320px] gap-5 mb-8">
        {/* Strategic Heatmap */}
        <GlassCard className="!p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "18px",
                  fontWeight: 600,
                }}
              >
                Mapa de Calor Estratégico Atualizado
              </h3>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2E4C3B]/10">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-[#2E4C3B]"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span
                  className="text-[10px] text-[#2E4C3B]"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, letterSpacing: "0.1em" }}
                >
                  LIVE
                </span>
              </div>
            </div>

            {/* Heatmap Filter Tabs */}
            <div className="flex items-center gap-1 bg-black/5 rounded-full p-0.5">
              {(
                [
                  { key: "regiao", label: "Região" },
                  { key: "segmento", label: "Segmento" },
                  { key: "estado", label: "Estado" },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setHeatmapFilter(f.key)}
                  className={`px-3 py-1.5 rounded-full text-[11px] transition-all ${
                    heatmapFilter === f.key
                      ? "bg-white text-[#1A1A1A] shadow-sm"
                      : "text-[#717182] hover:text-[#1A1A1A]"
                  }`}
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            {heatmapData.length === 0 && (
              <div className="py-8">
                <p className="text-[12px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Nenhum dado de heatmap disponível para o usuário atual.
                </p>
              </div>
            )}
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-[140px]" />
                  {heatmapMetrics.map((metric) => (
                    <th
                      key={metric}
                      className="px-2 py-2 text-center"
                    >
                      <span
                        className="text-[11px] text-[#717182]"
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 600,
                        }}
                      >
                        {metric}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapData.map((region, ri) => {
                  const isHighlighted = mirrorRegion === region.name;
                  return (
                    <motion.tr
                      key={region.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: ri * 0.08, type: "spring", stiffness: 300, damping: 30 }}
                      className="border-t border-black/5"
                      style={isHighlighted ? {
                        background: "rgba(198,73,40,0.04)",
                        boxShadow: "inset 3px 0 0 #C64928",
                      } : undefined}
                    >
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-2">
                          {isHighlighted ? (
                            <motion.div
                              className="w-2 h-2 rounded-full"
                              style={{ background: "#C64928" }}
                              animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          ) : (
                            <div className="w-1 h-1 rounded-full bg-[#717182]" />
                          )}
                          <span
                            className="text-[12px] whitespace-nowrap"
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: isHighlighted ? 700 : 500,
                              color: isHighlighted ? "#C64928" : "#1A1A1A",
                            }}
                          >
                            {region.name}
                            {isHighlighted && (
                              <span className="ml-1.5 text-[9px] tracking-wider opacity-70">← MIRROR</span>
                            )}
                          </span>
                        </div>
                      </td>
                      {region.metrics.map((cell, ci) => {
                        const colors = getHeatmapColor(cell.intensity);
                        return (
                          <td key={ci} className="px-2 py-2">
                            <motion.div
                              className="w-full h-10 rounded-xl flex items-center justify-center cursor-pointer"
                              style={{
                                background: colors.bg,
                                color: colors.text,
                                boxShadow: isHighlighted ? `0 0 0 2px ${colors.bg}, 0 0 12px ${colors.bg}44` : undefined,
                              }}
                              whileHover={{ scale: 1.08, boxShadow: "0 8px 20px -4px rgba(0,0,0,0.15)" }}
                              animate={isHighlighted ? { scale: [1, 1.03, 1] } : { scale: 1 }}
                              transition={isHighlighted
                                ? { duration: 2, repeat: Infinity, delay: ci * 0.1 }
                                : { type: "spring", stiffness: 400, damping: 25 }
                              }
                            >
                              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "13px", fontWeight: 400, fontVariantNumeric: "tabular-nums" }}>
                                {cell.value}
                              </span>
                            </motion.div>
                          </td>
                        );
                      })}
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-black/5">
            <div className="flex items-center gap-4">
              <span
                className="text-[11px] text-[#717182]"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
              >
                Intensidade:
              </span>
              {[
                { label: "Crítico", color: "#E8A090" },
                { label: "Atenção", color: "#F5D0A9" },
                { label: "Estável", color: "#A7C4A0" },
                { label: "Forte", color: "#2E4C3B" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded"
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
            <div className="flex items-center gap-1.5">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-[#2E4C3B]"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span
                className="text-[10px] text-[#2E4C3B]"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
              >
                Dados sincronizados recentemente
              </span>
            </div>
          </div>
        </GlassCard>

        {/* A Narrativa */}
        <GlassCard className="!p-5">
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "18px",
              fontWeight: 600,
            }}
            className="text-[#1A1A1A] mb-1"
          >
            A Narrativa
          </h3>
          <p
            className="text-[11px] text-[#717182] mb-5"
            style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}
          >
            Prioridades estratégicas em tempo real
          </p>

          <div className="flex flex-col gap-3">
            {narrativeItems.map((item, i) => {
              // Highlight narrative item if it matches the mirrored lead
              const isRelated = mirrorLead && item.desc.toLowerCase().includes(mirrorLead.name.split(" ")[0].toLowerCase());
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 30 }}
                  className="p-3 rounded-2xl border transition-colors cursor-pointer"
                  style={{
                    background: isRelated ? "rgba(198,73,40,0.06)" : "rgba(255,255,255,0.4)",
                    borderColor: isRelated ? "rgba(198,73,40,0.3)" : "rgba(255,255,255,0.3)",
                    boxShadow: isRelated ? "0 0 0 1px rgba(198,73,40,0.15)" : undefined,
                  }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="px-2 py-0.5 rounded-full text-[8px] tracking-wider"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                        background: item.priority === "ALTA" ? "rgba(198,73,40,0.12)" : item.priority === "MÉDIA" ? "rgba(245,158,11,0.12)" : "rgba(107,114,128,0.12)",
                        color: item.priority === "ALTA" ? "#C64928" : item.priority === "MÉDIA" ? "#F59E0B" : "#6B7280",
                      }}
                    >
                      {item.priority}
                    </span>
                    {item.tag && (
                      <span
                        className="px-2 py-0.5 rounded-full text-[8px] tracking-wider"
                        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, background: `${item.tagColor}15`, color: item.tagColor! }}
                      >
                        {item.tag}
                      </span>
                    )}
                    {isRelated && (
                      <span
                        className="px-1.5 py-0.5 rounded-full text-[8px] tracking-wider"
                        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, background: "rgba(198,73,40,0.12)", color: "#C64928" }}
                      >
                        MIRROR
                      </span>
                    )}
                    <span
                      className="text-[10px] text-[#717182] ml-auto flex items-center gap-1"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      <Clock size={10} />
                      {item.time}
                    </span>
                  </div>
                  <p
                    className="text-[12px] mb-0.5"
                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, color: isRelated ? "#C64928" : "#1A1A1A" }}
                  >
                    {item.title}
                  </p>
                  <p
                    className="text-[10px] text-[#717182]"
                    style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.4 }}
                  >
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Bottom Row: Pipeline & Strategic Actions */}
      <div className="grid grid-cols-2 gap-5">
        {/* Pipeline & Forecast */}
        <GlassCard className="!p-6">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "18px",
                  fontWeight: 600,
                }}
              >
                Pipeline & Forecast
              </h3>
              <p
                className="text-[11px] text-[#717182] mt-0.5"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Projeção assertiva — Presente → Próximo trimestre
              </p>
            </div>
            <div className="flex items-center gap-4">
              {[
                { label: "Projetado", color: "#2E4C3B" },
                { label: "Atual", color: "#C64928" },
                { label: "Meta", color: "#717182", dashed: true },
              ].map((legend) => (
                <div key={legend.label} className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-0.5"
                    style={{
                      background: legend.color,
                      borderTop: (legend as any).dashed
                        ? `1px dashed ${legend.color}`
                        : "none",
                    }}
                  />
                  <span
                    className="text-[10px] text-[#717182]"
                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                  >
                    {legend.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-[200px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pipelineData}>
                <defs>
                  <linearGradient id="heatmapPipelineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E4C3B" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2E4C3B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="heatmapAtualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C64928" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#C64928" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 11,
                    fill: "#717182",
                    fontFamily: "'Inter', sans-serif",
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fill: "#717182",
                    fontFamily: "'Space Mono', monospace",
                  }}
                  tickFormatter={(v: number) => `${v}M`}
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
                />
                <Area
                  type="monotone"
                  dataKey="meta"
                  stroke="#717182"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  fill="none"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="projetado"
                  stroke="#2E4C3B"
                  strokeWidth={2}
                  fill="url(#heatmapPipelineGrad)"
                  dot={{ fill: "#2E4C3B", r: 3 }}
                />
                <Area
                  type="monotone"
                  dataKey="atual"
                  stroke="#C64928"
                  strokeWidth={2}
                  fill="url(#heatmapAtualGrad)"
                  dot={{ fill: "#C64928", r: 3 }}
                  connectNulls={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Strategic Actions */}
        <GlassCard className="!p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "18px",
                  fontWeight: 600,
                }}
              >
                Strategic Actions — Board Recommendations
              </h3>
              <p
                className="text-[11px] text-[#717182] mt-0.5"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Ações priorizadas com base nos insights sincronizados
              </p>
            </div>
            <motion.button
              onClick={() => setBoardOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C64928]/10 text-[#C64928] hover:bg-[#C64928]/15 transition-colors"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" as const }}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              <Zap size={12} />
              BOARD VIEW
            </motion.button>
          </div>

          <div className="flex flex-col gap-3">
            {strategicActions.map((action, i) => (
              <motion.div
                key={action.action}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: i * 0.08,
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/30 hover:bg-white/50 transition-colors cursor-pointer group"
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: action.color }}
                />
                <p
                  className="text-[12px] text-[#1A1A1A] flex-1"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, lineHeight: 1.5 }}
                >
                  {action.action}
                </p>
                <span
                  className="text-[10px] text-[#717182] whitespace-nowrap"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {action.owner}
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] text-[#C64928] bg-[#C64928]/10 whitespace-nowrap"
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontWeight: 400,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {action.date}
                </span>
                <ChevronRight
                  size={14}
                  className="text-[#717182] opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
