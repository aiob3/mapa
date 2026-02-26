import type { ModuleSlug } from '../auth/types';

export type StatusSeverity = 'info' | 'success' | 'warning' | 'critical';

export interface StatusInsightItem {
  id: string;
  severity: StatusSeverity;
  message: string;
  tooltip?: string;
  updatedAt: string;
  source: string;
  actionLabel?: string;
  actionTargetPath?: string;
}

export interface SidebarStatusPanelConfig {
  title: string;
  subtitle?: string;
  items: StatusInsightItem[];
  maxVisibleItems?: number;
  seeMoreLabel?: string;
  seeMoreTargetPath?: string;
}

export interface ActionComposerItem {
  id: string;
  label: string;
  description: string;
  targetPath: string;
  payload?: Record<string, string>;
  requiredAnyModule?: ModuleSlug[];
  contexts?: string[];
}

export type PatternId =
  | 'PAT-SHELL-001'
  | 'PAT-SIDEBAR-001'
  | 'PAT-SIDEBAR-002'
  | 'PAT-CARD-001'
  | 'PAT-MODAL-001'
  | 'PAT-STATUS-001'
  | 'PAT-STATUS-002'
  | 'PAT-WIDGET-001'
  | 'PAT-WIDGET-002'
  | 'PAT-WIDGET-003'
  | 'PAT-WIDGET-004'
  | 'PAT-WIDGET-005';

export interface RoutePatternInventory {
  route: string;
  shell: PatternId;
  nav: PatternId;
  sidebar: PatternId | 'N/A';
  cards: PatternId | 'N/A';
  modal: PatternId | 'N/A';
  status: PatternId | 'N/A';
  exceptions?: string;
}
