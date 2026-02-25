import React from "react";
import { useNavigate, useLocation } from "react-router";
import { Home } from "lucide-react";
import { motion } from "motion/react";

export function FloatingHomeButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on login or dashboard (home) pages
  if (location.pathname === "/" || location.pathname === "/dashboard") {
    return null;
  }

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={() => navigate("/dashboard")}
      className="fixed bottom-8 right-8 z-[9999] flex items-center gap-2 px-5 py-3 rounded-full
        bg-white/65 backdrop-blur-[24px]
        border border-white/40
        shadow-[0_20px_40px_-10px_rgba(0,0,0,0.12)]
        cursor-pointer
        group
        hover:bg-white/80 hover:shadow-[0_24px_48px_-10px_rgba(0,0,0,0.16)]
        transition-colors duration-300"
      style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, lineHeight: "1.5" }}
      aria-label="Voltar ao Dashboard"
    >
      <Home
        size={18}
        className="text-[#C64928] transition-transform duration-300 group-hover:rotate-[-8deg]"
        strokeWidth={2.2}
      />
      <span
        className="text-[#1A1A1A] tracking-[0.05em] uppercase"
      >
        Início
      </span>
    </motion.button>
  );
}