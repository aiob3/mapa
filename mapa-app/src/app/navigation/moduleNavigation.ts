import type { ModuleSlug } from '../auth/types';

export interface ModuleNavigationItem {
  id: string;
  label: string;
  path: string;
  primaryModule: ModuleSlug;
  accessModules?: ModuleSlug[];
}

export function getAccessModules(item: ModuleNavigationItem): ModuleSlug[] {
  if (item.accessModules && item.accessModules.length > 0) {
    return item.accessModules;
  }
  return [item.primaryModule];
}

export const MODULE_NAVIGATION: ModuleNavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', primaryModule: 'mapa-syn' },
  {
    id: 'mapa-syn',
    label: 'MAPA Syn',
    path: '/syn',
    primaryModule: 'mapa-syn',
    accessModules: ['mapa-syn', 'synapse'],
  },
  { id: 'war-room', label: 'War Room', path: '/war-room', primaryModule: 'war-room' },
  {
    id: 'team-hub',
    label: 'Team Hub',
    path: '/team',
    primaryModule: 'team-hub',
    accessModules: ['team-hub', 'the-bridge'],
  },
  { id: 'the-vault', label: 'The Vault', path: '/vault', primaryModule: 'the-vault' },
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
