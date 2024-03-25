import * as React from "react";
import Link from "next/link";

import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/chat/user-menu";
import { SidebarMobile } from "./sidebar-mobile";
import { SidebarToggle } from "./sidebar-toggle";
import { ChatHistory } from "./chat-history";
import { PublicAiData } from "@/lib/types";

async function SidebarAndTitle({
  title,
  aiId,
}: {
  title: string;
  aiId?: string;
}) {
  const session = await getSession();
  if (session?.user) {
    return (
      <>
        <SidebarMobile>
          <ChatHistory userId={session.user.id} aiId={aiId} />
        </SidebarMobile>
        <SidebarToggle />
        <Link href="/" className="ms-1 font-semibold">
          {title}
        </Link>
      </>
    );
  }

  return (
    <Link href="/" className="font-semibold">
      {title}
    </Link>
  );
}

async function UserOrLogin({ ai }: { ai: PublicAiData | null }) {
  const session = await getSession();
  if (session?.user) {
    return (
      <UserMenu
        user={session.user}
        ai={ai}
        appBaseUrl={
          process.env.NEXT_PUBLIC_VERCEL_ENV
            ? `https://app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
            : `http://app.localhost:3000`
        }
      />
    );
  }

  let loginUrl = "/login";

  // For demo, the Login link should lead to App login – users try to sign up to ownAI here
  if (ai?.subdomain === "demo") {
    loginUrl = process.env.NEXT_PUBLIC_VERCEL_ENV
      ? `https://app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/login`
      : `http://app.localhost:3000/login`;
  }

  return (
    <Button variant="link" asChild className="-ml-2">
      <Link href={loginUrl}>Login</Link>
    </Button>
  );
}

export function Header({ ai }: { ai: PublicAiData | null }) {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b bg-gradient-to-b from-background/10 via-background/50 to-background/80 px-4 backdrop-blur-xl">
      <div className="flex items-center">
        <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
          <SidebarAndTitle title={ai?.name ?? ""} aiId={ai?.id} />
        </React.Suspense>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
          <UserOrLogin ai={ai} />
        </React.Suspense>
      </div>
    </header>
  );
}
