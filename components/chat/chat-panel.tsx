import * as React from "react";
import { shareChat } from "@/lib/actions/chat";
import { Button } from "@/components/ui/button";
import { PromptForm } from "@/components/chat/prompt-form";
import { ButtonScrollToBottom } from "@/components/chat/button-scroll-to-bottom";
import { IconShare } from "@/components/ui/icons";
import { FooterText } from "@/components/chat/footer";
import { ChatShareDialog } from "@/components/chat/chat-share-dialog";
import { useAIState, useActions, useUIState } from "ai/rsc";
import type { AI } from "@/lib/actions/ai";
import { nanoid } from "nanoid";
import { UserMessage } from "@/components/aiui";
import { ConversationStarter } from "@/lib/types";
import { toast } from "sonner";

export interface ChatPanelProps {
  id?: string;
  title?: string;
  input: string;
  setInput: (value: string) => void;
  starters?: string | null;
  isAtBottom: boolean;
  scrollToBottom: () => void;
}

export function ChatPanel({
  id,
  title,
  input,
  setInput,
  starters,
  isAtBottom,
  scrollToBottom,
}: ChatPanelProps) {
  const [aiState] = useAIState();
  const [messages, setMessages] = useUIState<typeof AI>();
  const { submitUserMessage } = useActions();
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);

  const exampleMessages: ConversationStarter[] = starters
    ? JSON.parse(starters)
    : [];

  return (
    <div className="fixed inset-x-0 bottom-0 w-full bg-gradient-to-b from-background/0 to-background/100 duration-300 ease-in-out animate-in peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
      <ButtonScrollToBottom
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />

      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <div className="mb-4 grid grid-cols-2 gap-2 px-4 sm:px-0">
          {messages.length === 0 &&
            (exampleMessages || []).map((example, index) => (
              <div
                key={example.heading}
                className={`cursor-pointer rounded-lg border bg-white p-4 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 ${
                  index > 1 && "hidden md:block"
                }`}
                onClick={async () => {
                  setMessages((currentMessages) => [
                    ...currentMessages,
                    {
                      id: nanoid(),
                      display: <UserMessage>{example.message}</UserMessage>,
                    },
                  ]);

                  try {
                    const responseMessage = await submitUserMessage(
                      example.message,
                    );
                    setMessages((currentMessages) => [
                      ...currentMessages,
                      responseMessage,
                    ]);
                  } catch (error: any) {
                    toast.error(error);
                  }
                }}
              >
                <div className="text-sm font-semibold">{example.heading}</div>
              </div>
            ))}
        </div>

        {messages?.length >= 2 ? (
          <div className="flex h-12 items-center justify-center">
            <div className="flex space-x-2">
              {id && title ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShareDialogOpen(true)}
                  >
                    <IconShare className="mr-2" />
                    Share
                  </Button>
                  <ChatShareDialog
                    open={shareDialogOpen}
                    onOpenChange={setShareDialogOpen}
                    onCopy={() => setShareDialogOpen(false)}
                    shareChat={shareChat}
                    chat={{
                      id,
                      title,
                      messages: aiState.messages,
                    }}
                  />
                </>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
          <PromptForm input={input} setInput={setInput} />
          <FooterText className="hidden sm:block" />
        </div>
      </div>
    </div>
  );
}
