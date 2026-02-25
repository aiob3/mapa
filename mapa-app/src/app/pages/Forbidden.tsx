import React from "react";
import { useLocation } from "react-router";

import { StatusRoute } from "./StatusRoute";

interface ForbiddenState {
  moduleSlug?: string;
}

export function Forbidden() {
  const location = useLocation();
  const state = (location.state || {}) as ForbiddenState;
  const moduleSlug = state.moduleSlug;

  const description = moduleSlug
    ? `Você está autenticado, mas não possui permissão para acessar o módulo "${moduleSlug}". Sinalize o administrador para revisão de acesso.`
    : "Você está autenticado, mas não possui permissão para acessar esta página. Sinalize o administrador para revisão de acesso.";

  return (
    <StatusRoute
      code="403"
      title="Acesso proibido"
      description={description}
    />
  );
}
