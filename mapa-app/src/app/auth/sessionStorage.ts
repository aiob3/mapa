import type { AuthSession } from './types';

const AUTH_STORAGE_KEY = 'mapa.auth.session.v1';

export function loadStoredSession(): AuthSession | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.accessToken || !parsed?.user?.id) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function persistSession(session: AuthSession): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

