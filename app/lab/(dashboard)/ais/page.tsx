import { redirect } from "next/navigation";
import { Suspense } from "react";

import Ais from "@/components/ais";
import CreateAiButton from "@/components/create-ai-button";
import CreateAiModal from "@/components/modal/create-ai";
import PlaceholderCard from "@/components/placeholder-card";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { labPath } from "@/lib/urls";

export default async function AllAisPage() {
  const session = await getSession();
  if (!session) {
    redirect(labPath("/login"));
  }

  const subscriptionPlan = await getUserSubscriptionPlan(session.user.id);
  const aiCount = await prisma.ai.count({
    where: {
      userId: session.user.id,
    },
  });

  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="mt-12 flex flex-col space-y-6 sm:mt-0">
        <div className="flex items-center justify-between">
          <h1 className="font-cal text-3xl font-bold dark:text-white">
            Your AIs
          </h1>
          <CreateAiButton>
            <CreateAiModal
              subscriptionPlan={subscriptionPlan}
              currentAiCount={aiCount}
            />
          </CreateAiButton>
        </div>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <PlaceholderCard key={i} />
              ))}
            </div>
          }
        >
          <Ais />
        </Suspense>
      </div>
    </div>
  );
}
