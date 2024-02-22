import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Knowledges from "@/components/knowledges";
import CreateKnowledgeButton from "@/components/create-knowledge-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bot } from "lucide-react";

export default async function AiKnowledges({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const data = await prisma.ai.findUnique({
    where: {
      id: decodeURIComponent(params.id),
    },
  });

  if (!data || data.userId !== session.user.id) {
    notFound();
  }

  const url =
    data.ownDomain ??
    `${data.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;

  return (
    <>
      <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
        <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
          <h1 className="w-60 truncate font-cal text-xl font-bold dark:text-white sm:w-auto sm:text-3xl">
            Knowledge for {data.name}
          </h1>
        </div>
        <CreateKnowledgeButton />
      </div>
      <Alert>
        <Bot className="h-4 w-4" />
        <AlertTitle>Hi, I&#39;m {data.name}!</AlertTitle>
        <AlertDescription>
          <p>
            You can talk to me by visiting my URL{" "}
            <a
              href={
                process.env.NEXT_PUBLIC_VERCEL_ENV
                  ? `https://${url}`
                  : `http://${data.subdomain}.localhost:3000`
              }
              target="_blank"
              rel="noreferrer"
              className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
            >
              {url} ↗
            </a>
            . To change my behavior or appearance, please go to my{" "}
            <a
              href={`/ai/${params.id}/settings`}
              className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
            >
              Settings
            </a>
            .
          </p>
        </AlertDescription>
      </Alert>
      <Knowledges aiId={decodeURIComponent(params.id)} />
    </>
  );
}
