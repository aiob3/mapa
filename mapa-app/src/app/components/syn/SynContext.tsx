import React, { createContext, useContext, useState, ReactNode } from "react";

// ─── Shared lead registry (single source of truth across views) ───────────────
export interface LeadSummary {
  id: string;
  name: string;
  initials: string;
  company: string;
  value: string;
  location: string;
  region: string; // maps to heatmap row name
  sector: string;
  score: number;
  status: string;
  statusColor: string;
}

export const leadsRegistry: LeadSummary[] = [
  {
    id: "1",
    name: "Roberto Almeida",
    initials: "RA",
    company: "LogiTech Brasil",
    value: "R$ 2.4M",
    location: "SP",
    region: "São Paulo",
    sector: "Logística",
    score: 91,
    status: "Quente",
    statusColor: "#C64928",
  },
  {
    id: "2",
    name: "Mariana Costa",
    initials: "MC",
    company: "FarmaVida Group",
    value: "R$ 1.8M",
    location: "RJ",
    region: "Rio de Janeiro",
    sector: "Farmacêutico",
    score: 78,
    status: "Morno",
    statusColor: "#F59E0B",
  },
  {
    id: "3",
    name: "Carlos Ferreira",
    initials: "CF",
    company: "TechNova Solutions",
    value: "R$ 3.1M",
    location: "MG",
    region: "Minas Gerais",
    sector: "Tecnologia",
    score: 85,
    status: "Quente",
    statusColor: "#C64928",
  },
  {
    id: "4",
    name: "Ana Beatriz Lima",
    initials: "AB",
    company: "RetailMax S.A.",
    value: "R$ 950K",
    location: "PR",
    region: "Sul",
    sector: "Varejo",
    score: 54,
    status: "Frio",
    statusColor: "#6B7280",
  },
  {
    id: "5",
    name: "Pedro Santos",
    initials: "PS",
    company: "FinanceCore",
    value: "R$ 4.2M",
    location: "SP",
    region: "São Paulo",
    sector: "Financeiro",
    score: 87,
    status: "Morno",
    statusColor: "#F59E0B",
  },
];

// ─── Context type ─────────────────────────────────────────────────────────────
interface SynContextValue {
  /** ID of the lead currently "mirrored" from Leads view to Heatmap view */
  mirrorLeadId: string | null;
  setMirrorLeadId: (id: string | null) => void;
  /** Called by LeadsInsights to jump to the Heatmap sub-view */
  navigateToHeatmap: () => void;
}

export const SynContext = createContext<SynContextValue>({
  mirrorLeadId: null,
  setMirrorLeadId: () => {},
  navigateToHeatmap: () => {},
});

export function useSynContext() {
  return useContext(SynContext);
}

// ─── Provider (mounted in MapaSyn) ───────────────────────────────────────────
interface SynProviderProps {
  navigateToHeatmap: () => void;
  children: ReactNode;
}

export function SynProvider({ navigateToHeatmap, children }: SynProviderProps) {
  const [mirrorLeadId, setMirrorLeadId] = useState<string | null>(null);

  return (
    <SynContext.Provider
      value={{ mirrorLeadId, setMirrorLeadId, navigateToHeatmap }}
    >
      {children}
    </SynContext.Provider>
  );
}
