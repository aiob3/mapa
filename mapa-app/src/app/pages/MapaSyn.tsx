import React, { useState } from "react";
import { TopNav } from "../components/TopNav";
import { SynToolbar } from "../components/syn/SynHeader";
import { SynProvider } from "../components/syn/SynContext";
import { LeadsInsights } from "../components/syn/LeadsInsights";
import { StrategicHeatmap } from "../components/syn/StrategicHeatmap";
import { SectorAnalysis } from "../components/syn/SectorAnalysis";
import { Phone, BarChart3, PieChart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type SynView = "leads" | "heatmap" | "sector";

export function MapaSyn() {
  const [lang, setLang] = useState<"PT" | "EN">("PT");
  const [activeView, setActiveView] = useState<SynView>("leads");
  const [search, setSearch] = useState("");

  return (
    <SynProvider navigateToHeatmap={() => setActiveView("heatmap")}>
      <div className="min-h-screen flex flex-col" style={{ background: "#F5F5F7" }}>
        {/* 1. Global TopNav */}
        <TopNav
          brand="MAPA"
          brandSub="Syn"
          lang={lang}
          onLangToggle={() => setLang((l) => (l === "PT" ? "EN" : "PT"))}
        />

        {/* 2. Syn-specific secondary toolbar */}
        <SynToolbar searchValue={search} onSearchChange={setSearch} />

        {/* 3. Body: sidebar + main content */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <SynSidebar activeView={activeView} onChangeView={setActiveView} />

          <main className="flex-1 p-8 overflow-auto flex flex-col">
            <AnimatePresence mode="wait">
              {activeView === "leads" && (
                <motion.div
                  key="leads"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <LeadsInsights />
                </motion.div>
              )}
              {activeView === "heatmap" && (
                <motion.div
                  key="heatmap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <StrategicHeatmap />
                </motion.div>
              )}
              {activeView === "sector" && (
                <motion.div
                  key="sector"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <SectorAnalysis />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </SynProvider>
  );
}

// -------------- Internal Sidebar Component ----------------

interface SynSidebarProps {
  activeView: SynView;
  onChangeView: (view: SynView) => void;
}

function SynSidebar({ activeView, onChangeView }: SynSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const items: {
    view: SynView;
    label: string;
    sublabel: string;
    icon: typeof Phone;
  }[] = [
    { view: "leads", label: "Leads & Insights", sublabel: "Call Intelligence Hub", icon: Phone },
    { view: "heatmap", label: "MAPA Syn", sublabel: "Strategic Heatmap", icon: BarChart3 },
    { view: "sector", label: "Análise Setorial", sublabel: "Sector Performance", icon: PieChart },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col bg-white/70 border-r border-white/40 relative shrink-0"
      style={{
        backdropFilter: "blur(24px) saturate(150%)",
        WebkitBackdropFilter: "blur(24px) saturate(150%)",
      }}
    >
      {/* Collapse/Expand Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 w-7 h-7 rounded-full bg-[#C64928] flex items-center justify-center hover:scale-110 hover:bg-[#E07B5B] transition-all z-50 shadow-lg"
        aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
      >
        {isCollapsed ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        )}
      </button>

      <div className="p-5 flex flex-col h-full overflow-hidden">
        {/* Brand mark */}
        <div className="mb-8 overflow-hidden">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#C64928] to-[#8B7355] flex items-center justify-center shadow-[0_4px_12px_rgba(198,73,40,0.25)]">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3h18v18H3z" />
                    <path d="M3 12h18" />
                    <path d="M12 3v18" />
                  </svg>
                </div>
                <div>
                  <div
                    className="text-[#1A1A1A] whitespace-nowrap"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, letterSpacing: "0.05em" }}
                  >
                    MAPA SYN
                  </div>
                  <div
                    className="text-[#717182] whitespace-nowrap"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 400 }}
                  >
                    Intelligence Module
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {isCollapsed && (
            <div className="flex justify-center">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#C64928] to-[#8B7355] flex items-center justify-center shadow-[0_4px_12px_rgba(198,73,40,0.25)]">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3h18v18H3z" />
                  <path d="M3 12h18" />
                  <path d="M12 3v18" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5 flex-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.view;
            return (
              <motion.button
                key={item.view}
                onClick={() => onChangeView(item.view)}
                className={`flex items-center gap-3 rounded-2xl text-left transition-all duration-200 relative ${
                  isActive
                    ? "bg-[rgba(198,73,40,0.08)] text-[#1A1A1A]"
                    : "text-[#717182] hover:text-[#1A1A1A] hover:bg-white/20 border border-transparent"
                } ${isCollapsed ? "justify-center px-3 py-3" : "px-4 py-3"}`}
                style={
                  isActive
                    ? {
                        backdropFilter: "blur(24px) saturate(150%)",
                        WebkitBackdropFilter: "blur(24px) saturate(150%)",
                        borderLeft: "2px solid #C64928",
                      }
                    : undefined
                }
                whileHover={{ scale: isActive ? 1 : 1.01 }}
                whileTap={{ scale: 0.98 }}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={18} className={isActive ? "text-[#C64928]" : ""} />

                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col flex-1 overflow-hidden"
                  >
                    <span
                      className="text-[13px] whitespace-nowrap"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: isActive ? 600 : 500, color: isActive ? "#1A1A1A" : undefined }}
                    >
                      {item.label}
                    </span>
                    <span
                      className="text-[10px] whitespace-nowrap"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, color: "#717182" }}
                    >
                      {item.sublabel}
                    </span>
                  </motion.div>
                )}

                {!isCollapsed && isActive && (
                  <motion.svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#C64928" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </motion.svg>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Footer: collapse button + system status */}
        <div className="mt-auto pt-4">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="w-full py-2 rounded-full bg-white/50 text-[#717182] hover:bg-white/70 transition-all mb-4"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" as const }}
                >
                  « RECOLHER
                </button>

                {/* System Status */}
                <div className="p-3 rounded-2xl bg-white/85 border border-white/60 shadow-[0_12px_32px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-2 mb-1">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-[#2E4C3B]"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-[11px] text-[#2E4C3B]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                      Sistema Ativo
                    </span>
                  </div>
                  <p className="text-[11px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>
                    Última sincronização: 2min atrás
                  </p>
                  <p className="text-[11px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>
                    12 eventos monitorados
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}