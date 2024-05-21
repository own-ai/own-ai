"use client";

import { useAIState, useUIState } from "ai/rsc";
import { MDXRemoteProps } from "next-mdx-remote";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ChatList } from "@/components/chat/chat-list";
import { ChatPanel } from "@/components/chat/chat-panel";
import { EmptyScreen } from "@/components/chat/empty-screen";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { useScrollAnchor } from "@/lib/hooks/use-scroll-anchor";
import { Session } from "@/lib/types";
import { aiPath } from "@/lib/urls";
import { cn } from "@/lib/utils";

export interface ChatProps extends React.ComponentProps<"div"> {
  domain: string;
  id?: string;
  session?: Session | null;
  welcome?: MDXRemoteProps | null;
  starters?: string | null;
}

export function Chat({
  domain,
  id,
  className,
  welcome,
  starters,
  session,
}: ChatProps) {
  const path = usePathname();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [messages] = useUIState();
  const [aiState] = useAIState();

  const [_, setNewChatId] = useLocalStorage("newChatId", id);

  useEffect(() => {
    if (session?.user) {
      if (!path.includes("chat") && messages.length === 1) {
        window.history.replaceState({}, "", aiPath(domain, `/chat/${id}`));
      }
    }
  }, [id, path, session?.user, messages, domain]);

  useEffect(() => {
    const messagesLength = aiState.messages?.length;
    if (messagesLength === 2) {
      router.refresh();
    }
  }, [aiState.messages, router]);

  useEffect(() => {
    setNewChatId(id);
  });

  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
    useScrollAnchor();

  return (
    <div
      className="group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
      ref={scrollRef}
    >
      <div
        className={cn("pb-[200px] pt-4 md:pt-10", className)}
        ref={messagesRef}
      >
        {messages.length ? (
          <ChatList
            messages={messages}
            isShared={false}
            session={session}
            domain={domain}
          />
        ) : (
          <EmptyScreen welcome={welcome} />
        )}
        <div className="h-px w-full" ref={visibilityRef} />
      </div>
      <ChatPanel
        id={id}
        input={input}
        setInput={setInput}
        starters={starters}
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />
    </div>
  );
}
