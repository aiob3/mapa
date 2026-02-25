export type CanonicalAtomKey = 'q' | 'l' | 'k' | 'a' | 's' | 'e' | 'b' | 'n' | 'h' | 't' | 'd';

export interface CanonicalAtom {
  key: CanonicalAtomKey;
  raw: string;
  normalized: string;
  order: number;
  source: string;
}

export interface CanonicalEventLayer {
  opportunity: string;
  quarter: string;
  date: string;
  time: string;
  timezone: string;
  alliances: string[];
  status: string;
  channel: string;
  legacyIds: {
    id_iov?: string;
    io_opp?: string;
    iv_vdd?: string;
  };
  atoms: CanonicalAtom[];
}

export interface CanonicalIamLayer {
  userId: string;
  typeId: string;
  contact: {
    email?: string;
    mobile?: string;
  };
  zone: string;
  credentialPolicy?: string;
  metadata: Record<string, string>;
}

export interface CanonicalPayloadNormalization {
  status: 'homologated' | 'requires_operator_review';
  isValidJson: boolean;
  parseError?: string;
  warnings: string[];
}

export interface CanonicalInputV2 {
  event_layer: CanonicalEventLayer;
  iam_layer: CanonicalIamLayer;
  raw_payload: string;
  raw_payload_normalization: CanonicalPayloadNormalization;
  parse_warnings: string[];
}

export interface CanonicalIdAlias {
  legacyId: string;
  aliasType: 'id_iov' | 'io_opp' | 'iv_vdd';
  canonicalIdV2: string;
}
