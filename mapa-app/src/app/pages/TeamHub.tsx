import React, { useState } from "react";
import { TopNav } from "../components/TopNav";
import { SidebarNav } from "../components/SidebarNav";
import { GlassCard } from "../components/GlassCard";
import { Eye, Users, Target, BarChart3, Settings, Search, Plus, MoreVertical } from "lucide-react";

const sidebarItems = [
  { label: "Visão Geral", path: "/team/overview", icon: Eye },
  { label: "Consultores", path: "/team", icon: Users },
  { label: "Desafios", path: "/team/challenges", icon: Target },
  { label: "Performance", path: "/team/performance", icon: BarChart3 },
  { label: "Configurações", path: "/team/settings", icon: Settings },
];

interface Consultant {
  name: string;
  avatar: string;
  level: string;
  levelColor: string;
  borderColor: string;
  workload: number;
  challenge: string;
  challengeDesc: string;
  challengeColor: string;
}

const consultants: Consultant[] = [
  {
    name: "Ana Beatriz Souza",
    avatar: "AB",
    level: "SÊNIOR",
    levelColor: "#C64928",
    borderColor: "#C64928",
    workload: 85,
    challenge: "Expansão Grupo Varejo Sul",
    challengeDesc: "Reestruturação completa da cadeia ...",
    challengeColor: "#2E4C3B",
  },
  {
    name: "Carlos Mendes",
    avatar: "CM",
    level: "ESPECIALISTA",
    levelColor: "#4A6FA5",
    borderColor: "#4A6FA5",
    workload: 45,
    challenge: "TechSolutions Cloud",
    challengeDesc: "Migração de infraestrutura legada.",
    challengeColor: "#4A6FA5",
  },
  {
    name: "Juliana Costa",
    avatar: "JC",
    level: "PLENO",
    levelColor: "#1A1A1A",
    borderColor: "#C64928",
    workload: 92,
    challenge: "Fusão Banco Horizon",
    challengeDesc: "Auditoria de compliance urgente.",
    challengeColor: "#C64928",
  },
  {
    name: "Roberto Lima",
    avatar: "RL",
    level: "JÚNIOR",
    levelColor: "#2E4C3B",
    borderColor: "#2E4C3B",
    workload: 30,
    challenge: "Logística Norte",
    challengeDesc: "Otimização de rotas regionais.",
    challengeColor: "#2E4C3B",
  },
  {
    name: "Fernanda Torres",
    avatar: "FT",
    level: "SÊNIOR",
    levelColor: "#C64928",
    borderColor: "#C64928",
    workload: 75,
    challenge: "Inova Varejo 360",
    challengeDesc: "Transformação digital do varejo.",
    challengeColor: "#4A6FA5",
  },
  {
    name: "Ricardo Alencar",
    avatar: "RA",
    level: "PLENO",
    levelColor: "#1A1A1A",
    borderColor: "#4A6FA5",
    workload: 60,
    challenge: "Construct Base Alpha",
    challengeDesc: "Reestruturação operacional.",
    challengeColor: "#C64928",
  },
];

