import React, { useState } from "react";
import { TopNav } from "../components/TopNav";
import { GlassCard } from "../components/GlassCard";
import { AlertTriangle, Plus, Eye, MoreHorizontal } from "lucide-react";
import { motion } from "motion/react";

export function DualCore() {
  const [lang, setLang] = useState<"PT" | "EN">("PT");

  const t = lang === "PT" ? {
    title: "The Bridge:",
    subtitle: "Mapa Dual Core",
    status: "Status de Risco Ativo",
    sync: "Sincronização em 72%",
    healthMonitor: "MONITOR DE SAÚDE",
    newOKR: "+ Novo OKR",
    viewPipeline: "Ver Pipeline",
    upperLevel: "NÍVEL SUPERIOR",
    objectiveQ3: "OBJETIVO Q3",
    keyResult: "RESULTADO CHAVE",
    progress: "Progresso",
    atRisk: "Em Risco",
    critical: "Crítico",
    strategy: "ESTRATÉGIA",
    execution: "EXECUÇÃO",
    activeDeals: "Negócios Ativos",
    groundLevel: "NÍVEL TÉRREO",
    tasksToday: "Tarefas Hoje",
    meetings: "Reuniões",
    next: "Próxima",
    draft: "RASCUNHO",
    syncAtRisk: "SINCRONIZAÇÃO EM RISCO",
    worksOngoing: "OBRAS EM ANDAMENTO",
    newElement: "NOVO ELEMENTO",
    addDeal: "+ Adicionar Negócio",
    awaitingApproval: "Aguardando Aprovação",
    launch: "Lançar Nível Empresarial",
    launchDesc: "Definir preços, recursos e estratégia de go-to-market para clientes empresariais.",
    okr1Title: "Aumentar Penetração de Mercado na LATAM",
    okr1Desc: "Foco nos segmentos empresariais do Brasil e México com o novo framework de RevOps.",
    okr2Title: "Reduzir Taxa de Churn para < 2.5%",
    okr2Desc: "Implementar novos pontos de contato de sucesso do cliente e verificações de saúde automatizadas.",
    task1: "Ligar Diretor Stark Ind",
    task1Detail: "Vencido: 14:00 • Alta Prioridade",
    task2: "Atualizar registros CRM Q2",
    task2Detail: "Vence 17:00",
    meeting1Time: "14:00 - 15:00",
    meeting1: "Sincronização Estratégica",
    meeting1Status: "Cancelado",
    meeting2Time: "16:30 - 17:00",
    meeting2: "Reunião de Crise",
    deal1: "Renovação Acme Corp",
    deal1Status: "Atrasado 2 dias",
    deal2: "Expansão TechGlobal",
    deal2Status: "Bloqueado",
    tickerItems: [
      "Discrepância de dados na região Sul detectada",
      "Metas de Receita Q3 em risco - Ação necessária",
      "Alerta de capacidade da equipe SDR"
    ],
  } : {
    title: "The Bridge:",
    subtitle: "Mapa Dual Core",
    status: "Active Risk Status",
    sync: "Sync at 72%",
    healthMonitor: "HEALTH MONITOR",
    newOKR: "+ New OKR",
    viewPipeline: "View Pipeline",
    upperLevel: "UPPER LEVEL",
    objectiveQ3: "OBJECTIVE Q3",
    keyResult: "KEY RESULT",
    progress: "Progress",
    atRisk: "At Risk",
    critical: "Critical",
    strategy: "STRATEGY",
    execution: "EXECUTION",
    activeDeals: "Active Deals",
    groundLevel: "GROUND LEVEL",
    tasksToday: "Tasks Today",
    meetings: "Meetings",
    next: "Next",
    draft: "DRAFT",
    syncAtRisk: "SYNC AT RISK",
    worksOngoing: "WORKS ONGOING",
    newElement: "NEW ELEMENT",
    addDeal: "+ Add Deal",
    awaitingApproval: "Awaiting Approval",
    launch: "Launch Enterprise Tier",
    launchDesc: "Define pricing, resources and go-to-market strategy for enterprise clients.",
    okr1Title: "Increase Market Penetration in LATAM",
    okr1Desc: "Focus on enterprise segments in Brazil and Mexico with the new RevOps framework.",
    okr2Title: "Reduce Churn Rate to < 2.5%",
    okr2Desc: "Implement new customer success touchpoints and automated health checks.",
    task1: "Call Director Stark Ind",
    task1Detail: "Overdue: 14:00 • High Priority",
    task2: "Update CRM Records Q2",
    task2Detail: "Due 17:00",
    meeting1Time: "14:00 - 15:00",
    meeting1: "Strategic Sync",
    meeting1Status: "Cancelled",
    meeting2Time: "16:30 - 17:00",
    meeting2: "Crisis Meeting",
    deal1: "Acme Corp Renewal",
    deal1Status: "Late by 2 days",
    deal2: "TechGlobal Expansion",
    deal2Status: "Blocked",
    tickerItems: [
      "Data discrepancy detected in South region",
      "Q3 Revenue targets at risk - Action required",
      "SDR team capacity alert"
    ],
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F5F5F7" }}>
      <TopNav
        brand="MAPA"
        brandSub="Sync"
        version="v2.4.0"
        lang={lang}
        onLangToggle={() => setLang(lang === "PT" ? "EN" : "PT")}
      />

      {/* UNIFIED LAYOUT CONTAINER - Guidelines §4.3 */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", fontWeight: 400, lineHeight: 1.2 }}>
              {t.title}{" "}
              <span style={{ fontStyle: "italic", fontWeight: 700 }}>{t.subtitle}</span>
            </h1>
            <p className="text-[13px] text-[#717182] mt-1" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
              {t.status} • {t.sync}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/65 backdrop-blur-[24px] border border-white/40 text-[12px] text-[#1A1A1A] shadow-sm"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {t.healthMonitor}
              <span className="w-2.5 h-2.5 rounded-full bg-[#C64928]" />
            </button>
            <button className="px-5 py-2.5 rounded-full bg-white/65 backdrop-blur-[24px] border border-white/40 text-[12px] text-[#1A1A1A] shadow-sm"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
              {t.newOKR}
            </button>
            <button className="px-5 py-2.5 rounded-full bg-[#C64928] text-white text-[12px] shadow-sm"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
              {t.viewPipeline}
            </button>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* OKR Card 1 */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-[#C64928]/10 text-[#C64928] text-[10px]"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {t.upperLevel} • {t.objectiveQ3}
              </span>
              <AlertTriangle size={16} className="text-[#C64928]" />
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 600, lineHeight: 1.3 }} className="mb-2">
              {t.okr1Title}
            </h3>
            <p className="text-[13px] text-[#717182] mb-6" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, lineHeight: 1.5 }}>
              {t.okr1Desc}
            </p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>{t.progress}</span>
              <span className="text-[12px] text-[#C64928]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{t.atRisk} (72%)</span>
            </div>
            <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#C64928] to-[#E07B5B] rounded-full" style={{ width: "72%" }} />
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 border-2 border-white" />
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C64928]/30 to-[#C64928]/50 border-2 border-white" />
              </div>
              <span className="text-[11px] text-[#717182] tracking-[0.1em] uppercase" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                {t.strategy}
              </span>
            </div>
          </GlassCard>

          {/* OKR Card 2 */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-[#2E4C3B]/10 text-[#2E4C3B] text-[10px]"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {t.upperLevel} • {t.keyResult}
              </span>
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 600, lineHeight: 1.3 }} className="mb-2">
              {t.okr2Title}
            </h3>
            <p className="text-[13px] text-[#717182] mb-6" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, lineHeight: 1.5 }}>
              {t.okr2Desc}
            </p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>{t.progress}</span>
              <span className="text-[12px] text-[#C64928]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{t.critical} (45%)</span>
            </div>
            <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#C64928] to-[#E07B5B] rounded-full" style={{ width: "45%" }} />
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 border-2 border-white" />
              <span className="text-[11px] text-[#717182] tracking-[0.1em] uppercase" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                {t.strategy}
              </span>
            </div>
          </GlassCard>

          {/* Active Deals */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600 }}>{t.activeDeals}</h4>
                <span className="text-[10px] text-[#717182] tracking-[0.1em] uppercase" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                  {t.groundLevel} • {t.execution}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#C64928] text-white text-[12px]"
                style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400 }}>
                14
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-2xl bg-white/50 border border-white/60">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-[#1A1A1A]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>{t.deal1}</span>
                  <span className="text-[14px]" style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, color: "#2E4C3B" }}>$120k</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C64928]" />
                  <span className="text-[11px] text-[#C64928]" style={{ fontFamily: "'Inter', sans-serif" }}>{t.deal1Status}</span>
                </div>
                <div className="flex justify-end mt-2">
                  <div className="w-8 h-4 bg-black/10 rounded-full relative">
                    <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/50 border border-white/60">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-[#1A1A1A]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>{t.deal2}</span>
                  <span className="text-[14px]" style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, color: "#2E4C3B" }}>$85k</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C64928]" />
                  <span className="text-[11px] text-[#C64928]" style={{ fontFamily: "'Inter', sans-serif" }}>{t.deal2Status}</span>
                </div>
              </div>
            </div>

            <button className="w-full mt-4 py-2.5 rounded-2xl border border-[#C64928]/20 text-[#C64928] text-[12px]"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
              {t.addDeal}
            </button>
          </GlassCard>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Tasks Today */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600 }}>{t.tasksToday}</h4>
                <span className="text-[10px] text-[#717182] tracking-[0.1em] uppercase" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                  {t.groundLevel} • {t.execution}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#C64928] text-white text-[12px]"
                style={{ fontFamily: "'Space Mono', monospace", fontWeight: 400 }}>
                5
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/50">
                <div className="w-5 h-5 mt-0.5 rounded-full border-2 border-[#C64928] flex items-center justify-center shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#C64928]" />
                </div>
                <div>
                  <span className="text-[14px] text-[#1A1A1A]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>{t.task1}</span>
                  <p className="text-[11px] text-[#C64928] mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{t.task1Detail}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/50">
                <div className="w-5 h-5 mt-0.5 rounded-full border-2 border-[#ccc] shrink-0" />
                <div>
                  <span className="text-[14px] text-[#1A1A1A]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>{t.task2}</span>
                  <p className="text-[11px] text-[#717182] mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{t.task2Detail}</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Meetings */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600 }}>{t.meetings}</h4>
                <span className="text-[10px] text-[#717182] tracking-[0.1em] uppercase" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                  {t.groundLevel} • {t.execution}
                </span>
              </div>
              <span className="text-[12px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>{t.next}</span>
            </div>
            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-2xl bg-white/50 border-l-2 border-l-[#717182]/30">
                <span className="text-[12px] text-[#717182]" style={{ fontFamily: "'Space Mono', monospace" }}>{t.meeting1Time}</span>
                <p className="text-[14px] text-[#1A1A1A] mt-1" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontStyle: "italic" }}>
                  {t.meeting1}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C64928]" />
                  <span className="text-[11px] text-[#C64928]" style={{ fontFamily: "'Inter', sans-serif" }}>{t.meeting1Status}</span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-[#C64928]/5 border border-[#C64928]/15">
                <span className="text-[12px] text-[#C64928]" style={{ fontFamily: "'Space Mono', monospace" }}>{t.meeting2Time}</span>
                <p className="text-[14px] text-[#1A1A1A] mt-1" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                  {t.meeting2}
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Draft Strategy Card */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] text-[#717182] tracking-[0.1em] uppercase" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                {t.draft} • {t.strategy}
              </span>
              <MoreHorizontal size={16} className="text-[#717182]" />
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 600, lineHeight: 1.3 }} className="mb-2">
              {t.launch}
            </h3>
            <p className="text-[13px] text-[#717182] mb-6" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, lineHeight: 1.5 }}>
              {t.launchDesc}
            </p>
            <div className="p-4 rounded-2xl bg-black/3 border border-black/5 text-center">
              <span className="text-[12px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>{t.awaitingApproval}</span>
            </div>
          </GlassCard>
        </div>

        {/* New Element Row */}
        <div className="mb-8">
          <div className="border-2 border-dashed border-black/10 rounded-[24px] p-10 flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center mb-3">
              <Plus size={20} className="text-[#717182]" />
            </div>
            <span className="text-[11px] text-[#717182] tracking-[0.15em] uppercase" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
              {t.newElement}
            </span>
          </div>
        </div>

        {/* Sync Risk Pill */}
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/65 backdrop-blur-[24px] border border-[#C64928]/20 shadow-sm"
          >
            <AlertTriangle size={14} className="text-[#C64928]" />
            <span className="text-[12px] text-[#C64928] tracking-[0.1em] uppercase" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
              {t.syncAtRisk}
            </span>
          </motion.div>
        </div>
        </div>
      </div>

      {/* Bottom Ticker */}
      <div className="flex items-center bg-[#1A1A1A] text-white h-10 overflow-hidden">
        <div className="shrink-0 px-4 py-2 bg-[#C64928] text-[10px] tracking-[0.1em] uppercase h-full flex items-center"
          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>
          {t.worksOngoing}
        </div>
        <motion.div
          className="flex items-center gap-12 whitespace-nowrap"
          animate={{ x: [0, -600] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {[...t.tickerItems, ...t.tickerItems].map((item, i) => (
            <span key={i} className="flex items-center gap-2 text-[12px] text-white/70" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C64928]" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}