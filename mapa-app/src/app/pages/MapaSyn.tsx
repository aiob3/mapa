import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';

import { SidebarNav } from '../components/SidebarNav';
import { TopNav } from '../components/TopNav';
import { LeadsInsights } from '../components/syn/LeadsInsights';
import { StrategicHeatmap } from '../components/syn/StrategicHeatmap';
import { SynProvider } from '../components/syn/SynContext';
import { SynToolbar } from '../components/syn/SynHeader';
import { SectorAnalysis } from '../components/syn/SectorAnalysis';
import { MAPA_SYN_SIDEBAR_ITEMS } from '../navigation/sidebarNavigation';
import type { SidebarStatusPanelConfig } from '../types/patterns';

type SynView = 'leads' | 'heatmap' | 'sector';

const synStatusPanel: SidebarStatusPanelConfig = {
  title: 'Status do Sistema',
  subtitle: 'Execução do módulo MAPA Syn',
  items: [
    {
      id: 'syn-active',
      severity: 'success',
      message: 'Pipeline narrativo ativo com 12 eventos monitorados.',
      tooltip: 'Monitoramento em tempo real da camada narrativa.',
      updatedAt: 'há 2 min',
      source: 'MAPA Syn',
    },
    {
      id: 'syn-watch',
      severity: 'warning',
      message: '2 segmentos com queda de engajamento nesta janela.',
      tooltip: 'Recomendado revisar cadência e recorte setorial.',
      updatedAt: 'agora',
      source: 'Heatmap',
    },
    {
      id: 'syn-sync',
      severity: 'info',
      message: 'Integração com Synapse e Team Hub sincronizada.',
      tooltip: 'Estado canônico de navegação e contexto.',
      updatedAt: 'há 5 min',
      source: 'Navegação',
    },
  ],
};

function resolveViewFromPath(pathname: string): SynView {
  if (pathname.startsWith('/syn/heatmap')) {
    return 'heatmap';
  }
  if (pathname.startsWith('/syn/sector')) {
    return 'sector';
  }
  return 'leads';
}

export function MapaSyn() {
  const location = useLocation();
  const navigate = useNavigate();
  const [lang, setLang] = useState<'PT' | 'EN'>('PT');
  const [search, setSearch] = useState('');
  const activeView = resolveViewFromPath(location.pathname);

  return (
    <SynProvider navigateToHeatmap={() => navigate('/syn/heatmap')}>
      <div className="min-h-screen flex flex-col" style={{ background: '#F5F5F7' }}>
        <TopNav
          brand="MAPA"
          brandSub="Syn"
          lang={lang}
          onLangToggle={() => setLang((prev) => (prev === 'PT' ? 'EN' : 'PT'))}
        />

        <SynToolbar searchValue={search} onSearchChange={setSearch} />

        <div className="flex flex-1 min-h-0 overflow-hidden">
          <SidebarNav
            brand="MAPA Syn"
            brandSub="INTELIGÊNCIA NARRATIVA"
            items={MAPA_SYN_SIDEBAR_ITEMS}
            statusPanel={synStatusPanel}
          />

          <main className="flex-1 p-8 overflow-auto flex flex-col">
            <AnimatePresence mode="wait">
              {activeView === 'leads' && (
                <motion.div
                  key="leads"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <LeadsInsights />
                </motion.div>
              )}
              {activeView === 'heatmap' && (
                <motion.div
                  key="heatmap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <StrategicHeatmap />
                </motion.div>
              )}
              {activeView === 'sector' && (
                <motion.div
                  key="sector"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <SectorAnalysis />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </SynProvider>
  );
}
