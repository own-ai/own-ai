import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { UIState } from "@/lib/actions/ai";
import { Session } from "@/lib/types";
import { aiPath } from "@/lib/urls";

export interface ChatList {
  messages: UIState;
  session?: Session | null;
  isShared: boolean;
  domain: string;
}

export function ChatList({ messages, session, isShared, domain }: ChatList) {
  if (!messages.length) {
    return null;
  }

  const isDemo =
    domain === "demo" ||
    domain === `demo.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {!isDemo && !isShared && !session ? (
        <>
          <div className="group relative mb-4 flex items-start md:-ml-12">
            <div className="flex size-[25px] shrink-0 select-none items-center justify-center rounded-md border bg-background shadow-sm">
              <ExclamationTriangleIcon />
            </div>
            <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
              <p className="leading-normal text-muted-foreground">
                Please{" "}
                <Link href={aiPath(domain, "/login")} className="underline">
                  log in
                </Link>{" "}
                if you want to save and revisit your chat history.
              </p>
            </div>
          </div>
          <Separator className="my-4" />
        </>
      ) : null}

      {messages.map((message, index) => (
        <div key={message.id}>
          {message.display}
          {index < messages.length - 1 && <Separator className="my-4" />}
        </div>
      ))}
    </div>
  );
}
