import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  MoreVertical,
  Plus,
  Search,
} from 'lucide-react';

import { ActionComposerModal } from '../components/actions/ActionComposerModal';
import { DEFAULT_ADD_ITEMS } from '../components/actions/defaultActionComposerItems';
import { GlassCard } from '../components/GlassCard';
import { SidebarNav } from '../components/SidebarNav';
import { TopNav } from '../components/TopNav';
import { useAuth } from '../auth/AuthContext';
import { TEAM_SIDEBAR_ITEMS } from '../navigation/sidebarNavigation';
import type { ActionComposerItem, SidebarStatusPanelConfig } from '../types/patterns';

interface Consultant {
  name: string;
  avatar: string;
  level: string;
  levelColor: string;
  borderColor: string;
  workload: number;
  challenge: string;
  challengeDesc: string;
  challengeColor: string;
}

const consultants: Consultant[] = [
  {
    name: 'Ana Beatriz Souza',
    avatar: 'AB',
    level: 'SÊNIOR',
    levelColor: '#C64928',
    borderColor: '#C64928',
    workload: 85,
    challenge: 'Expansão Grupo Varejo Sul',
    challengeDesc: 'Reestruturação completa da cadeia comercial regional.',
    challengeColor: '#2E4C3B',
  },
  {
    name: 'Carlos Mendes',
    avatar: 'CM',
    level: 'ESPECIALISTA',
    levelColor: '#4A6FA5',
    borderColor: '#4A6FA5',
    workload: 45,
    challenge: 'TechSolutions Cloud',
    challengeDesc: 'Migração de infraestrutura legada e desenho de proposta.',
    challengeColor: '#4A6FA5',
  },
  {
    name: 'Juliana Costa',
    avatar: 'JC',
    level: 'PLENO',
    levelColor: '#1A1A1A',
    borderColor: '#C64928',
    workload: 92,
    challenge: 'Fusão Banco Horizon',
    challengeDesc: 'Auditoria de compliance com janela crítica.',
    challengeColor: '#C64928',
  },
  {
    name: 'Roberto Lima',
    avatar: 'RL',
    level: 'JÚNIOR',
    levelColor: '#2E4C3B',
    borderColor: '#2E4C3B',
    workload: 30,
    challenge: 'Logística Norte',
    challengeDesc: 'Otimização de rotas e revisão de funil local.',
    challengeColor: '#2E4C3B',
  },
];

type TeamView = 'overview' | 'consultants' | 'challenges' | 'performance' | 'settings';

function resolveTeamView(pathname: string): TeamView {
  if (pathname.startsWith('/team/overview')) {
    return 'overview';
  }
  if (pathname.startsWith('/team/challenges')) {
    return 'challenges';
  }
  if (pathname.startsWith('/team/performance')) {
    return 'performance';
  }
  if (pathname.startsWith('/team/settings')) {
    return 'settings';
  }
  return 'consultants';
}

function headerByView(view: TeamView): { title: string; subtitle: string } {
  if (view === 'overview') {
    return {
      title: 'Visão Geral Integrada',
      subtitle: 'Bridge absorvido no Team Hub para sincronização estratégica.',
    };
  }
  if (view === 'challenges') {
    return {
      title: 'Desafios Ativos',
      subtitle: 'Pipeline de execução com alertas e dependências críticas.',
    };
  }
  if (view === 'performance') {
    return {
      title: 'Performance da Equipe',
      subtitle: 'Leitura consolidada de carga, progresso e risco de entrega.',
    };
  }
  if (view === 'settings') {
    return {
      title: 'Configurações',
      subtitle: 'Governança de regras operacionais, alertas e permissões.',
    };
  }
  return {
    title: 'Consultores & Desafios',
    subtitle: 'Gestão de carga e alocação estratégica.',
  };
}

function workloadGradient(workload: number): string {
  if (workload > 80) return 'linear-gradient(90deg, #C64928, #E07B5B)';
  if (workload > 60) return 'linear-gradient(90deg, #8B7355, #B89F7D)';
  return 'linear-gradient(90deg, #4A6FA5, #6B8FC5)';
}

