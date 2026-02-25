import { GoogleGeminiConfig, LLMConfig, LLMProvider, OpenRouterConfig } from '../types';
import { BaseLLMClient } from './baseLLMClient';
import { OpenRouterClient } from './openRouterClient';
import { GoogleGeminiClient } from './googleGeminiClient';

export class LLMClientFactory {
  static createClient(config: LLMConfig): BaseLLMClient {
    if (config.provider === 'google') {
      const googleConfig: GoogleGeminiConfig = {
        apiKey: config.apiKey,
        baseUrl: config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta',
        model: config.model
      };
      return new GoogleGeminiClient(googleConfig);
    }

    const openRouterConfig: OpenRouterConfig = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || 'https://openrouter.ai/api/v1',
      model: config.model
    };
    return new OpenRouterClient(openRouterConfig);
  }

  static getDefaultModel(provider: LLMProvider = 'openrouter'): string {
    if (provider === 'google') {
      return 'gemini-2.5-flash';
    }
    return 'x-ai/grok-4-fast';
  }

  static getEnvironmentVariables(provider: LLMProvider = 'openrouter'): string[] {
    if (provider === 'google') {
      return ['GOOGLE_API_KEY', 'GEMINI_API_KEY'];
    }
    return ['OPENROUTER_API_KEY'];
  }

  static getModelEnvironmentVariables(provider: LLMProvider = 'openrouter'): string[] {
    if (provider === 'google') {
      return ['GEMINI_MODEL', 'GOOGLE_MODEL'];
    }
    return ['OPENROUTER_MODEL'];
  }

  static getBaseUrlEnvironmentVariables(provider: LLMProvider = 'openrouter'): string[] {
    if (provider === 'google') {
      return ['GEMINI_BASE_URL', 'GOOGLE_BASE_URL'];
    }
    return ['OPENROUTER_BASE_URL'];
  }
}
