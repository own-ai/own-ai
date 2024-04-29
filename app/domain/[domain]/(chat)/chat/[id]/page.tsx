import { type Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { AI } from "@/lib/actions/ai";
import { getChat } from "@/lib/actions/chat";
import { getAiData } from "@/lib/fetchers";
import { Chat } from "@/components/chat/chat";

export interface ChatPageProps {
  params: {
    domain: string;
    id: string;
  };
}

export async function generateMetadata({
  params,
}: ChatPageProps): Promise<Metadata> {
  const session = await getSession();

  if (!session?.user) {
    return {};
  }

  const chat = await getChat(params.id, session.user.id);
  return {
    title: chat?.title.toString().slice(0, 50) ?? "Chat",
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const domain = decodeURIComponent(params.domain);
  const ai = await getAiData(domain);
  if (!ai) {
    notFound();
  }

  const chat = await getChat(params.id, session.user.id);
  if (!chat) {
    notFound();
  }

  if (chat?.userId !== session?.user?.id) {
    notFound();
  }

  return (
    <AI
      initialAIState={{ aiId: ai.id, chatId: chat.id, messages: chat.messages }}
    >
      <Chat id={chat.id} session={session} />
    </AI>
  );
}
