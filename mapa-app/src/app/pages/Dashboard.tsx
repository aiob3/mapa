import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, ArrowRight } from "lucide-react";

import { ActionComposerModal } from "../components/actions/ActionComposerModal";
import { DEFAULT_ADD_ITEMS } from "../components/actions/defaultActionComposerItems";
import type { ActionComposerItem } from "../types/patterns";
import { GlassCard } from "../components/GlassCard";
import { TopNav } from "../components/TopNav";
import { motion } from "motion/react";
import { useAuth } from "../auth/AuthContext";
import type { ModuleSlug } from "../auth/types";

const modules = [
  {
    module: "mapa-syn" as ModuleSlug,
    title: "MAPA Syn",
    subtitle: "Narrativa Executiva",
    description: "Visão estratégica C-Level. Narrativas de crescimento, projeções de ROI e aprovações de governança.",
    path: "/syn",
    accent: "#2E4C3B",
    metric: "+23% ARR",
    metricLabel: "Crescimento Q3",
  },
  {
    module: "war-room" as ModuleSlug,
    title: "War Room",
    subtitle: "Comando Tático",
    description: "Canvas de pipeline, rastreador de desafios e recursos para reuniões da equipe de vendas.",
    path: "/war-room",
    accent: "#C64928",
    metric: "$840k",
    metricLabel: "Pipeline",
  },
  {
    module: "the-bridge" as ModuleSlug,
    title: "The Bridge",
    subtitle: "Sincronização Dual Core",
    description: "Onde a estratégia encontra a execução. Alinhamento de OKRs, status de sincronização e ponte tática.",
    path: "/team/overview",
    accent: "#4A6FA5",
    metric: "72%",
    metricLabel: "Taxa de Sync",
  },
  {
    module: "team-hub" as ModuleSlug,
    title: "Team Hub",
    subtitle: "Pessoas & Desafios",
    description: "Capacidade da equipe, carga dos consultores e atribuições de desafios ativos.",
    path: "/team",
    accent: "#8B7355",
    metric: "82%",
    metricLabel: "Capacidade",
  },
  {
    module: "synapse" as ModuleSlug,
    title: "Synapse",
    subtitle: "Analytics IA",
    description: "Performance de outreach, scripts gerados por IA e pontuação de engajamento de leads.",
    path: "/analytics",
    accent: "#C64928",
    metric: "24.8%",
    metricLabel: "Conversão",
  },
  {
    module: "the-vault" as ModuleSlug,
    title: "The Vault",
    subtitle: "Biblioteca de Recursos",
    description: "Playbooks, battlecards, templates e frameworks estratégicos para capacitação.",
    path: "/vault",
    accent: "#1A1A1A",
    metric: "1,248",
    metricLabel: "Recursos",
  },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { canAccess } = useAuth();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const visibleModules = modules.filter(module => canAccess(module.module, "read"));
  const addItems: ActionComposerItem[] = useMemo(() => DEFAULT_ADD_ITEMS, []);

  const handleComposerSelect = (item: ActionComposerItem) => {
    setIsComposerOpen(false);
    navigate(item.targetPath, {
      state: {
        actionComposer: item.payload,
        actionId: item.id,
        origin: "/dashboard",
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F5F5F7" }}>
      <TopNav
        brand="MAPA"
        brandSub="Ecosystem"
        version="v2.4.0"
      />

      {/* UNIFIED LAYOUT CONTAINER - Guidelines §4.3 */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 mt-4"
          >
            <span className="text-[10px] text-[#C64928] tracking-[0.2em] uppercase mb-3 block" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>
              ECOSSISTEMA NARRATIVO
            </span>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "42px", fontWeight: 700, lineHeight: 1.15 }}>
              Bom dia, Marina.
            </h1>
            <p className="text-[16px] text-[#717182] mt-3 max-w-lg" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, fontStyle: "italic", lineHeight: 1.6 }}>
              Seu ecossistema narrativo está ativo. 3 itens requerem atenção nas camadas de estratégia e execução.
            </p>
            <button
              onClick={() => setIsComposerOpen(true)}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C64928] text-white text-[12px] tracking-[0.06em] uppercase shadow-sm hover:translate-y-[-2px] transition-all duration-300"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
              aria-label="Abrir ações rápidas"
            >
              <Plus size={14} />
              +ADD
            </button>
          </motion.div>

          <div className="grid grid-cols-3 gap-6">
            {visibleModules.map((module, i) => (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <GlassCard
                  onClick={() => navigate(module.path)}
                  className="group hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, lineHeight: 1.2 }}>
                        {module.title}
                      </h3>
                      <span className="text-[11px] tracking-[0.1em] uppercase mt-1 block" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, color: module.accent }}>
                        {module.subtitle}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-[#1A1A1A] group-hover:text-white transition-all duration-300" style={{ background: "rgba(0,0,0,0.05)" }}>
                      <ArrowRight size={14} />
                    </div>
                  </div>

                  <p className="text-[13px] text-[#717182] mb-6" style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
                    {module.description}
                  </p>

                  <div className="flex items-end justify-between pt-4 border-t border-black/5">
                    <div>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "24px", fontWeight: 400, color: module.accent }}>
                        {module.metric}
                      </span>
                      <p className="text-[10px] text-[#717182] tracking-[0.1em] uppercase mt-0.5" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                        {module.metricLabel}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <ActionComposerModal
        open={isComposerOpen}
        title="Ações rápidas do Ecossistema"
        description="Fluxo unificado para iniciar sessões, elementos estratégicos e novos insights."
        items={addItems}
        onClose={() => setIsComposerOpen(false)}
        onSelect={handleComposerSelect}
      />
    </div>
  );
}
