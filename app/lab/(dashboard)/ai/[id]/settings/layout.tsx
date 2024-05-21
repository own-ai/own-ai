import { notFound, redirect } from "next/navigation";
import { ReactNode } from "react";

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getAiUrlDisplay, getAiUrlHref, labPath } from "@/lib/urls";

import AiSettingsNav from "./nav";

export default async function AiSettingsLayout({
  params,
  children,
}: {
  params: { id: string };
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect(labPath("/login"));
  }
  const data = await prisma.ai.findUnique({
    where: {
      id: decodeURIComponent(params.id),
    },
  });

  if (!data || data.userId !== session.user.id) {
    notFound();
  }

  return (
    <>
      <div className="flex flex-col items-center space-x-4 space-y-2 sm:flex-row sm:space-y-0">
        <h1 className="font-cal text-xl font-bold dark:text-white sm:text-3xl">
          Settings for {data.name}
        </h1>
        <a
          href={getAiUrlHref(data)}
          target="_blank"
          rel="noreferrer"
          className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
        >
          {getAiUrlDisplay(data)} ↗
        </a>
      </div>
      <AiSettingsNav id={data.id} isTeamAi={data.access === "members"} />
      {children}
    </>
  );
}
