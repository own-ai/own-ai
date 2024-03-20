import { kv } from "@vercel/kv";
import { Message, StreamingTextResponse } from "ai";
import { ChatTogetherAI } from "@langchain/community/chat_models/togetherai";
import { BytesOutputParser } from "@langchain/core/output_parsers";
import {
  ChatPromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";

import { getSession } from "@/lib/auth";
import { nanoid } from "@/lib/utils";
import { getAiData } from "@/lib/fetchers";
import { getRatelimitResponse } from "@/lib/ratelimit";
import { getContext } from "@/lib/embeddings";

// The edge runtime needs next-auth 5
// export const runtime = "edge";

export async function POST(req: Request) {
  const ratelimitResponse = await getRatelimitResponse(
    req.headers.get("x-forwarded-for")!,
  );
  if (ratelimitResponse) {
    return ratelimitResponse;
  }

  const domain = req.headers
    .get("host")!
    .replace(".localhost:3000", `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`);
  const ai = await getAiData(domain);

  if (!ai) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const json = await req.json();
  const { messages } = json;
  const userId = (await getSession())?.user.id;

  const model = new ChatTogetherAI({
    togetherAIApiKey: process.env.TOGETHER_API_KEY,
    modelName: ai.model,
    maxTokens: -1,
    temperature: 0.7,
    streaming: true,
    modelKwargs: {
      repetition_penalty: 1,
    },
  });

  const inputs = messages
    .filter((m: Message) => m.role === "user")
    .map((m: Message) => m.content)
    .join(" ");
  const context = await getContext(ai.id, inputs);

  const systemPrompt = PromptTemplate.fromTemplate(
    context
      ? `${ai.instructions}\n\n<knowledge>\n{context}\n</knowledge>\n\n`
      : ai.instructions ?? "",
  );

  const langchainMessages = [
    new SystemMessagePromptTemplate(systemPrompt),
    ...messages.map((m: Message) => [
      m.role === "user" ? "human" : "ai",
      m.content.replaceAll("{", "{{").replaceAll("}", "}}"),
    ]),
  ];
  const prompt = ChatPromptTemplate.fromMessages(langchainMessages);
  const chain = prompt.pipe(model).pipe(new BytesOutputParser());

  let output = "";
  const stream = await chain.stream(
    context
      ? {
          context,
        }
      : {},
    {
      callbacks: [
        {
          handleLLMNewToken: (token) => {
            output += token;
          },
          handleChainEnd: async () => {
            if (!userId) {
              return;
            }
            const title = json.messages[0].content.substring(0, 100);
            const id = json.id ?? nanoid();
            const createdAt = Date.now();
            const path = `/chat/${id}`;
            const payload = {
              id,
              title,
              userId,
              aiId: ai.id,
              createdAt,
              path,
              messages: [
                ...messages,
                {
                  content: output,
                  role: "assistant",
                },
              ],
            };
            await kv.hmset(`chat:${id}`, payload);
            await kv.zadd(`user:${userId}:ai:${ai.id}`, {
              score: createdAt,
              member: `chat:${id}`,
            });
          },
        },
      ],
    },
  );

  return new StreamingTextResponse(stream);
}
