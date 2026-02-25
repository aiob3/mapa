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

export const router = createBrowserRouter([
  { path: "/", Component: Login },
  {
    Component: AppLayout,
    children: [
      { path: "/dashboard", Component: Dashboard },
      { path: "/bridge", Component: DualCore },
      { path: "/syn", Component: MapaSyn },
      { path: "/syn/*", Component: MapaSyn },
      { path: "/war-room", Component: WarRoom },
      { path: "/team", Component: TeamHub },
      { path: "/team/*", Component: TeamHub },
      { path: "/analytics", Component: Synapse },
      { path: "/analytics/*", Component: Synapse },
      { path: "/vault", Component: Vault },
      { path: "*", Component: NotFound },
    ],
  },
]);