function PlaceholderSection({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid grid-cols-[1fr_320px] gap-5">
      <GlassCard>
        <h2
          className="mb-2"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 600 }}
        >
          {title}
        </h2>
        <p
          className="text-[13px] text-[#717182]"
          style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.65 }}
        >
          {description}
        </p>
      </GlassCard>
      <GlassCard>
        <p
          className="text-[10px] tracking-[0.1em] uppercase text-[#717182]"
          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
        >
          Próximas Ações
        </p>
        <ul className="mt-3 space-y-2 text-[13px] text-[#1A1A1A]" style={{ fontFamily: "'Inter', sans-serif" }}>
          <li>Revisar indicadores do módulo.</li>
          <li>Atualizar regras de alertas contextuais.</li>
          <li>Registrar evidências para rodada HITL.</li>
        </ul>
      </GlassCard>
    </div>
  );
}

export function TeamHub() {
  const location = useLocation();
  const navigate = useNavigate();
  const { canAccess } = useAuth();
  const view = resolveTeamView(location.pathname);
  const [filter, setFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const filters = ['Todos', 'Sênior', 'Pleno'];

  const header = headerByView(view);

  const filteredConsultants = useMemo(() => {
    return consultants.filter((consultant) => {
      const matchesFilter = filter === 'Todos' || consultant.level.toLowerCase().includes(filter.toLowerCase());
      const loweredSearch = searchQuery.trim().toLowerCase();
      const matchesSearch =
        loweredSearch.length === 0 ||
        consultant.name.toLowerCase().includes(loweredSearch) ||
        consultant.challenge.toLowerCase().includes(loweredSearch);
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchQuery]);

  const addItems: ActionComposerItem[] = useMemo(() => {
    const context = view === 'overview' ? 'team-overview' : 'team';

    const contextualItems = DEFAULT_ADD_ITEMS.filter((item) => {
      const matchesContext = !item.contexts || item.contexts.includes(context);
      const hasPermission = !item.requiredAnyModule
        || item.requiredAnyModule.some((moduleSlug) => canAccess(moduleSlug, 'read'));
      return matchesContext && hasPermission;
    });

    if (canAccess('team-hub', 'read')) {
      contextualItems.push({
        id: 'add-team-challenge',
        label: 'Novo Desafio da Equipe',
        description: 'Criar desafio operacional e distribuir responsáveis na equipe.',
        targetPath: '/team/challenges',
        payload: { focus: 'new-challenge' },
        requiredAnyModule: ['team-hub'],
        contexts: ['team', 'team-overview'],
      });
    }

    return contextualItems;
  }, [canAccess, view]);

  const teamStatusPanel: SidebarStatusPanelConfig = useMemo(() => {
    const hasTeamHubAccess = canAccess('team-hub', 'read');
    return {
      title: 'Status Operacional',
      subtitle: 'Team Hub + Bridge',
      maxVisibleItems: 3,
      seeMoreLabel: hasTeamHubAccess ? 'Abrir visão detalhada' : 'Manter na visão geral',
      seeMoreTargetPath: hasTeamHubAccess ? '/team/performance' : '/team/overview',
      items: [
        {
          id: 'team-sync',
          severity: 'success',
          message: 'Sincronização entre estratégia e execução em 72% na visão absorvida.',
          tooltip: 'Bridge absorvido em Visão Geral do Team Hub.',
          updatedAt: 'há 2 min',
          source: 'Team Sync',
          actionLabel: 'Abrir Visão Geral',
          actionTargetPath: '/team/overview',
        },
        {
          id: 'team-alert',
          severity: 'warning',
          message: hasTeamHubAccess
            ? '2 desafios críticos aguardam aprovação executiva.'
            : '2 alertas estratégicos aguardam revisão na visão geral.',
          tooltip: 'Avaliar priorização e alocação de capacidade.',
          updatedAt: 'agora',
          source: 'Challenge Queue',
          actionLabel: hasTeamHubAccess ? 'Ver desafios' : 'Ver visão geral',
          actionTargetPath: hasTeamHubAccess ? '/team/challenges' : '/team/overview',
        },
        {
          id: 'team-info',
          severity: 'info',
          message: 'Compatibilidade /bridge ativa com roteamento para Team Overview.',
          tooltip: 'Deep links antigos redirecionados para /team/overview.',
          updatedAt: 'há 5 min',
          source: 'Routing',
          actionLabel: 'Validar rota',
          actionTargetPath: '/team/overview',
        },
      ],
    };
  }, [canAccess]);

  const visibleSidebarItems = useMemo(() => {
    const hasTeamAccess = canAccess('team-hub', 'read');
    if (hasTeamAccess) {
      return TEAM_SIDEBAR_ITEMS;
    }
    return TEAM_SIDEBAR_ITEMS.filter((item) => item.path === '/team/overview');
  }, [canAccess]);

  const handleSelectComposerAction = (item: ActionComposerItem) => {
    setIsComposerOpen(false);
    navigate(item.targetPath, {
      state: {
        actionComposer: item.payload,
        actionId: item.id,
        origin: location.pathname,
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F5F5F7' }}>
      <TopNav
        brand="MAPA"
        brandSub="Ecosystem"
        version="v2.4.0"
        navigationMode="full"
      />

      <div className="flex flex-1 min-h-0">
        <SidebarNav
          brand="Team Hub"
          brandSub="GESTÃO DE EQUIPE"
          items={visibleSidebarItems}
          statusPanel={teamStatusPanel}
        />

        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 600 }}>
                  {header.title}
                </h1>
                <p className="text-[13px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {header.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/65 backdrop-blur-[24px] border border-white/40 shadow-sm w-[280px]">
                  <Search size={16} className="text-[#717182]" />
                  <input
                    type="text"
                    placeholder="Buscar consultor, desafio ou alerta..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="bg-transparent outline-none text-[13px] flex-1 placeholder:text-[#717182]/60"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                </div>
                <button
                  onClick={() => setIsComposerOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C64928] text-white text-[12px] tracking-[0.05em] uppercase shadow-sm hover:translate-y-[-2px] transition-all duration-300"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: '0.05em' }}
                  aria-label="Abrir ações rápidas"
                >
                  <Plus size={14} />
                  +ADD
                </button>
              </div>
            </div>

            {view === 'overview' && (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-5">
                  <GlassCard>
                    <span
                      className="px-3 py-1 rounded-full bg-[#C64928]/10 text-[#C64928] text-[10px]"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, letterSpacing: '0.06em' }}
                    >
                      ESTRATÉGIA
                    </span>
                    <h2
                      className="mt-3 mb-2"
                      style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 600 }}
                    >
                      Aumentar Penetração LATAM
                    </h2>
                    <p className="text-[13px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
                      Foco em segmentos enterprise no Brasil e México com novo framework de RevOps.
                    </p>
                    <div className="mt-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[12px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Progresso
                        </span>
                        <span className="text-[12px] text-[#C64928]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                          72% • Em Risco
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#C64928] to-[#E07B5B]" style={{ width: '72%' }} />
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard>
                    <span
                      className="px-3 py-1 rounded-full bg-[#2E4C3B]/10 text-[#2E4C3B] text-[10px]"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, letterSpacing: '0.06em' }}
                    >
                      EXECUÇÃO
                    </span>
                    <h2
                      className="mt-3 mb-2"
                      style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 600 }}
                    >
                      Capacidade Operacional
                    </h2>
                    <p className="text-[13px] text-[#717182] mb-4" style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
                      Equipe em 82% de capacidade com 14 projetos ativos em pipeline.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/50 bg-white/55 p-3">
                        <p className="text-[10px] text-[#717182] uppercase tracking-[0.08em]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>
                          Projetos Ativos
                        </p>
                        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '24px', fontWeight: 700, color: '#C64928' }}>
                          14
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/50 bg-white/55 p-3">
                        <p className="text-[10px] text-[#717182] uppercase tracking-[0.08em]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>
                          Disponibilidade
                        </p>
                        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '24px', fontWeight: 700, color: '#1A1A1A' }}>
                          128h
                        </p>
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 600 }} className="mb-3">
                      Alertas de Sincronização
                    </h3>
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-[#C64928]/20 bg-[#C64928]/5 p-3">
                        <p className="text-[12px] text-[#1A1A1A]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                          Lançar nível enterprise
                        </p>
                        <p className="text-[11px] text-[#717182] mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Aguardando aprovação de preço e posicionamento.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/50 bg-white/55 p-3">
                        <p className="text-[12px] text-[#1A1A1A]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                          Reunião de crise
                        </p>
                        <p className="text-[11px] text-[#717182] mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Próxima janela hoje, 16:30 - 17:00.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/50 bg-white/55 p-3">
                        <p className="text-[12px] text-[#1A1A1A]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                          Renovação Acme Corp
                        </p>
                        <p className="text-[11px] text-[#717182] mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Atraso de 2 dias na camada de execução.
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </div>
            )}

            {view === 'consultants' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1 bg-black/5 rounded-full p-1">
                    {filters.map((facet) => (
                      <button
                        key={facet}
                        onClick={() => setFilter(facet)}
                        className={`px-4 py-1.5 rounded-full text-[12px] transition-all ${
                          filter === facet ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#717182]'
                        }`}
                        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                      >
                        {facet}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  {filteredConsultants.map((consultant) => (
                    <GlassCard key={consultant.name} borderColor={consultant.borderColor}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-[14px] shrink-0"
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 600,
                              background: `linear-gradient(135deg, ${consultant.borderColor}, ${consultant.borderColor}88)`,
                            }}
                          >
                            {consultant.avatar}
                          </div>
                          <div>
                            <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 600, lineHeight: 1.2 }}>
                              {consultant.name}
                            </h4>
                            <span
                              className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-white text-[9px] tracking-[0.1em]"
                              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, background: consultant.levelColor }}
                            >
                              {consultant.level}
                            </span>
                          </div>
                        </div>
                        <button className="p-1 hover:bg-black/5 rounded-full" aria-label={`Abrir ações de ${consultant.name}`}>
                          <MoreVertical size={16} className="text-[#717182]" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[12px] text-[#717182]" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Carga Atual
                        </span>
                        <span
                          className="text-[12px]"
                          style={{
                            fontFamily: "'Space Mono', monospace",
                            fontWeight: 700,
                            color: consultant.workload > 80 ? '#C64928' : '#1A1A1A',
                          }}
                        >
                          {consultant.workload}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden mb-4">
                        <div className="h-full rounded-full transition-all" style={{ width: `${consultant.workload}%`, background: workloadGradient(consultant.workload) }} />
                      </div>

                      <div className="p-3 rounded-2xl bg-black/3 border border-black/5">
                        <span className="text-[9px] text-[#717182] tracking-[0.1em] uppercase" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                          DESAFIO ATIVO
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="w-2 h-2 rounded-full" style={{ background: consultant.challengeColor }} />
                          <span className="text-[13px] text-[#1A1A1A]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                            {consultant.challenge}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#717182] mt-1 ml-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {consultant.challengeDesc}
                        </p>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {view === 'challenges' && (
              <PlaceholderSection
                title="Backlog de Desafios"
                description="Área preparada para receber os cards homologados de desafios com a mesma base visual de Dashboard, Vault e Team Hub."
              />
            )}

            {view === 'performance' && (
              <PlaceholderSection
                title="Matriz de Performance"
                description="Consolidação de métricas de capacidade, progresso e risco com leitura editorial padronizada para a liderança."
              />
            )}

            {view === 'settings' && (
              <PlaceholderSection
                title="Configurações do Team Hub"
                description="Definição de regras de status panel, gatilhos de alertas e padrões de labels para manter a consistência do design system."
              />
            )}
          </div>
        </main>
      </div>

      <ActionComposerModal
        open={isComposerOpen}
        title="Ações rápidas do Team Hub"
        description="Use o +ADD unificado para abrir fluxos estratégicos e operacionais."
        items={addItems}
        onClose={() => setIsComposerOpen(false)}
        onSelect={handleSelectComposerAction}
      />
    </div>
  );
}
