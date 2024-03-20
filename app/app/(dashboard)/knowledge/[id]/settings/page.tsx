import { getMemberRole, getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import DeleteKnowledgeForm from "@/components/form/delete-knowledge-form";

export default async function KnowledgeSettings({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const knowledge = await prisma.knowledge.findUnique({
    where: {
      id: decodeURIComponent(params.id),
    },
    include: {
      ai: {
        select: {
          userId: true,
          members: true,
        },
      },
    },
  });

  if (!knowledge || !knowledge.ai) {
    notFound();
  }
  if (
    knowledge.ai.userId !== session.user.id &&
    getMemberRole(knowledge.ai, session.user.email) !== "teacher"
  ) {
    return {
      error: "Not authorized",
    };
  }

  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-6">
      <div className="flex flex-col space-y-6">
        <h1 className="font-cal text-3xl font-bold dark:text-white">
          Knowledge Settings
        </h1>
        <DeleteKnowledgeForm id={knowledge.id} />
      </div>
    </div>
  );
}
