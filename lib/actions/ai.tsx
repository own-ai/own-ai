import "server-only";

import {
  createAI,
  getMutableAIState,
  getAIState,
  experimental_streamUI,
  createStreamableValue,
} from "ai/rsc";
import { BotMessage, UserMessage, SpinnerMessage } from "@/components/aiui";
import { nanoid } from "@/lib/utils";
import { saveChat } from "@/lib/actions/chat";
import { Chat } from "@/lib/types";
import { canUseAi, getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getContext } from "@/lib/embeddings";
import { aiProvider } from "../ai-provider";

async function submitUserMessage(content: string) {
  "use server";

  const aiState = getMutableAIState<typeof AI>();

  const ai = await prisma.ai.findUnique({
    where: {
      id: aiState.get().aiId,
    },
  });
  if (!ai || !(await canUseAi(ai, (await getSession())?.user))) {
    return new Response("Unauthorized", {
      status: 401,
    });
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
  const context = await getContext(ai.id, inputs);

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>;
  let textNode: undefined | React.ReactNode;

  const ui = await experimental_streamUI({
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

    const aiState = getAIState();

    if (aiState) {
      const uiState = getUIStateFromAIState(aiState);
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

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter((message) => message.role !== "system")
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === "user" ? (
          <UserMessage>{message.content}</UserMessage>
        ) : (
          <BotMessage content={message.content} />
        ),
    }));
};
