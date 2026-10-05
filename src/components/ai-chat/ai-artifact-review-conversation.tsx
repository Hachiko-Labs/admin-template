"use client";

import { FileText } from "lucide-react";
import * as React from "react";

import {
  type ArtifactRevision,
  compareArtifactSnapshots,
  type VersionedArtifact,
} from "@/components/ai-chat/ai-artifact-version-data";
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
import { AnimatedAgentBlob } from "@/components/ai-chat/animated-agent-blob";
import { Button } from "@/components/ui/button";

export function AiArtifactReviewConversation({
  artifact,
  selected,
  baseline,
  current,
  onCompare,
}: {
  artifact: VersionedArtifact;
  selected: ArtifactRevision;
  baseline: ArtifactRevision;
  current: ArtifactRevision;
  onCompare: () => void;
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
  function stop() {
    if (!run) return;
    setTurns((previous) =>
      previous.map((turn) =>
        turn.id === run.id ? { ...turn, stopped: true } : turn,
      ),
    );
    setRun(null);
  }
  function submit(question: string) {
    if (!question.trim() || run) return;
    const restore = /restor|revert|roll.?back/i.test(question);
    const from = restore ? current : baseline;
    const changes = compareArtifactSnapshots(
      from.snapshot,
      selected.snapshot,
    ).filter((item) => item.kind !== "unchanged");
    const supported =
      /chang|compar|differ|restor|revert|roll.?back|summari|summary|review/i.test(
        question,
      );
    const context = `Comparing **v${from.number} → v${selected.number}** of ${artifact.filename}.`;
    const details = changes
      .map(
        (item) =>
          `- **${item.title}:** ${item.kind === "removed" ? `Removed in v${selected.number}.` : item.kind === "added" ? `Added in v${selected.number}. ` : ""}${item.after ? (item.after.match(/^.*?[.!?](?:\s|$)/)?.[0] ?? item.after).trim() : ""}`,
      )
      .join("\n\n");
    const answer = !supported
      ? `${context}\n\nThis demo can summarize version changes and explain restore effects. Try “What changed?” or “What would restoring this version change?”`
      : `${context}\n\n${changes.length ? `${changes.length} sections differ. ${restore ? `Restoring would save the selected content as v${current.number + 1}, keeping earlier versions.` : "Here are the key differences:"}\n\n${details}` : "These versions have identical content. No restore is needed."}`;
    const id =
      globalThis.crypto?.randomUUID?.() ??
      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    setRun({ id, words: answer.match(/\S+\s*|\s+/g) ?? [], offset: 0 });
    setTurns((previous) => [
      ...previous,
      { id, question: question.trim(), answer: "" },
    ]);
    setDraft("");
  }
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between border-b px-5">
        <h2 className="text-sm font-medium">Conversation</h2>
        <span className="text-muted-foreground text-xs">Artifact review</span>
      </div>
      <AiConversationScroller
        itemized
        contentClassName="mx-auto w-full max-w-2xl px-5 py-7"
      >
        <AiConversationTurn id="review-intro">
          <AiChatMessage
            message={{
              id: "review-request",
              role: "user",
              parts: [
                {
                  type: "text",
                  text: `Help me review ${artifact.filename} before we share it. What changed, and is there anything we should bring back?`,
                },
              ],
            }}
          />
          <AiChatMessage
            message={{
              id: "review-intro",
              role: "assistant",
              parts: [
                {
                  type: "text",
                  text: "I’ve opened the artifact and its saved versions. We can review the differences before deciding which version to keep.",
                },
              ],
            }}
            assistantAvatar={
              <AnimatedAgentBlob
                className="size-7"
                colors={["#050505", "#334155", "#050505"]}
                silhouette="squircle"
                decorative
              />
            }
            assistantHeader={
              <span className="text-xs font-medium">Shadcnblocks AI</span>
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
              actions={
                turn.stopped ? (
                  <span className="text-muted-foreground text-xs">
                    Response stopped
                  </span>
                ) : undefined
              }
              message={{
                id: turn.id + "-answer",
                role: "assistant",
                parts: [{ type: "text", text: turn.answer }],
              }}
              assistantAvatar={
                <AnimatedAgentBlob
                  className="size-7"
                  colors={["#050505", "#334155", "#050505"]}
                  silhouette="squircle"
                  decorative
                />
              }
              assistantHeader={
                <span className="text-xs font-medium">Shadcnblocks AI</span>
              }
            />
          </AiConversationTurn>
        ))}
      </AiConversationScroller>
      <div className="mx-auto w-full max-w-2xl shrink-0 px-4 pt-3 pb-4">
        <div className="mb-3 flex flex-wrap gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            disabled={Boolean(run)}
            onClick={() => {
              onCompare();
              submit("What changed between these versions?");
            }}
          >
            Explain changes
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            disabled={Boolean(run)}
            onClick={() => submit("What would restoring this version change?")}
          >
            Restore impact
          </Button>
        </div>
        <AiChatComposer
          aria-label="Ask about artifact versions"
          onSubmit={(event) => {
            event.preventDefault();
            submit(draft);
          }}
        >
          <AiChatComposerEditor
            aria-label="Artifact review question"
            className="min-h-16"
            placeholder="Ask about these changes…"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <AiChatComposerToolbar>
            <AiChatComposerToolbarGroup>
              <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                <FileText className="size-3.5" />v{baseline.number} → v
                {selected.number}
              </span>
            </AiChatComposerToolbarGroup>
            <AiChatComposerSubmit
              status={run ? "streaming" : "ready"}
              onStop={stop}
              disabled={!draft.trim()}
            />
          </AiChatComposerToolbar>
        </AiChatComposer>
        <p className="text-muted-foreground mt-2 text-center text-[10px]">
          Demo answers from saved versions · no live model
        </p>
      </div>
    </div>
  );
}
