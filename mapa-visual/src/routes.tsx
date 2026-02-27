import { useEffect, useState } from 'react';
import { NavLink, Outlet, createBrowserRouter } from 'react-router';
import { snapshot } from '@/data/snapshot';
import { ExecutiveSummaryPanel } from '@/components/ExecutiveSummaryPanel';
import { DataArchitecturePage } from '@/pages/DataArchitecturePage';
import { AppArchitecturePage } from '@/pages/AppArchitecturePage';
import { AppDataArchitecturePage } from '@/pages/AppDataArchitecturePage';

const navItems = [
  { path: '/', label: 'Dados' },
  { path: '/app', label: 'Mapa-app' },
  { path: '/app-data', label: 'Mapa-app x Dados' },
];

type LayoutMode = 'default' | 'focus';
const LAYOUT_MODE_STORAGE_KEY = 'mapa-visual.layout-mode.v1';

function RootLayout() {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('default');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isFocusMode = layoutMode === 'focus';

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem(LAYOUT_MODE_STORAGE_KEY);
    if (stored === 'default' || stored === 'focus') {
      setLayoutMode(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(LAYOUT_MODE_STORAGE_KEY, layoutMode);
    if (layoutMode !== 'focus') {
      setDrawerOpen(false);
    }
  }, [layoutMode]);

  return (
    <div className="min-h-dvh noise-bg px-5 pb-10 pt-6 text-foreground lg:px-8">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6">
        <header className="glass-panel flex flex-col gap-4 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs/5 font-semibold tracking-[0.08em] text-accent uppercase">Portal Visual de Arquitetura</p>
            <h1 className="text-4xl/11 font-semibold">Blueprint Executivo da Plataforma MAPA</h1>
            <p className="max-w-3xl text-base/7 text-muted-foreground">
              Leitura consolidada da arquitetura vigente para homologação feature a feature,
              com evidências estruturais de módulos, dados e contratos.
            </p>
          </div>
          <div className="rounded-xl border border-white/80 bg-white/70 px-4 py-3 text-sm/6 text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">Snapshot:</span> {snapshot.version}
            </p>
            <p>
              <span className="font-semibold text-foreground">Atualização:</span>{' '}
              {new Date(snapshot.generatedAt).toLocaleString('pt-BR')}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded-lg bg-accent px-3 py-1.5 text-xs/5 font-semibold text-white transition hover:opacity-90"
                onClick={() => {
                  if (!navigator?.clipboard) {
                    return;
                  }
                  void navigator.clipboard.writeText('npm run visual:refresh');
                }}
                title="Copiar comando para regerar o snapshot"
              >
                Regerar snapshot
              </button>
              <code className="rounded-lg bg-white/90 px-3 py-1 text-xs/5 text-foreground">npm run visual:refresh</code>
            </div>
          </div>
        </header>

        <nav className="glass-panel flex flex-wrap items-center gap-2 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `rounded-xl px-4 py-2 text-sm/6 font-semibold transition ${isActive ? 'bg-accent text-white shadow-[0_8px_20px_rgba(198,73,40,0.35)]' : 'bg-white/65 text-foreground hover:bg-white/85'}`
              }
            >
              {item.label}
            </NavLink>
          ))}

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {isFocusMode ? (
              <>
                <button
                  type="button"
                  className="rounded-xl bg-white/75 px-4 py-2 text-sm/6 font-semibold text-foreground transition hover:bg-white"
                  onClick={() => setDrawerOpen(true)}
                >
                  Resumo executivo
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-accent px-4 py-2 text-sm/6 font-semibold text-white transition hover:opacity-90"
                  onClick={() => setLayoutMode('default')}
                >
                  Restaurar layout padrão
                </button>
              </>
            ) : (
              <button
                type="button"
                className="rounded-xl bg-white/75 px-4 py-2 text-sm/6 font-semibold text-foreground transition hover:bg-white"
                onClick={() => setLayoutMode('focus')}
              >
                Foco em conteúdo
              </button>
            )}
          </div>
        </nav>

        <div className={isFocusMode ? 'grid gap-6' : 'grid gap-6 2xl:grid-cols-[minmax(0,1fr)_22rem]'}>
          <main className="space-y-6">
            <Outlet />
          </main>
          {!isFocusMode ? <ExecutiveSummaryPanel snapshot={snapshot} /> : null}
        </div>
      </div>

      {isFocusMode && drawerOpen ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed inset-y-3 right-3 z-50 w-[min(28rem,calc(100vw-1.5rem))]">
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                className="rounded-xl bg-white px-4 py-2 text-sm/6 font-semibold text-foreground shadow-[0_10px_24px_rgba(0,0,0,0.14)] transition hover:bg-white/90"
                onClick={() => setDrawerOpen(false)}
              >
                Fechar resumo
              </button>
            </div>
            <ExecutiveSummaryPanel snapshot={snapshot} sticky={false} className="max-h-[calc(100dvh-4rem)] overflow-y-auto" />
          </div>
        </>
      ) : null}
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: DataArchitecturePage },
      { path: '/app', Component: AppArchitecturePage },
      { path: '/app-data', Component: AppDataArchitecturePage },
    ],
  },
]);
