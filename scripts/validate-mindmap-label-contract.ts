import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildMindmapLayout, type TechnicalLevel, type TechnicalOrientation } from '../mapa-visual/src/components/mindmapLayout.ts';

interface Snapshot {
  appArchitecture: {
    modules: Array<{ id: string; label: string }>;
    sidebars: Array<{ context: 'mapa-syn' | 'team-hub'; label: string; subLabel: string; path: string }>;
  };
}

function uniqueBy<T>(values: T[], keySelector: (value: T) => string) {
  const map = new Map<string, T>();
  values.forEach((value) => {
    const key = keySelector(value);
    if (!map.has(key)) {
      map.set(key, value);
    }
  });
  return [...map.values()];
}

function getNodeLabelMap(level: TechnicalLevel, orientation: TechnicalOrientation, snapshot: Snapshot) {
  const { nodes } = buildMindmapLayout(snapshot as never, level, orientation);
  const map = new Map<string, string>();
  nodes.forEach((node) => {
    const label = typeof node.data?.label === 'string' ? node.data.label : '';
    map.set(node.id, label);
  });
  return map;
}

function intersection(a: Iterable<string>, b: Iterable<string>) {
  const bSet = new Set(b);
  return [...new Set(a)].filter((key) => bSet.has(key));
}

function fail(errors: string[]) {
  const message = ['[visual:guardrails] Falha no contrato de labels do mindmap:', ...errors.map((error) => `- ${error}`)].join('\n');
  throw new Error(message);
}

function main() {
  const snapshotPath = resolve(process.cwd(), 'mapa-visual/src/data/architecture-snapshot.generated.json');
  const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf-8')) as Snapshot;
  const orientations: TechnicalOrientation[] = ['horizontal', 'vertical'];
  const levels: TechnicalLevel[] = ['L1', 'L2', 'L3'];
  const errors: string[] = [];

  orientations.forEach((orientation) => {
    const labelByLevel = new Map<TechnicalLevel, Map<string, string>>();
    levels.forEach((level) => {
      labelByLevel.set(level, getNodeLabelMap(level, orientation, snapshot));
    });

    const l1 = labelByLevel.get('L1')!;
    const l2 = labelByLevel.get('L2')!;
    const l3 = labelByLevel.get('L3')!;

    const sharedL1L2 = intersection(l1.keys(), l2.keys());
    sharedL1L2.forEach((nodeId) => {
      if (l1.get(nodeId) !== l2.get(nodeId)) {
        errors.push(`${orientation} ${nodeId}: label divergiu entre L1 e L2`);
      }
    });

    const sharedL2L3 = intersection(l2.keys(), l3.keys());
    sharedL2L3.forEach((nodeId) => {
      if (l2.get(nodeId) !== l3.get(nodeId)) {
        errors.push(`${orientation} ${nodeId}: label divergiu entre L2 e L3`);
      }
    });

    const modules = snapshot.appArchitecture.modules;
    modules.forEach((module) => {
      const nodeId = `M-${module.id}`;
      levels.forEach((level) => {
        const actual = labelByLevel.get(level)?.get(nodeId);
        if (actual && actual !== module.label) {
          errors.push(`${orientation} ${nodeId}: esperado "${module.label}" em ${level}, recebido "${actual}"`);
        }
      });
    });

    const uniqueSidebars = uniqueBy(snapshot.appArchitecture.sidebars, (item) => `${item.context}:${item.path}`);
    const syn = uniqueSidebars.filter((item) => item.context === 'mapa-syn').slice(0, 6);
    const team = uniqueSidebars.filter((item) => item.context === 'team-hub').slice(0, 6);

    syn.forEach((item, index) => {
      const nodeId = `SS-${index}`;
      const expected = item.subLabel || item.label;
      const actualL2 = l2.get(nodeId);
      const actualL3 = l3.get(nodeId);
      if (actualL2 && actualL2 !== expected) {
        errors.push(`${orientation} ${nodeId}: esperado "${expected}" em L2, recebido "${actualL2}"`);
      }
      if (actualL3 && actualL3 !== expected) {
        errors.push(`${orientation} ${nodeId}: esperado "${expected}" em L3, recebido "${actualL3}"`);
      }
    });

    team.forEach((item, index) => {
      const nodeId = `TS-${index}`;
      const expected = item.subLabel || item.label;
      const actualL2 = l2.get(nodeId);
      const actualL3 = l3.get(nodeId);
      if (actualL2 && actualL2 !== expected) {
        errors.push(`${orientation} ${nodeId}: esperado "${expected}" em L2, recebido "${actualL2}"`);
      }
      if (actualL3 && actualL3 !== expected) {
        errors.push(`${orientation} ${nodeId}: esperado "${expected}" em L3, recebido "${actualL3}"`);
      }
    });

    l3.forEach((label, nodeId) => {
      if ((nodeId.startsWith('M-') || nodeId.startsWith('SS-') || nodeId.startsWith('TS-')) && (label.includes('\n/') || label.includes('<br/>/'))) {
        errors.push(`${orientation} ${nodeId}: label técnico com path detectado no L3 (regressão de human-readable)`);
      }
    });
  });

  if (errors.length > 0) {
    fail(errors);
  }

  console.log('[visual:guardrails] Contrato de labels L1/L2/L3 validado com sucesso.');
}

main();
