import React, { useState } from "react";
import { TopNav } from "../components/TopNav";
import { GlassCard } from "../components/GlassCard";
import { MessageCircle, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DealOrb {
  id: string;
  name: string;
  value: number;
  probability: number;
  x: number;
  y: number;
  size: number;
}

const dealOrbs: DealOrb[] = [
  { id: "1", name: "Acme Corp", value: 120000, probability: 85, x: 25, y: 30, size: 72 },
  { id: "2", name: "TechGlobal", value: 85000, probability: 60, x: 55, y: 45, size: 64 },
  { id: "3", name: "Banco Horizon", value: 250000, probability: 90, x: 40, y: 65, size: 84 },
  { id: "4", name: "Varejo Sul", value: 45000, probability: 40, x: 70, y: 25, size: 52 },
  { id: "5", name: "Construct Base", value: 180000, probability: 75, x: 15, y: 55, size: 76 },
  { id: "6", name: "HealthPlus", value: 95000, probability: 55, x: 80, y: 60, size: 60 },
  { id: "7", name: "LogiTech", value: 65000, probability: 70, x: 60, y: 75, size: 56 },
];

const challenges = [
  { title: "Sprint Enterprise Q3", progress: 72, color: "#C64928" },
  { title: "Penetração LATAM", progress: 45, color: "#2E4C3B" },
  { title: "Redução Churn", progress: 88, color: "#4A6FA5" },
  { title: "Cross-Sell Financeiro", progress: 30, color: "#8B7355" },
];

const hacks = [
  { title: "Objection Handling: Preço", category: "Negociação", stage: "Execute" },
  { title: "Script de Discovery Call", category: "Prospecção", stage: "Analyze" },
  { title: "Framework de ROI", category: "Valor", stage: "Plan" },
  { title: "Competitive Battlecard", category: "Competidores", stage: "Execute" },
  { title: "Stakeholder Map Template", category: "Estratégia", stage: "Plan" },
  { title: "Champion Building Playbook", category: "Relacionamento", stage: "Execute" },
];

export function WarRoom() {
  const [lang, setLang] = useState<"PT" | "EN">("PT");
  const [hacksOpen, setHacksOpen] = useState(false);
  const [hoveredOrb, setHoveredOrb] = useState<string | null>(null);
  const [aiQuery, setAiQuery] = useState("");

  const formatValue = (v: number) => {
    if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`;
    return `$${v}`;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F5F5F7" }}>
      <TopNav
        brand="MAPA"
        brandSub="War Room"
        version="v2.4.0"
        lang={lang}
        onLangToggle={() => setLang(lang === "PT" ? "EN" : "PT")}
      />

      {/* UNIFIED LAYOUT CONTAINER - Guidelines §4.3 */}
      <div className="flex-1 flex relative overflow-hidden">
        <div className="max-w-[1920px] w-full mx-auto flex relative">
          {/* Pipeline Canvas - Center */}
          <div className={`flex-1 p-8 transition-all duration-500 ${hacksOpen ? "mr-[340px]" : ""}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full bg-[#C64928]/10 text-[#C64928] text-[10px] tracking-[0.08em] uppercase mb-2"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
                >
                  shell normatizado • canvas com exceção funcional
                </span>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 600, lineHeight: 1.2 }}>
                  Pipeline Canvas
                </h1>
                <p className="text-[13px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Arraste os orbs para estabelecer conexões
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-[#717182]" style={{ fontFamily: "'Space Mono', monospace" }}>
                  Pipeline Total: <span className="text-[#1A1A1A]" style={{ fontWeight: 700 }}>$840k</span>
                </span>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="relative w-full h-[480px] rounded-[32px] bg-white/40 backdrop-blur-[24px] border border-white/40 shadow-[0_12px_32px_rgba(0,0,0,0.04)] overflow-hidden">
              {/* Grid pattern */}
              <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1A1A1A" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* Connection lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {dealOrbs.slice(0, -1).map((orb, i) => {
                  const next = dealOrbs[i + 1];
                  return (
                    <line
                      key={orb.id}
                      x1={`${orb.x}%`}
                      y1={`${orb.y}%`}
                      x2={`${next.x}%`}
                      y2={`${next.y}%`}
                      stroke="rgba(198, 73, 40, 0.08)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  );
                })}
              </svg>

              {/* Deal Orbs */}
              {dealOrbs.map((orb) => (
                <motion.div
                  key={orb.id}
                  className="absolute cursor-grab active:cursor-grabbing"
                  style={{ left: `${orb.x}%`, top: `${orb.y}%`, transform: "translate(-50%, -50%)" }}
                  whileHover={{ scale: 1.15 }}
                  onHoverStart={() => setHoveredOrb(orb.id)}
                  onHoverEnd={() => setHoveredOrb(null)}
                >
                  <div
                    className="rounded-full flex items-center justify-center backdrop-blur-[16px] transition-all duration-300"
                    style={{
                      width: orb.size,
                      height: orb.size,
                      background: "rgba(255, 255, 255, 0.65)",
                      border: `2px solid ${orb.probability > 70 ? "#C64928" : orb.probability > 50 ? "#8B7355" : "rgba(0,0,0,0.1)"}`,
                      boxShadow: hoveredOrb === orb.id
                        ? "0 8px 24px rgba(198, 73, 40, 0.15)"
                        : "0 4px 12px rgba(0,0,0,0.04)",
                    }}
                  >
                    <span className="text-[11px] text-[#1A1A1A] text-center px-1" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, lineHeight: 1.2 }}>
                      {orb.name.split(" ")[0]}
                    </span>
                  </div>

                  {/* Tooltip */}
                  <AnimatePresence>
                    {hoveredOrb === orb.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute left-1/2 -translate-x-1/2 -bottom-16 z-10 px-4 py-2 rounded-2xl bg-[#1A1A1A] text-white whitespace-nowrap"
                      >
                        <p className="text-[12px]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>{orb.name}</p>
                        <p className="text-[11px] opacity-70" style={{ fontFamily: "'Space Mono', monospace" }}>
                          {formatValue(orb.value)} • {orb.probability}%
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* AI Brainstorm Widget */}
            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/65 backdrop-blur-[24px] border border-white/40 shadow-sm w-[400px]">
                <MessageCircle size={16} className="text-[#C64928] shrink-0" />
                <input
                  type="text"
                  placeholder="Pergunte ao MAPA IA..."
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  className="bg-transparent outline-none text-[13px] flex-1 placeholder:text-[#717182]/60"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
              </div>
            </div>
          </div>

          {/* Right: Challenge Tracker */}
          <div
            className="w-[280px] shrink-0 p-6 border-l border-white/40 bg-white/60"
            style={{ backdropFilter: "blur(24px) saturate(150%)", WebkitBackdropFilter: "blur(24px) saturate(150%)" }}
          >
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600 }} className="mb-1">
              Rastreador de Desafios
            </h3>
            <p className="text-[11px] text-[#717182] mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
              Sprint Atual
            </p>

            <div className="flex flex-col gap-4">
              {challenges.map((challenge) => (
                <div key={challenge.title} className="p-4 rounded-2xl bg-white/50 border border-white/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] text-[#1A1A1A]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                      {challenge.title}
                    </span>
                    <span className="text-[12px]" style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, color: challenge.color }}>
                      {challenge.progress}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${challenge.progress}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full rounded-full"
                      style={{ background: challenge.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Hacks Handle */}
            <button
              onClick={() => setHacksOpen(!hacksOpen)}
              className="mt-8 w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-[#C64928]/8 border border-[#C64928]/15 text-[#C64928] transition-all hover:bg-[#C64928]/12"
            >
              <span className="text-[12px] tracking-[0.05em] uppercase" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                Recursos para Reunião
              </span>
              <ChevronRight size={16} className={`transition-transform ${hacksOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Hacks Drawer */}
          <AnimatePresence>
            {hacksOpen && (
              <motion.div
                initial={{ x: 340 }}
                animate={{ x: 0 }}
                exit={{ x: 340 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute right-0 top-0 bottom-0 w-[340px] bg-white/80 backdrop-blur-[32px] border-l border-white/40 shadow-[-12px_0_32px_rgba(0,0,0,0.06)] z-20 p-6 overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 600 }}>
                    Recursos para Reunião
                  </h3>
                  <button onClick={() => setHacksOpen(false)} className="p-1 hover:bg-black/5 rounded-full">
                    <X size={18} className="text-[#717182]" />
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {hacks.map((hack) => (
                    <div key={hack.title} className="p-4 rounded-2xl bg-white/60 border border-white/40 hover:shadow-sm transition-all cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="px-2 py-0.5 rounded-full text-[9px] tracking-[0.05em]"
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 600,
                            background: hack.stage === "Analyze" ? "#4A6FA5" : hack.stage === "Plan" ? "#2E4C3B" : "#C64928",
                            color: "white",
                          }}
                        >
                          {hack.stage.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {hack.category}
                        </span>
                      </div>
                      <span className="text-[13px] text-[#1A1A1A]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                        {hack.title}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
