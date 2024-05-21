"use client";

import { Knowledge } from "@prisma/client";
import { Bot } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";

import Editor from "@/components/editor";
import LoadingDots from "@/components/icons/loading-dots";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { updateKnowledge } from "@/lib/actions/lab";
import { getAiUrlDisplay, getAiUrlHref } from "@/lib/urls";
import { cn } from "@/lib/utils";

type KnowledgeWithAi = Knowledge & {
  ai: {
    name: string | null;
    subdomain: string | null;
    ownDomain: string | null;
  } | null;
};

export default function KnowledgeEditor({
  knowledge,
}: {
  knowledge: KnowledgeWithAi;
}) {
  let [isPendingSaving, startTransitionSaving] = useTransition();
  let [isPendingLearning, startTransitionLearning] = useTransition();
  const [data, setData] = useState<KnowledgeWithAi>(knowledge);

  const saveChanges = useCallback(() => {
    if (data.title === knowledge.title && data.content === knowledge.content) {
      return;
    }
    startTransitionSaving(async () => {
      setData((prev) => ({ ...prev, learned: false }));
      await updateKnowledge({ ...data, learned: false });
    });
  }, [data, knowledge]);

  const saveChangesDebounced = useDebouncedCallback(saveChanges, 1000);

  // listen to CMD + S and override the default behavior
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "s") {
        e.preventDefault();
        saveChanges();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [saveChanges]);

  return (
    <>
      <div className="max-w-screen-lg px-4 sm:px-0">
        <Alert variant={data.learned ? "default" : "destructive"}>
          <Bot className="h-4 w-4" />
          <AlertTitle>
            {data.learned
              ? `${data.ai?.name} learned this knowledge`
              : "Knowledge not learned yet"}
          </AlertTitle>
          <AlertDescription>
            {data.learned ? (
              <p>
                I have learned this knowledge. You can talk with me about it by
                visiting my URL{" "}
                <a
                  href={getAiUrlHref(data.ai!)}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
                >
                  {getAiUrlDisplay(data.ai!)} ↗
                </a>
              </p>
            ) : (
              <p>
                Please click the <strong>Learn</strong> button to teach this
                content to your AI.
              </p>
            )}
          </AlertDescription>
        </Alert>
      </div>
      <div className="relative min-h-[500px] w-full max-w-screen-lg border-stone-200 p-12 px-8 dark:border-stone-700 sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:px-12 sm:shadow-lg">
        <div className="absolute right-5 top-5 mb-5 flex items-center space-x-3">
          <div className="rounded-lg bg-stone-100 px-2 py-1 text-sm text-stone-400 dark:bg-stone-800 dark:text-stone-500">
            {isPendingSaving ? "Saving..." : "Saved"}
          </div>
          <button
            onClick={() => {
              startTransitionLearning(async () => {
                const response = await updateKnowledge({
                  ...data,
                  learned: !data.learned,
                });
                if ("error" in response) {
                  toast.error(response.error);
                } else {
                  toast.success(
                    `Successfully ${
                      data.learned ? "unlearned" : "learned"
                    } your knowledge.`,
                  );
                  setData((prev) => ({ ...prev, learned: !prev.learned }));
                }
              });
            }}
            className={cn(
              "flex h-7 w-24 items-center justify-center space-x-2 rounded-lg border text-sm transition-all focus:outline-none",
              isPendingLearning
                ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                : "border border-black bg-black text-white hover:bg-white hover:text-black active:bg-stone-100 dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800",
            )}
            disabled={isPendingLearning}
          >
            {isPendingLearning ? (
              <LoadingDots />
            ) : (
              <p>{data.learned ? "Unlearn" : "Learn"}</p>
            )}
          </button>
        </div>
        <div className="mb-5 flex flex-col space-y-3 border-b border-stone-200 pb-5 dark:border-stone-700">
          <input
            type="text"
            placeholder="Knowledge Title"
            defaultValue={knowledge?.title || ""}
            autoFocus
            onChange={(e) => {
              setData({ ...data, title: e.target.value });
              saveChangesDebounced();
            }}
            className="dark:placeholder-text-600 border-none px-0 font-cal text-3xl placeholder:text-stone-400 focus:outline-none focus:ring-0 dark:bg-black dark:text-white"
          />
        </div>
        <Editor
          className="knowledge-editor relative block"
          initialContent={knowledge?.content || ""}
          onUpdate={(content) => {
            setData((prev) => ({
              ...prev,
              content,
            }));
            saveChangesDebounced();
          }}
          emptyEditorPlaceholder="Paste or write down special knowledge for your AI here"
          emptyLinePlaceholder="Press / for formatting options"
        />
      </div>
    </>
  );
}
