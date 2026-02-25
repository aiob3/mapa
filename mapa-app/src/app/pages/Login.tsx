import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { KeyRound, UserRound } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const { signIn, loading, error, isAuthenticated, session, rememberMeDefault } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(rememberMeDefault);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(identifier.trim(), password, rememberMe);
      navigate("/dashboard", { replace: true });
    } catch {
      // handled in context error state
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#F5F5F7" }}>
      <div className="grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
        {/* Left: Liquid Visual */}
        <div className="relative hidden overflow-hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] via-[#2a2a2a] to-[#1A1A1A]">
            <motion.div
              className="absolute h-[500px] w-[500px] rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, #C64928 0%, transparent 70%)", top: "20%", left: "30%" }}
              animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute h-[400px] w-[400px] rounded-full opacity-15"
              style={{ background: "radial-gradient(circle, #2E4C3B 0%, transparent 70%)", top: "50%", left: "50%" }}
              animate={{ scale: [1.2, 1, 1.2], x: [0, -40, 0], y: [0, 30, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute h-[300px] w-[300px] rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, #E07B5B 0%, transparent 70%)", top: "10%", left: "60%" }}
              animate={{ scale: [1, 1.3, 1], x: [0, 20, 0], y: [0, 40, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
              }}
            />
          </div>

          <div className="absolute left-12 top-12 z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }}>
              <h1
                style={{ fontFamily: "'Playfair Display', serif", fontSize: "48px", fontWeight: 700, color: "white", lineHeight: 1.1 }}
              >
                MAPA
              </h1>
              <p className="mt-2 text-[13px] uppercase tracking-[0.2em] text-white/40" style={{ fontFamily: "'Inter', sans-serif" }}>
                Ecossistema Narrativo
              </p>
            </motion.div>
          </div>

          <div className="absolute bottom-12 left-12 right-12 z-10">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="max-w-md text-[13px] text-white/30"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, lineHeight: 1.6 }}
            >
              Transformando dados brutos de CRM em narrativas envolventes de crescimento.
              Onde a estratégia encontra a execução através de uma lente editorial líquida.
            </motion.p>
          </div>
        </div>

        {/* Right: Login Glass Pane */}
        <div className="relative flex items-center justify-center px-4 py-8 sm:px-8 lg:px-10">
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: loading ? 0.98 : 1, scale: loading ? 0.99 : 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative w-full max-w-[520px]"
          >
            <div
              className="rounded-[32px] border border-white/40 px-6 py-7 sm:px-9 sm:py-10"
              style={{
                background: "rgba(255, 255, 255, 0.72)",
                backdropFilter: "blur(24px) saturate(150%)",
                WebkitBackdropFilter: "blur(24px) saturate(150%)",
                boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="mb-8 text-center sm:mb-10">
                <h2
                  style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px,4.2vw,44px)", fontWeight: 600, lineHeight: 1.1 }}
                  className="text-[#1A1A1A]"
                >
                  Bem-vindo de Volta
                </h2>
                <p className="mx-auto mt-3 max-w-[340px] text-[14px] text-[#616173]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
                  Faça login para acessar os módulos permitidos no seu perfil
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div
                  className="rounded-2xl border p-3.5 sm:p-4 transition-colors"
                  style={{
                    borderColor: focusedField === "identifier" ? "rgba(198,73,40,0.6)" : "rgba(26,26,26,0.12)",
                    background: "rgba(255,255,255,0.7)",
                  }}
                >
                  <label className="text-[11px] uppercase tracking-[0.08em] text-[#7B6C66]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                    Usuário ou E-mail
                  </label>
                  <div className="mt-2 flex items-center gap-3">
                    <UserRound size={16} className="text-[#C64928]" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      onFocus={() => setFocusedField("identifier")}
                      onBlur={() => setFocusedField(null)}
                      className="h-8 w-full bg-transparent text-[15px] text-[#1A1A1A] outline-none placeholder:text-[#9696A3]"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                      placeholder="vciadmin ou usuario@dominio"
                    />
                  </div>
                </div>

                <div
                  className="rounded-2xl border p-3.5 sm:p-4 transition-colors"
                  style={{
                    borderColor: focusedField === "password" ? "rgba(46,76,59,0.6)" : "rgba(26,26,26,0.12)",
                    background: "rgba(255,255,255,0.7)",
                  }}
                >
                  <label className="text-[11px] uppercase tracking-[0.08em] text-[#5E746A]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                    Senha
                  </label>
                  <div className="mt-2 flex items-center gap-3">
                    <KeyRound size={16} className="text-[#2E4C3B]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      className="h-8 w-full bg-transparent text-[15px] text-[#1A1A1A] outline-none placeholder:text-[#9696A3]"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                      placeholder="Digite sua senha"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-full py-3.5 text-[13px] uppercase tracking-[0.08em] text-white transition-all duration-300 hover:translate-y-[-1px] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    background: "#C64928",
                  }}
                  aria-label="Acessar o MAPA"
                >
                  {loading ? "Entrando..." : "ACESSAR MAPA"}
                </button>

                <label className="flex cursor-pointer items-center gap-2.5 pt-1 text-[12px] text-[#616173]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-[#C9C9D1] accent-[#C64928]"
                  />
                  <span>Lembrar-me nesta sessão do navegador</span>
                </label>
              </form>

              <div className="mt-4 min-h-[22px]">
                {error && (
                  <p className="text-center text-[12px] text-[#C64928]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                    {error}
                  </p>
                )}
                {session && (
                  <p className="text-center text-[12px] text-[#2E4C3B]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                    Perfil ativo: {session.role === "administrator" ? "Administrador" : "Convidado"}
                  </p>
                )}
              </div>

              <p className="mt-4 text-center text-[12px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>
                Esqueceu as credenciais? <span className="cursor-pointer text-[#C64928] hover:underline">Contatar Admin</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
