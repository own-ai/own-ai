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

export interface TogetherProvider {
  (
    modelId: TogetherChatModelId,
    settings?: TogetherChatSettings,
  ): TogetherChatLanguageModel;

  chat(
    modelId: TogetherChatModelId,
    settings?: TogetherChatSettings,
  ): TogetherChatLanguageModel;
}

export interface TogetherProviderSettings {
  /**
Use a different URL prefix for API calls, e.g. to use proxy servers.
The default prefix is `https://api.together.xyz/v1`.
   */
  baseURL?: string;

  /**
@deprecated Use `baseURL` instead.
   */
  baseUrl?: string;

  /**
API key that is being send using the `Authorization` header.
It defaults to the `TOGETHER_API_KEY` environment variable.
   */
  apiKey?: string;

  /**
Custom headers to include in the requests.
     */
  headers?: Record<string, string>;

  generateId?: () => string;
}

/**
Create a Together AI provider instance.
 */
export function createTogether(
  options: TogetherProviderSettings = {},
): TogetherProvider {
  const createModel = (
    modelId: TogetherChatModelId,
    settings: TogetherChatSettings = {},
  ) =>
    new TogetherChatLanguageModel(modelId, settings, {
      provider: "together.chat",
      baseURL:
        withoutTrailingSlash(options.baseURL ?? options.baseUrl) ??
        "https://api.together.xyz/v1",
      headers: () => ({
        Authorization: `Bearer ${loadApiKey({
          apiKey: options.apiKey,
          environmentVariableName: "TOGETHER_API_KEY",
          description: "Together",
        })}`,
        ...options.headers,
      }),
      generateId: options.generateId ?? generateId,
    });

  const provider = function (
    modelId: TogetherChatModelId,
    settings?: TogetherChatSettings,
  ) {
    if (new.target) {
      throw new Error(
        "The Together model function cannot be called with the new keyword.",
      );
    }

    return createModel(modelId, settings);
  };

  provider.chat = createModel;

  return provider as TogetherProvider;
}

/**
Default Together provider instance.
 */
export const together = createTogether();
