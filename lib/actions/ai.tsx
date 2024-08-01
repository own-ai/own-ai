import "server-only";

import {
  createAI,
  createStreamableValue,
  getAIState,
  getMutableAIState,
  streamUI,
} from "ai/rsc";
import { headers } from "next/headers";

import { BotMessage, SpinnerMessage, UserMessage } from "@/components/aiui";
import { saveChat } from "@/lib/actions/chat";
import { aiProvider } from "@/lib/ai-provider";
import { canUseAi, getSession } from "@/lib/auth";
import { getContext } from "@/lib/embeddings";
import prisma from "@/lib/prisma";
import { ratelimit } from "@/lib/ratelimit";
import { Chat } from "@/lib/types";
import { nanoid } from "@/lib/utils";

const MAX_CONTEXT_LENGTH = 4000; // ~1000 tokens

async function submitUserMessage(content: string) {
  "use server";

  const limit = await ratelimit(
    `ai_inference_${headers().get("x-forwarded-for")}`,
  );
  if (limit) {
    throw new Error(
      `You have sent many requests in a short time. Please wait ${limit.toFixed()} seconds or contact us to get a higher limit.`,
    );
  }

  const aiState = getMutableAIState<typeof AI>();

  const ai = await prisma.ai.findUnique({
    where: {
      id: aiState.get().aiId,
    },
  });
  if (!ai || !(await canUseAi(ai, (await getSession())?.user))) {
    throw new Error("You are not authorized to use this AI.");
  }

  if (!ai.model) {
    throw new Error("No model has been set for this AI.");
  }

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: "user",
        content,
      },
    ],
  });

  const inputs = aiState
    .get()
    .messages.filter((m: Message) => m.role === "user")
    .map((m: Message) => m.content)
    .join(" ");
  const context = (await getContext(ai.id, inputs)).slice(
    0,
    MAX_CONTEXT_LENGTH,
  );

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>;
  let textNode: undefined | React.ReactNode;

  const ui = await streamUI({
    model: aiProvider(ai.model),
    initial: <SpinnerMessage />,
    temperature: 0.7,
    system: context
      ? `${ai.instructions}\n\n<knowledge>\n${context}\n</knowledge>\n\n`
      : ai.instructions ?? "",
    messages: [...(aiState.get().messages as any)],
    text: ({ content, done, delta }) => {
      if (!textStream) {
        textStream = createStreamableValue("");
        textNode = <BotMessage content={textStream.value} />;
      }

      if (done) {
        textStream.done();
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: "assistant",
              content,
            },
          ],
        });
      } else {
        textStream.update(delta);
      }

      return textNode;
    },
  });

  return {
    id: nanoid(),
    display: ui.value,
  };
}

export type Message = {
  role: "user" | "assistant" | "system" | "function" | "data" | "tool";
  content: string;
  id: string;
  name?: string;
};

export type AIState = {
  aiId?: string;
  chatId: string;
  messages: Message[];
};

export type UIState = {
  id: string;
  display: React.ReactNode;
}[];

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
  },
  initialUIState: [],
  initialAIState: { aiId: undefined, chatId: nanoid(), messages: [] },
  onGetUIState: async () => {
    "use server";

    const session = await getSession();
    if (!session?.user?.id) {
      return;
    }

    const aiState = getAIState<typeof AI>();

    if (aiState) {
      const uiState = getUIStateFromMessages(aiState.messages, aiState.chatId);
      return uiState;
    }
  },
  onSetAIState: async ({ state }) => {
    "use server";
    const { aiId, chatId, messages } = state;

    const session = await getSession();
    if (!session?.user?.id || !aiId) {
      return;
    }

    const createdAt = Date.now();
    const userId = session.user.id as string;
    const path = `/chat/${chatId}`;
    const title = messages[0].content.substring(0, 100);

    const chat: Chat = {
      id: chatId,
      title,
      userId,
      createdAt,
      messages,
      path,
    };

    await saveChat(chat, aiId);
  },
});

export const getUIStateFromMessages = (
  messages: Message[],
  chatId: string,
): UIState => {
  return messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      id: `${chatId}-${message.id}`,
      display:
        message.role === "user" ? (
          <UserMessage>{message.content}</UserMessage>
        ) : (
          <BotMessage content={message.content} />
        ),
    }));
};
