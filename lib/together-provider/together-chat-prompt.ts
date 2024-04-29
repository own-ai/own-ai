export type TogetherChatPrompt = Array<TogetherChatMessage>;

export type TogetherChatMessage =
  | TogetherSystemMessage
  | TogetherUserMessage
  | TogetherAssistantMessage
  | TogetherToolMessage;

export interface TogetherSystemMessage {
  role: "system";
  content: string;
}

export interface TogetherUserMessage {
  role: "user";
  content: string;
}

export interface TogetherAssistantMessage {
  role: "assistant";
  content: string;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
}

export interface TogetherToolMessage {
  role: "tool";
  name: string;
  content: string;
}
