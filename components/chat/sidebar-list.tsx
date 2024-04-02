"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { clearChats, getChats } from "@/app/domain/[domain]/actions";
import { ClearHistory } from "@/components/chat/clear-history";
import { SidebarItems } from "@/components/chat/sidebar-items";
import { ThemeToggle } from "@/components/theme-toggle";
import { Chat } from "@/lib/types";

interface SidebarListProps {
  userId?: string;
  aiId?: string;
  children?: React.ReactNode;
}

export function SidebarList({ userId, aiId }: SidebarListProps) {
  const pathname = usePathname();
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    getChats(userId, aiId).then(setChats);
  }, [pathname, aiId, userId]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-auto">
        {chats?.length ? (
          <div className="space-y-2 px-2">
            <SidebarItems chats={chats} />
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No chat history</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between p-4">
        <ThemeToggle />
        {chats?.length > 3 ? (
          <ClearHistory
            clearChats={clearChats}
            isEnabled={chats?.length > 0}
            aiId={aiId}
          />
        ) : null}
      </div>
    </div>
  );
}
