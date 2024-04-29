import ApiClient from "openai";

export const embeddingsProvider = new ApiClient({
  baseURL: process.env.EMBEDDINGS_API_URL,
  apiKey: process.env.EMBEDDINGS_API_KEY,
});
