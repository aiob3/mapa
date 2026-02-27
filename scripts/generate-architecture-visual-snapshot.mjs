import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const requiredFiles = [
  'mapa-app/src/app/routes.ts',
  'mapa-app/src/app/navigation/moduleNavigation.ts',
  'mapa-app/src/app/navigation/sidebarNavigation.ts',
  'mapa-app/src/app/services/analytics/analyticsApi.ts',
  'scripts/syn-middleware.mjs',
  '.context/docs/clickhouse-role-architecture-state-db-004.md',
  '.context/docs/syn-canonical-pattern-catalog-state-db-005.md',
  '.context/docs/syn-analytics-widget-catalog-state-db-002.md',
];

const outputFile = path.resolve(repoRoot, 'mapa-visual/src/data/architecture-snapshot.generated.json');

function fail(message) {
  console.error(`[visual:refresh] ${message}`);
  process.exit(1);
}

function readRequired(relativePath) {
  const absolutePath = path.resolve(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    fail(`Arquivo obrigatório ausente: ${relativePath}`);
  }
  return fs.readFileSync(absolutePath, 'utf8');
}

function extractArrayContent(source, anchor) {
  const anchorIndex = source.indexOf(anchor);
  if (anchorIndex === -1) {
    fail(`Âncora não encontrada para parsing: ${anchor}`);
  }

  const equalsIndex = source.indexOf('=', anchorIndex);
  if (equalsIndex === -1) {
    fail(`Sinal de atribuição não encontrado após âncora: ${anchor}`);
  }

  const bracketStart = source.indexOf('[', equalsIndex);
  if (bracketStart === -1) {
    fail(`Array não encontrado após âncora: ${anchor}`);
  }

  let depth = 0;
  for (let i = bracketStart; i < source.length; i += 1) {
    const char = source[i];
    if (char === '[') depth += 1;
    if (char === ']') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(bracketStart + 1, i);
      }
    }
  }

  fail(`Array não fechado para âncora: ${anchor}`);
}

function splitObjectLiterals(arrayContent) {
  const objects = [];
  let depth = 0;
  let start = -1;

  for (let i = 0; i < arrayContent.length; i += 1) {
    const char = arrayContent[i];
    if (char === '{') {
      if (depth === 0) {
        start = i;
      }
      depth += 1;
    }
    if (char === '}') {
      depth -= 1;
      if (depth === 0 && start !== -1) {
        objects.push(arrayContent.slice(start, i + 1));
        start = -1;
      }
    }
  }

  return objects;
}

function field(objectLiteral, regex, fieldName) {
  const match = objectLiteral.match(regex);
  if (!match) {
    fail(`Campo obrigatório não encontrado (${fieldName}) no bloco: ${objectLiteral}`);
  }
  return match[1];
}

function parseStringArray(rawValue) {
  return [...rawValue.matchAll(/'([^']+)'/g)].map((item) => item[1]);
}

function unique(values) {
  return [...new Set(values)];
}

function parseModuleNavigation(source) {
  const content = extractArrayContent(source, 'export const MODULE_NAVIGATION');
  const objects = splitObjectLiterals(content);

  const modules = objects.map((objectLiteral) => {
    const accessRaw = objectLiteral.match(/accessModules\s*:\s*\[([^\]]+)\]/);
    return {
      id: field(objectLiteral, /id\s*:\s*'([^']+)'/, 'id'),
      label: field(objectLiteral, /label\s*:\s*'([^']+)'/, 'label'),
      path: field(objectLiteral, /path\s*:\s*'([^']+)'/, 'path'),
      primaryModule: field(objectLiteral, /primaryModule\s*:\s*'([^']+)'/, 'primaryModule'),
      accessModules: accessRaw ? parseStringArray(accessRaw[1]) : [],
    };
  });

  if (modules.length < 3) {
    fail('Parsing crítico: menos de 3 módulos encontrados em moduleNavigation.ts');
  }

  return modules;
}

