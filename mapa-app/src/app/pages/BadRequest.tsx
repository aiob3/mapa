import React from "react";

import { StatusRoute } from "./StatusRoute";

export function BadRequest() {
  return (
    <StatusRoute
      code="400"
      title="Solicitação inválida"
      description="A requisição não pôde ser processada. Revise os dados enviados e tente novamente."
    />
  );
}
