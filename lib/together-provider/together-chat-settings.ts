// https://docs.together.ai/docs/inference-models#chat-models
export type TogetherChatModelId =
  | "mistralai/Mixtral-8x7B-Instruct-v0.1"
  | "mistralai/Mistral-7B-Instruct-v0.1"
  | "togethercomputer/CodeLlama-34b-Instruct"
  | (string & {});

export interface TogetherChatSettings {
  /**
Whether to inject a safety prompt before all conversations.

Defaults to `false`.
   */
  safePrompt?: boolean;
}
