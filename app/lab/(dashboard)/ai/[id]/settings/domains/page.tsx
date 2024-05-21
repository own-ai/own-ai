import { notFound, redirect } from "next/navigation";

import Form from "@/components/form";
import { updateAi } from "@/lib/actions/lab";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { isSubdomainMode, labPath } from "@/lib/urls";

export default async function AiSettingsDomains({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect(labPath("/login"));
  }

  const subscriptionPlan = await getUserSubscriptionPlan(session.user.id);

  const data = await prisma.ai.findUnique({
    where: {
      id: decodeURIComponent(params.id),
    },
  });

  if (!data || data.userId !== session.user.id) {
    notFound();
  }

  return (
    <div className="flex flex-col space-y-6">
      <Form
        title={isSubdomainMode() ? "Subdomain" : "URL"}
        description={
          isSubdomainMode()
            ? "The subdomain for your AI."
            : "The URL for your AI."
        }
        helpText="Please use 64 characters maximum."
        inputAttrs={{
          name: "subdomain",
          type: "text",
          defaultValue: data?.subdomain!,
          maxLength: 64,
        }}
        handleSubmit={updateAi}
      />
      <Form
        title="Own Domain"
        description="Set your own domain for your AI! For example, this could be a subdomain of your company or a personal domain under which you want to run your AI."
        inputAttrs={{
          name: "ownDomain",
          type: "text",
          defaultValue: data?.ownDomain!,
          maxLength: 200,
          pattern: "^[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,5}$",
          placeholder: "e.g. yourai.com or ai.yourcompany.com",
        }}
        handleSubmit={updateAi}
        needsPro={true}
        hasPro={subscriptionPlan.isPro}
      />
    </div>
  );
}
