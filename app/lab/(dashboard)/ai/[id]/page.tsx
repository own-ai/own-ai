import { Bot } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import CreateKnowledgeButton from "@/components/create-knowledge-button";
import Knowledges from "@/components/knowledges";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getMemberRole, getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getAiUrlDisplay, getAiUrlHref, labPath } from "@/lib/urls";

export default async function AiKnowledges({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect(labPath("/login"));
  }

  const ai = await prisma.ai.findUnique({
    where: {
      id: decodeURIComponent(params.id),
    },
  });
  if (!ai) {
    notFound();
  }

  const isTeacher =
    ai.userId !== session.user.id &&
    getMemberRole(ai, session.user.email) === "teacher";
  if (ai.userId !== session.user.id && !isTeacher) {
    notFound();
  }

  return (
    <>
      <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
        <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
          <h1 className="w-60 truncate font-cal text-xl font-bold dark:text-white sm:w-auto sm:text-3xl">
            Knowledge for {ai.name}
          </h1>
        </div>
        <CreateKnowledgeButton />
      </div>
      <Alert>
        <Bot className="h-4 w-4" />
        <AlertTitle>Hi, I&#39;m {ai.name}!</AlertTitle>
        <AlertDescription>
          <p>
            You can talk to me by visiting my URL{" "}
            <a
              href={getAiUrlHref(ai)}
              target="_blank"
              rel="noreferrer"
              className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
            >
              {getAiUrlDisplay(ai)} ↗
            </a>
            .{" "}
            {isTeacher ? (
              "Knowledge you add here is shared with your team."
            ) : (
              <>
                To change my behavior or appearance, please go to my{" "}
                <Link
                  href={labPath(`/ai/${params.id}/settings`)}
                  className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
                >
                  Settings
                </Link>
                .
              </>
            )}
          </p>
        </AlertDescription>
      </Alert>
      <Knowledges aiId={decodeURIComponent(params.id)} />
    </>
  );
}
