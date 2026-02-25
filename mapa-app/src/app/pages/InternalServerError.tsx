import React from "react";

import { StatusRoute } from "./StatusRoute";

export function InternalServerError() {
  return (
    <StatusRoute
      code="500"
      title="Falha interna"
      description="Ocorreu um erro inesperado na navegação. Tente novamente em instantes."
    />
  );
}
