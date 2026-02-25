import React from "react";
import { useNavigate } from "react-router";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F5F5F7" }}>
      <div className="text-center">
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "72px", fontWeight: 700, color: "#1A1A1A" }}>
          404
        </h1>
        <p className="text-[#717182] text-[16px] mt-2 mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
          Esta página não existe na narrativa.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-8 py-3 rounded-full bg-[#C64928] text-white text-[13px] tracking-[0.06em] uppercase hover:translate-y-[-2px] transition-all duration-300"
          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: "0.06em" }}
          aria-label="Voltar ao MAPA"
        >
          VOLTAR AO MAPA
        </button>
      </div>
    </div>
  );
}
