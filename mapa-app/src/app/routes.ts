import React from 'react';
import { createBrowserRouter, Navigate, useLocation } from 'react-router';

import { AnyModuleAccessGuard } from './auth/AnyModuleAccessGuard';
import { ModuleAccessGuard } from './auth/ModuleAccessGuard';
import type { ModuleSlug } from './auth/types';
import { AppLayout } from './components/AppLayout';
import { BadRequest } from './pages/BadRequest';
import { Dashboard } from './pages/Dashboard';
import { Forbidden } from './pages/Forbidden';
import { InternalServerError } from './pages/InternalServerError';
import { Login } from './pages/Login';
import { MapaSyn } from './pages/MapaSyn';
import { NotFound } from './pages/NotFound';
import { TeamHub } from './pages/TeamHub';
import { Unauthorized } from './pages/Unauthorized';
import { Vault } from './pages/Vault';
import { WarRoom } from './pages/WarRoom';

function withModuleAccess(Component: React.ComponentType, moduleSlug: ModuleSlug) {
  return function GuardedComponent() {
    return React.createElement(
      ModuleAccessGuard,
      { moduleSlug },
      React.createElement(Component),
    );
  };
}

function withAnyModuleAccess(Component: React.ComponentType, moduleSlugs: ModuleSlug[]) {
  return function GuardedComponent() {
    return React.createElement(
      AnyModuleAccessGuard,
      { moduleSlugs },
      React.createElement(Component),
    );
  };
}

function BridgeCompatibilityRedirect() {
  const location = useLocation();
  return React.createElement(Navigate, {
    to: {
      pathname: '/team/overview',
      search: location.search,
      hash: location.hash,
    },
    replace: true,
    state: {
      migratedFrom: '/bridge',
      legacyPathname: location.pathname,
    },
  });
}

function AnalyticsCompatibilityRedirect() {
  const location = useLocation();

  let nextPathname = '/syn/outreach';
  if (location.pathname.startsWith('/analytics/leads')) {
    nextPathname = '/syn';
  } else if (location.pathname.startsWith('/analytics/settings')) {
    nextPathname = '/syn/sector';
  }

  return React.createElement(Navigate, {
    to: {
      pathname: nextPathname,
      search: location.search,
      hash: location.hash,
    },
    replace: true,
    state: {
      migratedFrom: location.pathname,
      compatibilityRoute: '/analytics',
    },
  });
}

const TeamRoute = withModuleAccess(TeamHub, 'team-hub');
const TeamOverviewRoute = withAnyModuleAccess(TeamHub, ['team-hub', 'the-bridge']);
const SynUnifiedRoute = withAnyModuleAccess(MapaSyn, ['mapa-syn', 'synapse']);
const AnalyticsCompatibilityRoute = withAnyModuleAccess(
  AnalyticsCompatibilityRedirect,
  ['mapa-syn', 'synapse'],
);

export const router = createBrowserRouter([
  { path: '/', Component: Login },
  { path: '/400', Component: BadRequest },
  { path: '/401', Component: Unauthorized },
  { path: '/403', Component: Forbidden },
  { path: '/404', Component: NotFound },
  { path: '/500', Component: InternalServerError },
  {
    Component: AppLayout,
    ErrorBoundary: InternalServerError,
    children: [
      { path: '/dashboard', Component: withModuleAccess(Dashboard, 'mapa-syn') },
      { path: '/bridge', Component: withAnyModuleAccess(BridgeCompatibilityRedirect, ['the-bridge', 'team-hub']) },
      { path: '/bridge/*', Component: withAnyModuleAccess(BridgeCompatibilityRedirect, ['the-bridge', 'team-hub']) },
      { path: '/syn', Component: SynUnifiedRoute },
      { path: '/syn/*', Component: SynUnifiedRoute },
      { path: '/war-room', Component: withModuleAccess(WarRoom, 'war-room') },
      { path: '/team', Component: TeamRoute },
      { path: '/team/overview', Component: TeamOverviewRoute },
      { path: '/team/*', Component: TeamRoute },
      { path: '/analytics', Component: AnalyticsCompatibilityRoute },
      { path: '/analytics/*', Component: AnalyticsCompatibilityRoute },
      { path: '/vault', Component: withModuleAccess(Vault, 'the-vault') },
    ],
  },
  { path: '*', Component: NotFound },
]);
