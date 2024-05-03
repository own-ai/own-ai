"use client";

import {
  EditorBubble,
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorContent,
  EditorRoot,
  JSONContent,
} from "novel";
import { Placeholder, handleCommandNavigation } from "novel/extensions";
import { useState } from "react";

import { editorExtensions } from "@/lib/editor/extensions";
import { LinkSelector } from "@/lib/editor/link-selector";
import { NodeSelector } from "@/lib/editor/node-selector";
import { slashCommand, suggestionItems } from "@/lib/editor/slash-command";
import { TextButtons } from "@/lib/editor/text-buttons";

export default function Editor({
  className,
  initialContent,
  onUpdate,
  emptyEditorPlaceholder,
  emptyLinePlaceholder,
}: {
  className?: string;
  initialContent?: JSONContent | string;
  onUpdate?: (markdown: string) => void;
  emptyEditorPlaceholder?: string;
  emptyLinePlaceholder?: string;
}) {
  const [isNodeSelectorOpen, setNodeSelectorOpen] = useState(false);
  const [isLinkSelectorOpen, setLinkSelectorOpen] = useState(false);

  const extensions = [...editorExtensions, slashCommand];

  if (emptyEditorPlaceholder || emptyLinePlaceholder) {
    extensions.push(
      Placeholder.configure({
        placeholder: ({ pos }) => {
          if (emptyEditorPlaceholder && pos === 0) {
            return emptyEditorPlaceholder;
          }
          return emptyLinePlaceholder || "";
        },
      }),
    );
  }

  return (
    <EditorRoot>
      <EditorContent
        className={className}
        extensions={extensions}
        initialContent={initialContent as any}
        onUpdate={({ editor }) => {
          if (onUpdate) {
            onUpdate(editor.storage.markdown.getMarkdown());
          }
        }}
        editorProps={{
          handleDOMEvents: {
            keydown: (_view, event) => handleCommandNavigation(event),
          },
          attributes: {
            class:
              "prose dark:prose-invert prose-headings:font-cal font-default focus:outline-none max-w-full",
          },
        }}
      >
        <EditorCommand className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
          <EditorCommandEmpty className="px-2 text-muted-foreground">
            No results
          </EditorCommandEmpty>
          {suggestionItems.map((item) => (
            <EditorCommandItem
              value={item.title}
              onCommand={(val) => item.command?.(val)}
              className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
              key={item.title}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                {item.icon}
              </div>
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </EditorCommandItem>
          ))}
        </EditorCommand>
        <EditorBubble
          tippyOptions={{
            placement: "top",
          }}
          className="flex w-fit max-w-[90vw] rounded border border-muted bg-background shadow-md"
        >
          <NodeSelector
            open={isNodeSelectorOpen}
            onOpenChange={setNodeSelectorOpen}
          />
          <LinkSelector
            open={isLinkSelectorOpen}
            onOpenChange={setLinkSelectorOpen}
          />
          <TextButtons />
        </EditorBubble>
      </EditorContent>
    </EditorRoot>
  );
}
