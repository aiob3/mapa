import type { CanonicalPayloadNormalization } from './types';

export interface PayloadHomologationResult {
  homologatedJson: string;
  normalizedCandidate: string;
  parsedPayload: unknown | null;
  normalization: CanonicalPayloadNormalization;
}

interface HomologationEnvelope {
  normalization: {
    status: CanonicalPayloadNormalization['status'];
    is_valid_json: boolean;
    parse_error?: string;
    warnings: string[];
  };
  payload: unknown | null;
  normalized_candidate: string;
  raw_document: string;
}

function stripCodeFence(input: string): string {
  const trimmed = input.trim();
  if (!trimmed.startsWith('```')) {
    return input;
  }

  return trimmed.replace(/^```[a-zA-Z0-9_-]*\n?/, '').replace(/\n?```$/, '');
}

function stripComments(input: string): string {
  let out = '';
  let i = 0;
  let inString = false;
  let quoteChar = '';
  let escaped = false;

  while (i < input.length) {
    const ch = input[i];
    const next = input[i + 1];

    if (inString) {
      out += ch;
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === quoteChar) {
        inString = false;
        quoteChar = '';
      }
      i += 1;
      continue;
    }

    if (ch === '"' || ch === '\'') {
      inString = true;
      quoteChar = ch;
      out += ch;
      i += 1;
      continue;
    }

    if (ch === '/' && next === '*') {
      i += 2;
      while (i < input.length && !(input[i] === '*' && input[i + 1] === '/')) {
        i += 1;
      }
      i += 2;
      continue;
    }

    if (ch === '/' && next === '/') {
      i += 2;
      while (i < input.length && input[i] !== '\n') {
        i += 1;
      }
      continue;
    }

    if (ch === '#') {
      i += 1;
      while (i < input.length && input[i] !== '\n') {
        i += 1;
      }
      continue;
    }

    out += ch;
    i += 1;
  }

  return out;
}

function extractJsonCandidate(input: string): string {
  const start = input.indexOf('{');
  if (start < 0) {
    return input.trim();
  }

  let i = start;
  let depth = 0;
  let inString = false;
  let quoteChar = '';
  let escaped = false;

  while (i < input.length) {
    const ch = input[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === quoteChar) {
        inString = false;
        quoteChar = '';
      }
      i += 1;
      continue;
    }

    if (ch === '"' || ch === '\'') {
      inString = true;
      quoteChar = ch;
      i += 1;
      continue;
    }

    if (ch === '{') {
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return input.slice(start, i + 1).trim();
      }
    }

    i += 1;
  }

  return input.slice(start).trim();
}

function normalizeCandidate(input: string): string {
  let candidate = input.trim();

  // Corrige involucro inicial duplicado apenas quando realmente houver "{ { ... } }" na raiz.
  let prev = '';
  while (candidate !== prev) {
    prev = candidate;
    const trimmed = candidate.trim();
    if (/^\{\s*\{/.test(trimmed) && /\}\s*\}$/.test(trimmed)) {
      candidate = trimmed.replace(/^\{\s*\{/, '{').replace(/\}\s*\}$/, '}');
    }
  }

  candidate = candidate.replace(/\r\n/g, '\n');
  candidate = candidate.replace(/[“”]/g, '"').replace(/[‘’]/g, '\'');
  candidate = candidate.replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_-]*)(\s*:)/g, '$1"$2"$3');
  candidate = candidate.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, value: string) => {
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `"${escaped}"`;
  });
  candidate = candidate.replace(/,\s*([}\]])/g, '$1');

  return candidate.trim();
}

export function homologateCanonicalPayload(rawDocument: string): PayloadHomologationResult {
  const warnings: string[] = [];
  const raw = (rawDocument || '').trim();
  const withoutFence = stripCodeFence(raw);

  if (withoutFence !== raw) {
    warnings.push('Code fence markdown removida do payload de entrada.');
  }

  const withoutComments = stripComments(withoutFence);
  if (withoutComments !== withoutFence) {
    warnings.push('Comentarios/diretivas removidos para tentativa de parse JSON.');
  }

  const extracted = extractJsonCandidate(withoutComments);
  if (extracted !== withoutComments.trim()) {
    warnings.push('Trecho JSON foi extraido do documento originario.');
  }

  const normalizedCandidate = normalizeCandidate(extracted);
  if (normalizedCandidate !== extracted) {
    warnings.push('Normalizacao sintatica aplicada ao candidato JSON.');
  }

  let parsedPayload: unknown | null = null;
  let parseError: string | undefined;
  let status: CanonicalPayloadNormalization['status'] = 'homologated';
  let isValidJson = true;

  try {
    parsedPayload = JSON.parse(normalizedCandidate);
  } catch (error) {
    isValidJson = false;
    status = 'requires_operator_review';
    parseError = error instanceof Error ? error.message : 'Erro desconhecido ao fazer parse do JSON.';
    warnings.push('Payload permanece invalido como JSON apos normalizacao automatica.');
  }

  const envelope: HomologationEnvelope = {
    normalization: {
      status,
      is_valid_json: isValidJson,
      parse_error: parseError,
      warnings,
    },
    payload: parsedPayload,
    normalized_candidate: normalizedCandidate,
    raw_document: rawDocument,
  };

  return {
    homologatedJson: JSON.stringify(envelope),
    normalizedCandidate,
    parsedPayload,
    normalization: {
      status,
      isValidJson,
      parseError,
      warnings,
    },
  };
}
