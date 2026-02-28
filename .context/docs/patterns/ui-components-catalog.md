---
id: ui-components-catalog-v1
ai_update_goal: "Documentar o catálogo de componentes UI padronizados para reutilização entre mapa-app e mapa-visual."
required_inputs:
  - "mapa-visual/src/components/"
  - "mapa-app/src/"
success_criteria:
  - "Lista de todos os componentes UI e padrões extraídos de mapa-visual detalhados e catalogados."
---

# UI Components & Pattern Catalog

Este documento cataloga os componentes da interface visual que devem ser consolidados como padrões (Pattern Library) a fim de propiciar flexibilidade, reusabilidade e consistência entre os pipelines visuais do ecossistema.

## Componentes Extraídos de `mapa-visual`

### Core Layout e Arquitetura

- **ArchitectureCanvas** (`ArchitectureCanvas.tsx`): Componente de canvas para diagramação de infraestrutura.
- **ExecutiveSummaryPanel** (`ExecutiveSummaryPanel.tsx`): Painel de leitura de metadados focados em visões macro de componentes técnicos.
- **MermaidDiagram** (`MermaidDiagram.tsx`): Visualizador de linguagem Mermaid encapsulado para fluxos da arquitetura de sistema.

### Componentes de Mapa Cognitivo (Mindmap)
> Usados para rastreamento visual HITL com orientação semântica

- **TechnicalMindmap** (`TechnicalMindmap.tsx`): Componente raiz para renderização e organização de mapas mentais, capaz de injetar score semântico por nó.
- **HitlMetrics Engine** (`hitlMetrics.ts`): Utilitário core para cálculo dos checkpoints HITL V2 (snapshot/diff/positions).
- **MindmapLayout Algorithms** (`mindmapLayout.ts`): Rotinas de cálculo estrutural (`L1`, `L2`, `L3`) para distribuição espacial de módulos em formatos de "tree", "horizontal" ou "vertical".

## Componentes Analíticos e Funcionais (`mapa-app`)

Os componentes contidos em `mapa-app/src/app/components/` constituem a camada de produto final operada por agentes e usuários, suportando fluxos de ação (actions), layout (core), elementos puros de UI (Shadcn UI) e widgets semânticos (SYN).

### Layout & Navegação (`mapa-app/src/app/components/`)
- **AppLayout**: Contêiner mestre com as áreas de topo e barra lateral.
- **SidebarNav** / **TopNav**: Componentes de navegação interativa estrutural (links, módulos, breadcrumbs).
- **SystemStatusPanel**: Painel flutuante de diagnóstico/status em modo DEV ou exibição pontual.
- **GlassCard** / **FloatingHomeButton**: Componentes conceituais em design glassmorfismo e interações flutuantes rápidas.

### Shadcn UI (Fundação `mapa-app/src/app/components/ui/`)
Coleção extensiva de primitivas baseadas em RadixUI + Tailwind, cobrindo:
- _Inputs e Forms:_ Form, Input, Select, Textarea, Switch, Checkbox, Radio-Group, Slider.
- _Containers e Modais:_ Dialog, Sheet, Drawer, Popover, Hover-Card, Card, Tabs, Accordion.
- _Navegação e Dados:_ Table, Pagination, Scroll-Area, Carousel, Sidebar, Command.
- _Visual e Feedback:_ Badge, Avatar, Alert, Chart, Progress, Skeleton, Sonner (Toasts).

### Componentes de Negócio Analítico (`mapa-app/src/app/components/syn/`)
> Componentes voltados a contextos ricos e exibição estruturada de inteligência e dados canônicos

- **SynComposer / SynHeader**: Interfaces do assistente/motor interativo para ações guiadas ("Chat" de negócios) com escopo.
- **BoardViewModal / PresentationModal**: Modais macro que encerram fluxos (kanban ou relatórios).
- **LeadsInsights / SectorAnalysis / StrategicHeatmap**: Gráficos e dashboards ricos em domínio para análises avançadas de CRM (homologados do blueprint estado-DB 003 e 004).

### Interação Extensível (`mapa-app/src/app/components/actions/`)
- **ActionComposerModal**: Base modal para fluxos acionáveis contextualizados em itens específicos da base (acionado pelo padrão `defaultActionComposerItems`).
