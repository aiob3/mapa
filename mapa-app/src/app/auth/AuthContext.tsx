import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  clearStoredSession,
  loadRememberMePreference,
  loadStoredSession,
  persistRememberMePreference,
  persistSession,
} from './sessionStorage';
import { signInWithPassword } from './supabaseAuthApi';
import type { AuthSession, AuthState, ModuleSlug, PermissionAction } from './types';

interface AuthContextValue extends AuthState {
  signIn: (identifier: string, password: string, rememberMe?: boolean) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
  rememberMeDefault: boolean;
  allowedModules: ModuleSlug[];
  canAccess: (moduleSlug: ModuleSlug, action?: PermissionAction) => boolean;
}

const ALL_MODULES: ModuleSlug[] = [
  'mapa-syn',
  'war-room',
  'the-bridge',
  'team-hub',
  'synapse',
  'the-vault',
];

function computeAllowedModules(session: AuthSession | null): ModuleSlug[] {
  if (!session) {
    return [];
  }
  if (session.allowedModules && session.allowedModules.length > 0) {
    return session.allowedModules;
  }
  return session.role === 'administrator' ? ALL_MODULES : [];
}

function canAccessAction(session: AuthSession | null, _moduleSlug: ModuleSlug, action: PermissionAction): boolean {
  if (!session) {
    return false;
  }

  if (session.role === 'administrator') {
    return true;
  }

  return action === 'read';
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => {
    const stored = loadStoredSession();
    if (!stored) {
      return null;
    }

    if (stored.expiresAt && stored.expiresAt < Date.now()) {
      clearStoredSession();
      return null;
    }

    return stored;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMeDefault] = useState<boolean>(() => loadRememberMePreference(true));
  const sessionExpired = Boolean(session?.expiresAt && session.expiresAt <= Date.now());

  useEffect(() => {
    if (!sessionExpired) {
      return;
    }
    clearStoredSession();
    setSession(null);
  }, [sessionExpired]);

  const signIn = useCallback(async (identifier: string, password: string, rememberMe = rememberMeDefault) => {
    setLoading(true);
    setError(null);
    try {
      const nextSession = await signInWithPassword(identifier, password);
      setSession(nextSession);
      persistSession(nextSession, rememberMe);
      persistRememberMePreference(rememberMe);
    } catch (err) {
      setSession(null);
      clearStoredSession();
      setError(err instanceof Error ? err.message : 'Falha ao autenticar.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [rememberMeDefault]);

  const signOut = useCallback(() => {
    setSession(null);
    setError(null);
    clearStoredSession();
  }, []);

  const allowedModules = useMemo(() => computeAllowedModules(session), [session]);

  const canAccess = useCallback(
    (moduleSlug: ModuleSlug, action: PermissionAction = 'read') => {
      if (!allowedModules.includes(moduleSlug)) {
        return false;
      }
      return canAccessAction(session, moduleSlug, action);
    },
    [allowedModules, session],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      error,
      signIn,
      signOut,
      isAuthenticated: Boolean(session?.accessToken) && !sessionExpired,
      rememberMeDefault,
      allowedModules,
      canAccess,
    }),
    [session, loading, error, signIn, signOut, sessionExpired, rememberMeDefault, allowedModules, canAccess],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }
  return context;
}
