"use client";

import {
  ArrowUp,
  Bookmark,
  Bot,
  Check,
  Highlighter,
  Link2,
  NotebookPen,
  Quote,
  Search,
  StickyNote,
  Trash2,
} from "lucide-react";
import * as React from "react";

import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  kbCitation,
  kbDocById,
  kbDocs,
  kbExplain,
  kbMatchAnswer,
  type KbTurn,
} from "./ai-knowledge-base-data";

type LibraryTab = "all" | "read" | "unread" | "starred";

/** CSS page thumbnail. Deterministic line rhythm per doc, no assets. */
function DocThumb({ id, title }: { id: string; title: string }) {
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const rows = [82, 95, 70, 88, 64, 92, 76, 85];
  return (
    <span
      aria-hidden="true"
      className="bg-card flex h-[68px] w-[52px] shrink-0 flex-col gap-[3px] overflow-hidden rounded-[3px] border p-[6px] shadow-xs"
    >
      <span className="bg-foreground/70 mb-[2px] h-[3px] w-3/4 rounded-full" />
      {rows.map((w, i) => (
        <span
          key={i}
          className="bg-foreground/15 h-[2px] rounded-full"
          style={{ width: `${(w + (hash % 17)) % 100}%` }}
        />
      ))}
      <span className="text-foreground/50 mt-auto truncate text-[5px] leading-none font-semibold">
        {title}
      </span>
    </span>
  );
}

const tabLabels: { id: LibraryTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "read", label: "Read" },
  { id: "unread", label: "Unread" },
  { id: "starred", label: "Starred" },
];

