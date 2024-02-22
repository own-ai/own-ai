"use server";

import { StreamingTextResponse } from "ai";
import { TogetherAI } from "@langchain/community/llms/togetherai";
import { PromptTemplate } from "@langchain/core/prompts";
import { getSession } from "@/lib/auth";
import { getRatelimitResponse } from "@/lib/ratelimit";

// The edge runtime needs next-auth 5
// export const runtime = "edge";

export async function POST(req: Request): Promise<Response> {
  const ratelimitResponse = await getRatelimitResponse(
    req.headers.get("x-forwarded-for")!,
  );
  if (ratelimitResponse) {
    return ratelimitResponse;
  }

  if (!(await getSession())) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  let { prompt: content } = await req.json();

  // remove trailing slash,
  // slice the content from the end to prioritize later characters
  content = content.replace(/\/$/, "").slice(-5000);

  const model = new TogetherAI({
    apiKey: process.env.TOGETHER_API_KEY,
    modelName: "mistralai/Mixtral-8x7B-Instruct-v0.1",
    maxTokens: 200,
    stop: ["\n\n", "</s>"],
    streaming: true,
  });

  const prompt = PromptTemplate.fromTemplate(
    content?.trim()
      ? "<s> [INST] " +
          "You are an AI writing assistant that continues existing text based on context from prior text. " +
          "Give more weight/priority to the later characters than the beginning ones. " +
          "Limit your response to no more than 200 characters, but make sure to construct complete sentences.\n\n" +
          "Please complete the following text:\n" +
          "{content} [/INST] "
      : "<s> [INST] " +
          "You are an AI who wants to know useful knowledge from your user. " +
          "Politely ask the user for useful knowledge and give a few examples that could be relevant " +
          "for you as an AI. [/INST] ",
  );

  const stream = await prompt
    .pipe(model)
    .stream(content?.trim() ? { content } : {});
  return new StreamingTextResponse(stream);
}
