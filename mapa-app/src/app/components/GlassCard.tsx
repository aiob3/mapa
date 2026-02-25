import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  borderColor?: string;
}

export function GlassCard({ children, className = "", onClick, borderColor }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-[24px] p-6
        bg-white/65
        border border-white/40
        ${onClick ? "cursor-pointer hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] hover:translate-y-[-1px] transition-all duration-300" : ""}
        ${className}
      `}
      style={{
        backdropFilter: "blur(24px) saturate(150%)",
        WebkitBackdropFilter: "blur(24px) saturate(150%)",
        boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.08)",
        ...(borderColor ? { borderLeftColor: borderColor, borderLeftWidth: "3px" } : {}),
      }}
    >
      {children}
    </div>
  );
}