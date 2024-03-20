import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import AiCard from "./ai-card";
import CreateAiButton from "./create-ai-button";
import CreateAiModal from "./modal/create-ai";

export default async function Ais({ limit }: { limit?: number }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const subscriptionPlan = await getUserSubscriptionPlan(session.user.id);

  const ownAis = await prisma.ai.findMany({
    where: {
      user: {
        id: session.user.id as string,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    ...(limit ? { take: limit } : {}),
  });

  const memberAis = await prisma.ai.findMany({
    where: {
      members: {
        array_contains: [
          {
            email: session.user.email,
            role: "teacher",
          },
        ],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    ...(limit ? { take: limit - ownAis.length } : {}),
  });

  const ais = [...ownAis, ...memberAis];

  return ais.length > 0 ? (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {ais.map((ai) => (
        <AiCard key={ai.id} data={ai} />
      ))}
    </div>
  ) : (
    <div className="mt-20 flex flex-col items-center gap-4 pt-32">
      <h1 className="font-cal text-4xl">Create your first AI</h1>
      <p className="mb-4 text-lg text-stone-500">
        You don&#39;t have any AIs yet. Create one to get started.
      </p>
      <CreateAiButton>
        <CreateAiModal subscriptionPlan={subscriptionPlan} currentAiCount={0} />
      </CreateAiButton>
    </div>
  );
}
