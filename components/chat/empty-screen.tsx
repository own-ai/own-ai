import { UseChatHelpers } from "ai/react";
import { MDXRemoteProps } from "next-mdx-remote";

import MDX from "@/components/mdx";
import { Button } from "@/components/ui/button";
import { IconArrowRight } from "@/components/ui/icons";
import { ConversationStarter } from "@/lib/types";

export function EmptyScreen({
  setInput,
  welcome,
  starters,
}: Pick<UseChatHelpers, "setInput"> & {
  welcome?: MDXRemoteProps | null;
  starters?: string | null;
}) {
  const exampleMessages: ConversationStarter[] = starters
    ? JSON.parse(starters)
    : [];

  if (!welcome && !exampleMessages?.length) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        {welcome ? <MDX source={welcome} /> : null}
        <div className="mt-4 flex flex-col items-start space-y-2">
          {(exampleMessages || []).map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
