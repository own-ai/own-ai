"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { useMounted } from "@/lib/hooks/use-mounted";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [_, startTransition] = React.useTransition();
  const mounted = useMounted();

  if (!mounted || !theme) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-lg p-1.5 text-stone-700 transition-all duration-150 ease-in-out hover:bg-stone-200 active:bg-stone-300 dark:text-white dark:hover:bg-stone-700 dark:active:bg-stone-800"
      onClick={() => {
        startTransition(() => {
          setTheme(theme === "light" ? "dark" : "light");
        });
      }}
      title="Toggle theme"
    >
      {theme === "dark" ? (
        <Moon className="transition-all" width={18} />
      ) : (
        <Sun className="transition-all" width={18} />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
