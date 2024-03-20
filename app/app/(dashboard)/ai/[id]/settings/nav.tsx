"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

export default function AiSettingsNav({
  id,
  isTeamAi,
}: {
  id: string;
  isTeamAi: boolean;
}) {
  const segment = useSelectedLayoutSegment();

  const navItems = [
    {
      name: "General",
      href: `/ai/${id}/settings`,
      segment: null,
    },
    {
      name: "Domains",
      href: `/ai/${id}/settings/domains`,
      segment: "domains",
    },
    {
      name: "Appearance",
      href: `/ai/${id}/settings/appearance`,
      segment: "appearance",
    },
  ];

  if (isTeamAi) {
    navItems.push({
      name: "Team",
      href: `/ai/${id}/settings/team`,
      segment: "team",
    });
  }

  return (
    <div className="flex space-x-4 border-b border-stone-200 pb-4 pt-2 dark:border-stone-700">
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          // Change style depending on whether the link is active
          className={cn(
            "rounded-md px-2 py-1 text-sm font-medium transition-colors active:bg-stone-200 dark:active:bg-stone-600",
            segment === item.segment
              ? "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
              : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800",
          )}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
}