function parseSidebar(source, anchor, context) {
  const content = extractArrayContent(source, anchor);
  const objects = splitObjectLiterals(content);
  const items = objects.map((objectLiteral) => ({
    context,
    label: field(objectLiteral, /label\s*:\s*'([^']+)'/, 'label'),
    subLabel: field(objectLiteral, /subLabel\s*:\s*'([^']+)'/, 'subLabel'),
    path: field(objectLiteral, /path\s*:\s*'([^']+)'/, 'path'),
  }));

  if (items.length === 0) {
    fail(`Parsing crítico: menu lateral vazio para ${context}`);
  }

  return items;
}

function parseRoutes(source) {
  const routes = unique([...source.matchAll(/path\s*:\s*'([^']+)'/g)].map((item) => item[1]));
  if (!routes.includes('/syn') || !routes.includes('/dashboard')) {
    fail('Parsing crítico: rotas base /syn e /dashboard não encontradas em routes.ts');
  }
  return routes;
}

function parseRpcContracts(catalogDoc) {
  const rpcs = unique(catalogDoc.match(/api_syn_[a-z0-9_]+_v1/g) || []);
  if (rpcs.length < 5) {
    fail('Parsing crítico: lista de RPCs Syn incompleta no catálogo PAT-SYN');
  }
  return rpcs;
}

function parseContractRefs(catalogDoc, widgetDoc) {
  const ids = unique([
    ...(catalogDoc.match(/PAT-SYN-[A-Z0-9-]+/g) || []),
    ...(widgetDoc.match(/PAT-WIDGET-[0-9]+/g) || []),
    'WEB-BUILD-004',
    'WEB-HITL-005',
  ]);

  if (!ids.includes('PAT-SYN-RPC-001') || !ids.includes('PAT-SYN-SOURCE-001')) {
    fail('Parsing crítico: contratos PAT-SYN obrigatórios não encontrados.');
  }

  return ids;
}

function parseMiddlewareEndpoint(analyticsApiSource) {
  const endpointMatch = analyticsApiSource.match(/'\/api\/syn\/semantic-signals-summary'/);
  if (!endpointMatch) {
    fail('Parsing crítico: endpoint /api/syn/semantic-signals-summary não encontrado no analyticsApi.ts');
  }
  return '/api/syn/semantic-signals-summary';
}

function buildDataArchitectureGraph() {
  const flowHorizontal = [
    'flowchart LR',
    '  SB["Supabase SoR"] -->|"canonical_events + source_contract"| MW["Syn Middleware"]',
    '  MW -->|"semantic_signals_v2 / semantic_chunks_v2"| CH["ClickHouse"]',
    '  CH -->|"semantic_signals_summary_v1"| MW',
    '  SB -->|"api_syn_*_v1"| APP["mapa-app /syn"]',
    '  MW -->|"/api/syn/semantic-signals-summary"| APP',
    '  CT["PAT-SYN Contracts"] --> APP',
    '  CT --> MW',
  ].join('\n');

  const flowVertical = [
    'flowchart TB',
    '  SB["Supabase SoR"] -->|"canonical_events + source_contract"| MW["Syn Middleware"]',
    '  MW -->|"semantic_signals_v2 / semantic_chunks_v2"| CH["ClickHouse"]',
    '  CH -->|"semantic_signals_summary_v1"| MW',
    '  SB -->|"api_syn_*_v1"| APP["mapa-app /syn"]',
    '  MW -->|"/api/syn/semantic-signals-summary"| APP',
    '  CT["PAT-SYN Contracts"] --> APP',
    '  CT --> MW',
  ].join('\n');

  const sankey = [
    'sankey-beta',
    'Supabase SoR,Syn Middleware,100',
    'Syn Middleware,ClickHouse,82',
    'ClickHouse,Semantic Summary,62',
    'Semantic Summary,mapa-app syn,54',
    'Supabase SoR,mapa-app syn,48',
    'PAT-SYN Contracts,Syn Middleware,28',
    'PAT-SYN Contracts,mapa-app syn,30',
  ].join('\n');

  return {
    nodes: [
      {
        id: 'supabase',
        label: 'Supabase (SoR)',
        kind: 'database',
        description: 'Fonte transacional canônica com auth, RLS e contratos RPC api_syn_*_v1.',
        group: 'Dados',
        x: 40,
        y: 90,
      },
      {
        id: 'syn-middleware',
        label: 'Syn Middleware',
        kind: 'service',
        description: 'Orquestra ingestão semântica, aplica guardrails e expõe endpoint de summary.',
        group: 'Orquestração',
        x: 410,
        y: 90,
      },
      {
        id: 'clickhouse',
        label: 'ClickHouse',
        kind: 'olap',
        description: 'Camada de performance para sinais semânticos e sumarização executiva.',
        group: 'Dados',
        x: 780,
        y: 90,
      },
      {
        id: 'mapa-app',
        label: 'mapa-app /syn',
        kind: 'frontend',
        description: 'Consome RPCs Syn e summary semântico para vistas de leads, heatmap, outreach e setor.',
        group: 'Consumo',
        x: 410,
        y: 360,
      },
      {
        id: 'contracts',
        label: 'Contratos PAT-SYN',
        kind: 'contract',
        description: 'SSOT com regras de binding, taxonomia de sinais e evolução versionada.',
        group: 'Governança',
        x: 780,
        y: 360,
      },
    ],
    edges: [
      { id: 'e1', from: 'supabase', to: 'syn-middleware', label: 'canonical_events + source_contract' },
      { id: 'e2', from: 'syn-middleware', to: 'clickhouse', label: 'semantic_signals_v2 / semantic_chunks_v2' },
      { id: 'e3', from: 'clickhouse', to: 'syn-middleware', label: 'semantic_signals_summary_v1' },
      { id: 'e4', from: 'syn-middleware', to: 'mapa-app', label: 'GET /api/syn/semantic-signals-summary' },
      { id: 'e5', from: 'supabase', to: 'mapa-app', label: 'RPC api_syn_*_v1 (authenticated)' },
      { id: 'e6', from: 'contracts', to: 'mapa-app', label: 'PAT-SYN-RPC-001' },
      { id: 'e7', from: 'contracts', to: 'syn-middleware', label: 'PAT-SYN-SOURCE-001' },
    ],
    mermaid: flowHorizontal,
    mermaidVertical: flowVertical,
    mermaidSankey: sankey,
  };
}

function buildAppArchitectureMermaid(modules, sidebars, routes, orientation) {
  const lines = [`flowchart ${orientation}`, '  OP["Operador"] --> TN["Top Navigation"]'];

  modules.forEach((module, index) => {
    const nodeId = `M${index}`;
    lines.push(`  TN --> ${nodeId}["${module.label}\\n${module.path}"]`);
  });

  const highlightedRoutes = routes.filter((route) => route.startsWith('/syn') || route.startsWith('/analytics') || route.startsWith('/team'));
  highlightedRoutes.slice(0, 10).forEach((route, index) => {
    lines.push(`  R${index}["${route}"]`);
    lines.push(`  M1 --> R${index}`);
  });

  sidebars.slice(0, 10).forEach((item, index) => {
    lines.push(`  S${index}["${item.context}: ${item.label}"]`);
    lines.push(`  M1 --> S${index}`);
  });

  return lines.join('\n');
}

function buildAppArchitectureSankey(modules, sidebars, routes) {
  const synRoutes = routes.filter((route) => route.startsWith('/syn')).length || 1;
  const teamRoutes = routes.filter((route) => route.startsWith('/team')).length || 1;
  const analyticsRoutes = routes.filter((route) => route.startsWith('/analytics')).length || 1;
  const synSidebarCount = sidebars.filter((item) => item.context === 'mapa-syn').length || 1;
  const teamSidebarCount = sidebars.filter((item) => item.context === 'team-hub').length || 1;
  const lines = ['sankey-beta', 'Operador,Top Navigation,100'];

  modules.forEach((module, index) => {
    const weight = module.path === '/syn' ? 42 : module.path === '/team' ? 24 : 12;
    lines.push(`Top Navigation,${module.label},${weight + index}`);
  });

  lines.push(`MAPA Syn,SYN Routes,${synRoutes * 6}`);
  lines.push(`MAPA Syn,Analytics Routes,${analyticsRoutes * 5}`);
  lines.push(`MAPA Syn,Sidebar MAPA Syn,${synSidebarCount * 5}`);
  lines.push(`Team Hub,Team Routes,${teamRoutes * 6}`);
  lines.push(`Team Hub,Sidebar Team Hub,${teamSidebarCount * 5}`);

  return lines.join('\n');
}

function buildAppDataBindings(rpcContracts, middlewareEndpoint) {
  const bindings = [
    {
      viewPath: '/syn',
      uiArea: 'Leads & Insights',
      sourceType: 'supabase-rpc',
      endpoint: rpcContracts.find((rpc) => rpc.includes('leads')) || 'api_syn_leads_v1',
      contractRefs: ['PAT-SYN-RPC-001'],
      riskLevel: 'medium',
      failureModes: ['falha parcial de analytics', 'token de sessão expirado'],
    },
    {
      viewPath: '/syn/heatmap',
      uiArea: 'Strategic Heatmap',
      sourceType: 'supabase-rpc',
      endpoint: rpcContracts.find((rpc) => rpc.includes('heatmap')) || 'api_syn_heatmap_v1',
      contractRefs: ['PAT-SYN-RPC-001'],
      riskLevel: 'medium',
      failureModes: ['schema cache miss', 'rpc indisponível'],
    },
    {
      viewPath: '/syn/outreach',
      uiArea: 'Outreach IA',
      sourceType: 'supabase-rpc',
      endpoint: rpcContracts.find((rpc) => rpc.includes('outreach')) || 'api_syn_outreach_v1',
      contractRefs: ['PAT-SYN-RPC-001'],
      riskLevel: 'low',
      failureModes: ['degradação de dados', 'timeout de fetch'],
    },
    {
      viewPath: '/syn/sector',
      uiArea: 'Análise Setorial',
      sourceType: 'supabase-rpc',
      endpoint: rpcContracts.find((rpc) => rpc.includes('sector')) || 'api_syn_sector_v1',
      contractRefs: ['PAT-SYN-RPC-001', 'PAT-SYN-SCORE-001', 'PAT-SYN-SIGNAL-001'],
      riskLevel: 'medium',
      failureModes: ['drift de mapper', 'payload parcial'],
    },
    {
      viewPath: '/syn/sector',
      uiArea: 'Resumo Semântico',
      sourceType: 'middleware-http',
      endpoint: middlewareEndpoint,
      contractRefs: ['PAT-SYN-SOURCE-001', 'WEB-HITL-005'],
      riskLevel: 'high',
      failureModes: ['Failed to fetch', 'middleware indisponível', 'token inválido'],
    },
  ];

  return bindings;
}

function buildAppDataMermaid(bindings, orientation) {
  const lines = [`flowchart ${orientation}`];
  const uniqueEndpoints = unique(bindings.map((binding) => binding.endpoint));

  lines.push('  subgraph UI["UI Views"]');
  bindings.forEach((binding, index) => {
    lines.push(`    V${index}["${binding.viewPath}\\n${binding.uiArea}"]`);
  });
  lines.push('  end');

  lines.push('  subgraph API["Chamadas / Endpoints"]');
  uniqueEndpoints.forEach((endpoint, index) => {
    lines.push(`    E${index}["${endpoint}"]`);
  });
  lines.push('  end');

  lines.push('  subgraph DATA["Dados e Serviços"]');
  lines.push('    SB["Supabase SoR"]');
  lines.push('    MW["Syn Middleware"]');
  lines.push('    CH["ClickHouse Summary"]');
  lines.push('    IDM["Idempotent Summary Read"]');
  lines.push('  end');
  lines.push('  CT1["PAT-SYN-RPC-001"]');
  lines.push('  CT2["PAT-SYN-SOURCE-001"]');

  bindings.forEach((binding, index) => {
    const endpointIndex = uniqueEndpoints.findIndex((endpoint) => endpoint === binding.endpoint);
    lines.push(`  V${index} --> E${endpointIndex}`);
  });

  uniqueEndpoints.forEach((endpoint, index) => {
    if (endpoint.startsWith('api_syn_')) {
      lines.push(`  E${index} -->|"RPC authenticated"| SB`);
      lines.push(`  CT1 --> E${index}`);
    } else {
      lines.push(`  E${index} -->|"HTTP GET idempotente"| MW`);
      lines.push(`  CT2 --> E${index}`);
    }
  });

  lines.push('  MW --> IDM');
  lines.push('  IDM --> CH');
  lines.push('  CH --> IDM');
  lines.push('  IDM --> MW');

  return lines.join('\n');
}

function buildExecutivePillars() {
  return [
    {
      id: 'pillar-data-authority',
      title: 'Autoridade do Dado',
      status: 'stable',
      description: 'Supabase mantém a verdade transacional e contratos RPC com governança explícita.',
      evidenceRefs: [
        '.context/docs/clickhouse-role-architecture-state-db-004.md',
        '.context/docs/syn-canonical-pattern-catalog-state-db-005.md',
      ],
    },
    {
      id: 'pillar-semantic-runtime',
      title: 'Runtime Semântico',
      status: 'attention',
      description: 'Middleware Syn opera como camada crítica para summary e precisa monitoria de disponibilidade.',
      evidenceRefs: [
        'scripts/syn-middleware.mjs',
        'mapa-app/src/app/services/analytics/analyticsApi.ts',
      ],
    },
    {
      id: 'pillar-contract-conformance',
      title: 'Conformidade de Contratos',
      status: 'critical',
      description: 'Bindings UI↔dados dependem de aderência PAT-SYN e validação pós-migration sem drift.',
      evidenceRefs: [
        '.context/docs/syn-canonical-pattern-catalog-state-db-005.md',
        '.context/docs/syn-analytics-widget-catalog-state-db-002.md',
      ],
    },
  ];
}

function main() {
  const content = new Map(requiredFiles.map((relativePath) => [relativePath, readRequired(relativePath)]));

  const modules = parseModuleNavigation(content.get('mapa-app/src/app/navigation/moduleNavigation.ts'));
  const synSidebar = parseSidebar(content.get('mapa-app/src/app/navigation/sidebarNavigation.ts'), 'export const MAPA_SYN_SIDEBAR_ITEMS', 'mapa-syn');
  const teamSidebar = parseSidebar(content.get('mapa-app/src/app/navigation/sidebarNavigation.ts'), 'export const TEAM_SIDEBAR_ITEMS', 'team-hub');
  const routes = parseRoutes(content.get('mapa-app/src/app/routes.ts'));
  const rpcContracts = parseRpcContracts(content.get('.context/docs/syn-canonical-pattern-catalog-state-db-005.md'));
  const contractRefs = parseContractRefs(
    content.get('.context/docs/syn-canonical-pattern-catalog-state-db-005.md'),
    content.get('.context/docs/syn-analytics-widget-catalog-state-db-002.md'),
  );
  const middlewareEndpoint = parseMiddlewareEndpoint(content.get('mapa-app/src/app/services/analytics/analyticsApi.ts'));

  const dataArchitecture = buildDataArchitectureGraph();
  const bindings = buildAppDataBindings(rpcContracts, middlewareEndpoint);

  const snapshot = {
    version: 'ARCH-SNAPSHOT-v1',
    generatedAt: new Date().toISOString(),
    sourceFiles: requiredFiles,
    dataArchitecture,
    appArchitecture: {
      modules,
      topNav: modules.map((module) => module.label),
      sidebars: [...synSidebar, ...teamSidebar],
      routes,
      mermaid: buildAppArchitectureMermaid(modules, [...synSidebar, ...teamSidebar], routes, 'LR'),
      mermaidVertical: buildAppArchitectureMermaid(modules, [...synSidebar, ...teamSidebar], routes, 'TB'),
      mermaidSankey: buildAppArchitectureSankey(modules, [...synSidebar, ...teamSidebar], routes),
    },
    appDataArchitecture: {
      bindings,
      contracts: contractRefs,
      mermaid: buildAppDataMermaid(bindings, 'LR'),
      mermaidVertical: buildAppDataMermaid(bindings, 'TB'),
    },
    executivePillars: buildExecutivePillars(),
  };

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  console.log(`[visual:refresh] Snapshot gerado em ${path.relative(repoRoot, outputFile)}`);
}

main();
