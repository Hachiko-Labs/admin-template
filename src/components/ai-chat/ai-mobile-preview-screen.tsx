"use client";

import {
  ArrowUp,
  BatteryFull,
  ChevronDown,
  ListChecks,
  Menu,
  Signal,
  Wifi,
  X,
} from "lucide-react";
import * as React from "react";

type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
};

const openingMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    text: "I reviewed the launch notes. Want a short handoff plan for the team?",
  },
  {
    id: 2,
    role: "user",
    text: "Yes. Keep it to three clear steps.",
  },
  {
    id: 3,
    role: "assistant",
    text: "Start with the release checklist, name an owner for each open item, then share a final status update before launch.",
  },
];

export function AiMobilePreviewScreen() {
  const [messages, setMessages] = React.useState(openingMessages);
  const [draft, setDraft] = React.useState("");
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [model, setModel] = React.useState<"Focus" | "Fast">("Focus");
  const nextId = React.useRef(4);
  const thread = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (messages.length <= openingMessages.length || !thread.current) return;
    thread.current.scrollTop = thread.current.scrollHeight;
  }, [messages]);

  function sendMessage() {
    const text = draft.trim();
    if (!text) return;
    const userId = nextId.current++;
    const replyId = nextId.current++;
    setMessages((current) => [
      ...current,
      { id: userId, role: "user", text },
      {
        id: replyId,
        role: "assistant",
        text: "Here’s a concise version: confirm the owner, close the remaining checks, and post the launch update. I can refine any step.",
      },
    ]);
    setDraft("");
  }

  return (
    <div
      className="bg-background text-foreground relative flex h-full w-full flex-col overflow-hidden"
      data-mobile-preview-screen
    >
      <div
        aria-hidden="true"
        className="flex h-11 shrink-0 items-end justify-between px-7 pb-2 text-[11px] font-semibold"
      >
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <Signal className="size-3.5" />
          <Wifi className="size-3.5" />
          <BatteryFull className="size-4" />
        </div>
      </div>

      <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <button
          type="button"
          aria-label={menuOpen ? "Close conversations" : "Open conversations"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="hover:bg-muted flex size-9 items-center justify-center rounded-xl"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-xl">
          <ListChecks className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold">Release handoff</p>
          <p className="text-muted-foreground text-[11px]">AI workspace</p>
        </div>
        <button
          type="button"
          aria-label={`Model: ${model}. Switch model`}
          onClick={() =>
            setModel((current) => (current === "Focus" ? "Fast" : "Focus"))
          }
          className="hover:bg-muted flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium"
        >
          {model}
          <ChevronDown className="size-3" />
        </button>
      </header>

      <div ref={thread} className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <p className="text-muted-foreground mb-5 text-center text-[11px]">
          Today
        </p>
        <div className="space-y-5">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={
                  message.role === "user"
                    ? "bg-primary text-primary-foreground max-w-[82%] rounded-2xl rounded-br-md px-3.5 py-2.5 text-[13px] leading-[1.45]"
                    : "bg-muted max-w-[86%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[13px] leading-[1.45]"
                }
              >
                {message.text}
              </div>
            </div>
          ))}
          <div className="ml-1 max-w-[86%] rounded-2xl border p-3">
            <p className="text-[11px] font-semibold">Release checklist</p>
            <div className="mt-2 space-y-2">
              {[
                "Confirm owners",
                "Review open checks",
                "Post launch update",
              ].map((step, index) => (
                <div key={step} className="flex items-center gap-2 text-[11px]">
                  <span className="bg-muted text-muted-foreground flex size-5 shrink-0 items-center justify-center rounded-full text-[10px]">
                    {index + 1}
                  </span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 px-4 pb-2">
        <div className="mb-3 flex gap-2 overflow-x-auto whitespace-nowrap">
          {["Draft team update", "Find open risks"].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setDraft(prompt)}
              className="hover:bg-muted rounded-full border px-3 py-1.5 text-[11px]"
            >
              {prompt}
            </button>
          ))}
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}
          className="rounded-2xl border p-2.5 shadow-sm"
        >
          <textarea
            aria-label="Message"
            placeholder="Ask anything…"
            value={draft}
            maxLength={1000}
            rows={2}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
            className="placeholder:text-muted-foreground w-full resize-none bg-transparent px-1 text-[13px] outline-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              aria-label="Send message"
              disabled={!draft.trim()}
              className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-full disabled:opacity-40"
            >
              <ArrowUp className="size-4" />
            </button>
          </div>
        </form>
      </div>
      <div
        aria-hidden="true"
        className="flex h-5 shrink-0 items-center justify-center"
      >
        <div className="bg-foreground h-1 w-28 rounded-full" />
      </div>

      {menuOpen ? (
        <nav
          aria-label="Mobile conversations"
          className="bg-background absolute inset-x-0 top-[100px] bottom-5 z-20 flex flex-col border-t p-5 shadow-lg"
        >
          <p className="text-muted-foreground mb-3 text-[11px] font-medium tracking-wide uppercase">
            Conversations
          </p>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="bg-muted rounded-xl px-3 py-3 text-left text-[13px] font-medium"
          >
            Release handoff
          </button>
          <button
            type="button"
            onClick={() => {
              setMessages(openingMessages);
              setDraft("");
              setMenuOpen(false);
            }}
            className="hover:bg-muted mt-2 rounded-xl px-3 py-3 text-left text-[13px]"
          >
            Reset preview
          </button>
        </nav>
      ) : null}
    </div>
  );
}
