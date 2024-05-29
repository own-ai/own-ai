"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import LoadingDots from "@/components/icons/loading-dots";
import { createAi } from "@/lib/actions/lab";
import { slugify } from "@/lib/domains";
import { reportEvent } from "@/lib/environment";
import { isSubscriptionMode } from "@/lib/subscription";
import { UserSubscriptionPlan } from "@/lib/types";
import { isSubdomainMode, labPath } from "@/lib/urls";
import { cn } from "@/lib/utils";

import { useModal } from "./provider";

export default function CreateAiModal({
  subscriptionPlan,
  currentAiCount,
}: {
  subscriptionPlan: UserSubscriptionPlan;
  currentAiCount: number;
}) {
  const router = useRouter();
  const modal = useModal();

  const [data, setData] = useState({
    name: "",
    subdomain: "",
    access: "private",
    instructions: "",
  });

  useEffect(() => {
    setData((prev) => ({
      ...prev,
      subdomain: slugify(prev.name),
    }));
  }, [data.name]);

  return (
    <form
      action={async (data: FormData) =>
        createAi(data).then((res: any) => {
          if (res.error) {
            toast.error(res.error);
          } else {
            reportEvent("Created AI");
            const { id } = res;
            router.refresh();
            router.push(labPath(`/ai/${id}`));
            modal?.hide();
            toast.success(`Successfully created the AI.`);
          }
        })
      }
      className="w-full rounded-md bg-white dark:bg-black md:max-w-md md:border md:border-stone-200 md:shadow dark:md:border-stone-700"
    >
      <div className="relative flex flex-col space-y-4 p-5 md:p-10">
        <h2 className="font-cal text-2xl dark:text-white">
          Create your new AI
        </h2>

        {!isSubscriptionMode() || subscriptionPlan.isPro ? null : (
          <p className="text-sm text-stone-500 dark:text-stone-400">
            You can have up to 3 AIs for free.{" "}
            <Link
              href={labPath("/settings")}
              onClick={() => {
                modal?.hide();
              }}
              className="font-semibold underline decoration-stone-500 underline-offset-4 dark:decoration-stone-400"
            >
              Upgrade to{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                PRO
              </span>
            </Link>{" "}
            to create more.
          </p>
        )}

        {isSubscriptionMode() &&
        !subscriptionPlan.isPro &&
        currentAiCount >= 3 ? null : (
          <>
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-stone-500 dark:text-stone-400"
              >
                AI Name
              </label>
              <input
                name="name"
                type="text"
                autoFocus
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                maxLength={32}
                required
                className="w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-600 placeholder:text-stone-400 focus:border-black focus:outline-none focus:ring-black dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 dark:focus:ring-white"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="subdomain"
                className="text-sm font-medium text-stone-500"
              >
                URL for your AI
              </label>
              <div className="flex w-full max-w-md">
                {isSubdomainMode() ? null : (
                  <div className="flex items-center whitespace-nowrap rounded-l-lg border border-r-0 border-stone-200 bg-stone-100 px-3 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-400">
                    {process.env.NEXT_PUBLIC_ROOT_DOMAIN}/ai/
                  </div>
                )}
                <input
                  name="subdomain"
                  type="text"
                  value={data.subdomain}
                  onChange={(e) =>
                    setData({ ...data, subdomain: e.target.value })
                  }
                  autoCapitalize="off"
                  maxLength={32}
                  required
                  className={`w-full rounded-${
                    isSubdomainMode() ? "l" : "r"
                  }-lg border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-600 placeholder:text-stone-400 focus:border-black focus:outline-none focus:ring-black dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 dark:focus:ring-white`}
                />
                {isSubdomainMode() ? (
                  <div className="flex items-center rounded-r-lg border border-l-0 border-stone-200 bg-stone-100 px-3 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-400">
                    .{process.env.NEXT_PUBLIC_ROOT_DOMAIN}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="access"
                className="text-sm font-medium text-stone-500"
              >
                Access
              </label>
              <select
                name="access"
                defaultValue="private"
                onChange={(e) => setData({ ...data, access: e.target.value })}
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-600 placeholder:text-stone-400 focus:border-black focus:outline-none focus:ring-black dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 dark:focus:ring-white"
              >
                <option value="private">Private</option>
                <option value="members">Team</option>
                <option value="public">Public</option>
              </select>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {data.access === "private" ? (
                  "Only you can use and teach the AI."
                ) : data.access === "members" ? (
                  <>
                    You specify email addresses that can use or teach the AI.
                    Available in{" "}
                    <strong className="inline-block bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                      PRO
                    </strong>
                    .
                  </>
                ) : (
                  "Anyone can use the AI. Only you can teach it."
                )}
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="instructions"
                className="text-sm font-medium text-stone-500"
              >
                Instructions to the AI
              </label>
              <textarea
                name="instructions"
                value={data.instructions}
                placeholder="You are …"
                onChange={(e) =>
                  setData({ ...data, instructions: e.target.value })
                }
                maxLength={140}
                rows={3}
                className="w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-600 placeholder:text-stone-400 focus:border-black  focus:outline-none focus:ring-black dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700 dark:focus:ring-white"
              />
            </div>{" "}
          </>
        )}
      </div>
      <div className="flex items-center justify-end rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800 md:px-10">
        {isSubscriptionMode() &&
        !subscriptionPlan.isPro &&
        (currentAiCount >= 3 || data.access === "members") ? (
          <button
            className="flex h-10 w-full items-center justify-center space-x-2 rounded-md border border-black bg-black text-sm text-white transition-all hover:bg-white hover:text-black focus:outline-none dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800"
            onClick={(event) => {
              event.preventDefault();
              modal?.hide();
              router.push(labPath("/settings"));
            }}
          >
            <p>Upgrade to PRO</p>
          </button>
        ) : (
          <CreateAiFormButton />
        )}
      </div>
    </form>
  );
}
function CreateAiFormButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className={cn(
        "flex h-10 w-full items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none",
        pending
          ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
          : "border-black bg-black text-white hover:bg-white hover:text-black dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800",
      )}
      disabled={pending}
    >
      {pending ? <LoadingDots color="#808080" /> : <p>Create AI</p>}
    </button>
  );
}
