import React from 'react';
import { Navigate } from 'react-router';

import { useAuth } from './AuthContext';
import type { ModuleSlug } from './types';

interface ModuleAccessGuardProps {
  moduleSlug: ModuleSlug;
  children: React.ReactNode;
}

export function ModuleAccessGuard({ moduleSlug, children }: ModuleAccessGuardProps) {
  const { loading, isAuthenticated, canAccess, session } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    const isExpired = Boolean(session?.expiresAt && session.expiresAt <= Date.now());
    return <Navigate to={isExpired ? "/401?reason=expired" : "/401?reason=auth-required"} replace />;
  }

  if (!canAccess(moduleSlug, 'read')) {
    return <Navigate to="/403" state={{ moduleSlug }} replace />;
  }

  return <>{children}</>;
}
