"use client";

import { MessageSquare } from "lucide-react";
import * as React from "react";
import { z } from "zod";

import {
  AiChatComposer,
  AiChatComposerEditor,
  AiChatComposerSubmit,
  AiChatComposerToolbar,
} from "./ai-chat-composer";
import { useReviewState } from "./ai-review-utils";

const notesSchema = z.object({
  draft: z.string().max(2000),
  notes: z.array(z.string().min(1).max(2000)).max(40),
});
type Notes = z.infer<typeof notesSchema>;
const initialNotes: Notes = { draft: "", notes: [] };
const validNotes = (value: unknown): value is Notes =>
  notesSchema.safeParse(value).success;

/** CSS owns the split at every viewport; shell geometry never waits for JS. */
export function AiReviewArtifactWorkspace({
  context,
  children,
  storageKey,
}: {
  context: React.ReactNode;
  children: React.ReactNode;
  storageKey: string;
}) {
  const { value, setValue, ready, storageError } = useReviewState(
    storageKey,
    initialNotes,
    validNotes,
  );
  const full = value.notes.length >= 40;
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:grid lg:grid-cols-[clamp(220px,calc(50%_-_280px),640px)_minmax(0,1fr)] lg:overflow-hidden">
      <aside
        aria-label="Review conversation"
        className="bg-muted/20 flex min-h-0 shrink-0 flex-col border-b lg:border-r lg:border-b-0"
      >
        <div className="flex h-10 shrink-0 items-center gap-2 border-b px-4 text-xs font-medium">
          <MessageSquare className="size-4" aria-hidden="true" />
          Conversation
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4 max-lg:max-h-64">
          {context}
          {value.notes.length > 0 ? (
            <section
              aria-label="Saved review notes"
              className="flex flex-col gap-3"
            >
              <h2 className="text-muted-foreground text-xs">Your notes</h2>
              {value.notes.map((note, index) => (
                <p
                  key={index}
                  className="bg-background rounded-xl border p-3 text-sm leading-relaxed break-words whitespace-pre-wrap"
                >
                  {note}
                </p>
              ))}
            </section>
          ) : null}
        </div>
        <div className="shrink-0 p-3">
          <AiChatComposer
            aria-label="Add a review note"
            onSubmit={(event) => {
              event.preventDefault();
              if (!ready || full || !value.draft.trim()) return;
              setValue((previous) =>
                previous.notes.length >= 40 || !previous.draft.trim()
                  ? previous
                  : {
                      draft: "",
                      notes: [...previous.notes, previous.draft.trim()],
                    },
              );
            }}
          >
            <AiChatComposerEditor
              aria-label="Review note"
              placeholder="Add a review note…"
              value={value.draft}
              maxLength={2000}
              disabled={!ready || full}
              onChange={(event) =>
                setValue((previous) => ({
                  ...previous,
                  draft: event.target.value,
                }))
              }
            />
            <AiChatComposerToolbar>
              <span className="text-muted-foreground flex-1 text-[11px]">
                {full ? "40-note limit reached" : "Saved in this browser"}
              </span>
              <AiChatComposerSubmit
                aria-label="Save review note"
                disabled={!ready || full || !value.draft.trim()}
              />
            </AiChatComposerToolbar>
          </AiChatComposer>
          {storageError ? (
            <p role="status" className="text-destructive mt-2 text-xs">
              {storageError}
            </p>
          ) : null}
        </div>
      </aside>
      <section
        aria-label="Review artifact"
        className="bg-background flex min-h-[740px] min-w-0 shrink-0 flex-col lg:min-h-0"
      >
        {children}
      </section>
    </div>
  );
}
