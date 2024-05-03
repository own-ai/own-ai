"use client";

import { Button } from "@/components/ui/button";
import { IconPlus, IconTrash } from "@/components/ui/icons";
import { ConversationStarter } from "@/lib/types";

export default function ConversationStartersConfiguration({
  starters,
  onUpdate,
}: {
  starters: ConversationStarter[];
  onUpdate: (starters: ConversationStarter[]) => void;
}) {
  return (
    <>
      {starters.map((starter) => (
        <div key={starter.key} className="flex w-full items-center space-x-2">
          <div className="flex max-w-lg flex-grow flex-col gap-1">
            <label
              htmlFor={`starter-${starter.key}-heading`}
              className="sr-only"
            >
              Description
            </label>
            <input
              type="text"
              name={`starter-${starter.key}-heading`}
              placeholder="Description"
              maxLength={500}
              value={starter.heading}
              onChange={(e) =>
                onUpdate(
                  starters.map((s) =>
                    s.key === starter.key
                      ? {
                          ...s,
                          heading: e.target.value,
                        }
                      : s,
                  ),
                )
              }
              className="w-full max-w-lg rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
            />
            <label
              htmlFor={`starter-${starter.key}-message`}
              className="sr-only"
            >
              Message
            </label>
            <input
              type="text"
              name={`starter-${starter.key}-message`}
              placeholder="Message"
              maxLength={500}
              value={starter.message}
              onChange={(e) =>
                onUpdate(
                  starters.map((s) =>
                    s.key === starter.key
                      ? {
                          ...s,
                          message: e.target.value,
                        }
                      : s,
                  ),
                )
              }
              className="w-full max-w-lg rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
            />
          </div>
          <Button
            variant="destructive"
            className="size-6 p-0"
            disabled={false}
            onClick={(e) => {
              e.preventDefault();
              const purgedStarters = starters.filter(
                (s) => s.key !== starter.key,
              );
              onUpdate(
                purgedStarters.length
                  ? purgedStarters
                  : [
                      {
                        key: 0,
                        heading: "",
                        message: "",
                      },
                    ],
              );
            }}
          >
            <IconTrash />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      ))}
      {starters.length >= 10 ? null : (
        <Button
          variant="secondary"
          className="size-6 p-0"
          disabled={false}
          onClick={(e) => {
            e.preventDefault();
            onUpdate([
              ...starters,
              {
                key: starters[starters.length - 1].key + 1,
                heading: "",
                message: "",
              },
            ]);
          }}
        >
          <IconPlus />
          <span className="sr-only">Add</span>
        </Button>
      )}
    </>
  );
}
