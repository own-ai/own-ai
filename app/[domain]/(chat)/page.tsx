import { redirect } from "next/navigation";
import { getAiData } from "@/lib/fetchers";
import { nanoid } from "@/lib/utils";
import { Chat } from "@/components/chat/chat";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bot } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getMdxSource } from "@/lib/mdx";
import { getUserSubscriptionPlan } from "@/lib/subscription";

export default async function IndexPage({
  params,
}: {
  params: { domain: string };
}) {
  const id = nanoid();
  const domain = decodeURIComponent(params.domain);
  const ai = await getAiData(domain);
  if (!ai) {
    if (await getSession()) {
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
    <Chat id={id} welcome={welcome} starters={JSON.stringify(ai.starters)} />
  );
}
