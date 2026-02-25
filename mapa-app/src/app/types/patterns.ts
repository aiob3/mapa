export type StatusSeverity = 'info' | 'success' | 'warning' | 'critical';

export interface StatusInsightItem {
  id: string;
  severity: StatusSeverity;
  message: string;
  tooltip?: string;
  updatedAt: string;
  source: string;
}

export interface SidebarStatusPanelConfig {
  title: string;
  subtitle?: string;
  items: StatusInsightItem[];
}

export interface ActionComposerItem {
  id: string;
  label: string;
  description: string;
  targetPath: string;
  payload?: Record<string, string>;
}

export type PatternId =
  | 'PAT-SHELL-001'
  | 'PAT-SIDEBAR-001'
  | 'PAT-SIDEBAR-002'
  | 'PAT-CARD-001'
  | 'PAT-MODAL-001'
  | 'PAT-STATUS-001'
  | 'PAT-STATUS-002';

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
