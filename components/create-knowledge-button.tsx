"use client";

import va from "@vercel/analytics";
import { useParams, useRouter } from "next/navigation";
import { useTransition } from "react";

import LoadingDots from "@/components/icons/loading-dots";
import { createKnowledge } from "@/lib/actions/app";
import { cn } from "@/lib/utils";

export default function CreateKnowledgeButton() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          const knowledge = await createKnowledge(null, id, null);
          va.track("Created Knowledge");
          router.refresh();
          router.push(`/knowledge/${knowledge.id}`);
        })
      }
      className={cn(
        "flex h-8 w-36 items-center justify-center space-x-2 rounded-lg border text-sm transition-all focus:outline-none sm:h-9",
        isPending
          ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
          : "border border-black bg-black text-white hover:bg-white hover:text-black active:bg-stone-100 dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800",
      )}
      disabled={isPending}
    >
      {isPending ? <LoadingDots color="#808080" /> : <p>Add Knowledge</p>}
    </button>
  );
}
