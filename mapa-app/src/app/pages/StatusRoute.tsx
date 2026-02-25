import React from "react";
import { useNavigate } from "react-router";

import { useAuth } from "../auth/AuthContext";

interface StatusRouteProps {
  code: "400" | "401" | "403" | "404" | "500";
  title: string;
  description: string;
}

export function StatusRoute({ code, title, description }: StatusRouteProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const homePath = isAuthenticated ? "/dashboard" : "/";

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#F5F5F7" }}>
      <div
        className="w-full max-w-[560px] rounded-[28px] border border-white/40 p-8 sm:p-10 text-center"
        style={{
          background: "rgba(255, 255, 255, 0.76)",
          backdropFilter: "blur(22px) saturate(145%)",
          WebkitBackdropFilter: "blur(22px) saturate(145%)",
          boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <span
          className="inline-flex rounded-full bg-[#C64928]/10 px-3 py-1 text-[11px] tracking-[0.1em] uppercase text-[#C64928]"
          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
        >
          Erro de Rota
        </span>

        <h1
          className="mt-5 text-[#1A1A1A]"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(56px,9vw,90px)", fontWeight: 700, lineHeight: 1 }}
        >
          {code}
        </h1>

        <h2
          className="mt-3 text-[#1A1A1A]"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px,4vw,34px)", fontWeight: 600, lineHeight: 1.15 }}
        >
          {title}
        </h2>

        <p
          className="mx-auto mt-4 max-w-[420px] text-[14px] text-[#616173]"
          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, lineHeight: 1.6 }}
        >
          {description}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => navigate(homePath, { replace: true })}
            className="rounded-full bg-[#C64928] px-7 py-3 text-[12px] tracking-[0.07em] uppercase text-white transition-all duration-300 hover:translate-y-[-1px] hover:shadow-lg"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
            aria-label="Voltar para página inicial"
          >
            Voltar
          </button>
          <button
            onClick={() => navigate(-1)}
            className="rounded-full border border-[#1A1A1A]/15 bg-white/70 px-7 py-3 text-[12px] tracking-[0.07em] uppercase text-[#1A1A1A] transition-all duration-300 hover:bg-white"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
            aria-label="Voltar para página anterior"
          >
            Página Anterior
          </button>
        </div>
      </div>
    </div>
  );
}
