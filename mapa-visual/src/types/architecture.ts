export type RiskLevel = 'low' | 'medium' | 'high';

export interface ArchitectureNode {
  id: string;
  label: string;
  kind: string;
  description: string;
  group: string;
  x: number;
  y: number;
}

export interface ArchitectureEdge {
  id: string;
  from: string;
  to: string;
  label: string;
}

export interface ArchitectureGraph {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  mermaid: string;
  mermaidVertical?: string;
  mermaidSankey?: string;
}

export interface AppModuleNode {
  id: string;
  label: string;
  path: string;
  primaryModule: string;
  accessModules: string[];
}

export interface SidebarNode {
  context: 'mapa-syn' | 'team-hub';
  label: string;
  path: string;
  subLabel: string;
}

export interface AppDataBindingV1 {
  viewPath: string;
  uiArea: string;
  sourceType: 'supabase-rpc' | 'middleware-http';
  endpoint: string;
  contractRefs: string[];
  riskLevel: RiskLevel;
  failureModes: string[];
}

export interface ExecutivePillar {
  id: string;
  title: string;
  status: 'stable' | 'attention' | 'critical';
  description: string;
  evidenceRefs: string[];
}

export interface ArchitectureSnapshotV1 {
  version: 'ARCH-SNAPSHOT-v1';
  generatedAt: string;
  sourceFiles: string[];
  dataArchitecture: ArchitectureGraph;
  appArchitecture: {
    modules: AppModuleNode[];
    topNav: string[];
    sidebars: SidebarNode[];
    routes: string[];
    mermaid: string;
    mermaidVertical?: string;
    mermaidSankey?: string;
  };
  appDataArchitecture: {
    bindings: AppDataBindingV1[];
    contracts: string[];
    mermaid: string;
    mermaidVertical?: string;
  };
  executivePillars: ExecutivePillar[];
}
