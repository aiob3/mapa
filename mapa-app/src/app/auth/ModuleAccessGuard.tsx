import React from 'react';
import { Navigate } from 'react-router';

import { useAuth } from './AuthContext';
import type { ModuleSlug } from './types';

interface ModuleAccessGuardProps {
  moduleSlug: ModuleSlug;
  children: React.ReactNode;
}

export function ModuleAccessGuard({ moduleSlug, children }: ModuleAccessGuardProps) {
  const { loading, isAuthenticated, canAccess } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!canAccess(moduleSlug, 'read')) {
    const fallback = canAccess('mapa-syn', 'read') ? '/dashboard' : '/';
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
