import { resolveLlmConfig } from './llmConfig';
import type { TranslateFn } from '../../utils/i18n';

const t: TranslateFn = (key, params) => `${key}:${JSON.stringify(params || {})}`;
const ORIGINAL_ENV = process.env;

describe('resolveLlmConfig', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_MODEL;
    delete process.env.OPENROUTER_BASE_URL;
    delete process.env.GOOGLE_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_MODEL;
    delete process.env.GOOGLE_MODEL;
    delete process.env.GEMINI_BASE_URL;
    delete process.env.GOOGLE_BASE_URL;
    delete process.env.LLM_PROVIDER;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('uses OpenRouter by default when provider is not informed', async () => {
    process.env.OPENROUTER_API_KEY = 'openrouter-key';
    process.env.OPENROUTER_MODEL = 'x-ai/grok-test';

    const resolved = await resolveLlmConfig({
      rawOptions: {},
      fallbackModel: 'fallback-model',
      t
    });

    expect(resolved).toEqual({
      provider: 'openrouter',
      model: 'x-ai/grok-test',
      apiKey: 'openrouter-key',
      baseUrl: undefined
    });
  });

  it('resolves Google Gemini config from provider option and Gemini env vars', async () => {
    process.env.GEMINI_API_KEY = 'gemini-key';
    process.env.GEMINI_MODEL = 'gemini-3.1';

    const resolved = await resolveLlmConfig({
      rawOptions: { provider: 'google' },
      fallbackModel: 'fallback-model',
      t
    });

    expect(resolved).toEqual({
      provider: 'google',
      model: 'gemini-3.1',
      apiKey: 'gemini-key',
      baseUrl: undefined
    });
  });

  it('accepts provider from LLM_PROVIDER environment variable', async () => {
    process.env.LLM_PROVIDER = 'google';
    process.env.GOOGLE_API_KEY = 'google-key';
    process.env.GOOGLE_MODEL = 'gemini-env-model';
    process.env.GOOGLE_BASE_URL = 'https://example.google.api';

    const resolved = await resolveLlmConfig({
      rawOptions: {},
      fallbackModel: 'fallback-model',
      t
    });

    expect(resolved).toEqual({
      provider: 'google',
      model: 'gemini-env-model',
      apiKey: 'google-key',
      baseUrl: 'https://example.google.api'
    });
  });

  it('throws an error for invalid provider values', async () => {
    await expect(
      resolveLlmConfig({
        rawOptions: { provider: 'invalid-provider' as any },
        fallbackModel: 'fallback-model',
        t
      })
    ).rejects.toThrow('errors.fill.invalidProvider');
  });

  it('throws a provider-specific missing API key error', async () => {
    await expect(
      resolveLlmConfig({
        rawOptions: { provider: 'google' },
        fallbackModel: 'fallback-model',
        t
      })
    ).rejects.toThrow('GOOGLE_API_KEY');
  });
});
