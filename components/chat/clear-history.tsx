"use client";

import { useParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { IconSpinner } from "@/components/ui/icons";
import { ServerActionResult } from "@/lib/types";
import { aiPath } from "@/lib/urls";

interface ClearHistoryProps {
  isEnabled: boolean;
  aiId: string;
  clearChats: (aiId: string, aiRoot: string) => ServerActionResult<void>;
}

export function ClearHistory({
  isEnabled = false,
  aiId,
  clearChats,
}: ClearHistoryProps) {
  const params = useParams() as { domain: string };
  const domain = decodeURIComponent(params.domain);

  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" disabled={!isEnabled || isPending}>
          {isPending && <IconSpinner className="mr-2" />}
          Clear history
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete all your chat history.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              startTransition(async () => {
                const aiRoot = aiPath(domain, "/");
                const result = await clearChats(aiId, aiRoot);
                if (result && "error" in result) {
                  toast.error(result.error);
                  return;
                }

                setOpen(false);
              });
            }}
          >
            {isPending && <IconSpinner className="mr-2 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
