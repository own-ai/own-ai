import {
  generateId,
  loadApiKey,
  withoutTrailingSlash,
} from "@ai-sdk/provider-utils";
import { TogetherChatLanguageModel } from "./together-chat-language-model";
import {
  TogetherChatModelId,
  TogetherChatSettings,
} from "./together-chat-settings";
import { TogetherProviderSettings } from "./together-provider";

/**
 * @deprecated Use `createTogether` instead.
 */
export class Together {
  /**
   * Base URL for the Together API calls.
   */
  readonly baseURL: string;

  readonly apiKey?: string;

  readonly headers?: Record<string, string>;

  private readonly generateId: () => string;

  /**
   * Creates a new Together provider instance.
   */
  constructor(options: TogetherProviderSettings = {}) {
    this.baseURL =
      withoutTrailingSlash(options.baseURL ?? options.baseUrl) ??
      "https://api.together.xyz/v1";

    this.apiKey = options.apiKey;
    this.headers = options.headers;
    this.generateId = options.generateId ?? generateId;
  }

  private get baseConfig() {
    return {
      baseURL: this.baseURL,
      headers: () => ({
        Authorization: `Bearer ${loadApiKey({
          apiKey: this.apiKey,
          environmentVariableName: "TOGETHER_API_KEY",
          description: "Together",
        })}`,
        ...this.headers,
      }),
    };
  }

  chat(modelId: TogetherChatModelId, settings: TogetherChatSettings = {}) {
    return new TogetherChatLanguageModel(modelId, settings, {
      provider: "together.chat",
      ...this.baseConfig,
      generateId: this.generateId,
    });
  }
}
