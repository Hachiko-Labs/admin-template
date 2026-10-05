"use client";

import { ArrowUpRight, Files } from "lucide-react";
import * as React from "react";

import {
  AiChatComposer,
  AiChatComposerEditor,
  AiChatComposerSubmit,
  AiChatComposerToolbar,
  AiChatComposerToolbarGroup,
} from "@/components/ai-chat/ai-chat-composer";
import { AiChatMessage } from "@/components/ai-chat/ai-chat-message";
import {
  AiConversationScroller,
  AiConversationTurn,
} from "@/components/ai-chat/ai-conversation-scroller";
import {
  answerDeliverableQuestion,
  deliverableFiles,
  type DeliverableSession,
} from "@/components/ai-chat/ai-deliverable-data";
import { AnimatedAgentBlob } from "@/components/ai-chat/animated-agent-blob";
import { Button } from "@/components/ui/button";

const avatar = (
  <AnimatedAgentBlob
    className="size-7"
    colors={["#050505", "#334155", "#050505"]}
    silhouette="squircle"
    decorative
  />
);
const assistantHeader = (
  <span className="text-xs font-medium">Shadcnblocks AI</span>
);
export function AiDeliverableConversation({
  session,
  selectedId,
  onOpenFiles,
}: {
  session: DeliverableSession;
  selectedId: string | null;
  onOpenFiles: () => void;
}) {
  const [draft, setDraft] = React.useState("");
  const [turns, setTurns] = React.useState<
    { id: string; question: string; answer: string; stopped?: boolean }[]
  >([]);
  const [run, setRun] = React.useState<{
    id: string;
    words: string[];
    offset: number;
  } | null>(null);
  const selected = deliverableFiles.find(
    (file) => file.id === selectedId && file.sessionId === session.id,
  );
  React.useEffect(() => {
    if (!run) return;
    const timer = window.setTimeout(
      () => {
        const offset = Math.min(run.offset + 1, run.words.length);
        setTurns((previous) =>
          previous.map((turn) =>
            turn.id === run.id
              ? { ...turn, answer: run.words.slice(0, offset).join("") }
              : turn,
          ),
        );
        setRun(offset === run.words.length ? null : { ...run, offset });
      },
      run.offset === 0 ? 400 : 38,
    );
    return () => window.clearTimeout(timer);
  }, [run]);
  function submit(question: string) {
    if (!question.trim() || run) return;
    const id =
      globalThis.crypto?.randomUUID?.() ??
      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    const answer = answerDeliverableQuestion(question, session.id, selectedId);
    setTurns((previous) => [
      ...previous,
      { id, question: question.trim(), answer: "" },
    ]);
    setRun({ id, words: answer.match(/\S+\s*|\s+/g) ?? [], offset: 0 });
    setDraft("");
  }
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center border-b px-5">
        <h2 className="truncate text-sm font-medium">{session.title}</h2>
      </header>
      <AiConversationScroller
        showScrollButton={turns.length > 0}
        itemized
        contentClassName="mx-auto w-full max-w-2xl px-5 py-7"
      >
        <AiConversationTurn id="deliverable-origin">
          <AiChatMessage
            message={{
              id: "origin-user",
              role: "user",
              parts: [{ type: "text", text: session.prompt }],
            }}
          />
          <AiChatMessage
            message={{
              id: "origin-assistant",
              role: "assistant",
              parts: [{ type: "text", text: session.answer }],
            }}
            assistantAvatar={avatar}
            assistantHeader={assistantHeader}
            actions={
              <Button variant="outline" onClick={onOpenFiles}>
                <Files data-icon="inline-start" />
                View 3 deliverables
                <ArrowUpRight data-icon="inline-end" />
              </Button>
            }
          />
        </AiConversationTurn>
        {turns.map((turn) => (
          <AiConversationTurn key={turn.id} id={turn.id} className="pt-7">
            <AiChatMessage
              message={{
                id: turn.id + "-user",
                role: "user",
                parts: [{ type: "text", text: turn.question }],
              }}
            />
            <AiChatMessage
              status={
                run?.id === turn.id
                  ? run.offset === 0
                    ? "thinking"
                    : "streaming"
                  : "complete"
              }
              message={{
                id: turn.id + "-assistant",
                role: "assistant",
                parts: [{ type: "text", text: turn.answer }],
              }}
              assistantAvatar={avatar}
              assistantHeader={assistantHeader}
              actions={
                turn.stopped ? (
                  <span className="text-muted-foreground text-xs">
                    Response stopped
                  </span>
                ) : undefined
              }
            />
          </AiConversationTurn>
        ))}
      </AiConversationScroller>
      <div className="mx-auto flex w-full max-w-2xl shrink-0 flex-col gap-3 px-4 pt-3 pb-4">
        {selected && (
          <div>
            <Button
              variant="outline"
              size="sm"
              disabled={Boolean(run)}
              onClick={() => submit("Summarize this file")}
            >
              Summarize this file
            </Button>
          </div>
        )}
        <AiChatComposer
          aria-label="Ask about deliverables"
          onSubmit={(event) => {
            event.preventDefault();
            submit(draft);
          }}
        >
          <AiChatComposerEditor
            aria-label="Deliverable question"
            className="min-h-16"
            placeholder={
              selected ? "Ask about this file…" : "Ask about the deliverables…"
            }
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <AiChatComposerToolbar>
            <AiChatComposerToolbarGroup>
              <span className="text-muted-foreground max-w-52 truncate text-[11px]">
                {selected?.name ?? "3 files in this conversation"}
              </span>
            </AiChatComposerToolbarGroup>
            <AiChatComposerSubmit
              status={run ? "streaming" : "ready"}
              disabled={!draft.trim()}
              onStop={() => {
                if (run)
                  setTurns((previous) =>
                    previous.map((turn) =>
                      turn.id === run.id ? { ...turn, stopped: true } : turn,
                    ),
                  );
                setRun(null);
              }}
            />
          </AiChatComposerToolbar>
        </AiChatComposer>
        <p className="text-muted-foreground text-center text-[10px]">
          Prepared demo files and streamed replies
        </p>
      </div>
    </div>
  );
}
