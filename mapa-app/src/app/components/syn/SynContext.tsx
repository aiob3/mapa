import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAuth } from '../../auth/AuthContext';
import type { SynAnalyticsStatus, SynAnalyticsViewModel } from '../../types/analytics';
import {
  fetchSynAnalyticsBundleV1,
  fetchSynKpisV1,
} from '../../services/analytics/analyticsApi';
import {
  createEmptySynAnalyticsViewModel,
  mapSynBundleToViewModel,
  mergeKpisIntoViewModel,
} from '../../services/analytics/mappers';

const KPI_POLLING_MS = 45_000;

interface SynContextValue {
  mirrorLeadId: string | null;
  setMirrorLeadId: (id: string | null) => void;
  navigateToHeatmap: () => void;
  analytics: SynAnalyticsViewModel;
  analyticsStatus: SynAnalyticsStatus;
  refreshAll: () => Promise<void>;
  refreshKpis: () => Promise<void>;
}

export const SynContext = createContext<SynContextValue>({
  mirrorLeadId: null,
  setMirrorLeadId: () => {},
  navigateToHeatmap: () => {},
  analytics: createEmptySynAnalyticsViewModel(),
  analyticsStatus: {
    loading: false,
    error: null,
    lastUpdatedAt: null,
    pollingMs: KPI_POLLING_MS,
  },
  refreshAll: async () => {},
  refreshKpis: async () => {},
});

export function useSynContext() {
  return useContext(SynContext);
}

interface SynProviderProps {
  navigateToHeatmap: () => void;
  children: ReactNode;
}

export function SynProvider({ navigateToHeatmap, children }: SynProviderProps) {
  const { session, canAccess } = useAuth();

  const [mirrorLeadId, setMirrorLeadId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<SynAnalyticsViewModel>(createEmptySynAnalyticsViewModel);
  const [analyticsStatus, setAnalyticsStatus] = useState<SynAnalyticsStatus>({
    loading: true,
    error: null,
    lastUpdatedAt: null,
    pollingMs: KPI_POLLING_MS,
  });

  const canReadSyn = canAccess('mapa-syn', 'read') || canAccess('synapse', 'read');

  const refreshAll = useCallback(async () => {
    if (!session?.accessToken || !canReadSyn) {
      setAnalytics(createEmptySynAnalyticsViewModel());
      setAnalyticsStatus((prev) => ({
        ...prev,
        loading: false,
        error: canReadSyn ? 'Sessão inválida para leitura analítica.' : null,
      }));
      return;
    }

    setAnalyticsStatus((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await fetchSynAnalyticsBundleV1(session.accessToken);
      setAnalytics(mapSynBundleToViewModel(result.bundle));
      setAnalyticsStatus((prev) => ({
        ...prev,
        loading: false,
        error: result.errors.length > 0 ? `Falhas parciais em analytics: ${result.errors.join(' | ')}` : null,
        lastUpdatedAt: new Date().toISOString(),
      }));
    } catch (error) {
      setAnalyticsStatus((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Falha ao carregar analytics.',
      }));
    }
  }, [canReadSyn, session?.accessToken]);

  const refreshKpis = useCallback(async () => {
    if (!session?.accessToken || !canReadSyn) {
      return;
    }

    try {
      const kpis = await fetchSynKpisV1(session.accessToken);
      setAnalytics((prev) => mergeKpisIntoViewModel(prev, kpis));
      setAnalyticsStatus((prev) => ({ ...prev, lastUpdatedAt: new Date().toISOString() }));
    } catch (error) {
      setAnalyticsStatus((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Falha ao atualizar KPIs.',
      }));
    }
  }, [canReadSyn, session?.accessToken]);

  useEffect(() => {
    let active = true;

    (async () => {
      if (!active) {
        return;
      }
      await refreshAll();
    })();

    return () => {
      active = false;
    };
  }, [refreshAll]);

  useEffect(() => {
    if (!session?.accessToken || !canReadSyn) {
      return;
    }

    const timer = window.setInterval(() => {
      void refreshKpis();
    }, KPI_POLLING_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [canReadSyn, refreshKpis, session?.accessToken]);

  const value = useMemo<SynContextValue>(
    () => ({
      mirrorLeadId,
      setMirrorLeadId,
      navigateToHeatmap,
      analytics,
      analyticsStatus,
      refreshAll,
      refreshKpis,
    }),
    [mirrorLeadId, navigateToHeatmap, analytics, analyticsStatus, refreshAll, refreshKpis],
  );

  return <SynContext.Provider value={value}>{children}</SynContext.Provider>;
}
