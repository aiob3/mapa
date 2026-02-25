import type { AppRole, AuthSession, ModuleSlug } from './types';

interface SupabaseAuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  user?: {
    id: string;
    email?: string;
  };
}

interface SupabaseUserResponse {
  id: string;
  email?: string;
}

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const MODULE_SLUGS: ModuleSlug[] = [
  'mapa-syn',
  'war-room',
  'the-bridge',
  'team-hub',
  'synapse',
  'the-vault',
];

function resolveConfig(): SupabaseConfig {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Configuração Supabase ausente. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no mapa-app/.env.',
    );
  }

  return { url, anonKey };
}

async function requestSupabase<T>(path: string, init: RequestInit): Promise<T> {
  const { url, anonKey } = resolveConfig();
  const response = await fetch(`${url}${path}`, {
    ...init,
    headers: {
      apikey: anonKey,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Erro Supabase (${response.status})`);
  }

  return response.json() as Promise<T>;
}

async function fetchCurrentUser(accessToken: string): Promise<SupabaseUserResponse> {
  return requestSupabase<SupabaseUserResponse>('/auth/v1/user', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

async function resolveRole(accessToken: string): Promise<AppRole> {
  try {
    const result = await requestSupabase<boolean>('/rest/v1/rpc/is_administrator', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: '{}',
    });
    return result ? 'administrator' : 'guest';
  } catch {
    return 'guest';
  }
}

async function resolveAllowedModules(accessToken: string, role: AppRole): Promise<ModuleSlug[]> {
  if (role === 'administrator') {
    return MODULE_SLUGS;
  }

  try {
    const checks = await Promise.all(
      MODULE_SLUGS.map(async (moduleSlug) => {
        const allowed = await requestSupabase<boolean>('/rest/v1/rpc/can_access_module', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ p_module_slug: moduleSlug }),
        });
        return allowed ? moduleSlug : null;
      }),
    );

    return checks.filter((value): value is ModuleSlug => value !== null);
  } catch {
    return [];
  }
}

export async function signInWithPassword(email: string, password: string): Promise<AuthSession> {
  const auth = await requestSupabase<SupabaseAuthResponse>('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!auth.access_token || !auth.refresh_token) {
    throw new Error('Credenciais inválidas.');
  }

  const user = auth.user ?? (await fetchCurrentUser(auth.access_token));
  const role = await resolveRole(auth.access_token);
  const allowedModules = await resolveAllowedModules(auth.access_token, role);

  return {
    accessToken: auth.access_token,
    refreshToken: auth.refresh_token,
    expiresAt: auth.expires_in ? Date.now() + auth.expires_in * 1000 : null,
    user: {
      id: user.id,
      email: user.email ?? email,
    },
    role,
    allowedModules,
  };
}
