"use client";

import { type Session } from "next-auth";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconExternalLink } from "@/components/ui/icons";
import { PublicAiData } from "@/lib/types";
import { aiPath, getLabUrlHref } from "@/lib/urls";

export interface UserMenuProps {
  user: Session["user"] & { id?: string };
  ai: PublicAiData | null;
}

function getUserInitials(name: string) {
  const [firstName, lastName] = name.split(" ");
  return lastName ? `${firstName[0]}${lastName[0]}` : firstName.slice(0, 2);
}

export function UserMenu({ user, ai }: UserMenuProps) {
  const params = useParams() as { domain: string };
  const domain = decodeURIComponent(params.domain);

  const label = user?.name ?? user?.email;
  return (
    <div className="flex items-center justify-between">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="pl-0">
            {user?.image ? (
              <Image
                className="size-6 select-none rounded-full ring-1 ring-zinc-100/10 transition-opacity duration-300 hover:opacity-80"
                src={user?.image ?? ""}
                alt={label ?? "Avatar"}
                height={48}
                width={48}
              />
            ) : (
              <div className="flex size-7 shrink-0 select-none items-center justify-center rounded-full bg-muted/50 text-xs font-medium uppercase text-muted-foreground">
                {label ? getUserInitials(label) : null}
              </div>
            )}
            <span className="ml-2">{label}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={8} align="start" className="w-[180px]">
          <DropdownMenuItem className="flex-col items-start">
            <div className="text-xs font-medium">{user?.name}</div>
            <div className="text-xs text-zinc-500">{user?.email}</div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {ai && ai.userId === user?.id ? (
            <DropdownMenuItem asChild>
              <a
                href={`${getLabUrlHref()}/ai/${ai.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-between text-xs"
              >
                Edit {ai.name}
                <IconExternalLink className="ml-auto size-3" />
              </a>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            onClick={() =>
              signOut({
                callbackUrl: aiPath(domain, "/"),
              })
            }
            className="text-xs"
          >
            Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
