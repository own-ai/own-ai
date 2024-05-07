import { Bot } from "lucide-react";
import { redirect } from "next/navigation";

import { Chat } from "@/components/chat/chat";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AI } from "@/lib/actions/ai";
import { getSession } from "@/lib/auth";
import { getAiData } from "@/lib/fetchers";
import { getMdxSource } from "@/lib/mdx";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { nanoid } from "@/lib/utils";

export const maxDuration = 60;

export default async function IndexPage({
  params,
}: {
  params: { domain: string };
}) {
  const session = await getSession();
  const id = nanoid();
  const domain = decodeURIComponent(params.domain);
  const ai = await getAiData(domain);
  if (!ai) {
    if (session?.user) {
      return (
        <div className="m-4">
          <Alert variant="destructive">
            <Bot className="h-4 w-4" />
            <AlertTitle>Unauthorized</AlertTitle>
            <AlertDescription>
              <p>
                You are not authorized to use this AI. Please contact the owner
                to get access.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      );
    } else {
      redirect("/login");
    }
  }

  // Check if the AI owner still has a PRO subscription for own domains.
  if (!domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)) {
    const subscriptionPlan = ai.userId
      ? await getUserSubscriptionPlan(ai.userId)
      : null;
    if (!subscriptionPlan?.isPro) {
      redirect(
        `https://${ai.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
      );
    }
  }

  const welcome = ai.welcome ? await getMdxSource(ai.welcome) : null;

  return (
    <AI initialAIState={{ aiId: ai.id, chatId: id, messages: [] }}>
      <Chat
        id={id}
        session={session}
        welcome={welcome}
        starters={JSON.stringify(ai.starters)}
      />
    </AI>
  );
}
