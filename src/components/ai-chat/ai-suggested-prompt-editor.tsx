"use client";

import { useEffect, useRef, useState } from "react";

import { AiChatComposerEditor } from "@/components/ai-chat/ai-chat-composer";

import styles from "./suggested-prompt.module.css";

const suggestions = [
  "Help me plan a project launch for our new workspace",
  "Suggest a dashboard layout for tracking team progress",
  "Show me a concise summary of a weekly planning meeting",
  "Design a billing screen with invoices and payment history",
];

export function AiSuggestedPromptEditor({
  value,
  onValueChange,
  enabled,
}: {
  value: string;
  onValueChange: (value: string) => void;
  enabled: boolean;
}) {
  const editor = useRef<HTMLTextAreaElement>(null);
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(0);
  const [phase, setPhase] = useState<"typing" | "holding" | "erasing">(
    "typing",
  );
  const [focused, setFocused] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const suggestion = suggestions[index];
  const showing = enabled && !value && !focused;

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!showing || paused) return;
    const timer = setTimeout(
      () => {
        if (reducedMotion) {
          setIndex((current) => (current + 1) % suggestions.length);
        } else if (phase === "typing") {
          if (length < suggestion.length) setLength(length + 1);
          else setPhase("holding");
        } else if (phase === "holding") {
          setPhase("erasing");
        } else if (length > 0) {
          setLength(length - 1);
        } else {
          setIndex((current) => (current + 1) % suggestions.length);
          setPhase("typing");
        }
      },
      reducedMotion || phase === "holding"
        ? 8000
        : phase === "erasing"
          ? 35 + (length % 3) * 8
          : length === 0
            ? 700
            : suggestion[length - 1] === " "
              ? 180
              : 75 + ((length * 7) % 5) * 12,
    );
    return () => clearTimeout(timer);
  }, [showing, paused, reducedMotion, phase, length, suggestion]);

  return (
    <div className="relative w-full">
      {showing && (
        <button
          type="button"
          aria-label={`Use suggestion: ${suggestion}`}
          className="text-muted-foreground absolute inset-x-2 top-2 z-10 rounded-sm text-left text-sm leading-5 focus-visible:outline-2 focus-visible:outline-offset-4"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onClick={() => {
            onValueChange(suggestion);
            setPaused(false);
            editor.current?.focus();
          }}
        >
          <span aria-hidden="true">
            {reducedMotion ? suggestion : suggestion.slice(0, length)}
            {!reducedMotion && (
              <span
                data-prompt-cursor
                className={`${phase === "holding" ? styles.cursor : ""} ml-0.5 inline-block h-4 w-px translate-y-0.5 bg-current`}
              />
            )}
          </span>
        </button>
      )}
      <AiChatComposerEditor
        ref={editor}
        aria-label="Describe the screen to create"
        placeholder={
          showing
            ? ""
            : enabled
              ? "Write your own prompt…"
              : "Ask for a screen, or use @ to add context"
        }
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}
