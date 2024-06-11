import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
import { createOllama } from "ollama-ai-provider";

export const aiProvider = (() => {
  switch (process.env.AI_API_TYPE) {
    case "openai":
      return createOpenAI({
        baseURL: process.env.AI_API_URL,
        apiKey: process.env.AI_API_KEY,
      });
    case "mistral":
      return createMistral({
        baseURL: process.env.AI_API_URL,
        apiKey: process.env.AI_API_KEY,
      });
    case "google":
      return createGoogleGenerativeAI({
        baseURL: process.env.AI_API_URL,
        apiKey: process.env.AI_API_KEY,
      });
    case "anthropic":
      return createAnthropic({
        baseURL: process.env.AI_API_URL,
        apiKey: process.env.AI_API_KEY,
      });
    case "ollama":
      return createOllama({
        baseURL: process.env.AI_API_URL,
      });
    default:
      throw new Error("AI_API_TYPE is not set or unknown.");
  }
})();
