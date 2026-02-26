import React, { useState, useCallback, useRef, useEffect } from "react";
import { GlassCard } from "../GlassCard";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Upload,
  Sparkles,
  Phone,
  FileText,
  Users,
  Activity,
  Clock,
  MapPin,
  Building2,
  DollarSign,
  Target,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  GitBranch,
  X,
} from "lucide-react";
import { useSynContext } from "./SynContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TranscriptLine {
  time: string;
  speaker: string;
  text: string;
}

// ─── Transcript parsers ───────────────────────────────────────────────────────

function padTime(h: number, m: number) {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function parseVTT(content: string): TranscriptLine[] {
  const lines: TranscriptLine[] = [];
  const blocks = content.replace(/^WEBVTT[^\n]*\n/, "").split(/\n\n+/).filter(Boolean);
  for (const block of blocks) {
    const parts = block.split("\n");
    const tsLine = parts.find((p) => p.includes("-->"));
    if (!tsLine) continue;
    const timeMatch = tsLine.match(/(\d{2}:\d{2})/);
    const time = timeMatch ? timeMatch[1] : "00:00";
    const tsIdx = parts.indexOf(tsLine);
    const text = parts.slice(tsIdx + 1).join(" ").trim();
    const speakerMatch = text.match(/^([^:]{1,40}):\s*(.+)/s);
    if (speakerMatch) {
      lines.push({ time, speaker: speakerMatch[1].trim(), text: speakerMatch[2].trim() });
    } else {
      lines.push({ time, speaker: "Participante", text });
    }
  }
  return lines;
}

function parseSRT(content: string): TranscriptLine[] {
  const lines: TranscriptLine[] = [];
  const blocks = content.split(/\n\n+/).filter(Boolean);
  for (const block of blocks) {
    const parts = block.split("\n");
    const tsLine = parts.find((p) => p.includes("-->"));
    if (!tsLine) continue;
    const timeMatch = tsLine.match(/(\d{2}:\d{2})/);
    const time = timeMatch ? timeMatch[1] : "00:00";
    const tsIdx = parts.indexOf(tsLine);
    const text = parts.slice(tsIdx + 1).join(" ").trim();
    const speakerMatch = text.match(/^([^:]{1,40}):\s*(.+)/s);
    if (speakerMatch) {
      lines.push({ time, speaker: speakerMatch[1].trim(), text: speakerMatch[2].trim() });
    } else {
      lines.push({ time, speaker: "Participante", text });
    }
  }
  return lines;
}

function parseTXT(content: string): TranscriptLine[] {
  const lines: TranscriptLine[] = [];
  const rawLines = content.split("\n").filter((l) => l.trim());
  let autoMin = 32;
  let autoSec = 0;
  for (const line of rawLines) {
    // [HH:MM] Speaker: Text
    const p1 = line.match(/\[(\d{1,2}:\d{2})\]\s*([^:]+):\s*(.+)/);
    // HH:MM - Speaker: Text
    const p2 = line.match(/^(\d{1,2}:\d{2})\s*[-–]\s*([^:]+):\s*(.+)/);
    // Speaker: Text (no timestamp)
    const p3 = line.match(/^([^:]{1,40}):\s*(.+)/);

    if (p1) {
      lines.push({ time: p1[1], speaker: p1[2].trim(), text: p1[3].trim() });
    } else if (p2) {
      lines.push({ time: p2[1], speaker: p2[2].trim(), text: p2[3].trim() });
    } else if (p3) {
      const m = autoMin + Math.floor(autoSec / 60);
      const s = autoSec % 60;
      lines.push({ time: padTime(Math.floor(m / 60), m % 60), speaker: p3[1].trim(), text: p3[2].trim() });
      autoSec += 90;
    }
  }
  return lines;
}

function parseTranscript(content: string, filename: string): TranscriptLine[] {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "vtt") return parseVTT(content);
  if (ext === "srt") return parseSRT(content);
  return parseTXT(content);
}

// ─── Default transcript (for lead "1") ───────────────────────────────────────

