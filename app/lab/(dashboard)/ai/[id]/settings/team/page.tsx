import { notFound, redirect } from "next/navigation";

import Form from "@/components/form";
import { updateAi } from "@/lib/actions/lab";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  getUserSubscriptionPlan,
  isSubscriptionMode,
} from "@/lib/subscription";
import { getAiUrlDisplay, labPath } from "@/lib/urls";

export default async function AiSettingsTeam({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect(labPath("/login"));
  }

  const subscriptionPlan = await getUserSubscriptionPlan(session.user.id);

  const ai = await prisma.ai.findUnique({
    where: {
      id: decodeURIComponent(params.id),
    },
  });

  if (!ai || ai.userId !== session.user.id) {
    notFound();
  }

  return (
    <div className="flex flex-col space-y-6">
      <Form
        title="Team Members"
        description={`Please enter the e-mail addresses of people who are allowed to access ${ai?.name}. People who are allowed to use the AI can do so by visiting the AI URL ${getAiUrlDisplay(
          ai,
        )}. People who are allowed to edit knowledge can do so by logging in to ownAI.`}
        helpText=""
        inputAttrs={{
          name: "members",
          type: "text",
          defaultValue: JSON.stringify(ai?.members),
        }}
        handleSubmit={updateAi}
        hasPro={subscriptionPlan.isPro}
        needsPro={isSubscriptionMode()}
      />
    </div>
  );
}
