import * as React from "react";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn(className)}>
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Bot />
          <p className="text-center text-sm leading-loose md:text-left">
            ownAI ·{" "}
            <a
              href="/privacy"
              className="font-medium underline underline-offset-4"
            >
              Privacy
            </a>{" "}
            ·{" "}
            <a
              href="/legal"
              className="font-medium underline underline-offset-4"
            >
              Legal Notice / Impressum
            </a>{" "}
            ·{" "}
            <a
              href="https://github.com/own-ai"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