const defaultTranscriptLines: TranscriptLine[] = [];

// ─── CRM field extraction ─────────────────────────────────────────────────────

interface CRMField {
  label: string;
  value: string;
  icon: React.ReactNode;
  color?: string;
}

function buildCRMFields(selectedLead: {
  value: string;
  status: string;
  company: string;
  sector: string;
  region: string;
  executiveSummary: string;
  inflectionPointsCount: number;
  tacitBasis: string[];
}): CRMField[] {
  const tacitHints = selectedLead.tacitBasis.length > 0
    ? selectedLead.tacitBasis.slice(0, 2).join(', ')
    : 'Sem embasamento tácito consolidado nesta janela.';

  return [
    { label: "Deal Size", value: selectedLead.value, icon: <DollarSign size={14} />, color: "#2E4C3B" },
    { label: "Pain Points", value: "Consolidação de dados, correlação operacional, priorização de execução", icon: <AlertTriangle size={14} />, color: "#C64928" },
    { label: "Orçamento Aprovado", value: `${selectedLead.value} (janela ativa)`, icon: <Target size={14} />, color: "#2E4C3B" },
    { label: "Timeline", value: "Próxima janela operacional", icon: <Calendar size={14} />, color: "#3B82F6" },
    { label: "Concorrência", value: "Análise competitiva em andamento", icon: <AlertTriangle size={14} />, color: "#F59E0B" },
    { label: "Decisão", value: selectedLead.executiveSummary || "Governança + Comitê de Receita", icon: <Clock size={14} />, color: "#C64928" },
    { label: "Ponto de Inflexão", value: `${selectedLead.inflectionPointsCount} sinais ativos`, icon: <GitBranch size={14} />, color: "#C64928" },
    { label: "Embasamento Tácito", value: tacitHints, icon: <FileText size={14} />, color: "#8B5CF6" },
    { label: "Escopo", value: `${selectedLead.company} · ${selectedLead.sector} · ${selectedLead.region}`, icon: <Building2 size={14} />, color: "#6366F1" },
    { label: "To-Do", value: "Atualizar briefing técnico, validar hipótese e acionar plano de execução", icon: <CheckCircle2 size={14} />, color: "#10B981" },
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LeadsInsights() {
  const { setMirrorLeadId, navigateToHeatmap, analytics, analyticsStatus } = useSynContext();
  const leadsRegistry = analytics.leadsRegistry;

  const [selectedLeadId, setSelectedLeadId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionComplete, setExtractionComplete] = useState(false);
  const [visibleFields, setVisibleFields] = useState<number>(0);

  // Transcript state (file-importable)
  const [transcriptLines, setTranscriptLines] = useState<TranscriptLine[]>(defaultTranscriptLines);
  const [importedFilename, setImportedFilename] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedLeadId && leadsRegistry.length > 0) {
      setSelectedLeadId(leadsRegistry[0].id);
    }
  }, [leadsRegistry, selectedLeadId]);

  const selectedLead = leadsRegistry.find((l) => l.id === selectedLeadId) ?? leadsRegistry[0];
  const extractedCRMFields = selectedLead
    ? buildCRMFields({
      value: selectedLead.value,
      status: selectedLead.status,
      company: selectedLead.company,
      sector: selectedLead.sector,
      region: selectedLead.region,
      executiveSummary: selectedLead.semanticSignals.executiveSummary,
      inflectionPointsCount: selectedLead.semanticSignals.inflectionPointsCount,
      tacitBasis: selectedLead.semanticLayer.tacitBasis,
    })
    : [];
  const leadKpis = [
    { label: "Leads Ativos", value: String(analytics.kpis.leadsAtivos), change: `+${Math.max(0, Math.round(analytics.kpis.leadsAtivos * 0.1))}`, color: "#C64928", icon: <Users size={16} className="text-white" /> },
    { label: "Contratos Vigentes", value: String(analytics.kpis.contratosVigentes), change: `+${Math.max(0, Math.round(analytics.kpis.contratosVigentes * 0.1))}`, color: "#10B981", icon: <FileText size={16} className="text-white" /> },
    { label: "Leads em Aberto", value: String(analytics.kpis.leadsEmAberto), change: `+${Math.max(0, Math.round(analytics.kpis.leadsEmAberto * 0.12))}`, color: "#F59E0B", icon: <Activity size={16} className="text-white" /> },
    { label: "Eventos Monitorados", value: String(analytics.kpis.eventosMonitorados), change: `+${Math.max(0, Math.round(analytics.kpis.eventosMonitorados * 0.08))}`, color: "#6366F1", icon: <Activity size={16} className="text-white" /> },
  ];

  // ── Transcript import handlers ────────────────────────────────────────────
  const processFile = useCallback((file: File) => {
    setUploadError(null);
    const allowed = ["txt", "vtt", "srt"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowed.includes(ext)) {
      setUploadError("Formato não suportado. Use .txt, .vtt ou .srt");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = parseTranscript(content, file.name);
      if (parsed.length === 0) {
        setUploadError("Não foi possível extrair linhas da transcrição. Verifique o formato.");
        return;
      }
      setTranscriptLines(parsed);
      setImportedFilename(file.name);
      setExtractionComplete(false);
      setVisibleFields(0);
    };
    reader.onerror = () => setUploadError("Erro ao ler o arquivo.");
    reader.readAsText(file, "UTF-8");
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // ── CRM extraction ────────────────────────────────────────────────────────
  const handleConvert = useCallback(() => {
    setIsExtracting(true);
    setVisibleFields(0);
    setExtractionComplete(false);
    extractedCRMFields.forEach((_, index) => {
      setTimeout(() => {
        setVisibleFields((prev) => prev + 1);
      }, 600 + index * 400);
    });
    setTimeout(() => {
      setIsExtracting(false);
      setExtractionComplete(true);
    }, 600 + extractedCRMFields.length * 400 + 500);
  }, [extractedCRMFields]);

  // ── Strategic Mirror ──────────────────────────────────────────────────────
  const handleMirrorLead = (leadId: string) => {
    setMirrorLeadId(leadId);
    navigateToHeatmap();
  };

  const filteredLeads = leadsRegistry.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      {analyticsStatus.loading && (
        <GlassCard className="!p-4 mb-5">
          <p className="text-[12px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>
            Carregando dados de leads...
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

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.vtt,.srt"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Importar arquivo de transcrição"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-shrink-0">
        <div>
          <h1
            style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 600, lineHeight: 1.3 }}
            className="text-[#1A1A1A]"
          >
            Leads & Call Insights
          </h1>
          <p className="text-[13px] text-[#717182] mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
            Intelligence Hub — Importação e conversão de transcrições em oportunidades estratégicas
          </p>
        </div>
        <div className="flex items-center gap-3">
          {importedFilename && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2E4C3B]/10"
            >
              <FileText size={12} className="text-[#2E4C3B]" />
              <span className="text-[11px] text-[#2E4C3B]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                {importedFilename}
              </span>
              <button
                onClick={() => { setTranscriptLines(defaultTranscriptLines); setImportedFilename(null); }}
                className="hover:text-[#C64928] transition-colors text-[#2E4C3B]"
                aria-label="Remover transcrição importada"
              >
                <X size={12} />
              </button>
            </motion.div>
          )}
          <motion.button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/65 border border-white/40 text-[#1A1A1A] hover:bg-white/80 transition-all"
            style={{
              backdropFilter: "blur(24px) saturate(150%)",
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase" as const,
            }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <Upload size={14} />
            IMPORTAR TRANSCRIÇÃO
          </motion.button>
        </div>
      </div>

      {/* Upload error */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#C64928]/8 border border-[#C64928]/20 flex-shrink-0"
          >
            <AlertTriangle size={14} className="text-[#C64928] shrink-0" />
            <p className="text-[12px] text-[#C64928]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
              {uploadError}
            </p>
            <button onClick={() => setUploadError(null)} className="ml-auto text-[#C64928]">
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-5 mb-8 flex-shrink-0">
        {leadKpis.map((kpi) => (
          <GlassCard key={kpi.label} className="!p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: `${kpi.color}20` }}>
                <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: kpi.color }}>
                  {kpi.icon}
                </div>
              </div>
              <span
                className="px-2 py-0.5 rounded-full text-[10px]"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, background: `${kpi.color}15`, color: kpi.color }}
              >
                {kpi.change}
              </span>
            </div>
            <p className="text-[#1A1A1A] mt-2" style={{ fontFamily: "'Space Mono', monospace", fontSize: "24px", fontWeight: 400, fontVariantNumeric: "tabular-nums" }}>
              {kpi.value}
            </p>
            <p className="text-[11px] text-[#717182] mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
              {kpi.label}
            </p>
          </GlassCard>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-[280px_1fr_300px] gap-5 flex-1 min-h-0">

        {/* ── Left: Pipeline de Leads ────────────────────────────────── */}
        <GlassCard className="!p-0 overflow-hidden flex flex-col h-full">
          <div className="p-5 pb-3">
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600 }} className="text-[#1A1A1A] mb-3">
              Pipeline de Leads
            </h3>
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/50 border border-white/30">
              <Search size={13} className="text-[#717182]" />
              <input
                type="text"
                placeholder="Filtrar leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-[12px] flex-1 placeholder:text-[#717182]/60"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
              />
            </div>
          </div>

          <div className="flex flex-col flex-1 min-h-0 overflow-y-auto px-3 pb-3">
            {filteredLeads.map((lead) => (
              <motion.div
                key={lead.id}
                className={`flex flex-col p-4 rounded-2xl mb-1.5 group relative cursor-pointer transition-all duration-200 ${
                  selectedLeadId === lead.id
                    ? "bg-white/70 border border-white/50 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)]"
                    : "bg-transparent border border-transparent hover:bg-white/40"
                }`}
                style={selectedLeadId === lead.id ? { backdropFilter: "blur(24px) saturate(150%)" } : undefined}
                onClick={() => {
                  setSelectedLeadId(lead.id);
                  setExtractionComplete(false);
                  setVisibleFields(0);
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Lead row */}
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="text-[13px] text-[#1A1A1A]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: selectedLeadId === lead.id ? 600 : 500 }}>
                    {lead.name}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-white text-[9px] tracking-wider"
                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, background: lead.statusColor }}
                  >
                    {lead.status}
                  </span>
                </div>
                <span className="text-[11px] text-[#717182] mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {lead.company}
                </span>
                <div className="flex items-center justify-between w-full">
                  <span className="text-[12px] text-[#1A1A1A]" style={{ fontFamily: "'Space Mono', monospace", fontVariantNumeric: "tabular-nums" }}>
                    {lead.value}
                  </span>
                  <div className="flex items-center gap-1">
                    <MapPin size={10} className="text-[#717182]" />
                    <span className="text-[10px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {lead.location} · {lead.sector}
                    </span>
                  </div>
                </div>
                {/* Score bar */}
                <div className="w-full mt-2 h-1 rounded-full bg-black/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: lead.score > 80 ? "#2E4C3B" : lead.score > 60 ? "#F59E0B" : "#6B7280" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${lead.score}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>

                {/* Strategic Mirror CTA — appears on hover / active */}
                <AnimatePresence>
                  {selectedLeadId === lead.id && (
                    <motion.button
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMirrorLead(lead.id);
                      }}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-full transition-all"
                      style={{
                        background: "rgba(198,73,40,0.08)",
                        border: "1px solid rgba(198,73,40,0.2)",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        color: "#C64928",
                        textTransform: "uppercase" as const,
                      }}
                      whileHover={{ scale: 1.02, background: "rgba(198,73,40,0.14)" }}
                      whileTap={{ scale: 0.97 }}
                      aria-label={`Ver impacto de ${lead.name} no Mapa Estratégico`}
                    >
                      <GitBranch size={10} />
                      VER NO MAPA ESTRATÉGICO
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* ── Center: Transcrição da Chamada ────────────────────────── */}
        <GlassCard className="!p-0 flex flex-col overflow-hidden h-full">
          <div className="p-5 pb-3 flex items-center justify-between border-b border-black/5">
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-[#C64928]" />
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600 }}>
                Transcrição da Chamada
              </span>
            </div>
            <div className="flex items-center gap-2">
              {importedFilename ? (
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] bg-[#2E4C3B]/10 text-[#2E4C3B]"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
                >
                  IMPORTADO
                </span>
              ) : (
                <span className="text-[11px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Hoje, 14:32
                </span>
              )}
              <ChevronRight size={14} className="text-[#717182]" />
            </div>
          </div>

          {/* Lead info bar */}
          <div className="px-5 py-3 flex items-center justify-between bg-white/30 border-b border-black/5">
            <div className="flex items-center gap-3 max-w-[70%]">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${selectedLead?.statusColor || "#717182"}, ${(selectedLead?.statusColor || "#717182")}88)` }}
              >
                <span className="text-white text-[10px]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>
                  {selectedLead?.initials || "--"}
                </span>
              </div>
              <div>
                <span className="text-[13px] text-[#1A1A1A]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                  {selectedLead?.name || "Nenhum lead selecionado"}
                </span>
                <span className="text-[11px] text-[#717182] ml-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {selectedLead ? `${selectedLead.company} · ${selectedLead.sector}` : "Sem dados"}
                </span>
                {selectedLead?.semanticSignals.executiveSummary && (
                  <p
                    className="text-[10px] text-[#4A4A5A] mt-1 max-w-[520px] truncate"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    title={selectedLead.semanticSignals.executiveSummary}
                  >
                    {selectedLead.semanticSignals.executiveSummary}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#717182] tracking-wider uppercase" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                Deal Size
              </span>
              <p className="text-[#1A1A1A]" style={{ fontFamily: "'Space Mono', monospace", fontSize: "14px", fontVariantNumeric: "tabular-nums" }}>
                {selectedLead?.value || "N/A"}
              </p>
              <span
                className="inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px]"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  color: "#C64928",
                  background: "rgba(198,73,40,0.1)",
                }}
              >
                Inflexões: {selectedLead?.semanticSignals.inflectionPointsCount ?? 0}
              </span>
            </div>
          </div>

          {/* Drag-and-drop zone + transcript */}
          <div
            className="flex-1 min-h-0 overflow-y-auto px-5 py-4 relative"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {/* Drag overlay */}
            <AnimatePresence>
              {isDragging && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl"
                  style={{
                    background: "rgba(198,73,40,0.06)",
                    border: "2px dashed rgba(198,73,40,0.4)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <Upload size={28} className="text-[#C64928] mb-3" />
                  <p className="text-[13px] text-[#C64928]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>
                    Solte para importar transcrição
                  </p>
                  <p className="text-[11px] text-[#717182] mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                    .txt · .vtt · .srt
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-4">
              {transcriptLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, type: "spring", stiffness: 300, damping: 30 }}
                >
                  <p className="text-[12px] text-[#717182] leading-relaxed" style={{ fontFamily: "'Space Mono', monospace", fontVariantNumeric: "tabular-nums" }}>
                    <span className="text-[#1A1A1A]/40">[{line.time}]</span>{" "}
                    <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, color: line.speaker === "Consultor" ? "#717182" : "#1A1A1A" }}>
                      {line.speaker}:
                    </span>{" "}
                    <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, color: "#4A4A5A", lineHeight: 1.7 }}>
                      {line.text}
                    </span>
                  </p>
                </motion.div>
              ))}

              {/* Empty state for empty transcript */}
              {transcriptLines.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <FileText size={28} className="text-[#717182]/40 mb-3" />
                  <p className="text-[13px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                    Nenhuma linha de transcrição encontrada
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Hint bar for drag-and-drop */}
          {!importedFilename && (
            <div
              className="px-5 py-2 border-t border-black/5 flex items-center gap-2"
              style={{ background: "rgba(0,0,0,0.01)" }}
            >
              <Upload size={11} className="text-[#717182]/50" />
              <span className="text-[10px] text-[#717182]/60" style={{ fontFamily: "'Inter', sans-serif" }}>
                Arraste um arquivo .txt, .vtt ou .srt aqui, ou clique em "Importar Transcrição"
              </span>
            </div>
          )}

          {/* Convert Button */}
          <div className="p-5 pt-3 border-t border-black/5">
            <motion.button
              onClick={handleConvert}
              disabled={isExtracting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-white transition-all"
              style={{
                background: isExtracting ? "linear-gradient(135deg, #C64928 0%, #E07B5B 50%, #C64928 100%)" : "#C64928",
                backgroundSize: isExtracting ? "200% 200%" : "100% 100%",
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
              }}
              whileHover={!isExtracting ? { y: -2, boxShadow: "0 12px 24px -6px rgba(198,73,40,0.35)" } : undefined}
              whileTap={!isExtracting ? { scale: 0.98 } : undefined}
              animate={isExtracting ? { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] } : {}}
              transition={isExtracting ? { duration: 2, repeat: Infinity, ease: "linear" } : { type: "spring", stiffness: 300, damping: 30 }}
            >
              <Sparkles size={16} className={isExtracting ? "animate-spin" : ""} />
              {isExtracting ? "EXTRAINDO INSIGHTS COM IA..." : extractionComplete ? "OPORTUNIDADE CONVERTIDA ✓" : "CONVERTER EM OPORTUNIDADE"}
            </motion.button>
          </div>
        </GlassCard>

        {/* ── Right: CRM Intelligence Fields ─────────────────────────── */}
        <GlassCard className="!p-0 flex flex-col overflow-hidden h-full">
          <div className="p-5 pb-3 border-b border-black/5">
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600 }} className="text-[#1A1A1A]">
              CRM Intelligence Fields
            </h3>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-5">
            <AnimatePresence mode="wait">
              {visibleFields === 0 && !extractionComplete ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full py-12"
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(198,73,40,0.08)" }}>
                    <Sparkles size={24} className="text-[#C64928]" />
                  </div>
                  <p className="text-[13px] text-[#1A1A1A] text-center mb-1" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                    Clique em &quot;Converter em Oportunidade&quot;
                  </p>
                  <p className="text-[11px] text-[#717182] text-center max-w-[200px]" style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>
                    A IA irá extrair insights da transcrição e popular os campos do CRM automaticamente
                  </p>
                </motion.div>
              ) : (
                <motion.div key="fields" className="flex flex-col gap-3">
                  {extractedCRMFields.slice(0, visibleFields || (extractionComplete ? extractedCRMFields.length : 0)).map((field, i) => (
                    <motion.div
                      key={field.label}
                      initial={{ opacity: 0, x: 20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30, delay: i * 0.05 }}
                      className="p-3 rounded-2xl bg-white/50 border border-white/40"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div style={{ color: field.color }}>{field.icon}</div>
                        <span className="text-[10px] tracking-wider uppercase" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, color: field.color }}>
                          {field.label}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#1A1A1A]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, lineHeight: 1.5 }}>
                        {field.value}
                      </p>
                    </motion.div>
                  ))}

                  {isExtracting && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-3 py-2">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-[#C64928]"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <span className="text-[11px] text-[#C64928]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                        Extraindo próximo campo...
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Stats */}
          {extractionComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="p-4 border-t border-black/5 bg-white/30"
            >
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { value: "R$ 12.4M", label: "Pipeline Total", color: "#2E4C3B" },
                  { value: "73%", label: "Win Rate", color: "#2E4C3B" },
                  { value: "28d", label: "Avg Cycle", color: "#1A1A1A" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "16px", fontWeight: 400, fontVariantNumeric: "tabular-nums", color: stat.color }}>
                      {stat.value}
                    </p>
                    <span className="text-[9px] text-[#717182] tracking-wider uppercase" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
