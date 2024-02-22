import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import KnowledgeCard from "./knowledge-card";
import CreateKnowledgeButton from "@/components/create-knowledge-button";

export default async function Knowledges({
  aiId,
  limit,
}: {
  aiId?: string;
  limit?: number;
}) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }
  const knowledges = await prisma.knowledge.findMany({
    where: {
      userId: session.user.id as string,
      ...(aiId ? { aiId } : {}),
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      ai: true,
    },
    ...(limit ? { take: limit } : {}),
  });

  return knowledges.length > 0 ? (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {knowledges.map((knowledge) => (
        <KnowledgeCard key={knowledge.id} data={knowledge} />
      ))}
    </div>
  ) : (
    <div className="flex flex-col items-center gap-4 pt-32">
      <h1 className="font-cal text-4xl">Add some knowledge</h1>
      <p className="mb-4 text-lg text-stone-500">
        Your AI doesn&#39;t have any special knowledge yet. Add some to get
        started.
      </p>
      <CreateKnowledgeButton />
    </div>
  );
}
