"use client";

import { type DialogProps } from "@radix-ui/react-dialog";
import { useParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconSpinner } from "@/components/ui/icons";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";
import { type Chat, ServerActionResult } from "@/lib/types";
import { aiPath } from "@/lib/urls";

interface ChatShareDialogProps extends DialogProps {
  chat: Pick<Chat, "id" | "title" | "messages">;
  shareChat: (id: string) => ServerActionResult<Chat>;
  onCopy: () => void;
}

export function ChatShareDialog({
  chat,
  shareChat,
  onCopy,
  ...props
}: ChatShareDialogProps) {
  const params = useParams() as { domain: string };
  const domain = decodeURIComponent(params.domain);

  const { copyToClipboard } = useCopyToClipboard({ timeout: 1000 });
  const [isSharePending, startShareTransition] = React.useTransition();

  const copyShareLink = React.useCallback(
    async (chat: Chat) => {
      if (!chat.sharePath) {
        return toast.error("Could not copy share link to clipboard");
      }

      const url = new URL(window.location.href);
      url.pathname = aiPath(domain, chat.sharePath);
      copyToClipboard(url.toString());
      onCopy();
      toast.success("Share link copied to clipboard");
    },
    [copyToClipboard, onCopy, domain],
  );

  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share link to chat</DialogTitle>
          <DialogDescription>
            Anyone with the URL will be able to view the shared chat.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1 rounded-md border p-4 text-sm">
          <div className="font-medium">{chat.title}</div>
          <div className="text-muted-foreground">
            {chat.messages.length} messages
          </div>
        </div>
        <DialogFooter className="items-center">
          <Button
            disabled={isSharePending}
            onClick={() => {
              // @ts-ignore
              startShareTransition(async () => {
                const result = await shareChat(chat.id);

                if (result && "error" in result) {
                  toast.error(result.error);
                  return;
                }

                copyShareLink(result);
              });
            }}
          >
            {isSharePending ? (
              <>
                <IconSpinner className="mr-2 animate-spin" />
                Copying...
              </>
            ) : (
              <>Copy link</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
