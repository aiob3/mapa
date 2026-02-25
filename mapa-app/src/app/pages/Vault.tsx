import React, { useState } from "react";
import { TopNav } from "../components/TopNav";
import { GlassCard } from "../components/GlassCard";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Asset {
  id: string;
  title: string;
  category: string;
  stage: "Analyze" | "Plan" | "Execute";
  type: string;
  description: string;
  readTime: string;
}

const assets: Asset[] = [
  { id: "1", title: "The Discovery Framework", category: "Prospecção", stage: "Analyze", type: "Playbook", description: "Um framework completo para conduzir discovery calls que revelam as verdadeiras dores do cliente.", readTime: "12 min" },
  { id: "2", title: "Competitive Battlecard: Enterprise", category: "Competidores", stage: "Execute", type: "Template", description: "Comparativo detalhado contra os principais concorrentes no segmento enterprise.", readTime: "8 min" },
  { id: "3", title: "ROI Calculator & Value Map", category: "Valor", stage: "Plan", type: "Ferramenta", description: "Calculadora de ROI personalizada para demonstrar valor quantitativo ao cliente.", readTime: "5 min" },
  { id: "4", title: "Objection Handling Masterclass", category: "Negociação", stage: "Execute", type: "Script", description: "As 15 objeções mais comuns e respostas baseadas em dados para cada uma.", readTime: "15 min" },
  { id: "5", title: "Stakeholder Mapping Canvas", category: "Estratégia", stage: "Plan", type: "Template", description: "Identifique e mapeie todos os stakeholders envolvidos no processo de compra.", readTime: "6 min" },
  { id: "6", title: "Champion Building Playbook", category: "Relacionamento", stage: "Execute", type: "Playbook", description: "Como identificar, cultivar e alavancar champions dentro da organização do cliente.", readTime: "18 min" },
  { id: "7", title: "Market Analysis: LATAM 2026", category: "Mercado", stage: "Analyze", type: "Report", description: "Análise detalhada do mercado LATAM com tendências e oportunidades para o próximo ano.", readTime: "25 min" },
  { id: "8", title: "Pricing Strategy Guide", category: "Pricing", stage: "Plan", type: "Guia", description: "Estratégias de precificação para diferentes segmentos e cenários de negociação.", readTime: "10 min" },
  { id: "9", title: "Executive Briefing Template", category: "Estratégia", stage: "Analyze", type: "Template", description: "Template para preparar briefings executivos impactantes antes de reuniões C-Level.", readTime: "7 min" },
];

const stageColors: Record<string, string> = {
  Analyze: "#4A6FA5",
  Plan: "#2E4C3B",
  Execute: "#C64928",
};

const allFilters = ["Todos", "Objection Handling", "Pricing", "Competidores", "Estratégia", "Prospecção"];

export function Vault() {
  const [lang, setLang] = useState<"PT" | "EN">("PT");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "Todos" || asset.category.includes(activeFilter);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F5F5F7" }}>
      <TopNav
        brand="MAPA"
        brandSub="Vault"
        version="v2.4.0"
        lang={lang}
        onLangToggle={() => setLang(lang === "PT" ? "EN" : "PT")}
      />

      {/* UNIFIED LAYOUT CONTAINER - Guidelines §4.3 */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Search */}
          <div className="max-w-2xl mx-auto mb-10 mt-4">
            <div className="flex items-center gap-3 px-8 py-5 rounded-full bg-white/65 backdrop-blur-[24px] border border-white/40 shadow-[0_12px_32px_rgba(0,0,0,0.04)]">
              <Search size={20} className="text-[#717182]" />
              <input
                type="text"
                placeholder="O que você precisa resolver?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-[16px] flex-1 placeholder:text-[#717182]/50"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, fontStyle: "italic" }}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
            {allFilters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-5 py-2 rounded-full text-[12px] transition-all duration-200 ${
                  activeFilter === f
                    ? "bg-[#1A1A1A] text-white shadow-sm"
                    : "bg-white/50 text-[#717182] border border-white/40 hover:text-[#1A1A1A] hover:bg-white/70"
                }`}
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Masonry Grid */}
          <div className="columns-3 gap-5 space-y-5">
            {filteredAssets.map((asset, index) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="break-inside-avoid"
              >
                <GlassCard
                  onClick={() => setSelectedAsset(asset)}
                  className={`hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-300 ${
                    index % 3 === 1 ? "!pt-10 !pb-10" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-white text-[9px] tracking-[0.05em]"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, background: stageColors[asset.stage] }}
                    >
                      {asset.stage.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>{asset.type}</span>
                  </div>

                  <h2
                    style={{ fontFamily: "'Playfair Display', serif", fontSize: index % 3 === 1 ? "26px" : "22px", fontWeight: 600, lineHeight: 1.2 }}
                    className="mb-3"
                  >
                    {asset.title}
                  </h2>

                  <p className="text-[13px] text-[#717182] mb-4" style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
                    {asset.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-black/5 text-[10px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                      {asset.category}
                    </span>
                    <span className="text-[11px] text-[#717182]" style={{ fontFamily: "'Space Mono', monospace" }}>
                      {asset.readTime}
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-8"
            onClick={() => setSelectedAsset(null)}
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-white/90 backdrop-blur-[32px] rounded-[32px] border border-white/40 shadow-[0_32px_64px_rgba(0,0,0,0.15)] p-10"
            >
              <button
                onClick={() => setSelectedAsset(null)}
                className="absolute top-6 right-6 p-2 hover:bg-black/5 rounded-full"
              >
                <X size={20} className="text-[#717182]" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <span
                  className="px-3 py-1 rounded-full text-white text-[10px] tracking-[0.05em]"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, background: stageColors[selectedAsset.stage] }}
                >
                  {selectedAsset.stage.toUpperCase()}
                </span>
                <span className="text-[12px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {selectedAsset.type} • {selectedAsset.category}
                </span>
              </div>

              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", fontWeight: 700, lineHeight: 1.2 }} className="mb-4">
                {selectedAsset.title}
              </h1>

              <p className="text-[15px] text-[#717182] mb-8" style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.7 }}>
                {selectedAsset.description}
              </p>

              <div className="p-8 rounded-2xl bg-black/3 border border-black/5 mb-6">
                <p className="text-[14px] text-[#717182] text-center" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", lineHeight: 1.8 }}>
                  O conteúdo de prévia apareceria aqui. Este recurso contém frameworks estratégicos detalhados,
                  templates e insights acionáveis para sua prática de consultoria em vendas.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#717182]" style={{ fontFamily: "'Space Mono', monospace" }}>
                  {selectedAsset.readTime} leitura
                </span>
                <button
                  className="px-6 py-2.5 rounded-full bg-[#C64928] text-white text-[12px] tracking-[0.06em] uppercase hover:translate-y-[-2px] transition-all duration-300"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: "0.06em" }}
                  aria-label="Abrir Documento Completo"
                >
                  ABRIR DOCUMENTO
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}