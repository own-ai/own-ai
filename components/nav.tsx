"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Edit3,
  LayoutDashboard,
  Menu,
  Newspaper,
  Settings,
} from "lucide-react";
import {
  useParams,
  usePathname,
  useSelectedLayoutSegments,
} from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { getAiIdFromKnowledgeId, getIsUserAiOwner } from "@/lib/actions/app";
import Image from "next/image";

const externalLinks: {
  name: string;
  href: string;
  icon: JSX.Element;
}[] = [];

export default function Nav({ children }: { children: ReactNode }) {
  const segments = useSelectedLayoutSegments();
  const firstSegment = segments[0];
  const { id } = useParams() as { id?: string };

  const [aiId, setAiId] = useState<string | null>();
  const [isAiOwner, setIsAiOwner] = useState<boolean | null>();

  useEffect(() => {
    if (firstSegment === "knowledge" && id) {
      getAiIdFromKnowledgeId(id).then((aiId) => {
        setAiId(aiId);
      });
    }
    if (firstSegment === "ai" && id) {
      getIsUserAiOwner(id).then((isOwner) => {
        setIsAiOwner(isOwner);
      });
    }
  }, [firstSegment, id]);

  const tabs = useMemo(() => {
    if (segments[0] === "ai" && id) {
      const items = [
        {
          name: "Back to your AIs",
          href: "/ais",
          icon: <ArrowLeft width={18} />,
        },
        {
          name: "AI Knowledge",
          href: `/ai/${id}`,
          isActive: segments.length === 2,
          icon: <Newspaper width={18} />,
        },
      ];
      if (isAiOwner) {
        items.push({
          name: "AI Settings",
          href: `/ai/${id}/settings`,
          isActive: segments.includes("settings"),
          icon: <Settings width={18} />,
        });
      }
      return items;
    } else if (segments[0] === "knowledge" && id) {
      return [
        {
          name: "Back to the AI",
          href: aiId ? `/ai/${aiId}` : "/ais",
          icon: <ArrowLeft width={18} />,
        },
        {
          name: "Knowledge Editor",
          href: `/knowledge/${id}`,
          isActive: segments.length === 2,
          icon: <Edit3 width={18} />,
        },
        {
          name: "Knowledge Settings",
          href: `/knowledge/${id}/settings`,
          isActive: segments.includes("settings"),
          icon: <Settings width={18} />,
        },
      ];
    }
    return [
      {
        name: "Overview",
        href: "/",
        isActive: segments.length === 0,
        icon: <LayoutDashboard width={18} />,
      },
      {
        name: "AIs",
        href: "/ais",
        isActive: segments[0] === "ais",
        icon: <Bot width={18} />,
      },
      {
        name: "Settings",
        href: "/settings",
        isActive: segments[0] === "settings",
        icon: <Settings width={18} />,
      },
    ];
  }, [segments, id, aiId, isAiOwner]);

  const [showSidebar, setShowSidebar] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    // hide sidebar on path change
    setShowSidebar(false);
  }, [pathname]);

  return (
    <>
      <button
        className={`fixed z-20 ${
          // left align for Editor, right align for other pages
          segments[0] === "knowledge" && segments.length === 2 && !showSidebar
            ? "left-5 top-5"
            : "right-5 top-7"
        } sm:hidden`}
        onClick={() => setShowSidebar(!showSidebar)}
      >
        <Menu width={20} />
      </button>
      <div
        className={`transform ${
          showSidebar ? "w-full translate-x-0" : "-translate-x-full"
        } fixed z-10 flex h-full flex-col justify-between border-r border-stone-200 bg-stone-100 p-4 transition-all dark:border-stone-700 dark:bg-stone-900 sm:w-60 sm:translate-x-0`}
      >
        <div className="grid gap-2">
          <div className="flex items-center space-x-2 rounded-lg py-1.5">
            <Link
              href="/"
              className="rounded-lg p-2 hover:bg-stone-200 dark:hover:bg-stone-700"
            >
              <Image
                src="/logo.png"
                width={48}
                height={48}
                alt="Logo"
                className="dark:invert"
              />
            </Link>
          </div>
          <div className="grid gap-1">
            {tabs.map(({ name, href, isActive, icon }) => (
              <Link
                key={name}
                href={href}
                className={`flex items-center space-x-3 ${
                  isActive ? "bg-stone-200 text-black dark:bg-stone-700" : ""
                } rounded-lg px-2 py-1.5 transition-all duration-150 ease-in-out hover:bg-stone-200 active:bg-stone-300 dark:text-white dark:hover:bg-stone-700 dark:active:bg-stone-800`}
              >
                {icon}
                <span className="text-sm font-medium">{name}</span>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="grid gap-1">
            {externalLinks.map(({ name, href, icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg px-2 py-1.5 transition-all duration-150 ease-in-out hover:bg-stone-200 active:bg-stone-300 dark:text-white dark:hover:bg-stone-700 dark:active:bg-stone-800"
              >
                <div className="flex items-center space-x-3">
                  {icon}
                  <span className="text-sm font-medium">{name}</span>
                </div>
                <p>↗</p>
              </a>
            ))}
          </div>
          <div className="my-2 border-t border-stone-200 dark:border-stone-700" />
          {children}
        </div>
      </div>
    </>
  );
}
