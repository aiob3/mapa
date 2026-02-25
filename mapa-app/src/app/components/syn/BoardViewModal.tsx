import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Printer, Download, TrendingUp, Target, Users, AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import { leadsRegistry } from "./SynContext";

interface BoardViewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const today = new Date().toLocaleDateString("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const boardKPIs = [
  { label: "Pipeline Total", value: "R$ 12.4M", sub: "+23% vs Q2", color: "#2E4C3B", icon: TrendingUp },
  { label: "Leads Quentes", value: "12", sub: "Alta probabilidade", color: "#C64928", icon: Target },
  { label: "Win Rate", value: "73%", sub: "+5pp vs meta", color: "#10B981", icon: CheckCircle2 },
  { label: "At Risk", value: "R$ 3.2M", sub: "Requer atenção C-Level", color: "#F43F5E", icon: AlertTriangle },
];

const strategicActions = [
  { priority: "ALTA", action: "Aprovar proposta técnica LogiTech (WMS + Frotas NE)", owner: "VP Comercial", date: "28/02" },
  { priority: "ALTA", action: "Agendar demo plataforma para FarmaVida Group", owner: "Pre-Sales", date: "03/03" },
  { priority: "ALTA", action: "Escalar negociação FinanceCore com C-Level", owner: "CEO", date: "07/03" },
  { priority: "MÉDIA", action: "Revisar forecast Q2 com base em novas oportunidades", owner: "Revenue Ops", date: "05/03" },
  { priority: "MÉDIA", action: "Preparar board summary setorial (Varejo + Finance)", owner: "Strategy", date: "10/03" },
];

