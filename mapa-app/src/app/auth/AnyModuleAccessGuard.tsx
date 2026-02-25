import React from 'react';
import { Navigate } from 'react-router';

import { useAuth } from './AuthContext';
import type { ModuleSlug } from './types';

interface AnyModuleAccessGuardProps {
  moduleSlugs: ModuleSlug[];
  children: React.ReactNode;
}

export function AnyModuleAccessGuard({ moduleSlugs, children }: AnyModuleAccessGuardProps) {
  const { loading, isAuthenticated, canAccess, session } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    const isExpired = Boolean(session?.expiresAt && session.expiresAt <= Date.now());
    return <Navigate to={isExpired ? '/401?reason=expired' : '/401?reason=auth-required'} replace />;
  }

  const hasAccess = moduleSlugs.some((moduleSlug) => canAccess(moduleSlug, 'read'));
  if (!hasAccess) {
    return <Navigate to="/403" state={{ moduleSlugs }} replace />;
  }

  return <>{children}</>;
}
