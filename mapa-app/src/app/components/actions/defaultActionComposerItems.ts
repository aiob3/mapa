import type { ActionComposerItem } from '../../types/patterns';

export const DEFAULT_ADD_ITEMS: ActionComposerItem[] = [
  {
    id: 'add-session',
    label: 'Adicionar Sessão no Vault',
    description: 'Abrir The Vault para criar uma nova sessão de trabalho e recursos vinculados.',
    targetPath: '/vault',
    payload: { focus: 'new-session' },
    requiredAnyModule: ['the-vault'],
    contexts: ['dashboard', 'vault', 'team', 'team-overview'],
  },
  {
    id: 'add-bridge-element',
    label: 'Novo Elemento Estratégico',
    description: 'Criar item de sincronização na Visão Geral (Bridge) da camada Team Hub.',
    targetPath: '/team/overview',
    payload: { focus: 'bridge-element' },
    requiredAnyModule: ['team-hub', 'the-bridge'],
    contexts: ['dashboard', 'team', 'team-overview'],
  },
  {
    id: 'add-syn-insight',
    label: 'Novo Insight no MAPA Syn',
    description: 'Acessar dashboard analítico para registrar insight narrativo e acionável.',
    targetPath: '/syn',
    payload: { focus: 'insight' },
    requiredAnyModule: ['mapa-syn', 'synapse'],
    contexts: ['dashboard', 'syn'],
  },
];
