import type { AuthSession } from './types';

const AUTH_STORAGE_KEY = 'mapa.auth.session.v1';
const AUTH_SESSION_STORAGE_KEY = 'mapa.auth.session.current.v1';
const AUTH_REMEMBER_ME_KEY = 'mapa.auth.remember_me.v1';

function safeLocalStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function safeSessionStorage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function parseSession(raw: string | null): AuthSession | null {
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

export function loadStoredSession(): AuthSession | null {
  const localStore = safeLocalStorage();
  const sessionStore = safeSessionStorage();

  const localSession = parseSession(localStore?.getItem(AUTH_STORAGE_KEY) ?? null);
  if (localSession) {
    return localSession;
  }

  const sessionSession = parseSession(sessionStore?.getItem(AUTH_SESSION_STORAGE_KEY) ?? null);
  if (sessionSession) {
    return sessionSession;
  }

  return null;
}

export function loadRememberMePreference(defaultValue = true): boolean {
  const localStore = safeLocalStorage();
  const remembered = localStore?.getItem(AUTH_REMEMBER_ME_KEY);
  if (remembered === 'true') {
    return true;
  }
  if (remembered === 'false') {
    return false;
  }
  return defaultValue;
}

export function persistSession(session: AuthSession, rememberMe: boolean): void {
  const serialized = JSON.stringify(session);
  const localStore = safeLocalStorage();
  const sessionStore = safeSessionStorage();

  if (rememberMe) {
    localStore?.setItem(AUTH_STORAGE_KEY, serialized);
    sessionStore?.removeItem(AUTH_SESSION_STORAGE_KEY);
    localStore?.setItem(AUTH_REMEMBER_ME_KEY, 'true');
    return;
  }

  sessionStore?.setItem(AUTH_SESSION_STORAGE_KEY, serialized);
  localStore?.removeItem(AUTH_STORAGE_KEY);
  localStore?.setItem(AUTH_REMEMBER_ME_KEY, 'false');
}

export function clearStoredSession(): void {
  const localStore = safeLocalStorage();
  const sessionStore = safeSessionStorage();

  localStore?.removeItem(AUTH_STORAGE_KEY);
  sessionStore?.removeItem(AUTH_SESSION_STORAGE_KEY);
}

export function persistRememberMePreference(rememberMe: boolean): void {
  const localStore = safeLocalStorage();
  localStore?.setItem(AUTH_REMEMBER_ME_KEY, rememberMe ? 'true' : 'false');
}
