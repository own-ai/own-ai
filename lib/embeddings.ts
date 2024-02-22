import { TogetherAIEmbeddings } from "@langchain/community/embeddings/togetherai";
import { PrismaVectorStore } from "@langchain/community/vectorstores/prisma";
import { Prisma, Knowledge } from "@prisma/client";
import prisma from "@/lib/prisma";

const MAX_KNOWLEDGE_CONSIDERED = 8;
const MAX_KNOWLEDGE_LENGTH = 40000; // ~10000 tokens

const embeddings = new TogetherAIEmbeddings({
  apiKey: process.env.TOGETHER_API_KEY,
  modelName: "togethercomputer/m2-bert-80M-32k-retrieval",
});

const vectorStore = PrismaVectorStore.withModel<Knowledge>(prisma).create(
  embeddings,
  {
    prisma: Prisma,
    tableName: "Knowledge",
    vectorColumnName: "vector",
    columns: {
      id: PrismaVectorStore.IdColumn,
      content: PrismaVectorStore.ContentColumn,
    },
  },
);

export async function generateEmbeddings(document: string): Promise<number[]> {
  return await embeddings.embedQuery(document.slice(0, MAX_KNOWLEDGE_LENGTH));
}

export async function getMostRelevantKnowledge(
  aiId: string,
  query: string,
  numResults = 1,
) {
  const vector = await generateEmbeddings(query);
  return await vectorStore.similaritySearchVectorWithScore(vector, numResults, {
    learned: {
      equals: true,
    },
    aiId: {
      equals: aiId,
    },
  });
}

export async function getContext(aiId: string, query: string) {
  const relevantKnowledge = await getMostRelevantKnowledge(
    aiId,
    query,
    MAX_KNOWLEDGE_CONSIDERED,
  );
  return relevantKnowledge
    .map(([d]) => d.pageContent)
    .join("\n\n")
    .slice(0, MAX_KNOWLEDGE_LENGTH);
}