export function BoardViewModal({ isOpen, onClose }: BoardViewModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handlePrint = () => {
    if (!printRef.current) return;

    const printWin = window.open("", "_blank", "width=1200,height=800");
    if (!printWin) return;

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>MAPA Syn — Board Summary</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Space+Mono&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #F5F5F7; color: #1A1A1A; padding: 48px; }
    .header { border-bottom: 2px solid #C64928; padding-bottom: 24px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end; }
    .title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; }
    .subtitle { font-size: 13px; color: #717182; margin-top: 4px; }
    .date { font-size: 12px; color: #717182; font-family: 'Space Mono', monospace; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 40px; }
    .kpi-card { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .kpi-label { font-size: 11px; color: #717182; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; margin-bottom: 8px; }
    .kpi-value { font-family: 'Space Mono', monospace; font-size: 28px; font-weight: 400; margin-bottom: 4px; }
    .kpi-sub { font-size: 11px; color: #717182; }
    .section-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 600; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
    th { text-align: left; font-size: 11px; color: #717182; text-transform: uppercase; letter-spacing: 0.06em; padding: 8px 12px; border-bottom: 1px solid #e0e0e0; }
    td { padding: 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 100px; font-size: 10px; font-weight: 700; }
    .action-row { display: grid; grid-template-columns: 80px 1fr 120px 80px; gap: 16px; align-items: center; padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
    .priority-alta { color: #C64928; background: rgba(198,73,40,0.1); }
    .priority-media { color: #F59E0B; background: rgba(245,158,11,0.1); }
    .footer { margin-top: 40px; border-top: 1px solid #e0e0e0; padding-top: 16px; font-size: 11px; color: #717182; display: flex; justify-content: space-between; }
    @media print { body { padding: 24px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">MAPA Syn — Board Summary</div>
      <div class="subtitle">Strategic Intelligence Report — Revenue Operations</div>
    </div>
    <div class="date">${today}</div>
  </div>

  <div class="kpi-grid">
    ${boardKPIs.map(k => `
    <div class="kpi-card">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value" style="color:${k.color}">${k.value}</div>
      <div class="kpi-sub">${k.sub}</div>
    </div>`).join("")}
  </div>

  <div class="section-title">Pipeline de Leads — Top Oportunidades</div>
  <table>
    <thead><tr><th>Lead</th><th>Empresa</th><th>Setor</th><th>Valor</th><th>Status</th><th>Score IA</th></tr></thead>
    <tbody>
      ${leadsRegistry.map(l => `
      <tr>
        <td>${l.name}</td>
        <td>${l.company}</td>
        <td>${l.sector}</td>
        <td style="font-family:'Space Mono',monospace">${l.value}</td>
        <td><span class="badge" style="background:${l.statusColor}20;color:${l.statusColor}">${l.status}</span></td>
        <td style="font-family:'Space Mono',monospace;color:#2E4C3B">${l.score}</td>
      </tr>`).join("")}
    </tbody>
  </table>

  <div class="section-title">Ações Estratégicas Recomendadas pelo Board</div>
  ${strategicActions.map(a => `
  <div class="action-row">
    <span class="badge priority-${a.priority === "ALTA" ? "alta" : "media"}">${a.priority}</span>
    <span>${a.action}</span>
    <span style="color:#717182">${a.owner}</span>
    <span style="font-family:'Space Mono',monospace;color:#C64928">${a.date}</span>
  </div>`).join("")}

  <div class="footer">
    <span>MAPA Narrative Ecosystem — Confidencial</span>
    <span>Gerado em ${today} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
  </div>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

    printWin.document.write(html);
    printWin.document.close();
  };

  const handleDownload = () => {
    const json = {
      report: "MAPA Syn — Board Summary",
      date: today,
      kpis: boardKPIs.map((k) => ({ label: k.label, value: k.value, trend: k.sub })),
      leads: leadsRegistry.map((l) => ({ name: l.name, company: l.company, value: l.value, score: l.score, status: l.status })),
      actions: strategicActions,
    };
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mapa-syn-board-summary-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black/40"
            style={{ backdropFilter: "blur(8px)" }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-6 z-[201] rounded-[24px] overflow-hidden flex flex-col"
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(32px) saturate(180%)",
              WebkitBackdropFilter: "blur(32px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.6)",
              boxShadow: "0 40px 80px -20px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-8 py-5 border-b border-black/5"
              style={{ background: "rgba(255,255,255,0.8)" }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(198,73,40,0.1)" }}
                >
                  <Zap size={18} className="text-[#C64928]" />
                </div>
                <div>
                  <h2
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "22px",
                      fontWeight: 700,
                    }}
                    className="text-[#1A1A1A]"
                  >
                    Board Summary
                  </h2>
                  <p
                    className="text-[12px] text-[#717182]"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    MAPA Syn — Strategic Intelligence Report · {today}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 text-[#1A1A1A] hover:bg-black/5 transition-colors"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                  }}
                >
                  <Download size={13} />
                  BAIXAR JSON
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
                    boxShadow: "0 8px 20px -4px rgba(198,73,40,0.35)",
                  }}
                >
                  <Printer size={13} />
                  IMPRIMIR / PDF
                </button>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
                  aria-label="Fechar"
                >
                  <X size={18} className="text-[#717182]" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div ref={printRef} className="flex-1 overflow-auto px-8 py-6">
              {/* KPI Grid */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {boardKPIs.map((kpi, i) => {
                  const Icon = kpi.icon;
                  return (
                    <motion.div
                      key={kpi.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07, type: "spring", stiffness: 300, damping: 30 }}
                      className="p-5 rounded-2xl border border-white/60"
                      style={{ background: "rgba(255,255,255,0.8)", boxShadow: "0 8px 20px -6px rgba(0,0,0,0.06)" }}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                        style={{ background: `${kpi.color}15` }}
                      >
                        <Icon size={15} style={{ color: kpi.color }} />
                      </div>
                      <p
                        className="mb-0.5"
                        style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: "26px",
                          fontWeight: 400,
                          fontVariantNumeric: "tabular-nums",
                          color: kpi.color,
                        }}
                      >
                        {kpi.value}
                      </p>
                      <p
                        className="text-[11px] text-[#1A1A1A]"
                        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
                      >
                        {kpi.label}
                      </p>
                      <p
                        className="text-[10px] text-[#717182] mt-0.5"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {kpi.sub}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="grid grid-cols-[1fr_380px] gap-6">
                {/* Leads Table */}
                <div>
                  <h3
                    className="mb-4 text-[#1A1A1A]"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "18px",
                      fontWeight: 600,
                    }}
                  >
                    Pipeline de Leads — Top Oportunidades
                  </h3>
                  <div
                    className="rounded-2xl overflow-hidden border border-black/5"
                    style={{ background: "rgba(255,255,255,0.7)" }}
                  >
                    <table className="w-full border-collapse">
                      <thead>
                        <tr style={{ background: "rgba(0,0,0,0.03)" }}>
                          {["Lead", "Empresa", "Setor / Região", "Valor", "Status", "Score IA"].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left"
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: "10px",
                                fontWeight: 700,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                color: "#717182",
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {leadsRegistry.map((lead, i) => (
                          <motion.tr
                            key={lead.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.06, type: "spring", stiffness: 300, damping: 30 }}
                            className="border-t border-black/5 hover:bg-black/2 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                                  style={{ background: `${lead.statusColor}20` }}
                                >
                                  <span
                                    className="text-[9px]"
                                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, color: lead.statusColor }}
                                  >
                                    {lead.initials}
                                  </span>
                                </div>
                                <span
                                  className="text-[12px] text-[#1A1A1A]"
                                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                                >
                                  {lead.name}
                                </span>
                              </div>
                            </td>
                            <td
                              className="px-4 py-3 text-[12px] text-[#717182]"
                              style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                              {lead.company}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-0.5">
                                <span
                                  className="text-[11px] text-[#1A1A1A]"
                                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                                >
                                  {lead.sector}
                                </span>
                                <span
                                  className="text-[10px] text-[#717182]"
                                  style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                  {lead.region}
                                </span>
                              </div>
                            </td>
                            <td
                              className="px-4 py-3 text-[#1A1A1A]"
                              style={{
                                fontFamily: "'Space Mono', monospace",
                                fontSize: "12px",
                                fontVariantNumeric: "tabular-nums",
                              }}
                            >
                              {lead.value}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className="px-2 py-0.5 rounded-full text-[9px]"
                                style={{
                                  fontFamily: "'Inter', sans-serif",
                                  fontWeight: 700,
                                  background: `${lead.statusColor}20`,
                                  color: lead.statusColor,
                                }}
                              >
                                {lead.status}
                              </span>
                            </td>
                            <td
                              className="px-4 py-3"
                              style={{
                                fontFamily: "'Space Mono', monospace",
                                fontSize: "14px",
                                fontWeight: 400,
                                fontVariantNumeric: "tabular-nums",
                                color: lead.score > 80 ? "#2E4C3B" : lead.score > 60 ? "#F59E0B" : "#6B7280",
                              }}
                            >
                              {lead.score}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Strategic Actions */}
                <div>
                  <h3
                    className="mb-4 text-[#1A1A1A]"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "18px",
                      fontWeight: 600,
                    }}
                  >
                    Ações Estratégicas
                  </h3>
                  <div className="flex flex-col gap-3">
                    {strategicActions.map((action, i) => (
                      <motion.div
                        key={action.action}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.07, type: "spring", stiffness: 300, damping: 30 }}
                        className="p-4 rounded-2xl border border-black/5"
                        style={{ background: "rgba(255,255,255,0.7)" }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="px-2 py-0.5 rounded-full text-[9px]"
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 700,
                              background: action.priority === "ALTA" ? "rgba(198,73,40,0.12)" : "rgba(245,158,11,0.12)",
                              color: action.priority === "ALTA" ? "#C64928" : "#F59E0B",
                            }}
                          >
                            {action.priority}
                          </span>
                          <span
                            className="text-[10px] text-[#717182] ml-auto"
                            style={{ fontFamily: "'Space Mono', monospace", fontVariantNumeric: "tabular-nums" }}
                          >
                            {action.date}
                          </span>
                        </div>
                        <p
                          className="text-[12px] text-[#1A1A1A] mb-1"
                          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, lineHeight: 1.5 }}
                        >
                          {action.action}
                        </p>
                        <p
                          className="text-[11px] text-[#717182]"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          {action.owner}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-8 py-4 border-t border-black/5 flex items-center justify-between"
              style={{ background: "rgba(0,0,0,0.02)" }}
            >
              <span
                className="text-[11px] text-[#717182]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                MAPA Narrative Ecosystem — Relatório Confidencial
              </span>
              <span
                className="text-[11px] text-[#717182]"
                style={{ fontFamily: "'Space Mono', monospace", fontVariantNumeric: "tabular-nums" }}
              >
                Gerado em {today}
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
