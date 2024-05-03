import Link from "next/link";
import * as React from "react";

import { SidebarList } from "@/components/chat/sidebar-list";
import { buttonVariants } from "@/components/ui/button";
import { IconPlus } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface ChatHistoryProps {
  userId?: string;
  aiId?: string;
}

export async function ChatHistory({ userId, aiId }: ChatHistoryProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 mt-12 px-2 lg:mt-4">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-10 w-full justify-start bg-zinc-50 px-4 shadow-none transition-colors hover:bg-zinc-200/40 dark:bg-zinc-900 dark:hover:bg-zinc-300/10",
          )}
        >
          <IconPlus className="-translate-x-2 stroke-2" />
          New Chat
        </Link>
      </div>
      <React.Suspense
        fallback={
          <div className="flex flex-1 flex-col space-y-4 overflow-auto px-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-6 w-full shrink-0 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800"
              />
            ))}
          </div>
        }
      >
        <SidebarList userId={userId} aiId={aiId} />
      </React.Suspense>
    </div>
  );
}
