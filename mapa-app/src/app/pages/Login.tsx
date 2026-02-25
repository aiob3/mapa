import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useAuth } from "../auth/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const { signIn, loading, error, isAuthenticated, session } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(identifier.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch {
      // handled in context error state
    }
  };

  return (
    <div className="w-full h-screen flex overflow-hidden" style={{ background: "#F5F5F7" }}>
      {/* Left: Liquid Visual */}
      <div className="w-[60%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] via-[#2a2a2a] to-[#1A1A1A]">
          {/* Animated liquid shapes */}
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #C64928 0%, transparent 70%)", top: "20%", left: "30%" }}
            animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #2E4C3B 0%, transparent 70%)", top: "50%", left: "50%" }}
            animate={{ scale: [1.2, 1, 1.2], x: [0, -40, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-[300px] h-[300px] rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #E07B5B 0%, transparent 70%)", top: "10%", left: "60%" }}
            animate={{ scale: [1, 1.3, 1], x: [0, 20, 0], y: [0, 40, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Noise overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />
        </div>

        {/* Brand overlay */}
        <div className="absolute top-12 left-12 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "48px", fontWeight: 700, color: "white", lineHeight: 1.1 }}>
              MAPA
            </h1>
            <p className="text-white/40 mt-2 text-[13px] tracking-[0.2em] uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
              Ecossistema Narrativo
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-12 left-12 right-12 z-10">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-white/30 text-[13px] max-w-md"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, lineHeight: 1.6 }}
          >
            Transformando dados brutos de CRM em narrativas envolventes de crescimento.
            Onde a estratégia encontra a execução através de uma lente editorial líquida.
          </motion.p>
        </div>
      </div>

      {/* Right: Login Glass Pane */}
      <div className="w-[40%] flex items-center justify-center relative">
        {/* Subtle grain texture */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: loading ? 0.98 : 1, scale: loading ? 0.99 : 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[360px] px-8"
        >
          <div
            className="rounded-[32px] border border-white/40 p-10"
            style={{
              background: "rgba(255, 255, 255, 0.65)",
              backdropFilter: "blur(24px) saturate(150%)",
              WebkitBackdropFilter: "blur(24px) saturate(150%)",
              boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.08)",
            }}
          >
            <div className="text-center mb-10">
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 600, lineHeight: 1.2 }} className="text-[#1A1A1A]">
                Bem-vindo de Volta
              </h2>
              <p className="text-[#717182] text-[13px] mt-2" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
                Faça login para acessar os módulos permitidos no seu perfil
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="relative">
                <label
                  className={`absolute left-0 transition-all duration-200 ${
                    focusedField === "email" || identifier
                      ? "text-[11px] -top-4 text-[#C64928]"
                      : "text-[14px] top-2 text-[#717182]"
                  }`}
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: focusedField === "email" || identifier ? 500 : 400 }}
                >
                  Usuário ou E-mail
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent border-b outline-none py-2 text-[14px] text-[#1A1A1A] transition-colors"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 400,
                    borderBottomColor: focusedField === "email" ? "#C64928" : "rgba(255,255,255,0.4)",
                  }}
                />
              </div>

              <div className="relative">
                <label
                  className={`absolute left-0 transition-all duration-200 ${
                    focusedField === "password" || password
                      ? "text-[11px] -top-4 text-[#C64928]"
                      : "text-[14px] top-2 text-[#717182]"
                  }`}
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: focusedField === "password" || password ? 500 : 400 }}
                >
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent border-b outline-none py-2 text-[14px] text-[#1A1A1A] transition-colors"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 400,
                    borderBottomColor: focusedField === "password" ? "#C64928" : "rgba(255,255,255,0.4)",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full py-3 rounded-full text-white text-[13px] tracking-[0.06em] uppercase transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px]"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  background: "#C64928",
                  letterSpacing: "0.06em",
                }}
                aria-label="Acessar o MAPA"
              >
                {loading ? "Entrando..." : "ACESSAR MAPA"}
              </button>
            </form>

            {error && (
              <p className="text-center text-[11px] text-[#C64928] mt-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                {error}
              </p>
            )}

            {session && (
              <p className="text-center text-[11px] text-[#2E4C3B] mt-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                Perfil ativo: {session.role === "administrator" ? "Administrador" : "Convidado"}
              </p>
            )}

            <p className="text-center text-[11px] text-[#717182] mt-6" style={{ fontFamily: "'Inter', sans-serif" }}>
              Esqueceu as credenciais?{" "}
              <span className="text-[#C64928] cursor-pointer hover:underline">Contatar Admin</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
