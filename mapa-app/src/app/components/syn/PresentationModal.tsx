import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Download, Printer, BarChart3, Users, TrendingUp, Zap } from "lucide-react";
import { useSynContext } from "./SynContext";

interface PresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const today = new Date().toLocaleDateString("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const slides = [
  { id: 1, title: "Visão Executiva", icon: Zap, color: "#C64928", tag: "SLIDE 01" },
  { id: 2, title: "Pipeline & Leads", icon: Users, color: "#2E4C3B", tag: "SLIDE 02" },
  { id: 3, title: "Mapa de Calor Estratégico", icon: BarChart3, color: "#3B82F6", tag: "SLIDE 03" },
  { id: 4, title: "Projeções & Forecast", icon: TrendingUp, color: "#8B5CF6", tag: "SLIDE 04" },
];

function generatePresentationHTML(leadsRegistry: Array<{ id: string; name: string; company: string; sector: string; value: string; status: string; statusColor: string }>) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MAPA Syn — Apresentação Estratégica</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Space+Mono&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #0D0D10; color: #F5F5F7; }
    .slide { width: 100vw; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; padding: 80px; page-break-after: always; position: relative; overflow: hidden; }
    .slide::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 60% 60% at 80% 40%, rgba(198,73,40,0.08) 0%, transparent 70%); pointer-events: none; }
    .slide-number { font-family: 'Space Mono', monospace; font-size: 11px; color: rgba(255,255,255,0.3); letter-spacing: 0.15em; margin-bottom: 40px; }
    .slide-tag { display: inline-block; padding: 4px 14px; border-radius: 100px; background: rgba(198,73,40,0.2); color: #C64928; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; margin-bottom: 16px; }
    .slide-title { font-family: 'Playfair Display', serif; font-size: 56px; font-weight: 700; line-height: 1.1; margin-bottom: 24px; max-width: 700px; }
    .slide-sub { font-size: 16px; color: rgba(255,255,255,0.6); max-width: 600px; line-height: 1.6; }
    .accent { color: #C64928; }
    .divider { width: 60px; height: 2px; background: #C64928; margin: 24px 0; }

    /* Slide 2: Pipeline */
    .lead-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 40px; width: 100%; }
    .lead-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; }
    .lead-name { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    .lead-company { font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 12px; }
    .lead-value { font-family: 'Space Mono', monospace; font-size: 22px; color: #2E4C3B; }
    .lead-status { display: inline-block; padding: 2px 8px; border-radius: 100px; font-size: 9px; font-weight: 700; margin-top: 8px; }

    /* Slide 3: Heatmap */
    .heatmap { display: grid; grid-template-columns: 140px repeat(6, 1fr); gap: 8px; margin-top: 40px; width: 100%; }
    .hm-header { font-size: 10px; color: rgba(255,255,255,0.4); font-weight: 600; text-align: center; letter-spacing: 0.05em; padding: 4px; }
    .hm-region { font-size: 12px; color: rgba(255,255,255,0.7); display: flex; align-items: center; padding: 4px; }
    .hm-cell { height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-family: 'Space Mono', monospace; font-size: 13px; }

    /* Slide 4: Forecast */
    .metric-row { display: flex; gap: 32px; margin-top: 48px; }
    .metric-item { flex: 1; }
    .metric-value { font-family: 'Space Mono', monospace; font-size: 48px; font-weight: 400; line-height: 1; margin-bottom: 8px; }
    .metric-label { font-size: 13px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.08em; }
    .bar-chart { margin-top: 40px; display: flex; align-items: flex-end; gap: 16px; height: 120px; }
    .bar { flex: 1; border-radius: 8px 8px 0 0; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 8px; }
    .bar-label { font-size: 10px; color: rgba(255,255,255,0.5); }

    /* Navigation dots */
    .dots { position: fixed; bottom: 32px; right: 32px; display: flex; gap: 8px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.3); }
    .dot.active { background: #C64928; }

    @media print { .slide { height: 100vh; page-break-after: always; } }
  </style>
</head>
<body>

<!-- SLIDE 1: Capa -->
<div class="slide">
  <div class="slide-number">MAPA NARRATIVE ECOSYSTEM · ${today}</div>
  <span class="slide-tag">SLIDE 01</span>
  <h1 class="slide-title">Relatório Estratégico<br/><span class="accent">Q1 2026</span></h1>
  <div class="divider"></div>
  <p class="slide-sub">Visão consolidada do pipeline, performance de mercado e recomendações estratégicas para o Board of Directors.</p>
</div>

<!-- SLIDE 2: Pipeline -->
<div class="slide">
  <span class="slide-tag">SLIDE 02</span>
  <h2 class="slide-title" style="font-size:40px">Pipeline de Leads<br/><span class="accent">Top Oportunidades</span></h2>
  <div class="lead-grid">
    ${leadsRegistry.map(l => `
    <div class="lead-card">
      <div class="lead-name">${l.name}</div>
      <div class="lead-company">${l.company} · ${l.sector}</div>
      <div class="lead-value">${l.value}</div>
      <span class="lead-status" style="background:${l.statusColor}30;color:${l.statusColor}">${l.status}</span>
    </div>`).join("")}
  </div>
</div>

<!-- SLIDE 3: Heatmap -->
<div class="slide">
  <span class="slide-tag">SLIDE 03</span>
  <h2 class="slide-title" style="font-size:40px">Mapa de Calor<br/><span class="accent">Estratégico</span></h2>
  <div class="heatmap">
    <div></div>
    <div class="hm-header">Revenue</div>
    <div class="hm-header">Growth</div>
    <div class="hm-header">Mkt Share</div>
    <div class="hm-header">Inovação</div>
    <div class="hm-header">Satisf.</div>
    <div class="hm-header">Pipeline</div>
    ${[
      { name: "São Paulo", vals: [85, 88, 82, 75, 90, 92], colors: ["#2E4C3B","#2E4C3B","#2E4C3B","#A7C4A0","#2E4C3B","#2E4C3B"] },
      { name: "Rio de Janeiro", vals: [78, 72, 68, 60, 82, 74], colors: ["#A7C4A0","#A7C4A0","#F5D0A9","#F5D0A9","#2E4C3B","#A7C4A0"] },
      { name: "Minas Gerais", vals: [65, 80, 55, 70, 75, 68], colors: ["#F5D0A9","#2E4C3B","#F5D0A9","#A7C4A0","#A7C4A0","#F5D0A9"] },
      { name: "Nordeste", vals: [40, 92, 35, 85, 70, 68], colors: ["#E8A090","#2E4C3B","#E8A090","#2E4C3B","#A7C4A0","#F5D0A9"] },
      { name: "Sul", vals: [70, 60, 75, 65, 78, 63], colors: ["#A7C4A0","#F5D0A9","#A7C4A0","#F5D0A9","#A7C4A0","#F5D0A9"] },
    ].map(r => `
    <div class="hm-region">${r.name}</div>
    ${r.vals.map((v, i) => `<div class="hm-cell" style="background:${r.colors[i]};color:${r.colors[i] === '#2E4C3B' ? '#fff' : '#1A1A1A'}">${v}</div>`).join("")}`).join("")}
  </div>
</div>

<!-- SLIDE 4: Forecast -->
<div class="slide">
  <span class="slide-tag">SLIDE 04</span>
  <h2 class="slide-title" style="font-size:40px">Projeções &<br/><span class="accent">Forecast Q2</span></h2>
  <div class="metric-row">
    <div class="metric-item">
      <div class="metric-value" style="color:#2E4C3B">R$16M</div>
      <div class="metric-label">Pipeline Projetado</div>
    </div>
    <div class="metric-item">
      <div class="metric-value" style="color:#C64928">73%</div>
      <div class="metric-label">Win Rate</div>
    </div>
    <div class="metric-item">
      <div class="metric-value" style="color:#8B5CF6">+23%</div>
      <div class="metric-label">Crescimento ARR</div>
    </div>
  </div>
  <div class="bar-chart">
    ${[
      { label: "Mar", h: 40, c: "#C64928" },
      { label: "Abr", h: 55, c: "#C64928" },
      { label: "Mai", h: 88, c: "#2E4C3B" },
      { label: "Jun", h: 102, c: "#2E4C3B" },
      { label: "Jul", h: 120, c: "#2E4C3B" },
      { label: "Ago*", h: 90, c: "#3B82F6" },
    ].map(b => `
    <div class="bar" style="height:${b.h}px;background:${b.c}30;border-top:2px solid ${b.c}">
      <span class="bar-label">${b.label}</span>
    </div>`).join("")}
  </div>
</div>

<script>window.addEventListener('load', () => setTimeout(() => window.print(), 800));</script>
</body>
</html>`;
}

export function PresentationModal({ isOpen, onClose }: PresentationModalProps) {
  const { analytics } = useSynContext();
  const leadsRegistry = analytics.leadsRegistry;
  const [activeSlide, setActiveSlide] = useState(0);

  const handleExportHTML = () => {
    const html = generatePresentationHTML(leadsRegistry);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mapa-syn-apresentacao-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const html = generatePresentationHTML(leadsRegistry);
    const printWin = window.open("", "_blank", "width=1280,height=800");
    if (!printWin) return;
    printWin.document.write(html);
    printWin.document.close();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/50"
            style={{ backdropFilter: "blur(12px)" }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed z-[201] rounded-[24px] overflow-hidden flex flex-col"
            style={{
              inset: "5%",
              background: "rgba(13,13,16,0.96)",
              backdropFilter: "blur(32px) saturate(160%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 40px 80px -20px rgba(0,0,0,0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-8 py-5 border-b"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <div>
                <h2
                  className="text-white"
                  style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700 }}
                >
                  Apresentação Estratégica
                </h2>
                <p
                  className="text-[12px] mt-0.5"
                  style={{ fontFamily: "'Inter', sans-serif", color: "rgba(255,255,255,0.4)" }}
                >
                  MAPA Syn · {today} · 4 slides gerados
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportHTML}
                  className="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.7)",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                  }}
                >
                  <Download size={13} />
                  BAIXAR .HTML
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-5 py-2 rounded-full text-white transition-all hover:-translate-y-0.5"
                  style={{
                    background: "#C64928",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    boxShadow: "0 8px 20px -4px rgba(198,73,40,0.4)",
                  }}
                >
                  <Printer size={13} />
                  EXPORTAR PDF
                </button>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                  aria-label="Fechar"
                >
                  <X size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
                </button>
              </div>
            </div>

            {/* Slide selector tabs */}
            <div
              className="flex gap-2 px-8 py-4 border-b overflow-x-auto"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              {slides.map((slide, i) => {
                const Icon = slide.icon;
                return (
                  <button
                    key={slide.id}
                    onClick={() => setActiveSlide(i)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full transition-all shrink-0"
                    style={{
                      background: activeSlide === i ? `${slide.color}20` : "rgba(255,255,255,0.04)",
                      border: `1px solid ${activeSlide === i ? slide.color : "rgba(255,255,255,0.08)"}`,
                      color: activeSlide === i ? slide.color : "rgba(255,255,255,0.4)",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "12px",
                      fontWeight: activeSlide === i ? 700 : 500,
                      letterSpacing: "0.03em",
                    }}
                  >
                    <Icon size={13} />
                    <span className="text-[10px] tracking-wider">{slide.tag}</span>
                    <span>{slide.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Slide Preview */}
            <div className="flex-1 overflow-hidden p-8 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-full max-w-4xl rounded-2xl overflow-hidden relative"
                  style={{
                    background: "linear-gradient(135deg, #0D0D10 0%, #1A0A05 100%)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    aspectRatio: "16/9",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                  }}
                >
                  {/* Slide content preview */}
                  <div className="absolute inset-0 p-10 flex flex-col justify-center">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-[9px] tracking-widest mb-4 w-fit"
                      style={{
                        background: `${slides[activeSlide].color}20`,
                        color: slides[activeSlide].color,
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                      }}
                    >
                      {slides[activeSlide].tag}
                    </span>

                    <h3
                      className="mb-3"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "clamp(24px, 3vw, 40px)",
                        fontWeight: 700,
                        color: "white",
                        lineHeight: 1.15,
                      }}
                    >
                      {activeSlide === 0 && <>Relatório Estratégico<br /><span style={{ color: "#C64928" }}>Q1 2026</span></>}
                      {activeSlide === 1 && <>Pipeline de Leads<br /><span style={{ color: "#2E4C3B" }}>Top Oportunidades</span></>}
                      {activeSlide === 2 && <>Mapa de Calor<br /><span style={{ color: "#3B82F6" }}>Estratégico</span></>}
                      {activeSlide === 3 && <>Projeções &<br /><span style={{ color: "#8B5CF6" }}>Forecast Q2</span></>}
                    </h3>

                    {/* Mini content preview */}
                    {activeSlide === 1 && (
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        {leadsRegistry.slice(0, 3).map((lead) => (
                          <div
                            key={lead.id}
                            className="p-3 rounded-xl"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                          >
                            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, color: "white" }}>{lead.name}</p>
                            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "14px", color: "#2E4C3B", marginTop: "4px" }}>{lead.value}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeSlide === 2 && (
                      <div className="mt-4 grid grid-cols-4 gap-1.5">
                        {[85, 88, 82, 92, 78, 72, 40, 68, 65, 80, 55, 70].map((v, i) => (
                          <div
                            key={i}
                            className="h-8 rounded-lg flex items-center justify-center"
                            style={{
                              background: v > 80 ? "#2E4C3B" : v > 65 ? "#A7C4A0" : v > 45 ? "#F5D0A9" : "#E8A090",
                              color: v > 80 ? "white" : "#1A1A1A",
                              fontFamily: "'Space Mono', monospace",
                              fontSize: "10px",
                            }}
                          >
                            {v}
                          </div>
                        ))}
                      </div>
                    )}

                    {activeSlide === 3 && (
                      <div className="flex gap-6 mt-4">
                        {[{ v: "R$16M", l: "Pipeline", c: "#2E4C3B" }, { v: "73%", l: "Win Rate", c: "#C64928" }, { v: "+23%", l: "ARR Growth", c: "#8B5CF6" }].map((m) => (
                          <div key={m.l}>
                            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "24px", color: m.c }}>{m.v}</p>
                            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{m.l}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Decorative gradient orb */}
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      right: "-10%",
                      top: "-20%",
                      width: "50%",
                      height: "80%",
                      background: `radial-gradient(ellipse, ${slides[activeSlide].color}12 0%, transparent 70%)`,
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer / slide nav */}
            <div
              className="flex items-center justify-between px-8 py-4 border-t"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <div className="flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className="rounded-full transition-all"
                    style={{
                      width: activeSlide === i ? "24px" : "8px",
                      height: "8px",
                      background: activeSlide === i ? "#C64928" : "rgba(255,255,255,0.2)",
                    }}
                  />
                ))}
              </div>
              <p
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.25)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {activeSlide + 1} / {slides.length}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
