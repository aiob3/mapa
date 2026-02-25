import { createHash } from 'crypto';

import { homologateCanonicalPayload } from './payloadHomologator';
import type { CanonicalAtom, CanonicalAtomKey, CanonicalIdAlias, CanonicalInputV2 } from './types';

const ATOM_ORDER: CanonicalAtomKey[] = ['q', 'l', 'k', 'a', 's', 'e', 'b', 'n', 'h', 't', 'd'];

function normalizeToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\-_/]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function buildCanonicalAtoms(rawAtoms: Partial<Record<CanonicalAtomKey, string>>, source: string): CanonicalAtom[] {
  return ATOM_ORDER
    .filter(key => typeof rawAtoms[key] === 'string' && rawAtoms[key]!.trim().length > 0)
    .map((key, index) => ({
      key,
      raw: rawAtoms[key]!.trim(),
      normalized: normalizeToken(rawAtoms[key]!),
      order: index + 1,
      source,
    }));
}

export function buildCanonicalIdV2(atoms: CanonicalAtom[]): string {
  const ordered = [...atoms].sort((a, b) => a.order - b.order);
  const payload = ordered.map(atom => `${atom.key}_${atom.normalized}`).join('__');
  return `cv2_${payload}`;
}

export function buildIdempotencyKey(atoms: CanonicalAtom[]): string {
  const ordered = [...atoms].sort((a, b) => a.order - b.order);
  const stablePayload = ordered.map(atom => `${atom.order}:${atom.key}:${atom.normalized}`).join('|');
  return createHash('sha256').update(stablePayload).digest('hex');
}

export function buildAliasRecords(
  canonicalIdV2: string,
  legacyIds: {
    id_iov?: string;
    io_opp?: string;
    iv_vdd?: string;
  },
): CanonicalIdAlias[] {
  const aliases: CanonicalIdAlias[] = [];

  if (legacyIds.id_iov) {
    aliases.push({ legacyId: legacyIds.id_iov, aliasType: 'id_iov', canonicalIdV2 });
  }
  if (legacyIds.io_opp) {
    aliases.push({ legacyId: legacyIds.io_opp, aliasType: 'io_opp', canonicalIdV2 });
  }
  if (legacyIds.iv_vdd) {
    aliases.push({ legacyId: legacyIds.iv_vdd, aliasType: 'iv_vdd', canonicalIdV2 });
  }

  return aliases;
}

interface CreateCanonicalInputParams {
  opportunity: string;
  quarter: string;
  date: string;
  time: string;
  timezone: string;
  alliances: string[];
  status: string;
  channel: string;
  userId: string;
  typeId: string;
  zone: string;
  atoms: Partial<Record<CanonicalAtomKey, string>>;
  legacyIds?: {
    id_iov?: string;
    io_opp?: string;
    iv_vdd?: string;
  };
  rawPayload: string;
  contact?: {
    email?: string;
    mobile?: string;
  };
  metadata?: Record<string, string>;
}

export function createCanonicalInputV2(params: CreateCanonicalInputParams): CanonicalInputV2 {
  const warnings: string[] = [];
  const atoms = buildCanonicalAtoms(params.atoms, 'operator-payload');
  const homologation = homologateCanonicalPayload(params.rawPayload);

  if (atoms.length === 0) {
    warnings.push('Nenhum fator atômico foi identificado no payload.');
  }

  warnings.push(...homologation.normalization.warnings);

  if (!homologation.normalization.isValidJson) {
    warnings.push('Payload originario homologado em envelope de depuracao (JSON invalido apos normalizacao).');
  }

  return {
    event_layer: {
      opportunity: params.opportunity,
      quarter: params.quarter,
      date: params.date,
      time: params.time,
      timezone: params.timezone,
      alliances: params.alliances,
      status: params.status,
      channel: params.channel,
      legacyIds: params.legacyIds || {},
      atoms,
    },
    iam_layer: {
      userId: params.userId,
      typeId: params.typeId,
      contact: params.contact || {},
      zone: params.zone,
      metadata: params.metadata || {},
    },
    raw_payload: homologation.homologatedJson,
    raw_payload_normalization: homologation.normalization,
    parse_warnings: warnings,
  };
}
