"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type MockChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  stopped?: boolean;
};
export type MockChatStatus = "ready" | "submitted" | "streaming";

// These replies demonstrate chat behavior only. No model or network is involved.
function mockReply(prompt: string, history: MockChatMessage[]): string {
  const query = prompt.toLowerCase();
  if (
    /shorter|concise|summari[sz]e that/.test(query) &&
    history.some((message) => message.role === "assistant")
  ) {
    return "Here’s the short version:\n\n- Agree on the goal and the person responsible.\n- Build the smallest useful version.\n- Test it with the team, then decide what to improve next.";
  }
  if (/summari|meeting|notes/.test(query)) {
    return "Here’s an example of a concise meeting summary:\n\n### Decisions\nStart with one focused workflow and use the existing design system.\n\n### Next steps\n1. **Design:** prepare the first screen for review.\n2. **Engineering:** confirm the interactions and empty states.\n3. **Product:** collect feedback before expanding the scope.\n\n### Open question\nWhich part of the workflow should we validate first?";
  }
  if (/plan|launch|project/.test(query)) {
    return "Here’s a simple starting plan:\n\n| Stage | Focus | Outcome |\n| --- | --- | --- |\n| Define | Agree on the audience and goal | A short brief |\n| Build | Create the core flow | A working first version |\n| Review | Test realistic tasks | A prioritized list of fixes |\n| Launch | Release to a small group | Feedback for the next iteration |\n\nKeep the first release narrow enough to review as a complete experience. Assign an owner to each stage before you begin.";
  }
  if (/screen|design|dashboard|interface/.test(query)) {
    return "I’d start with a clear hierarchy:\n\n1. **Context at the top:** a useful page title and one primary action.\n2. **The main task in the center:** give the content people work with the most room.\n3. **Supporting details nearby:** reveal secondary settings when they’re needed.\n\nUse the existing type scale, spacing, and controls. Include loading, empty, and error states so the screen feels complete.\n\nThe first review should focus on whether someone can finish the main task without explanation.";
  }
  return "Your message is now part of this conversation. This is a scripted example response to demonstrate the complete chat flow.\n\nYou can send another message, stop a reply while it is appearing, or retry the latest response. The conversation stays on this page until you start a new chat.\n\nTry asking for a **project plan**, a **meeting summary**, or **screen design suggestions** to see a different sample reply.";
}

export function useMockChat() {
  const [messages, setMessages] = useState<MockChatMessage[]>([]);
  const [status, setStatus] = useState<MockChatStatus>("ready");
  const history = useRef<MockChatMessage[]>([]);
  const busy = useRef(false);
  const generation = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeReply = useRef<string | null>(null);

  const cancel = useCallback(() => {
    generation.current += 1;
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
    busy.current = false;
    activeReply.current = null;
  }, []);
  useEffect(() => cancel, [cancel]);

  function publish(next: MockChatMessage[]) {
    history.current = next;
    setMessages(next);
  }
  function startReply(prompt: string, turns: MockChatMessage[]) {
    busy.current = true;
    const run = ++generation.current;
    const id =
      globalThis.crypto?.randomUUID?.() ??
      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    activeReply.current = id;
    const chunks = mockReply(prompt, turns).match(/\S+\s*/g) ?? [];
    let position = 0;
    publish([...turns, { id, role: "assistant", text: "" }]);
    setStatus("submitted");
    const tick = () => {
      if (run !== generation.current) return;
      position = Math.min(chunks.length, position + 3);
      publish(
        history.current.map((message) =>
          message.id === id
            ? { ...message, text: chunks.slice(0, position).join("") }
            : message,
        ),
      );
      if (position === chunks.length) {
        busy.current = false;
        activeReply.current = null;
        timer.current = null;
        setStatus("ready");
      } else {
        setStatus("streaming");
        timer.current = setTimeout(tick, 65);
      }
    };
    timer.current = setTimeout(tick, 550);
  }
  function send(value: string) {
    const text = value.trim();
    if (!text || busy.current) return false;
    const next: MockChatMessage[] = [
      ...history.current,
      {
        id:
          globalThis.crypto?.randomUUID?.() ??
          `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
        role: "user",
        text,
      },
    ];
    startReply(text, next);
    return true;
  }
  function stop() {
    const id = activeReply.current;
    cancel();
    publish(
      history.current.map((message) =>
        message.id === id ? { ...message, stopped: true } : message,
      ),
    );
    setStatus("ready");
  }
  function reset(seed: MockChatMessage[] = []) {
    cancel();
    publish(seed.map((message) => ({ ...message })));
    setStatus("ready");
  }
  function retry() {
    if (busy.current) return;
    const last = history.current.at(-1);
    const turns =
      last?.role === "assistant"
        ? history.current.slice(0, -1)
        : history.current;
    const prompt = turns.at(-1);
    if (prompt?.role === "user") startReply(prompt.text, turns);
  }
  return { messages, status, send, stop, reset, retry };
}
