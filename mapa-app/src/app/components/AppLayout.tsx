import React from "react";
import { Navigate, Outlet } from "react-router";
import { FloatingHomeButton } from "./FloatingHomeButton";
import { useAuth } from "../auth/AuthContext";

export function AppLayout() {
  const { loading, isAuthenticated, session } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    const isExpired = Boolean(session?.expiresAt && session.expiresAt <= Date.now());
    return <Navigate to={isExpired ? "/401?reason=expired" : "/401?reason=auth-required"} replace />;
  }

  return (
    <>
      {/* Global Noise Texture Overlay - Guidelines §3.1 */}
      <div
        className="fixed inset-0 pointer-events-none z-[9998] opacity-[0.025]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        }}
      />
      <Outlet />
      <FloatingHomeButton />
    </>
  );
}
