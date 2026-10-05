"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  CornerDownRight,
  FileCheck2,
  GitBranch,
  MessageSquare,
  PanelRightOpen,
  Play,
  RotateCcw,
  Square,
  X,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import {
  AiChatComposer,
  AiChatComposerEditor,
  AiChatComposerSubmit,
  AiChatComposerToolbar,
  AiChatComposerToolbarGroup,
} from "@/components/ai-chat/ai-chat-composer";
import { AiChatMessage } from "@/components/ai-chat/ai-chat-message";
import { AiCodingWorkspace } from "@/components/ai-chat/ai-coding-workspace";
import {
  AiConversationScroller,
  AiConversationTurn,
} from "@/components/ai-chat/ai-conversation-scroller";
import {
  type ChildAction,
  type ChildContinuation,
  childMessage,
  createChildContinuation,
  type DelegatedChild,
  initialDelegatedChildren,
  transitionDelegatedChild,
} from "@/components/ai-chat/ai-delegated-threads-data";
import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

function ChildState({ child }: { child: DelegatedChild }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px]",
        child.status === "running"
          ? "text-chart-2"
          : child.status === "completed"
            ? "text-success"
            : "text-muted-foreground",
      )}
    >
      {child.status === "completed" ? (
        <Check className="size-3" />
      ) : (
        <span className="size-1.5 rounded-full bg-current" />
      )}
      {child.status === "running"
        ? "Working"
        : child.status === "completed"
          ? "Completed"
          : "Stopped"}
    </span>
  );
}