export function AiKnowledgeBaseScreen() {
  const [docId, setDocId] = React.useState(kbDocs[0].id);
  const [tab, setTab] = React.useState<LibraryTab>("all");
  const [query, setQuery] = React.useState("");
  const [starred, setStarred] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(kbDocs.map((d) => [d.id, d.starred])),
  );
  const [read, setRead] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(kbDocs.map((d) => [d.id, d.read])),
  );
  const [saved, setSaved] = React.useState<Record<string, boolean>>({});
  const [notes, setNotes] = React.useState<
    Record<string, { id: string; text: string }[]>
  >({});
  const [noteDraft, setNoteDraft] = React.useState("");
  const [readerTab, setReaderTab] = React.useState<"notes" | "highlights">(
    "notes",
  );
  const [turns, setTurns] = React.useState<KbTurn[]>([
    {
      id: "kb-welcome",
      role: "assistant",
      text: `This library holds ${kbDocs.length} company documents. I answer from the one you are reading — pick a suggested question or ask your own.`,
    },
  ]);
  const [input, setInput] = React.useState("");
  const [thinking, setThinking] = React.useState(false);
  const [notice, setNotice] = React.useState("");
  const threadEnd = React.useRef<HTMLDivElement>(null);
  const timers = React.useRef<number[]>([]);
  React.useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  const doc = kbDocById(docId);
  const docNotes = notes[doc.id] ?? [];
  const savedHighlights = kbDocs.filter((d) => saved[d.id]);
  const counts: Record<LibraryTab, number> = {
    all: kbDocs.length,
    read: kbDocs.filter((d) => read[d.id]).length,
    unread: kbDocs.filter((d) => !read[d.id]).length,
    starred: kbDocs.filter((d) => starred[d.id]).length,
  };
  const library = kbDocs.filter((d) => {
    if (tab === "read" && !read[d.id]) return false;
    if (tab === "unread" && read[d.id]) return false;
    if (tab === "starred" && !starred[d.id]) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return `${d.title} ${d.source} ${d.authors} ${d.keywords.join(" ")}`
      .toLowerCase()
      .includes(q);
  });

  function pushTurn(role: KbTurn["role"], text: string) {
    setTurns((t) => [
      ...t,
      {
        id:
          globalThis.crypto?.randomUUID?.() ??
          `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
        role,
        text,
      },
    ]);
    requestAnimationFrame(() =>
      threadEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" }),
    );
  }

  function selectDoc(id: string) {
    if (id === docId) return;
    setDocId(id);
    setRead((r) => ({ ...r, [id]: true }));
    setNoteDraft("");
    pushTurn("context", `Now reading “${kbDocById(id).title}”.`);
  }

  function ask(question: string) {
    const q = question.trim();
    if (!q || thinking) return;
    pushTurn("user", q);
    setInput("");
    setThinking(true);
    const target = doc;
    timers.current.push(
      window.setTimeout(() => {
        pushTurn("assistant", kbMatchAnswer(target, q));
        setThinking(false);
      }, 650),
    );
  }

  function explain() {
    if (thinking) return;
    setThinking(true);
    const target = doc;
    timers.current.push(
      window.setTimeout(() => {
        pushTurn("assistant", kbExplain(target));
        setThinking(false);
      }, 650),
    );
  }

  function addNote() {
    if (!noteDraft.trim()) return;
    setNotes((n) => ({
      ...n,
      [doc.id]: [
        ...(n[doc.id] ?? []),
        {
          id:
            globalThis.crypto?.randomUUID?.() ??
            `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
          text: noteDraft.trim(),
        },
      ],
    }));
    setNoteDraft("");
    setNotice("Note attached to this document.");
  }

  async function copyCitation() {
    try {
      await navigator.clipboard.writeText(kbCitation(doc));
      setNotice("Citation copied.");
    } catch {
      setNotice(`Citation: ${kbCitation(doc)}`);
    }
  }

  function progressLabel(id: string): string {
    const d = kbDocById(id);
    if (read[id] || d.progress >= 1) return "Completed";
    if (d.progress <= 0) return "Unread";
    return `${Math.max(1, Math.round(d.minutes * (1 - d.progress)))} min left`;
  }

  return (
    <AiWorkspaceShell
      headerTitle="Knowledge base"
      hideNavigationSidebar
      headerActions={
        <span className="text-muted-foreground hidden text-xs sm:inline">
          {kbDocs.length} documents · company library
        </span>
      }
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)_340px] 2xl:grid-cols-[320px_minmax(0,1fr)_400px]">
        <section
          aria-label="Library"
          className="flex min-h-0 flex-col border-b xl:overflow-y-auto xl:border-r xl:border-b-0"
        >
          <div className="shrink-0 p-4 pb-3">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold">Library</h2>
              <span className="text-muted-foreground text-xs">
                {kbDocs.length} docs
              </span>
            </div>
            <div className="relative">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
              <Input
                aria-label="Search the library"
                placeholder="Search titles, sources…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 pl-8 text-[13px]"
              />
            </div>
            <div
              className="mt-2 flex gap-1"
              role="tablist"
              aria-label="Library filter"
            >
              {tabLabels.map((t) => (
                <Button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  size="sm"
                  variant={tab === t.id ? "secondary" : "ghost"}
                  onClick={() => setTab(t.id)}
                  className="h-7 flex-1 px-1 text-xs"
                >
                  {t.label}
                  <span className="text-muted-foreground ml-1 tabular-nums">
                    {counts[t.id]}
                  </span>
                </Button>
              ))}
            </div>
          </div>
          <ul className="min-h-0 flex-1 px-2 pb-4 xl:overflow-y-auto">
            {library.map((d) => (
              <li key={d.id} className="relative">
                <button
                  onClick={() => selectDoc(d.id)}
                  aria-pressed={docId === d.id}
                  className={cn(
                    "hover:bg-muted/60 flex w-full flex-col gap-2 rounded-lg px-3 py-3 pr-9 text-left",
                    docId === d.id && "bg-muted",
                  )}
                >
                  <span className="flex items-start gap-2.5">
                    <DocThumb id={d.id} title={d.title} />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="line-clamp-2 text-[13px] leading-5 font-medium break-words">
                        {d.title}
                      </span>
                      <span className="text-muted-foreground truncate text-[11px]">
                        {d.source}
                      </span>
                      <span className="text-muted-foreground truncate text-[11px]">
                        {d.authors}
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        {d.date} · {d.pages} pages
                      </span>
                    </span>
                  </span>
                  <span className="bg-muted-foreground/15 h-1 overflow-hidden rounded-full">
                    <span
                      className="bg-foreground block h-full rounded-full"
                      style={{
                        width: `${Math.round((read[d.id] ? 1 : d.progress) * 100)}%`,
                      }}
                    />
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    Page{" "}
                    {Math.max(
                      1,
                      Math.round((read[d.id] ? 1 : d.progress) * d.pages),
                    )}{" "}
                    / {d.pages} · {progressLabel(d.id)}
                  </span>
                </button>
                <button
                  aria-label={
                    starred[d.id] ? `Unstar ${d.title}` : `Star ${d.title}`
                  }
                  aria-pressed={!!starred[d.id]}
                  onClick={() =>
                    setStarred((s) => ({ ...s, [d.id]: !s[d.id] }))
                  }
                  className="text-muted-foreground hover:text-foreground absolute top-2.5 right-2.5 rounded p-1"
                >
                  <Bookmark
                    className="size-3.5"
                    fill={starred[d.id] ? "currentColor" : "none"}
                  />
                </button>
              </li>
            ))}
            {library.length === 0 ? (
              <li className="text-muted-foreground px-3 py-8 text-center text-xs">
                No documents match. Clear the search or pick another tab.
              </li>
            ) : null}
          </ul>
        </section>

        <section
          aria-label="Document reader"
          className="min-h-0 border-b xl:overflow-y-auto xl:border-b-0"
        >
          <div className="mx-auto flex max-w-2xl flex-col gap-5 px-5 py-6 md:px-8 2xl:max-w-3xl">
            <div>
              <p className="text-muted-foreground mb-2 text-xs">
                {doc.source} · {doc.date} · {doc.pages} pages
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">
                {doc.title}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {doc.intro}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {doc.keywords.map((k) => (
                  <Badge key={k} variant="secondary" className="font-normal">
                    {k}
                  </Badge>
                ))}
              </div>
            </div>
            <figure className="rounded-xl border p-4">
              <blockquote className="border-l-2 pl-3 text-sm leading-7">
                {doc.keyPassage}
              </blockquote>
              <figcaption className="text-muted-foreground mt-2 text-[11px]">
                Key passage ·{" "}
                {saved[doc.id] ? "saved to highlights" : "not highlighted"}
              </figcaption>
            </figure>
            {doc.sections.map((s) => (
              <section key={s.heading ?? s.paragraphs[0].slice(0, 24)}>
                {s.heading ? (
                  <h2 className="mb-2 text-lg font-semibold">{s.heading}</h2>
                ) : null}
                {s.paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className="text-muted-foreground mb-3 text-sm leading-7"
                  >
                    {p}
                  </p>
                ))}
              </section>
            ))}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={explain}
                disabled={thinking}
              >
                <Bot data-icon="inline-start" />
                Explain
              </Button>
              <Button
                size="sm"
                variant={saved[doc.id] ? "secondary" : "outline"}
                onClick={() => {
                  setSaved((s) => ({ ...s, [doc.id]: !s[doc.id] }));
                  setNotice(
                    saved[doc.id]
                      ? "Highlight removed."
                      : "Passage saved to highlights.",
                  );
                }}
              >
                <Highlighter data-icon="inline-start" />
                {saved[doc.id] ? "Highlighted" : "Highlight"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setReaderTab("notes");
                  requestAnimationFrame(() =>
                    document
                      .getElementById("kb-note-input")
                      ?.focus({ preventScroll: false }),
                  );
                }}
              >
                <NotebookPen data-icon="inline-start" />
                Add Note
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setStarred((s) => ({ ...s, [doc.id]: !s[doc.id] }))
                }
              >
                <Bookmark
                  data-icon="inline-start"
                  fill={starred[doc.id] ? "currentColor" : "none"}
                />
                {starred[doc.id] ? "Saved" : "Save"}
              </Button>
              <Button size="sm" variant="outline" onClick={copyCitation}>
                <Quote data-icon="inline-start" />
                Generate Citation
              </Button>
            </div>
            <div>
              <div
                className="flex gap-1 border-b"
                role="tablist"
                aria-label="Reader panel"
              >
                {(
                  [
                    { id: "notes", label: `Notes ${docNotes.length}` },
                    {
                      id: "highlights",
                      label: `Highlights ${savedHighlights.length}`,
                    },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={readerTab === t.id}
                    onClick={() => setReaderTab(t.id)}
                    className={cn(
                      "border-b-2 px-3 py-2 text-[13px]",
                      readerTab === t.id
                        ? "border-foreground font-medium"
                        : "text-muted-foreground border-transparent",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {readerTab === "notes" ? (
                <div className="py-3">
                  {docNotes.length ? (
                    <ul className="flex flex-col gap-2.5">
                      {docNotes.map((n) => (
                        <li
                          key={n.id}
                          className="group flex items-start gap-2 rounded-lg border p-3 text-[13px] leading-6"
                        >
                          <StickyNote className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                          <span className="min-w-0 flex-1 break-words">
                            {n.text}
                          </span>
                          <button
                            aria-label="Delete note"
                            onClick={() =>
                              setNotes((prev) => ({
                                ...prev,
                                [doc.id]: (prev[doc.id] ?? []).filter(
                                  (x) => x.id !== n.id,
                                ),
                              }))
                            }
                            className="text-muted-foreground hover:text-foreground shrink-0 opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground py-4 text-center text-xs">
                      No notes on this document yet.
                    </p>
                  )}
                  <div className="mt-2 flex gap-2">
                    <Input
                      id="kb-note-input"
                      aria-label="Add a note"
                      placeholder="Add a note…"
                      value={noteDraft}
                      maxLength={500}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addNote();
                      }}
                      className="h-9 text-[13px]"
                    />
                    <Button
                      size="sm"
                      className="h-9 shrink-0"
                      onClick={addNote}
                      disabled={!noteDraft.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              ) : (
                <ul className="flex flex-col gap-2.5 py-3">
                  {savedHighlights.length ? (
                    savedHighlights.map((d) => (
                      <li key={d.id} className="rounded-lg border p-3">
                        <button
                          onClick={() => selectDoc(d.id)}
                          className="mb-1 text-left text-[13px] font-medium hover:underline"
                        >
                          {d.title}
                        </button>
                        <p className="border-l-2 pl-3 text-[13px] leading-6 break-words">
                          {d.keyPassage}
                        </p>
                      </li>
                    ))
                  ) : (
                    <p className="text-muted-foreground py-4 text-center text-xs">
                      Nothing highlighted yet. Use Highlight on any document.
                    </p>
                  )}
                </ul>
              )}
            </div>
            <div>
              <h2 className="mb-2 text-sm font-medium">Related documents</h2>
              <div className="flex flex-col gap-1">
                {doc.related.map((id) => (
                  <button
                    key={id}
                    onClick={() => selectDoc(id)}
                    className="hover:bg-muted/60 flex items-center justify-between rounded-lg px-3 py-2 text-left text-[13px]"
                  >
                    {kbDocById(id).title}
                    <Link2 className="text-muted-foreground size-3.5" />
                  </button>
                ))}
              </div>
            </div>
            <p role="status" className="text-muted-foreground text-xs">
              {notice || "All answers quote the document in front of you."}
            </p>
          </div>
        </section>

        <aside
          aria-label="Ask the library"
          className="flex min-h-[420px] flex-col border-t xl:min-h-0 xl:border-t-0 xl:border-l"
        >
          <div className="flex shrink-0 items-center gap-2 border-b px-4 py-3">
            <Bot className="size-4" aria-hidden="true" />
            <h2 className="text-sm font-medium">Ask the library</h2>
            <span className="text-muted-foreground ml-auto text-[11px]">
              Local answers · no model
            </span>
          </div>
          <div className="text-muted-foreground shrink-0 border-b px-4 py-2 text-[11px]">
            Reading:{" "}
            <span className="text-foreground font-medium">{doc.title}</span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <div className="flex flex-col gap-4">
              {turns.map((t) =>
                t.role === "context" ? (
                  <p
                    key={t.id}
                    className="text-muted-foreground text-center text-[11px]"
                  >
                    — {t.text} —
                  </p>
                ) : t.role === "user" ? (
                  <div key={t.id} className="flex justify-end">
                    <p className="bg-muted max-w-[90%] rounded-2xl rounded-br-md px-3.5 py-2 text-[13px] leading-6 break-words">
                      {t.text}
                    </p>
                  </div>
                ) : (
                  <div key={t.id} className="flex gap-2.5">
                    <span className="bg-muted flex size-6 shrink-0 items-center justify-center rounded-md">
                      <Bot className="size-3.5" />
                    </span>
                    <p className="min-w-0 flex-1 text-[13px] leading-6 break-words">
                      {t.text}
                    </p>
                  </div>
                ),
              )}
              {thinking ? (
                <p role="status" className="text-muted-foreground text-xs">
                  Checking “{doc.title}”…
                </p>
              ) : null}
              <div ref={threadEnd} />
            </div>
          </div>
          <div className="shrink-0 border-t px-3 pt-2 pb-3">
            <div className="mb-2 flex gap-1.5 overflow-x-auto pb-0.5">
              {doc.followups.map((f) => (
                <Button
                  key={f.short}
                  size="sm"
                  variant="outline"
                  disabled={thinking}
                  onClick={() => ask(f.question)}
                  className="h-7 shrink-0 text-xs"
                >
                  {f.short}
                </Button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
              }}
              className="flex gap-2"
            >
              <Input
                aria-label="Ask about this document"
                placeholder={`Ask about ${doc.title}…`}
                value={input}
                maxLength={300}
                onChange={(e) => setInput(e.target.value)}
                className="h-9 min-w-0 flex-1 text-[13px]"
              />
              <Button
                type="submit"
                size="icon"
                className="h-9 w-9 shrink-0"
                disabled={!input.trim() || thinking}
                aria-label="Send question"
              >
                <ArrowUp />
              </Button>
            </form>
            <p className="mt-1.5 flex items-center gap-1.5 text-[11px]">
              <Check className="size-3 text-emerald-600" aria-hidden="true" />
              <span className="text-muted-foreground">
                Answers quote the document in front of you.
              </span>
            </p>
          </div>
        </aside>
      </div>
    </AiWorkspaceShell>
  );
}
