import { type Metadata } from "next";
import { notFound } from "next/navigation";

import { ChatList } from "@/components/chat/chat-list";
import { FooterText } from "@/components/chat/footer";
import { AI, UIState, getUIStateFromMessages } from "@/lib/actions/ai";
import { getSharedChat } from "@/lib/actions/chat";
import { formatDate } from "@/lib/utils";

// The edge runtime needs next-auth 5
// export const runtime = "edge";
// export const preferredRegion = "home";

interface SharePageProps {
  params: {
    domain: string;
    id: string;
  };
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const chat = await getSharedChat(params.id);

  return {
    title: chat?.title.slice(0, 50) ?? "Chat",
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const domain = decodeURIComponent(params.domain);
  const chat = await getSharedChat(params.id);

  if (!chat || !chat?.sharePath) {
    notFound();
  }

  const uiState: UIState = getUIStateFromMessages(chat.messages, chat.id);

  return (
    <>
      <div className="flex-1 space-y-6">
        <div className="border-b bg-background px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-2xl">
            <div className="space-y-1 md:-mx-8">
              <h1 className="text-2xl font-bold">{chat.title}</h1>
              <div className="text-sm text-muted-foreground">
                {formatDate(chat.createdAt)} · {chat.messages.length} messages
              </div>
            </div>
          </div>
        </div>
        <AI>
          <ChatList messages={uiState} isShared={true} domain={domain} />
        </AI>
      </div>
      <FooterText className="py-8" />
    </>
  );
}