export function AiDelegatedThreadsScreen() {
  const [children, setChildren] = React.useState(initialDelegatedChildren);
  const [selectedId, setSelectedId] = React.useState("data");
  const [panelOpen, setPanelOpen] = React.useState(true);
  const [drafts, setDrafts] = React.useState<Record<string, string>>({});
  const [sendMode, setSendMode] = React.useState<"steer" | "queue">("steer");
  const [continuations, setContinuations] = React.useState<ChildContinuation[]>(
    [],
  );
  const [activeContinuation, setActiveContinuation] = React.useState<
    string | null
  >(null);
  const [collected, setCollected] = React.useState<string[]>([]);
  const [parentDraft, setParentDraft] = React.useState("");
  const [parentFollowups, setParentFollowups] = React.useState<string[]>([]);
  const selected = children.find((child) => child.id === selectedId)!;
  const continued = continuations.find(
    (item) => item.id === activeContinuation,
  );
  const draft = continued?.draft ?? drafts[selectedId] ?? "";
  const completed = children.filter((child) => child.status === "completed");
  const running = children.filter((child) => child.status === "running");
  const queued = selected.controls.filter(
    (control) => control.status === "queued",
  );
  const applied = selected.controls.filter(
    (control) => control.status === "applied",
  );
  const originIdRef = React.useRef("data");

  function openChild(id: string) {
    originIdRef.current = id;
    setSelectedId(id);
    setActiveContinuation(null);
    setPanelOpen(true);
  }
  function closePanel() {
    setPanelOpen(false);
    requestAnimationFrame(() =>
      document.getElementById(`child-dispatch-${originIdRef.current}`)?.focus(),
    );
  }
  function act(id: string, action: ChildAction) {
    setChildren((current) =>
      current.map((child) =>
        child.id === id ? transitionDelegatedChild(child, action) : child,
      ),
    );
  }
  function setDraft(value: string) {
    if (continued)
      setContinuations((current) =>
        current.map((item) =>
          item.id === continued.id ? { ...item, draft: value } : item,
        ),
      );
    else setDrafts((current) => ({ ...current, [selectedId]: value }));
  }
  function send(event: React.FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    if (continued) {
      setContinuations((current) =>
        current.map((item) =>
          item.id === continued.id
            ? {
                ...item,
                draft: "",
                messages: [
                  ...item.messages,
                  childMessage(
                    globalThis.crypto?.randomUUID?.() ??
                      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
                    "user",
                    text,
                  ),
                ],
              }
            : item,
        ),
      );
      toast("Message added to the separate demo conversation");
      return;
    }
    if (selected.status !== "running") return;
    act(selected.id, {
      type: sendMode,
      id:
        globalThis.crypto?.randomUUID?.() ??
        `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
      text,
    });
    setDrafts((current) => ({ ...current, [selected.id]: "" }));
    toast(
      sendMode === "queue"
        ? `Queued for ${selected.name}`
        : `Guidance applied to ${selected.name}`,
    );
  }
  function continueSeparately() {
    const existing = continuations.find(
      (item) => item.sourceId === selected.id,
    );
    if (existing) {
      setActiveContinuation(existing.id);
      return;
    }
    const continuation = createChildContinuation(
      selected,
      globalThis.crypto?.randomUUID?.() ??
        `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
      drafts[selected.id] ?? "",
    );
    if (!continuation) return;
    setContinuations((current) => [...current, continuation]);
    setDrafts((current) => ({ ...current, [selected.id]: "" }));
    setActiveContinuation(continuation.id);
    toast("Opened a separate conversation with the child’s history");
  }
  function advanceDemo() {
    setChildren((current) =>
      current.map((child) =>
        transitionDelegatedChild(child, { type: "advance" }),
      ),
    );
  }
  function reset() {
    setChildren(initialDelegatedChildren);
    setSelectedId("data");
    setPanelOpen(true);
    setDrafts({});
    setContinuations([]);
    setActiveContinuation(null);
    setCollected([]);
    setParentDraft("");
    setParentFollowups([]);
    setSendMode("steer");
    toast("Delegation demo reset");
  }
  const childPanel = (
    <section
      aria-label={
        continued ? "Separate conversation" : "Delegated child conversation"
      }
      className="bg-background flex min-h-0 min-w-0 flex-1 flex-col"
    >
      <header className="flex h-11 shrink-0 items-center gap-2 border-b px-3">
        {continued ? (
          <>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Back to delegated thread"
              onClick={() => setActiveContinuation(null)}
            >
              <ArrowLeft />
            </Button>
            <span className="min-w-0 flex-1 truncate text-xs font-medium">
              {continued.name} · separate chat
            </span>
          </>
        ) : (
          <>
            <GitBranch className="text-muted-foreground size-3.5" />
            <Select
              value={selectedId}
              onValueChange={(id) => {
                setSelectedId(id);
                originIdRef.current = id;
              }}
            >
              <SelectTrigger
                aria-label="Select delegated agent"
                className="h-8 flex-1 border-0 shadow-none"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <ChildState child={selected} />
          </>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Close child conversation"
          onClick={closePanel}
        >
          <X />
        </Button>
      </header>
      <div className="text-muted-foreground flex shrink-0 items-center gap-2 border-b px-4 py-2.5 text-[11px]">
        <CornerDownRight className="size-3.5" />
        {continued
          ? "Snapshot of the completed child thread. Parent work stays separate."
          : "Assigned by Coordinator · Bulk import review"}
      </div>
      <AiConversationScroller
        key={continued?.id ?? selected.id}
        itemized
        contentClassName="mx-auto w-full max-w-xl px-5 py-6"
      >
        <AiConversationTurn id="child-conversation" className="gap-6">
          {(continued?.messages ?? selected.messages).map((message, index) => (
            <div key={message.id}>
              {index === 0 && (
                <p className="text-muted-foreground mb-2 text-[10px] font-medium tracking-wide uppercase">
                  Parent assignment
                </p>
              )}
              <AiChatMessage
                message={message}
                assistantHeader={
                  <span className="text-xs font-medium">
                    {continued?.name ?? selected.name}
                  </span>
                }
              />
            </div>
          ))}
          {!continued && (
            <Collapsible defaultOpen className="rounded-xl border">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-auto w-full justify-between px-3 py-3"
                >
                  <span className="flex items-center gap-2">
                    <FileCheck2 className="size-3.5" />
                    Task activity
                  </span>
                  <span className="text-muted-foreground flex items-center gap-2 text-xs">
                    {selected.activity.filter((item) => item.complete).length}/
                    {selected.activity.length}
                    <ChevronDown className="size-3.5" />
                  </span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ol className="flex flex-col gap-4 border-t px-4 py-4">
                  {selected.activity.map((item) => (
                    <li key={item.id} className="flex gap-2.5">
                      <span
                        className={cn(
                          "mt-0.5 flex size-4 shrink-0 items-center justify-center",
                          item.complete
                            ? "text-muted-foreground"
                            : "text-chart-2",
                        )}
                      >
                        {item.complete ? (
                          <Check className="size-3.5" />
                        ) : (
                          <span className="size-1.5 rounded-full bg-current" />
                        )}
                      </span>
                      <div>
                        <p className="text-xs font-medium">{item.title}</p>
                        <p className="text-muted-foreground mt-1 text-xs leading-5">
                          {item.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </CollapsibleContent>
            </Collapsible>
          )}
          {!continued && applied.length > 0 && (
            <div className="flex flex-col gap-2" aria-label="Control receipts">
              {applied.map((control) => (
                <div
                  key={control.id}
                  className="text-muted-foreground bg-muted/40 flex items-start gap-2 rounded-lg px-3 py-2 text-xs leading-5"
                >
                  <Check className="mt-0.5 size-3.5 shrink-0" />
                  <span>
                    <span className="text-foreground font-medium">
                      {control.kind === "cancel"
                        ? "Task stopped"
                        : control.kind === "queue"
                          ? "Queued follow-up delivered"
                          : "Guidance applied"}
                    </span>
                    {control.kind !== "cancel" && <> · {control.text}</>}
                  </span>
                </div>
              ))}
            </div>
          )}
          {!continued && selected.status === "cancelled" && (
            <div className="text-muted-foreground rounded-xl border p-4 text-sm leading-6">
              This child task was stopped. Its partial work is still available
              above. Other agents were not affected.
            </div>
          )}
        </AiConversationTurn>
      </AiConversationScroller>
      <div className="shrink-0 px-4 pt-3 pb-4">
        {!continued && queued.length > 0 && (
          <div className="mb-2 overflow-hidden rounded-xl border">
            <p className="bg-muted/35 border-b px-3 py-2 text-xs font-medium">
              Queued for this agent · {queued.length}
            </p>
            {queued.map((control) => (
              <div
                key={control.id}
                className="flex items-center gap-2 px-3 py-2"
              >
                <p className="min-w-0 flex-1 truncate text-xs">
                  {control.text}
                </p>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove queued follow-up: ${control.text}`}
                  onClick={() =>
                    act(selected.id, { type: "withdraw", id: control.id })
                  }
                >
                  <X />
                </Button>
              </div>
            ))}
          </div>
        )}
        {continued || selected.status !== "cancelled" ? (
          <>
            <AiChatComposer density="compact" onSubmit={send}>
              <AiChatComposerEditor
                aria-label={
                  continued ? "Separate conversation message" : "Child guidance"
                }
                placeholder={
                  continued
                    ? `Continue with ${continued.name}…`
                    : selected.status === "completed"
                      ? "Add a follow-up for a separate conversation…"
                      : `Guide ${selected.name.toLowerCase()}…`
                }
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                submitOnEnter={
                  Boolean(continued) || selected.status === "running"
                }
              />
              <AiChatComposerToolbar>
                <AiChatComposerToolbarGroup>
                  {continued ? (
                    <span className="text-muted-foreground text-[11px]">
                      Separate conversation
                    </span>
                  ) : selected.status === "running" ? (
                    <Select
                      value={sendMode}
                      onValueChange={(value) => {
                        if (value === "steer" || value === "queue")
                          setSendMode(value);
                      }}
                    >
                      <SelectTrigger
                        aria-label="Child guidance delivery"
                        className="h-7 w-34 border-0 shadow-none"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="steer">Steer now</SelectItem>
                          <SelectItem value="queue">Queue follow-up</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-muted-foreground text-[11px]">
                      Task completed
                    </span>
                  )}
                </AiChatComposerToolbarGroup>
                {!continued && selected.status === "completed" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={continueSeparately}
                  >
                    Continue separately
                    <ArrowUpRight data-icon="inline-end" />
                  </Button>
                ) : (
                  <div className="flex items-center gap-1">
                    {!continued && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Stop this child task"
                        onClick={() => {
                          act(selected.id, {
                            type: "cancel",
                            id:
                              globalThis.crypto?.randomUUID?.() ??
                              `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
                          });
                          toast(`Stopped ${selected.name} only`);
                        }}
                      >
                        <Square />
                      </Button>
                    )}
                    <AiChatComposerSubmit disabled={!draft.trim()} />
                  </div>
                )}
              </AiChatComposerToolbar>
            </AiChatComposer>
            <p className="text-muted-foreground mt-2 text-center text-[10px]">
              {continued
                ? "Demo conversation · original child history is preserved"
                : selected.status === "completed"
                  ? "Continue from a copy without changing the parent task"
                  : "Commands apply to this child only · demo runtime"}
            </p>
          </>
        ) : (
          <Button variant="outline" className="w-full" onClick={closePanel}>
            Return to parent
          </Button>
        )}
      </div>
    </section>
  );
  return (
    <AiWorkspaceShell
      headerTitle="Delegated conversations"
      hideNavigationSidebar
      headerActions={
        <>
          <span className="text-muted-foreground hidden text-xs sm:inline">
            Demo workspace
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={advanceDemo}
            disabled={!running.length}
          >
            <Play data-icon="inline-start" />
            Advance demo
          </Button>
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw data-icon="inline-start" />
            Reset
          </Button>
        </>
      }
    >
      <AiCodingWorkspace
        panelTitle="Child conversation"
        defaultPanelWidthPercent={48}
        codePanelOpen={panelOpen}
        onCodePanelOpenChange={(open) => {
          if (!open) closePanel();
          else setPanelOpen(true);
        }}
        codePanel={childPanel}
        chat={
          <div className="flex min-h-0 flex-1 flex-col">
            <header className="flex h-11 shrink-0 items-center justify-between border-b px-4">
              <h1 className="text-xs font-medium">Bulk import review</h1>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Open child conversation"
                onClick={() => setPanelOpen(true)}
              >
                <PanelRightOpen />
              </Button>
            </header>
            <AiConversationScroller
              itemized
              contentClassName="mx-auto w-full max-w-2xl px-5 py-7 sm:px-7"
            >
              <AiConversationTurn id="parent-conversation" className="gap-6">
                <AiChatMessage
                  message={childMessage(
                    "parent-request",
                    "user",
                    "Review the bulk import flow before we hand it to engineering. Have specialists check data handling, accessibility, and security, then bring their findings together.",
                  )}
                />
                <AiChatMessage
                  message={childMessage(
                    "parent-plan",
                    "assistant",
                    "I’ve split the review into three independent tasks. Open any child conversation to inspect its work or guide that agent directly.",
                  )}
                  assistantHeader={
                    <span className="text-xs font-medium">Coordinator</span>
                  }
                />
                <section
                  aria-label="Delegated tasks"
                  className="overflow-hidden rounded-xl border"
                >
                  <div className="bg-muted/30 flex items-center justify-between gap-2 border-b px-4 py-3">
                    <span className="flex items-center gap-2 text-xs font-medium">
                      <GitBranch className="size-3.5" />
                      Delegated work
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      {completed.length} of {children.length} complete
                    </span>
                  </div>
                  <div className="divide-y">
                    {children.map((child) => (
                      <button
                        key={child.id}
                        id={`child-dispatch-${child.id}`}
                        aria-label={`Open ${child.name} conversation`}
                        aria-pressed={
                          selectedId === child.id && panelOpen && !continued
                        }
                        className={cn(
                          "hover:bg-muted/40 focus-visible:outline-ring flex w-full items-start gap-3 px-4 py-4 text-left transition-colors",
                          selectedId === child.id &&
                            panelOpen &&
                            !continued &&
                            "bg-muted/35",
                        )}
                        onClick={() => openChild(child.id)}
                      >
                        <span className="bg-background mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border">
                          <CornerDownRight className="size-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-medium">{child.name}</p>
                            <ChildState child={child} />
                          </div>
                          <p className="text-muted-foreground mt-1 text-xs leading-5">
                            {child.role}
                          </p>
                          <p className="text-muted-foreground mt-2 line-clamp-2 text-xs leading-5">
                            {child.status === "completed"
                              ? child.result
                              : child.task}
                          </p>
                        </div>
                        <ArrowUpRight className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
                    <span className="text-muted-foreground text-xs">
                      {running.length
                        ? `${running.length} ${running.length === 1 ? "agent" : "agents"} still working`
                        : "All tasks settled"}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        !completed.length ||
                        completed.every((child) => collected.includes(child.id))
                      }
                      onClick={() =>
                        setCollected(completed.map((child) => child.id))
                      }
                    >
                      Collect results
                    </Button>
                  </div>
                </section>
                {collected.length > 0 && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <CheckCircle2 className="size-4" />
                      Findings returned to the parent
                    </div>
                    {children
                      .filter((child) => collected.includes(child.id))
                      .map((child) => (
                        <div key={child.id} className="border-l-2 pl-3">
                          <button
                            className="text-xs font-medium underline underline-offset-4"
                            onClick={() => openChild(child.id)}
                          >
                            {child.name}
                          </button>
                          <p className="text-muted-foreground mt-1 text-sm leading-6">
                            {child.result}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
                {parentFollowups.map((text, index) => (
                  <AiChatMessage
                    key={`parent-followup-${index}`}
                    message={childMessage(
                      `parent-followup-${index}`,
                      "user",
                      text,
                    )}
                  />
                ))}
                {continuations.length > 0 && (
                  <section className="flex flex-col gap-2">
                    <h2 className="text-muted-foreground text-xs">
                      Separate follow-up conversations
                    </h2>
                    {continuations.map((item) => (
                      <button
                        key={item.id}
                        className="hover:bg-muted/40 flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs"
                        onClick={() => {
                          setSelectedId(item.sourceId);
                          originIdRef.current = item.sourceId;
                          setActiveContinuation(item.id);
                          setPanelOpen(true);
                        }}
                      >
                        <MessageSquare className="size-3.5" />
                        <span className="flex-1">
                          Continue with {item.name}
                        </span>
                        <ArrowUpRight className="size-3.5" />
                      </button>
                    ))}
                  </section>
                )}
              </AiConversationTurn>
            </AiConversationScroller>
            <div className="shrink-0 px-4 pt-3 pb-4">
              <AiChatComposer
                density="compact"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!parentDraft.trim()) return;
                  setParentFollowups((current) => [
                    ...current,
                    parentDraft.trim(),
                  ]);
                  setParentDraft("");
                  toast("Added to the parent conversation only");
                }}
              >
                <AiChatComposerEditor
                  aria-label="Parent message"
                  placeholder="Message the coordinator…"
                  value={parentDraft}
                  onChange={(event) => setParentDraft(event.target.value)}
                />
                <AiChatComposerToolbar>
                  <AiChatComposerToolbarGroup>
                    <span className="text-muted-foreground text-[11px]">
                      Coordinator · parent thread
                    </span>
                  </AiChatComposerToolbarGroup>
                  <AiChatComposerSubmit disabled={!parentDraft.trim()} />
                </AiChatComposerToolbar>
              </AiChatComposer>
              <p className="text-muted-foreground mt-2 text-center text-[10px]">
                Parent and child conversations keep separate histories
              </p>
            </div>
          </div>
        }
      />
    </AiWorkspaceShell>
  );
}
