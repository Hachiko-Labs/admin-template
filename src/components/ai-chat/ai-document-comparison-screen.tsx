"use client";

import {
  ArrowLeftRight,
  Check,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";
import * as React from "react";

import {
  type ArtifactDifference,
  artifactWordChanges,
  compareArtifactSnapshots,
} from "@/components/ai-chat/ai-artifact-version-data";
import {
  AiChatComposer,
  AiChatComposerEditor,
  AiChatComposerSubmit,
  AiChatComposerToolbar,
} from "@/components/ai-chat/ai-chat-composer";
import { AiChatMessage } from "@/components/ai-chat/ai-chat-message";
import {
  AiConversationScroller,
  AiConversationTurn,
} from "@/components/ai-chat/ai-conversation-scroller";
import {
  comparisonAnswer,
  comparisonDocuments,
  comparisonScope,
} from "@/components/ai-chat/ai-document-comparison-data";
import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Turn = { id: string; question: string; answer: string };
function Passage({
  difference,
  side,
}: {
  difference: ArtifactDifference;
  side: "before" | "after";
}) {
  if (difference[side] === undefined)
    return (
      <p className="text-muted-foreground text-sm italic">
        Section absent in this document
      </p>
    );
  return (
    <p className="text-sm leading-7 whitespace-pre-wrap">
      {artifactWordChanges(difference.before ?? "", difference.after ?? "").map(
        (chunk, index) => {
          if (
            (side === "before" && chunk.kind === "added") ||
            (side === "after" && chunk.kind === "removed")
          )
            return null;
          if (chunk.kind === "removed")
            return (
              <del key={index} className="bg-destructive/10 text-destructive">
                {chunk.text}
              </del>
            );
          if (chunk.kind === "added")
            return (
              <ins
                key={index}
                className="bg-success/10 text-success no-underline"
              >
                {chunk.text}
              </ins>
            );
          return <React.Fragment key={index}>{chunk.text}</React.Fragment>;
        },
      )}
    </p>
  );
}

export function AiDocumentComparisonScreen() {
  const [beforeId, setBeforeId] = React.useState("original");
  const [afterId, setAfterId] = React.useState("proposal");
  const [changesOnly, setChangesOnly] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState("setup");
  const [reviewed, setReviewed] = React.useState<string[]>([]);
  const [conversations, setConversations] = React.useState<
    Record<string, Turn[]>
  >({});
  const [drafts, setDrafts] = React.useState<Record<string, string>>({});
  const [open, setOpen] = React.useState(false);
  const rows = React.useRef(new Map<string, HTMLElement>());
  const before = comparisonDocuments.find(
    (document) => document.id === beforeId,
  )!;
  const after = comparisonDocuments.find(
    (document) => document.id === afterId,
  )!;
  const differences = compareArtifactSnapshots(before.snapshot, after.snapshot);
  const changes = differences.filter(
    (difference) => difference.kind !== "unchanged",
  );
  const selected =
    changes.find((difference) => difference.id === selectedId) ?? changes[0];
  const scope = selected ? comparisonScope(beforeId, afterId, selected.id) : "";
  const turns = conversations[scope] ?? [];
  const draft = drafts[scope] ?? "";
  const reviewCount = changes.filter((change) =>
    reviewed.includes(comparisonScope(beforeId, afterId, change.id)),
  ).length;
  function jump(direction: number) {
    if (!selected) return;
    const index = changes.findIndex((change) => change.id === selected.id);
    const next = changes[(index + direction + changes.length) % changes.length];
    setSelectedId(next.id);
    rows.current
      .get(next.id)
      ?.scrollIntoView({ block: "center", behavior: "smooth" });
    rows.current.get(next.id)?.focus({ preventScroll: true });
  }
  function ask(question: string) {
    if (!selected || !question.trim()) return;
    const turn = {
      id:
        globalThis.crypto?.randomUUID?.() ??
        `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
      question: question.trim(),
      answer: comparisonAnswer(question, selected, before, after),
    };
    setConversations((previous) => ({
      ...previous,
      [scope]: [...(previous[scope] ?? []), turn],
    }));
    setDrafts((previous) => ({ ...previous, [scope]: "" }));
  }
  function reset() {
    setBeforeId("original");
    setAfterId("proposal");
    setChangesOnly(false);
    setSelectedId("setup");
    setReviewed([]);
    setConversations({});
    setDrafts({});
    setOpen(false);
  }
  return (
    <AiWorkspaceShell
      hideNavigationSidebar
      headerTitle="Document comparison"
      headerActions={
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Reset document comparison"
          onClick={reset}
        >
          <RotateCcw />
        </Button>
      }
    >
      <div className="@container/comparison flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
          <div>
            <h1 className="text-sm font-medium">Review the onboarding guide</h1>
            <p className="text-muted-foreground mt-1 text-xs">
              Original demo documents · changes stay in this session
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Checkbox
              id="comparison-changes-only"
              checked={changesOnly}
              onCheckedChange={(value) => setChangesOnly(value === true)}
            />
            <Label htmlFor="comparison-changes-only" className="mr-3 text-xs">
              Changes only
            </Label>
            <span className="text-muted-foreground text-xs" aria-live="polite">
              {reviewCount} of {changes.length} reviewed
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={!changes.length}
              aria-label="Previous difference"
              onClick={() => jump(-1)}
            >
              <ChevronUp />
            </Button>
            <span className="text-xs tabular-nums" aria-live="polite">
              {selected
                ? changes.findIndex((change) => change.id === selected.id) + 1
                : 0}{" "}
              / {changes.length}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={!changes.length}
              aria-label="Next difference"
              onClick={() => jump(1)}
            >
              <ChevronDown />
            </Button>
          </div>
        </div>
        <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b px-4 py-3">
          {(["before", "after"] as const).map((side, index) => (
            <React.Fragment key={side}>
              {index === 1 && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Swap documents"
                  onClick={() => {
                    setBeforeId(afterId);
                    setAfterId(beforeId);
                  }}
                >
                  <ArrowLeftRight />
                </Button>
              )}
              <div className="min-w-0">
                <Label className="text-muted-foreground mb-1 block text-xs">
                  {side === "before" ? "Before" : "After"}
                </Label>
                <Select
                  value={side === "before" ? beforeId : afterId}
                  onValueChange={side === "before" ? setBeforeId : setAfterId}
                >
                  <SelectTrigger
                    aria-label={
                      side === "before" ? "Before document" : "After document"
                    }
                    className="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {comparisonDocuments.map((document) => (
                      <SelectItem key={document.id} value={document.id}>
                        {document.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground mt-1 truncate text-xs">
                  {(side === "before" ? before : after).author}
                </p>
              </div>
            </React.Fragment>
          ))}
        </div>
        <div
          className="min-h-0 flex-1 overflow-y-auto"
          aria-label="Aligned document readers"
        >
          {!changes.length && (
            <div className="bg-muted/30 border-b p-6 text-center">
              <h2 className="text-sm font-medium">No differences</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Both readers contain the same document. Choose a different
                document to compare.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  setBeforeId("original");
                  setAfterId("proposal");
                }}
              >
                Compare original and proposal
              </Button>
            </div>
          )}
          <div className="mx-auto max-w-6xl px-4 py-6 @min-[48rem]/comparison:px-8">
            {differences
              .filter(
                (difference) => !changesOnly || difference.kind !== "unchanged",
              )
              .map((difference) => (
                <section
                  key={difference.id}
                  ref={(node) => {
                    if (node) rows.current.set(difference.id, node);
                    else rows.current.delete(difference.id);
                  }}
                  tabIndex={-1}
                  aria-label={`${difference.title}: ${difference.kind}`}
                  className={cn(
                    "mb-1 rounded-md border border-transparent outline-offset-2",
                    selected?.id === difference.id &&
                      "border-border bg-muted/20",
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3">
                    <h2 className="text-muted-foreground text-xs font-medium">
                      {difference.title}
                    </h2>
                    {difference.kind !== "unchanged" && (
                      <button
                        className="focus-visible:ring-ring flex items-center gap-2 rounded px-1 py-0.5 text-xs focus-visible:ring-2"
                        onClick={() => setSelectedId(difference.id)}
                        aria-pressed={selected?.id === difference.id}
                      >
                        <Badge variant="outline" className="capitalize">
                          {difference.kind}
                        </Badge>
                        {reviewed.includes(
                          comparisonScope(beforeId, afterId, difference.id),
                        ) && (
                          <Check
                            className="text-success size-3"
                            aria-label="Reviewed"
                          />
                        )}
                        <span>
                          {selected?.id === difference.id
                            ? "Selected"
                            : "Select change"}
                        </span>
                      </button>
                    )}
                  </div>
                  <div className="grid @min-[48rem]/comparison:grid-cols-2">
                    {(["before", "after"] as const).map((side) => (
                      <div
                        key={side}
                        className={cn(
                          "min-w-0 px-4 pt-2 pb-5",
                          side === "after" &&
                            "border-t @min-[48rem]/comparison:border-t-0 @min-[48rem]/comparison:border-l",
                        )}
                      >
                        <p className="text-muted-foreground mb-2 text-[10px] uppercase @min-[48rem]/comparison:hidden">
                          {side}
                        </p>
                        <Passage difference={difference} side={side} />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
          </div>
        </div>
        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t px-5 py-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {selected?.title ?? "No change selected"}
            </p>
            <p className="text-muted-foreground text-xs">
              Review one passage in its full document context.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!selected}
              onClick={() =>
                setReviewed((previous) =>
                  previous.includes(scope)
                    ? previous.filter((key) => key !== scope)
                    : [...previous, scope],
                )
              }
            >
              {reviewed.includes(scope) ? "Mark unreviewed" : "Mark reviewed"}
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button size="sm" disabled={!selected}>
                  Ask about this change
                </Button>
              </SheetTrigger>
              <SheetContent className="flex w-full flex-col gap-0 sm:max-w-lg">
                <SheetHeader className="border-b">
                  <SheetTitle>{selected?.title}</SheetTitle>
                  <SheetDescription>
                    {before.label} → {after.label}. Answers use only this
                    selected passage.
                  </SheetDescription>
                </SheetHeader>
                <AiConversationScroller
                  key={scope}
                  itemized
                  contentClassName="px-5 py-5"
                >
                  <p className="text-muted-foreground mb-6 text-sm">
                    Explain the difference or check what needs review. This is a
                    local demo with authored answers.
                  </p>
                  {turns.map((turn) => (
                    <AiConversationTurn
                      key={turn.id}
                      id={turn.id}
                      className="pb-6"
                    >
                      <AiChatMessage
                        message={{
                          id: turn.id + "-q",
                          role: "user",
                          parts: [{ type: "text", text: turn.question }],
                        }}
                      />
                      <AiChatMessage
                        message={{
                          id: turn.id + "-a",
                          role: "assistant",
                          parts: [{ type: "text", text: turn.answer }],
                        }}
                      />
                    </AiConversationTurn>
                  ))}
                </AiConversationScroller>
                <div className="shrink-0 border-t p-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mb-3"
                    onClick={() =>
                      ask("Explain this change and what I should check.")
                    }
                  >
                    Explain this change
                  </Button>
                  <AiChatComposer
                    aria-label="Ask about selected change"
                    onSubmit={(event) => {
                      event.preventDefault();
                      ask(draft);
                    }}
                  >
                    <AiChatComposerEditor
                      aria-label="Change question"
                      value={draft}
                      onChange={(event) =>
                        setDrafts((previous) => ({
                          ...previous,
                          [scope]: event.target.value,
                        }))
                      }
                      placeholder="What should I check?"
                      className="min-h-16"
                    />
                    <AiChatComposerToolbar>
                      <span className="text-muted-foreground text-xs">
                        Selected passage only
                      </span>
                      <AiChatComposerSubmit disabled={!draft.trim()} />
                    </AiChatComposerToolbar>
                  </AiChatComposer>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </footer>
      </div>
    </AiWorkspaceShell>
  );
}
