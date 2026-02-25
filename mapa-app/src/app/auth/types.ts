export type AppRole = 'administrator' | 'guest';

export type ModuleSlug =
  | 'mapa-syn'
  | 'war-room'
  | 'the-bridge'
  | 'team-hub'
  | 'synapse'
  | 'the-vault';

export type PermissionAction = 'read' | 'write' | 'full';

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number | null;
  user: AuthUser;
  role: AppRole;
  allowedModules: ModuleSlug[];
}

export interface AuthState {
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
}
