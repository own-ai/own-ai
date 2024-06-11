import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
import { createOllama } from "ollama-ai-provider";

export const embeddingsProvider = (() => {
  switch (process.env.EMBEDDINGS_API_TYPE) {
    case "openai":
      return createOpenAI({
        baseURL: process.env.EMBEDDINGS_API_URL,
        apiKey: process.env.EMBEDDINGS_API_KEY,
      });
    case "mistral":
      return createMistral({
        baseURL: process.env.EMBEDDINGS_API_URL,
        apiKey: process.env.EMBEDDINGS_API_KEY,
      });
    case "ollama":
      return createOllama({
        baseURL: process.env.EMBEDDINGS_API_URL,
      });
    default:
      throw new Error("EMBEDDINGS_API_TYPE is not set or unknown.");
  }
})();
