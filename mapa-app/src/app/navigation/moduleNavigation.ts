import type { ModuleSlug } from '../auth/types';

export interface ModuleNavigationItem {
  id: string;
  label: string;
  path: string;
  module: ModuleSlug;
}

export const MODULE_NAVIGATION: ModuleNavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', module: 'mapa-syn' },
  { id: 'mapa-syn', label: 'MAPA Syn', path: '/syn', module: 'mapa-syn' },
  { id: 'war-room', label: 'War Room', path: '/war-room', module: 'war-room' },
  { id: 'the-bridge', label: 'The Bridge', path: '/team/overview', module: 'the-bridge' },
  { id: 'team-hub', label: 'Team Hub', path: '/team', module: 'team-hub' },
  { id: 'synapse', label: 'Synapse', path: '/analytics', module: 'synapse' },
  { id: 'the-vault', label: 'The Vault', path: '/vault', module: 'the-vault' },
];

function normalizePath(pathname: string): string {
  if (!pathname) {
    return '/';
  }
  const trimmed = pathname.endsWith('/') && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;
  return trimmed;
}

export function isPathActive(currentPathname: string, targetPathname: string): boolean {
  const current = normalizePath(currentPathname);
  const target = normalizePath(targetPathname);

  if (current === target) {
    return true;
  }

  if (target === '/') {
    return current === '/';
  }

  return current.startsWith(`${target}/`);
}
