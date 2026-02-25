import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { KeyRound, UserRound } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { LoginRibbonVisual } from "../components/login/LoginRibbonVisual";

const NOISE_SVG =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")";

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
      <div className="relative grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
        <div
          className="pointer-events-none absolute inset-y-0 left-[57.5%] hidden w-32 -translate-x-1/2 lg:block"
          style={{
            background:
              "linear-gradient(90deg, rgba(198,73,40,0) 0%, rgba(198,73,40,0.24) 45%, rgba(198,73,40,0.1) 58%, rgba(198,73,40,0) 100%)",
            filter: "blur(18px)",
            opacity: 0.8,
          }}
        />
        <div
          className="pointer-events-none absolute left-[57.5%] top-1/2 hidden h-[56vh] w-[220px] -translate-x-[48%] -translate-y-1/2 lg:block"
          style={{
            background:
              "radial-gradient(55% 52% at 0% 50%, rgba(198,73,40,0.32) 0%, rgba(198,73,40,0.14) 36%, rgba(198,73,40,0) 76%)",
            filter: "blur(20px)",
          }}
        />
        {/* Left: Liquid Visual */}
        <div className="relative hidden overflow-hidden lg:block">
          <LoginRibbonVisual />

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
        <div className="relative flex items-center justify-center overflow-hidden px-4 py-8 sm:px-8 lg:px-10">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #F7F7F8 0%, #EEF0F3 100%)" }} />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(760px 420px at 32% 52%, rgba(198,73,40,0.12), transparent 68%), radial-gradient(760px 420px at 88% 84%, rgba(26,26,26,0.09), transparent 70%)",
            }}
          />
          <div
            className="pointer-events-none absolute -left-20 top-1/2 h-[64vh] w-[320px] -translate-y-1/2"
            style={{
              background:
                "radial-gradient(58% 58% at 0% 50%, rgba(198,73,40,0.28) 0%, rgba(198,73,40,0.12) 42%, rgba(198,73,40,0.02) 60%, transparent 78%)",
              filter: "blur(16px)",
            }}
          />
          <div
            className="pointer-events-none absolute left-[8%] top-[20%] h-52 w-52 rounded-full border-[16px]"
            style={{
              borderColor: "rgba(198,73,40,0.22) rgba(198,73,40,0.04) rgba(198,73,40,0.08) rgba(198,73,40,0.18)",
              transform: "rotate(22deg)",
              filter: "blur(0.3px)",
            }}
          />
          <div
            className="pointer-events-none absolute right-[8%] top-[34%] h-40 w-64 rounded-full border-[14px]"
            style={{
              borderColor: "rgba(26,26,26,0.16) rgba(26,26,26,0.03) rgba(26,26,26,0.09) rgba(26,26,26,0.14)",
              transform: "rotate(-18deg)",
            }}
          />
          <div
            className="pointer-events-none absolute left-[18%] bottom-[14%] h-24 w-72 rounded-full"
            style={{
              background: "linear-gradient(100deg, rgba(255,255,255,0.2), rgba(255,255,255,0.04), rgba(198,73,40,0.18))",
              transform: "rotate(-15deg)",
              filter: "blur(1px)",
            }}
          />
          <div
            className="pointer-events-none absolute right-[12%] bottom-[18%] h-32 w-52 rounded-full border-[12px]"
            style={{
              borderColor: "rgba(198,73,40,0.16) rgba(198,73,40,0.04) rgba(198,73,40,0.08) rgba(198,73,40,0.14)",
              transform: "rotate(14deg)",
            }}
          />
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[72%] w-[94%] -translate-x-1/2 -translate-y-1/2 rounded-[50%]"
            style={{
              background:
                "radial-gradient(55% 45% at 48% 50%, rgba(198,73,40,0.16) 0%, rgba(198,73,40,0.06) 48%, rgba(198,73,40,0) 76%)",
              filter: "blur(18px)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: NOISE_SVG,
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: loading ? 0.98 : 1, scale: loading ? 0.99 : 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative w-full max-w-[520px]"
          >
            <div
              className="pointer-events-none absolute -inset-6 rounded-[40px]"
              style={{
                background:
                  "radial-gradient(420px 180px at 50% 50%, rgba(198,73,40,0.16), rgba(198,73,40,0.02) 60%, transparent 72%)",
                filter: "blur(18px)",
              }}
            />
            <div
              className="pointer-events-none absolute -inset-12 rounded-[58px]"
              style={{
                background:
                  "radial-gradient(460px 220px at 42% 52%, rgba(198,73,40,0.18), rgba(198,73,40,0.05) 58%, transparent 78%)",
                filter: "blur(22px)",
              }}
            />
            <div
              className="rounded-[32px] border border-white/40 px-6 py-7 sm:px-9 sm:py-10"
              style={{
                background: "rgba(255, 255, 255, 0.76)",
                backdropFilter: "blur(24px) saturate(150%)",
                WebkitBackdropFilter: "blur(24px) saturate(150%)",
                boxShadow: "0 28px 56px -18px rgba(0, 0, 0, 0.18), 0 10px 28px -18px rgba(198, 73, 40, 0.32)",
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
