"use client";

import va from "@vercel/analytics";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import Editor from "@/components/editor";
import LoadingDots from "@/components/icons/loading-dots";
import type { AiMember, ConversationStarter } from "@/lib/types";
import { cn } from "@/lib/utils";

import ConversationStartersConfiguration from "./conversation-starters-configuration";
import DomainConfiguration from "./domain-configuration";
import DomainStatus from "./domain-status";
import MembersConfiguration from "./members-configuration";
import Uploader from "./uploader";

export default function Form({
  title,
  description,
  helpText,
  inputAttrs,
  handleSubmit,
  needsPro,
  hasPro,
  contactUs,
}: {
  title: string;
  description: string;
  helpText?: string;
  inputAttrs: {
    name: string;
    type: string;
    defaultValue: string;
    placeholder?: string;
    maxLength?: number;
    pattern?: string;
    disabled?: boolean;
    options?: { key: string; label: string }[];
  };
  handleSubmit: any;
  needsPro?: boolean;
  hasPro?: boolean;
  contactUs?: boolean;
}) {
  const { id } = useParams() as { id?: string };
  const router = useRouter();
  const { update } = useSession();
  const [welcome, setWelcome] = useState(
    inputAttrs.name === "welcome" ? inputAttrs.defaultValue : null,
  );
  const [members, setMembers] = useState<AiMember[]>(
    inputAttrs.name === "members" &&
      !["null", "[]"].includes(inputAttrs.defaultValue)
      ? JSON.parse(inputAttrs.defaultValue)
      : [
          {
            key: 0,
            email: "",
            role: "user",
          },
        ],
  );
  const [starters, setStarters] = useState<ConversationStarter[]>(
    inputAttrs.name === "starters" &&
      !["null", "[]"].includes(inputAttrs.defaultValue)
      ? JSON.parse(inputAttrs.defaultValue)
      : [
          {
            key: 0,
            heading: "",
            message: "",
          },
        ],
  );
  const [needsProState, setNeedsProState] = useState(!!needsPro);

  return (
    <form
      action={async (data: FormData) => {
        if (
          inputAttrs.name === "ownDomain" &&
          inputAttrs.defaultValue &&
          data.get("ownDomain") !== inputAttrs.defaultValue &&
          !confirm("Are you sure you want to change your domain?")
        ) {
          return;
        }

        if (inputAttrs.name === "welcome") {
          data.append("welcome", welcome ?? "");
        }
        if (inputAttrs.name === "members") {
          data.append(
            "members",
            JSON.stringify(members.filter((m) => m.email)),
          );
        }
        if (inputAttrs.name === "starters") {
          data.append(
            "starters",
            JSON.stringify(starters.filter((s) => s.heading && s.message)),
          );
        }

        handleSubmit(data, id, inputAttrs.name).then(async (res: any) => {
          if (res.error) {
            toast.error(res.error);
          } else {
            va.track(`Updated ${inputAttrs.name}`, id ? { id } : {});
            if (id) {
              router.refresh();
            } else {
              await update();
              router.refresh();
            }
            toast.success("Saved successfully");
          }
        });
      }}
      className="rounded-lg border border-stone-200 bg-white dark:border-stone-700 dark:bg-black"
    >
      <div className="relative flex flex-col space-y-4 p-5 sm:p-10">
        <h2 className="font-cal text-xl dark:text-white">{title}</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {description}
        </p>
        {inputAttrs.name === "image" ? (
          <Uploader
            defaultValue={inputAttrs.defaultValue}
            name={inputAttrs.name}
          />
        ) : inputAttrs.name === "access" ? (
          <>
            <select
              name="access"
              defaultValue={inputAttrs.defaultValue}
              className="w-full max-w-md rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
              onChange={(e) => {
                setNeedsProState(e.target.value === "members");
              }}
            >
              <option value="private">Private</option>
              <option value="members">Team</option>
              <option value="public">Public</option>
            </select>
            {needsProState && inputAttrs.defaultValue === "members" ? (
              <div className="text-sm text-stone-500 dark:text-stone-400">
                Please go to the{" "}
                <Link
                  href={`/ai/${id}/settings/team`}
                  className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
                >
                  Team tab
                </Link>{" "}
                to manage your team members.
              </div>
            ) : null}
          </>
        ) : inputAttrs.name === "model" ? (
          <select
            name="model"
            defaultValue={inputAttrs.defaultValue}
            className="w-full max-w-md rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
          >
            {(inputAttrs.options || []).map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        ) : inputAttrs.name === "subdomain" ? (
          <div className="flex w-full max-w-md">
            <input
              {...inputAttrs}
              required
              className="z-10 flex-1 rounded-l-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
            />
            <div className="flex items-center rounded-r-md border border-l-0 border-stone-300 bg-stone-100 px-3 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-400">
              .{process.env.NEXT_PUBLIC_ROOT_DOMAIN}
            </div>
          </div>
        ) : inputAttrs.name === "ownDomain" ? (
          <>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Please enter a domain that you <strong>already own</strong>.
              Contact us if you need help registering a domain.
            </p>
            <div className="relative flex w-full max-w-md">
              <input
                {...inputAttrs}
                className="z-10 flex-1 rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
              />
              {inputAttrs.defaultValue && (
                <div className="absolute right-3 z-10 flex h-full items-center">
                  <DomainStatus domain={inputAttrs.defaultValue} />
                </div>
              )}
            </div>
          </>
        ) : inputAttrs.name === "instructions" ? (
          <textarea
            {...inputAttrs}
            rows={3}
            required
            className="w-full rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
          />
        ) : inputAttrs.name === "welcome" ? (
          <Editor
            className="relative block w-full rounded-md border border-stone-300 p-6 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
            initialContent={inputAttrs.defaultValue || ""}
            onUpdate={(markdown) => {
              setWelcome(markdown);
            }}
            emptyEditorPlaceholder="Please write a friendly welcome message here"
            emptyLinePlaceholder="Press / for formatting options"
          />
        ) : inputAttrs.name === "members" ? (
          <MembersConfiguration
            members={members}
            onUpdate={(members) => setMembers(members)}
          />
        ) : inputAttrs.name === "starters" ? (
          <ConversationStartersConfiguration
            starters={starters}
            onUpdate={(starters) => setStarters(starters)}
          />
        ) : (
          <input
            {...inputAttrs}
            required
            className={cn(
              "w-full max-w-md rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700",
              inputAttrs.disabled ? "bg-stone-50 dark:bg-stone-800" : null,
            )}
          />
        )}
      </div>
      {inputAttrs.name === "ownDomain" && inputAttrs.defaultValue && (
        <DomainConfiguration domain={inputAttrs.defaultValue} />
      )}
      <div className="flex flex-col items-center justify-center space-y-2 rounded-b-lg border-t border-stone-200 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-800 sm:flex-row sm:justify-between sm:space-y-0 sm:px-10">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {helpText ||
            (needsProState && !hasPro ? (
              <>
                Available in{" "}
                <strong className="inline-block bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                  PRO
                </strong>
              </>
            ) : null)}
        </p>
        {needsProState && !hasPro ? (
          <button
            className="flex h-8 w-32 items-center justify-center space-x-2 rounded-md border border-black bg-black text-sm text-white transition-all hover:bg-white hover:text-black focus:outline-none dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800 sm:h-10"
            onClick={(event) => {
              event.preventDefault();
              router.push("/settings");
            }}
          >
            <p>Upgrade to PRO</p>
          </button>
        ) : contactUs ? (
          <button
            className="flex h-8 w-32 items-center justify-center space-x-2 rounded-md border border-black bg-black text-sm text-white transition-all hover:bg-white hover:text-black focus:outline-none dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800 sm:h-10"
            onClick={(event) => {
              event.preventDefault();
              window.location.href = "mailto:info@ownai.com";
            }}
          >
            <p>Contact us</p>
          </button>
        ) : (
          <FormButton />
        )}
      </div>
    </form>
  );
}

function FormButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className={cn(
        "flex h-8 w-32 items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none sm:h-10",
        pending
          ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
          : "border-black bg-black text-white hover:bg-white hover:text-black dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800",
      )}
      disabled={pending}
    >
      {pending ? <LoadingDots color="#808080" /> : <p>Save Changes</p>}
    </button>
  );
}
