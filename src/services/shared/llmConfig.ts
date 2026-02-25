import type { TranslateFn } from '../../utils/i18n';
import type { LLMConfig } from '../../types';
import { LLMClientFactory } from '../llmClientFactory';

export interface ResolvedLlmConfig {
  provider: LLMConfig['provider'];
  model: string;
  apiKey: string;
  baseUrl?: string;
}

export interface ResolveLlmConfigOptions {
  rawOptions: {
    provider?: LLMConfig['provider'];
    model?: string;
    apiKey?: string;
    baseUrl?: string;
  };
  fallbackModel: string;
  t: TranslateFn;
  factory?: typeof LLMClientFactory;
}

export async function resolveLlmConfig({
  rawOptions,
  fallbackModel,
  t,
  factory = LLMClientFactory
}: ResolveLlmConfigOptions): Promise<ResolvedLlmConfig> {
  const providerFromOption = normalizeProvider(rawOptions.provider);
  if (rawOptions.provider && !providerFromOption) {
    throw new Error(
      t('errors.fill.invalidProvider', {
        value: rawOptions.provider,
        allowed: 'openrouter, google'
      })
    );
  }

  const providerFromEnv = normalizeProvider(process.env.LLM_PROVIDER);
  const provider: LLMConfig['provider'] = providerFromOption || providerFromEnv || 'openrouter';
  const envVars = factory.getEnvironmentVariables(provider);

  // Get API key from options or environment
  let apiKey = rawOptions.apiKey;
  if (!apiKey) {
    apiKey = readFirstEnvValue(envVars);
  }

  // Get model from options, environment, or defaults
  let model = rawOptions.model;
  if (!model) {
    model = readFirstEnvValue(factory.getModelEnvironmentVariables(provider))
      || factory.getDefaultModel(provider)
      || fallbackModel;
  }

  const baseUrl = rawOptions.baseUrl || readFirstEnvValue(factory.getBaseUrlEnvironmentVariables(provider));

  // Validate API key exists
  if (!apiKey) {
    throw new Error(
      t('errors.fill.apiKeyMissing', {
        provider: provider.toUpperCase(),
        envVars: envVars.join(', ')
      })
    );
  }

  return {
    provider,
    model,
    apiKey,
    baseUrl
  };
}

function normalizeProvider(provider: string | undefined): LLMConfig['provider'] | undefined {
  if (!provider) {
    return undefined;
  }

  const normalized = provider.trim().toLowerCase();
  if (normalized === 'openrouter' || normalized === 'google') {
    return normalized;
  }

  return undefined;
}

function readFirstEnvValue(envVars: string[]): string | undefined {
  for (const envVar of envVars) {
    const value = process.env[envVar];
    if (value) {
      return value;
    }
  }
  return undefined;
}
