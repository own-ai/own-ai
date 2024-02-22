import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Editor from "@/components/editor";

export default async function KnowledgePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const data = await prisma.knowledge.findUnique({
    where: {
      id: decodeURIComponent(params.id),
    },
    include: {
      ai: {
        select: {
          subdomain: true,
          ownDomain: true,
          name: true,
        },
      },
    },
  });
  if (!data || data.userId !== session.user.id) {
    notFound();
  }

  return <Editor knowledge={data} />;
}
