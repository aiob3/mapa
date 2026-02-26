import { createHash } from 'node:crypto';

export const PAT_SYN_SOURCE_VERSION = 'PAT-SYN-SOURCE-v1';

export const SYN_SOURCE_REQUIRED_FIELDS = Object.freeze([
  'sourceSystem',
  'sourceEntity',
  'sourceId',
  'subjectKey',
  'sourceUpdatedAt',
  'payloadHash',
  'ingestionBatchId',
]);

function stableStringify(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

function toTrimmedString(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export function normalizeSubjectKey(value) {
  return toTrimmedString(value, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildPayloadHash(payload) {
  const raw = stableStringify(payload);
  return createHash('md5').update(raw).digest('hex');
}

export function buildCanonicalSubjectId(sourceSystem, subjectKeyNormalized) {
  const source = toTrimmedString(sourceSystem, 'unknown').toLowerCase();
  const subject = normalizeSubjectKey(subjectKeyNormalized) || 'unknown';
  return `csv1_${createHash('md5').update(`${source}:${subject}`).digest('hex')}`;
}

export function buildSourceIdempotencyKey(sourceSystem, sourceEntity, sourceId, payloadHash) {
  const source = toTrimmedString(sourceSystem, 'unknown').toLowerCase();
  const entity = toTrimmedString(sourceEntity, 'unknown').toLowerCase();
  const id = toTrimmedString(sourceId, 'unknown');
  const hash = toTrimmedString(payloadHash, 'unknown').toLowerCase();
  return createHash('md5').update(`${source}:${entity}:${id}:${hash}`).digest('hex');
}

export function buildCanonicalEventIdBySource(sourceSystem, sourceEntity, sourceId) {
  const source = toTrimmedString(sourceSystem, 'unknown').toLowerCase();
  const entity = toTrimmedString(sourceEntity, 'unknown').toLowerCase();
  const id = toTrimmedString(sourceId, 'unknown');
  return `cv2_src_${createHash('md5').update(`${source}:${entity}:${id}`).digest('hex')}`;
}

export function normalizeSourceContract(input, defaults = {}) {
  const sourceSystem = toTrimmedString(input?.sourceSystem, toTrimmedString(defaults.sourceSystem, 'unknown')).toLowerCase();
  const sourceEntity = toTrimmedString(input?.sourceEntity, toTrimmedString(defaults.sourceEntity, 'unknown')).toLowerCase();
  const sourceId = toTrimmedString(input?.sourceId, toTrimmedString(defaults.sourceId, ''));
  const subjectKey = toTrimmedString(input?.subjectKey, toTrimmedString(defaults.subjectKey, ''));
  const sourceUpdatedAt = toTrimmedString(input?.sourceUpdatedAt, toTrimmedString(defaults.sourceUpdatedAt, ''));
  const payloadHash = toTrimmedString(input?.payloadHash, toTrimmedString(defaults.payloadHash, '')).toLowerCase();
  const ingestionBatchId = toTrimmedString(input?.ingestionBatchId, toTrimmedString(defaults.ingestionBatchId, ''));
  const subjectKeyNormalized = normalizeSubjectKey(subjectKey);
  const canonicalSubjectId = toTrimmedString(
    input?.canonicalSubjectId,
    buildCanonicalSubjectId(sourceSystem, subjectKeyNormalized),
  );

  return {
    sourceSystem,
    sourceEntity,
    sourceId,
    subjectKey,
    sourceUpdatedAt,
    payloadHash,
    ingestionBatchId,
    subjectKeyNormalized,
    canonicalSubjectId,
  };
}

export const PAT_SYN_SOURCE_CONTRACT = Object.freeze({
  version: PAT_SYN_SOURCE_VERSION,
  requiredFields: SYN_SOURCE_REQUIRED_FIELDS,
  rules: Object.freeze({
    canonicalSubjectId: "csv1_${md5(source_system + ':' + subject_key_normalized)}",
    idempotencyKey: "md5(source_system + ':' + source_entity + ':' + source_id + ':' + payload_hash)",
  }),
});
