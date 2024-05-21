import { redirect } from "next/navigation";
import { Suspense } from "react";

import Ais from "@/components/ais";
import Knowledges from "@/components/knowledges";
import OverviewAisCTA from "@/components/overview-ais-cta";
import PlaceholderCard from "@/components/placeholder-card";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { labPath } from "@/lib/urls";

export default async function Overview() {
  const session = await getSession();
  if (!session) {
    redirect(labPath("/login"));
  }

  const hasKnowledge = !!(await prisma.knowledge.count({
    where: {
      user: {
        id: session.user.id as string,
      },
    },
  }));

  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="mt-12 flex flex-col space-y-6 sm:mt-0">
        <div className="flex items-center justify-between">
          <h1 className="font-cal text-3xl font-bold dark:text-white">
            Recent AIs
          </h1>
          <Suspense fallback={null}>
            <OverviewAisCTA />
          </Suspense>
        </div>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <PlaceholderCard key={i} />
              ))}
            </div>
          }
        >
          <Ais limit={4} />
        </Suspense>
      </div>

      {!hasKnowledge ? null : (
        <div className="flex flex-col space-y-6">
          <h1 className="font-cal text-3xl font-bold dark:text-white">
            Recent Knowledge
          </h1>
          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <PlaceholderCard key={i} />
                ))}
              </div>
            }
          >
            <Knowledges userId={session.user.id} limit={8} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
