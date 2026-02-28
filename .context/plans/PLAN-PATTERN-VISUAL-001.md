# PLAN-PATTERN-VISUAL-001: Aproveitamento e Expansão da Pattern Library

## Objetivo
Implementar uma nova sessão no `mapa-visual` para exibir o catálogo interativo da Pattern Library documentada em `ui-components-catalog.md`, aumentando a visibilidade e clareza para o operador sobre os componentes disponíveis e validados.

## Contexto e Justificativa
A homologação prévia do painel Mindmap consolidou importantes blocos visuais (`TechnicalMindmap`, `ExecutiveSummaryPanel`, etc). O próximo passo lógico é materializar a documentação escrita (o catálogo) em uma interface viva.

## Escopo
- Criar a rota/vista no `mapa-visual` chamada de "UI Pattern Library" (ou "Patterns & Component Catalog").
- Alimentar empiricamente ou via mock (data snapshot) as propriedades interativas ou static showcases.
- Exibir os componentes recém-catalogados:
  - Componentes de Layout: `ArchitectureCanvas`, `ExecutiveSummaryPanel`, `MermaidDiagram`.
  - Componentes de HITL/Mindmap: `TechnicalMindmap`.

## Passos Operacionais (ToDo)
1. **Modelar Rota**: Modificar `mapa-visual/src/routes.tsx` para apresentar `/patterns`.
2. **Criar Page Component**: Criar o contêiner macro em `mapa-visual/src/pages/PatternsLibraryPage.tsx`.
3. **Instanciar Props Base**: Definir mocks enxutos baseados no catalog para demonstrar uso padrão dos componentes selecionados.
4. **Validar Navegação**: Exibir aba lateral ou tab superior (`AppArchitecturePage.tsx`) conectando `/patterns`.
