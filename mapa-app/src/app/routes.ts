import React from "react";
import { createBrowserRouter } from "react-router";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { DualCore } from "./pages/DualCore";
import { MapaSyn } from "./pages/MapaSyn";
import { WarRoom } from "./pages/WarRoom";
import { TeamHub } from "./pages/TeamHub";
import { Synapse } from "./pages/Synapse";
import { Vault } from "./pages/Vault";
import { NotFound } from "./pages/NotFound";
import { AppLayout } from "./components/AppLayout";
import { ModuleAccessGuard } from "./auth/ModuleAccessGuard";
import type { ModuleSlug } from "./auth/types";

function withModuleAccess(Component: React.ComponentType, moduleSlug: ModuleSlug) {
  return function GuardedComponent() {
    return React.createElement(
      ModuleAccessGuard,
      { moduleSlug },
      React.createElement(Component),
    );
  };
}

export const router = createBrowserRouter([
  { path: "/", Component: Login },
  {
    Component: AppLayout,
    children: [
      { path: "/dashboard", Component: withModuleAccess(Dashboard, "mapa-syn") },
      { path: "/bridge", Component: withModuleAccess(DualCore, "the-bridge") },
      { path: "/syn", Component: withModuleAccess(MapaSyn, "mapa-syn") },
      { path: "/syn/*", Component: withModuleAccess(MapaSyn, "mapa-syn") },
      { path: "/war-room", Component: withModuleAccess(WarRoom, "war-room") },
      { path: "/team", Component: withModuleAccess(TeamHub, "team-hub") },
      { path: "/team/*", Component: withModuleAccess(TeamHub, "team-hub") },
      { path: "/analytics", Component: withModuleAccess(Synapse, "synapse") },
      { path: "/analytics/*", Component: withModuleAccess(Synapse, "synapse") },
      { path: "/vault", Component: withModuleAccess(Vault, "the-vault") },
      { path: "*", Component: NotFound },
    ],
  },
]);
