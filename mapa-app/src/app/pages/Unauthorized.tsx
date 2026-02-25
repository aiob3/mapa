import React from "react";
import { useLocation } from "react-router";

import { StatusRoute } from "./StatusRoute";

interface UnauthorizedState {
  reason?: "auth-required" | "expired";
}

export function Unauthorized() {
  const location = useLocation();
  const state = (location.state || {}) as UnauthorizedState;
  const params = new URLSearchParams(location.search);
  const reason = state.reason || (params.get("reason") as UnauthorizedState["reason"]) || "auth-required";

  const description =
    reason === "expired"
      ? "Sua sessão expirou. Faça login novamente para continuar com segurança."
      : "Esta área requer autenticação. Faça login para acessar a rota solicitada.";

  return (
    <StatusRoute
      code="401"
      title="Não autenticado"
      description={description}
    />
  );
}