export function TeamHub() {
  const [filter, setFilter] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const filters = ["Todos", "Sênior", "Pleno"];

  const filteredConsultants = consultants.filter((c) => {
    if (filter === "Todos") return true;
    return c.level.toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F5F5F7" }}>
      <TopNav
        brand="MAPA"
        brandSub="Ecosystem"
        version="v2.4.0"
      />

      <div className="flex flex-1">
        <SidebarNav
          brand="Team Hub"
          brandSub="GESTÃO DE EQUIPE"
          items={sidebarItems}
          bottomContent={
            <div className="p-3 rounded-2xl bg-white/50 border border-white/40">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] tracking-[0.1em] uppercase" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>
                  SINCRONIZAÇÃO
                </span>
                <span className="w-2 h-2 rounded-full bg-[#2E4C3B]" />
              </div>
              <p className="text-[11px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>
                Última atualização da equipe há 2 minutos.
              </p>
            </div>
          }
        />

        {/* UNIFIED LAYOUT CONTAINER - Guidelines §4.3 */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 600 }}>
                  Team Hub & Desafios
                </h1>
                <p className="text-[13px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Gestão de carga e alocação estratégica
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/65 backdrop-blur-[24px] border border-white/40 shadow-sm w-[280px]">
                  <Search size={16} className="text-[#717182]" />
                  <input
                    type="text"
                    placeholder="Buscar consultor ou projeto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent outline-none text-[13px] flex-1 placeholder:text-[#717182]/60"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C64928] text-white text-[12px] tracking-[0.05em] uppercase shadow-sm hover:translate-y-[-2px] transition-all duration-300"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: "0.05em" }}
                  aria-label="Criar Novo Desafio"
                >
                  <Plus size={14} />
                  NOVO DESAFIO
                </button>
              </div>
            </div>

            {/* Team Pulse */}
            <div className="grid grid-cols-[1fr_240px] gap-5 mb-8">
              <GlassCard>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 600 }} className="mb-2">
                  Team Pulse
                </h2>
                <p className="text-[13px] text-[#717182] mb-4 max-w-lg" style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
                  A capacidade operacional da equipe está em 82%. Recomendamos alocação cautelosa para novos projetos Premium.
                </p>

                <div className="flex items-center gap-8 mb-4">
                  <div className="text-center">
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "36px", fontWeight: 700, color: "#C64928" }}>14</span>
                    <p className="text-[10px] text-[#717182] tracking-[0.1em] uppercase mt-1" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                      PROJETOS ATIVOS
                    </p>
                  </div>
                </div>

                {/* Mini bar chart */}
                <div className="flex items-end gap-1 h-12">
                  {[40, 55, 70, 60, 75, 45, 80, 65, 50, 70, 85, 55, 60, 75, 40, 65].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{ height: `${h}%`, background: h > 70 ? "#C64928" : "#2E4C3B", opacity: 0.6 }}
                    />
                  ))}
                </div>
              </GlassCard>

              <GlassCard>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-1 rounded-full bg-[#2E4C3B]/10 text-[#2E4C3B] text-[10px]"
                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                    +4% vs. Mês Anterior
                  </span>
                </div>
                <div className="mt-6">
                  <span className="text-[10px] text-[#717182] tracking-[0.1em] uppercase" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                    DISPONIBILIDADE
                  </span>
                  <div className="mt-1">
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "48px", fontWeight: 400, color: "#1A1A1A" }}>128h</span>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Consultants Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 600 }}>
                    Consultores & Desafios
                  </h2>
                  <p className="text-[13px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Visão detalhada de carga e especialidades.
                  </p>
                </div>
                <div className="flex gap-1 bg-black/5 rounded-full p-1">
                  {filters.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-1.5 rounded-full text-[12px] transition-all ${
                        filter === f ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#717182]"
                      }`}
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-5">
                {filteredConsultants.map((consultant) => (
                  <GlassCard key={consultant.name} borderColor={consultant.borderColor}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-[14px] shrink-0"
                          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, background: `linear-gradient(135deg, ${consultant.borderColor}, ${consultant.borderColor}88)` }}
                        >
                          {consultant.avatar}
                        </div>
                        <div>
                          <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 600, lineHeight: 1.2 }}>
                            {consultant.name}
                          </h4>
                          <span
                            className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-white text-[9px] tracking-[0.1em]"
                            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, background: consultant.levelColor }}
                          >
                            {consultant.level}
                          </span>
                        </div>
                      </div>
                      <button className="p-1 hover:bg-black/5 rounded-full">
                        <MoreVertical size={16} className="text-[#717182]" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>Carga Atual</span>
                      <span className="text-[12px]" style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, color: consultant.workload > 80 ? "#C64928" : "#1A1A1A" }}>
                        {consultant.workload}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden mb-4">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${consultant.workload}%`,
                          background: consultant.workload > 80
                            ? "linear-gradient(90deg, #C64928, #E07B5B)"
                            : consultant.workload > 60
                            ? "linear-gradient(90deg, #8B7355, #B89F7D)"
                            : "linear-gradient(90deg, #4A6FA5, #6B8FC5)",
                        }}
                      />
                    </div>

                    <div className="p-3 rounded-2xl bg-black/3 border border-black/5">
                      <span className="text-[9px] text-[#717182] tracking-[0.1em] uppercase" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                        DESAFIO ATIVO
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full" style={{ background: consultant.challengeColor }} />
                        <span className="text-[13px] text-[#1A1A1A]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                          {consultant.challenge}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#717182] mt-1 ml-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {consultant.challengeDesc}
                      </p>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}