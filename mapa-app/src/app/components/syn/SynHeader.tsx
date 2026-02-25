import React from "react";
import { Search, Activity } from "lucide-react";

interface SynToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

/**
 * SynToolbar — Secondary contextual bar for the MAPA Syn module.
 * Renders BELOW the global TopNav and contains only Syn-specific controls:
 * search and AI Engine Online status indicator.
 * The global navigation is handled by TopNav (see MapaSyn.tsx).
 */
export function SynToolbar({ searchValue = "", onSearchChange }: SynToolbarProps) {
  return (
    <div
      className="flex items-center justify-between px-8 py-2.5 border-b border-white/40"
      style={{
        background: "rgba(255,255,255,0.45)",
        backdropFilter: "blur(16px) saturate(140%)",
        WebkitBackdropFilter: "blur(16px) saturate(140%)",
      }}
    >
      {/* Search */}
      <div
        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-white/50 w-[320px]"
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <Search size={13} className="text-[#717182] shrink-0" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Buscar leads, contratos, setores..."
          className="bg-transparent outline-none flex-1 placeholder:text-[#717182]/50 text-[#1A1A1A]"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: "12.5px",
          }}
        />
      </div>

      {/* AI Engine Online Pill */}
      <div
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-full"
        style={{ background: "rgba(46,76,59,0.08)" }}
      >
        <Activity size={12} className="text-[#2E4C3B]" />
        <span
          className="text-[#2E4C3B]"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "11.5px",
            fontWeight: 600,
            letterSpacing: "0.03em",
          }}
        >
          AI Engine Online
        </span>
        <span
          className="w-1.5 h-1.5 rounded-full bg-[#2E4C3B] inline-block"
          style={{ animation: "pulse 2s infinite" }}
        />
      </div>
    </div>
  );
}

// Keep backward-compat export alias so any stray imports don't break
export { SynToolbar as SynHeader };