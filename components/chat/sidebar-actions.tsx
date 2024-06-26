"use client";

import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { ChatShareDialog } from "@/components/chat/chat-share-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { IconShare, IconSpinner, IconTrash } from "@/components/ui/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Chat, ServerActionResult } from "@/lib/types";
import { aiPath } from "@/lib/urls";

interface SidebarActionsProps {
  chat: Chat;
  removeChat: (args: {
    id: string;
    aiRoot: string;
    aiPath: string;
  }) => ServerActionResult<void>;
  shareChat: (id: string) => ServerActionResult<Chat>;
}

export function SidebarActions({
  chat,
  removeChat,
  shareChat,
}: SidebarActionsProps) {
  const router = useRouter();
  const params = useParams() as { domain: string };
  const domain = decodeURIComponent(params.domain);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);
  const [isRemovePending, startRemoveTransition] = React.useTransition();

  return (
    <>
      <div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="h-7 w-7 p-0 hover:bg-background"
              onClick={() => setShareDialogOpen(true)}
            >
              <IconShare />
              <span className="sr-only">Share</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Share chat</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="h-7 w-7 p-0 hover:bg-background"
              disabled={isRemovePending}
              onClick={() => setDeleteDialogOpen(true)}
            >
              <IconTrash />
              <span className="sr-only">Delete</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete chat</TooltipContent>
        </Tooltip>
      </div>
      <ChatShareDialog
        chat={chat}
        shareChat={shareChat}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        onCopy={() => setShareDialogOpen(false)}
      />
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the chat conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovePending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isRemovePending}
              onClick={(event) => {
                event.preventDefault();
                // @ts-ignore
                startRemoveTransition(async () => {
                  const result = await removeChat({
                    id: chat.id,
                    aiRoot: aiPath(domain, "/"),
                    aiPath: aiPath(domain, chat.path),
                  });

                  if (result && "error" in result) {
                    toast.error(result.error);
                    return;
                  }

                  setDeleteDialogOpen(false);
                  router.refresh();
                  router.push(aiPath(domain, "/"));
                  toast.success("Chat deleted");
                });
              }}
            >
              {isRemovePending && <IconSpinner className="mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
