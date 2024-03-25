"use client";

import { useChat, type Message } from "ai/react";
import { MDXRemoteProps } from "next-mdx-remote";
import { toast } from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { ChatList } from "@/components/chat/chat-list";
import { ChatPanel } from "@/components/chat/chat-panel";
import { EmptyScreen } from "@/components/chat/empty-screen";
import { ChatScrollAnchor } from "@/components/chat/chat-scroll-anchor";

export interface ChatProps extends React.ComponentProps<"div"> {
  initialMessages?: Message[];
  id?: string;
  welcome?: MDXRemoteProps | null;
  starters?: string | null;
}

export function Chat({
  id,
  initialMessages,
  className,
  welcome,
  starters,
}: ChatProps) {
  const path = usePathname();
  const router = useRouter();

  const {
    messages,
    append,
    reload,
    stop,
    isLoading,
    input,
    setInput,
    setMessages,
  } = useChat({
    initialMessages,
    id,
    body: {
      id,
    },
    onResponse(response) {
      if (response.status === 401) {
        toast.error(response.statusText);
      }
    },
    onFinish() {
      if (id && !path.includes("chat")) {
        router.push(`/chat/${id}`);
      }
    },
  });
  return (
    <>
      <div className={cn("pb-[200px] pt-4 md:pt-10", className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <EmptyScreen
            setInput={setInput}
            welcome={welcome}
            starters={starters}
          />
        )}
      </div>
      <ChatPanel
        id={id}
        isLoading={isLoading}
        stop={stop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
        setMessages={setMessages}
      />
    </>
  );
}
