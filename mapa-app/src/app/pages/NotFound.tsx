import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";

import { registerUnknownRouteAttempt } from "../security/routeDefense";
import { StatusRoute } from "./StatusRoute";

export function NotFound() {
  const location = useLocation();
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const result = registerUnknownRouteAttempt(location.pathname);
    setBlocked(result.blocked);
  }, [location.pathname]);

  if (blocked) {
    return (
      <StatusRoute
        code="403"
        title="Acesso temporariamente bloqueado"
        description="Detectamos tentativas excessivas de navegação fora das rotas previstas. Aguarde alguns minutos e tente novamente."
      />
    );
  }

  return (
    <StatusRoute
      code="404"
      title="Rota não encontrada"
      description={`A rota "${location.pathname}" não existe no roadmap atual da aplicação.`}
    />
  );
}
