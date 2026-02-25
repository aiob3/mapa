import { buildAliasRecords, buildCanonicalIdV2, buildIdempotencyKey, createCanonicalInputV2 } from './normalizer';
import { homologateCanonicalPayload } from './payloadHomologator';

describe('canonical normalizer', () => {
  it('keeps idempotency key stable for repeated ingestion of same atoms', () => {
    const canonical = createCanonicalInputV2({
      opportunity: 'Voice2Translate-CallRecorder(55)',
      quarter: '26q1',
      date: '19/02/2026',
      time: '20:43:43',
      timezone: 'America/Sao_Paulo',
      alliances: ['119', '1-e2e', 'new-logo'],
      status: '100%-win',
      channel: 'Alliances',
      userId: '1-19-10',
      typeId: '119-110-171-86',
      zone: 'z_254-c_86-u_10',
      atoms: {
        q: 'q_q1-26-1',
        l: 'l_99-lead-vo2tr-204343-190226',
        k: 'k_20260219-204343',
        a: 'a_171-Fernando-Brito',
      },
      rawPayload: '{"sample":"payload"}',
    });

    const first = buildIdempotencyKey(canonical.event_layer.atoms);
    const second = buildIdempotencyKey(canonical.event_layer.atoms);
    const third = buildIdempotencyKey(canonical.event_layer.atoms);

    expect(first).toBe(second);
    expect(second).toBe(third);
  });

  it('changes idempotency key when a canonical atom changes', () => {
    const baseline = createCanonicalInputV2({
      opportunity: 'Voice2Translate-CallRecorder(55)',
      quarter: '26q1',
      date: '19/02/2026',
      time: '20:43:43',
      timezone: 'America/Sao_Paulo',
      alliances: ['119', '1-e2e', 'new-logo'],
      status: '100%-win',
      channel: 'Alliances',
      userId: '1-19-10',
      typeId: '119-110-171-86',
      zone: 'z_254-c_86-u_10',
      atoms: {
        q: 'q_q1-26-1',
        l: 'l_99-lead-vo2tr-204343-190226',
        k: 'k_20260219-204343',
      },
      rawPayload: '{"sample":"payload"}',
    });

    const changed = createCanonicalInputV2({
      opportunity: 'Voice2Translate-CallRecorder(55)',
      quarter: '26q1',
      date: '19/02/2026',
      time: '20:43:43',
      timezone: 'America/Sao_Paulo',
      alliances: ['119', '1-e2e', 'new-logo'],
      status: '100%-win',
      channel: 'Alliances',
      userId: '1-19-10',
      typeId: '119-110-171-86',
      zone: 'z_254-c_86-u_10',
      atoms: {
        q: 'q_q1-26-1',
        l: 'l_99-lead-vo2tr-204343-190226',
        k: 'k_20260219-204344',
      },
      rawPayload: '{"sample":"payload"}',
    });

    expect(buildIdempotencyKey(baseline.event_layer.atoms)).not.toBe(buildIdempotencyKey(changed.event_layer.atoms));
  });

  it('builds reversible alias records with canonical id v2', () => {
    const canonical = createCanonicalInputV2({
      opportunity: 'Voice2Translate-CallRecorder(55)',
      quarter: '26q1',
      date: '19/02/2026',
      time: '20:43:43',
      timezone: 'America/Sao_Paulo',
      alliances: ['119', '1-e2e', 'new-logo'],
      status: '100%-win',
      channel: 'Alliances',
      userId: '1-19-10',
      typeId: '119-110-171-86',
      zone: 'z_254-c_86-u_10',
      atoms: {
        q: 'q_q1-26-1',
        l: 'l_99-lead-vo2tr-204343-190226',
        k: 'k_20260219-204343',
        a: 'a_171-Fernando-Brito',
        s: 's_55-vo2tr-callrecorder',
      },
      legacyIds: {
        id_iov: '20260219-204343-q1-110-204343-190226',
        io_opp: 'o_26q1-lead-20260219-q1-171-vo2tr-199-10-110-204343-24-190226',
        iv_vdd: 'v_261-99-20260219-q1-171-55-199-10-110-204343-24-190226',
      },
      rawPayload: '{"sample":"payload"}',
    });

    const canonicalIdV2 = buildCanonicalIdV2(canonical.event_layer.atoms);
    const aliases = buildAliasRecords(canonicalIdV2, canonical.event_layer.legacyIds);

    expect(canonicalIdV2.startsWith('cv2_')).toBe(true);
    expect(aliases).toHaveLength(3);
    expect(aliases.every(alias => alias.canonicalIdV2 === canonicalIdV2)).toBe(true);
  });

  it('homologates invalid source payload into debug envelope', () => {
    const rawInvalid = `
    {
      {
      "memora_knowledge_database": {
        project: {
          "oppty": "Voice2Translate-CallRecorder(55)"
          "status": "100%-win",
        }
      }
    }
    `;

    const result = homologateCanonicalPayload(rawInvalid);

    expect(result.normalization.isValidJson).toBe(false);
    expect(result.normalization.status).toBe('requires_operator_review');
    expect(() => JSON.parse(result.homologatedJson)).not.toThrow();
  });

  it('keeps valid json payload homologated without review requirement', () => {
    const result = homologateCanonicalPayload('{"project":{"oppty":"Voice2Translate-CallRecorder(55)"}}');

    expect(result.normalization.isValidJson).toBe(true);
    expect(result.normalization.status).toBe('homologated');
    expect(result.parsedPayload).toEqual({
      project: {
        oppty: 'Voice2Translate-CallRecorder(55)',
      },
    });
  });

  it('stores payload normalization metadata in canonical input v2', () => {
    const canonical = createCanonicalInputV2({
      opportunity: 'Voice2Translate-CallRecorder(55)',
      quarter: '26q1',
      date: '19/02/2026',
      time: '20:43:43',
      timezone: 'America/Sao_Paulo',
      alliances: ['119', '1-e2e', 'new-logo'],
      status: '100%-win',
      channel: 'Alliances',
      userId: '1-19-10',
      typeId: '119-110-171-86',
      zone: 'z_254-c_86-u_10',
      atoms: {
        q: 'q_q1-26-1',
      },
      rawPayload: '{"sample":"payload"}',
    });

    expect(canonical.raw_payload_normalization.status).toBe('homologated');
    expect(() => JSON.parse(canonical.raw_payload)).not.toThrow();
  });
});
