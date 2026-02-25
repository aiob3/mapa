import axios, { AxiosInstance } from 'axios';
import type { GoogleGeminiConfig } from '../types';
import { BaseLLMClient } from './baseLLMClient';

interface GeminiUsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}

export class GoogleGeminiClient extends BaseLLMClient {
  private readonly client: AxiosInstance;
  private readonly config: GoogleGeminiConfig;

  constructor(config: GoogleGeminiConfig) {
    super(config.model);
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const model = this.normalizeModel(this.config.model || 'gemini-2.5-flash');
      const payload: Record<string, unknown> = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 16384
        }
      };

      if (systemPrompt) {
        payload.systemInstruction = {
          parts: [{ text: systemPrompt }]
        };
      }

      const response = await this.client.post(`/models/${encodeURIComponent(model)}:generateContent`, payload, {
        params: {
          key: this.config.apiKey
        }
      });

      const usage = response.data?.usageMetadata as GeminiUsageMetadata | undefined;
      this.trackUsage({
        prompt_tokens: usage?.promptTokenCount || 0,
        completion_tokens: usage?.candidatesTokenCount || 0,
        total_tokens: usage?.totalTokenCount || 0
      });

      const parts = response.data?.candidates?.[0]?.content?.parts;
      if (!Array.isArray(parts)) {
        return '';
      }

      return parts
        .map((part: { text?: string }) => part.text || '')
        .join('')
        .trim();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data?.error?.message;
        throw new Error(`Google Gemini API error: ${apiError || error.message}`);
      }
      throw error;
    }
  }

  private normalizeModel(model: string): string {
    return model.startsWith('models/') ? model.slice('models/'.length) : model;
  }
}
