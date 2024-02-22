import { notFound, redirect } from "next/navigation";
import { getAiData } from "@/lib/fetchers";
import { nanoid } from "@/lib/utils";
import { Chat } from "@/components/chat/chat";
import { getSession } from "@/lib/auth";
import { getMdxSource } from "@/lib/mdx";

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
      notFound();
    } else {
      redirect("/sign-in?next=/");
    }
  }

  const welcome = ai.welcome ? await getMdxSource(ai.welcome) : null;

  return (
    <Chat id={id} welcome={welcome} starters={JSON.stringify(ai.starters)} />
  );
}
