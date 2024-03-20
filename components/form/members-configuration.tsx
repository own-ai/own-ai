"use client";

import type { AiMember, AiMemberRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { IconPlus, IconTrash } from "@/components/ui/icons";

export default function MembersConfiguration({
  members,
  onUpdate,
}: {
  members: AiMember[];
  onUpdate: (members: AiMember[]) => void;
}) {
  return (
    <>
      {members.map((member) => (
        <div key={member.key} className="flex w-full items-center space-x-2">
          <div className="flex max-w-lg flex-grow flex-col gap-1">
            <label htmlFor={`member-${member.key}-email`} className="sr-only">
              E-mail address
            </label>
            <input
              type="email"
              name={`member-${member.key}-email`}
              placeholder="E-mail address"
              maxLength={500}
              value={member.email}
              onChange={(e) =>
                onUpdate(
                  members.map((m) =>
                    m.key === member.key
                      ? {
                          ...m,
                          email: e.target.value,
                        }
                      : m,
                  ),
                )
              }
              className="w-full max-w-lg rounded-md border border-stone-300 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
            />
            <label htmlFor={`member-${member.key}-role`} className="sr-only">
              Role
            </label>
            <select
              name={`member-${member.key}-role`}
              defaultValue={member.role}
              onChange={(e) =>
                onUpdate(
                  members.map((m) =>
                    m.key === member.key
                      ? {
                          ...m,
                          role: e.target.value as AiMemberRole,
                        }
                      : m,
                  ),
                )
              }
              className="w-full max-w-lg rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-900 placeholder-stone-300 focus:border-stone-500 focus:outline-none focus:ring-stone-500 dark:border-stone-600 dark:bg-black dark:text-white dark:placeholder-stone-700"
            >
              <option value="user">can use the AI</option>
              <option value="teacher">can use the AI and edit knowledge</option>
            </select>
          </div>
          <Button
            variant="destructive"
            className="size-6 p-0"
            disabled={false}
            onClick={(e) => {
              e.preventDefault();
              const updatedMembers = members.filter(
                (m) => m.key !== member.key,
              );
              onUpdate(
                updatedMembers.length
                  ? updatedMembers
                  : [
                      {
                        key: 0,
                        email: "",
                        role: "user",
                      },
                    ],
              );
            }}
          >
            <IconTrash />
            <span className="sr-only">Remove</span>
          </Button>
        </div>
      ))}
      {members.length >= 500 ? null : (
        <Button
          variant="secondary"
          className="size-6 p-0"
          disabled={false}
          onClick={(e) => {
            e.preventDefault();
            onUpdate([
              ...members,
              {
                key: members[members.length - 1].key + 1,
                email: "",
                role: "user",
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
