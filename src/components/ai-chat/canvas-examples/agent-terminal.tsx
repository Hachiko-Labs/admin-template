"use client";

import type * as React from "react";

import { ClaudeHeader } from "@/components/brainless/claude/claude-header";
import { ClaudeMessage } from "@/components/brainless/claude/claude-message";
import { ClaudePrompt } from "@/components/brainless/claude/claude-prompt";
import { ClaudeThinking } from "@/components/brainless/claude/claude-thinking";
import { ClaudeToolCall } from "@/components/brainless/claude/claude-tool-call";
import { CodexExec } from "@/components/brainless/codex/codex-exec";
import { CodexHeader } from "@/components/brainless/codex/codex-header";
import { CodexMessage } from "@/components/brainless/codex/codex-message";
import { CodexPrompt } from "@/components/brainless/codex/codex-prompt";
import { CodexWorking } from "@/components/brainless/codex/codex-working";
import { GrokHeader } from "@/components/brainless/grok/grok-header";
import { GrokMessage } from "@/components/brainless/grok/grok-message";
import { GrokPrompt } from "@/components/brainless/grok/grok-prompt";
import { GrokTool } from "@/components/brainless/grok/grok-tool";
import { GrokWorking } from "@/components/brainless/grok/grok-working";
import type { AgentActivity, AgentProvider } from "@/lib/ai-canvas/agents";

export function AgentTerminalHeader({
  provider,
  directory,
  version,
}: {
  provider: AgentProvider;
  directory: string;
  version: string;
}) {
  if (provider === "claude")
    return (
      <ClaudeHeader compact model="Research · plan mode" cwd={directory} />
    );
  if (provider === "grok") return <GrokHeader compact cwd={directory} />;
  return (
    <CodexHeader
      version={version}
      model="gpt-5.6-sol high"
      directory={directory}
    />
  );
}

export function AgentActivityView({
  item,
  provider = "codex",
}: {
  item: AgentActivity;
  provider?: AgentProvider;
}) {
  if (item.kind === "message" || item.kind === "prompt") {
    const Message =
      provider === "claude"
        ? ClaudeMessage
        : provider === "grok"
          ? GrokMessage
          : CodexMessage;
    return (
      <Message role={item.kind === "prompt" ? "user" : "assistant"}>
        <div className="break-words whitespace-pre-wrap">{item.text}</div>
      </Message>
    );
  }
  if (item.kind === "error")
    return <p className="text-destructive text-xs break-words">{item.text}</p>;
  if (provider === "claude") {
    const [tool, ...parts] = item.text.split(" · ");
    return (
      <ClaudeToolCall
        tool={tool}
        arg={parts.join(" · ") || undefined}
        status={
          item.status === "run"
            ? "pending"
            : item.status === "error"
              ? "error"
              : "success"
        }
        result={
          item.status === "run"
            ? "Working…"
            : item.output?.split("\n")[0] || "Complete"
        }
      >
        {item.output}
      </ClaudeToolCall>
    );
  }
  if (provider === "grok")
    return (
      <GrokTool variant="card" title={item.text}>
        <div className="whitespace-pre-wrap">
          {item.status === "run" ? "Running…" : item.output}
        </div>
      </GrokTool>
    );
  return (
    <CodexExec
      command={item.kind === "search" ? `Search · ${item.text}` : item.text}
      status={item.status}
      result={item.status === "run" ? "Running" : undefined}
    >
      {item.output}
    </CodexExec>
  );
}

export function AgentWorking({
  provider,
  startedAt,
}: {
  provider: AgentProvider;
  startedAt?: string;
}) {
  if (provider === "claude") return <ClaudeThinking showTokens={false} />;
  if (provider === "grok")
    return <GrokWorking label="Checking handoff…" showMetrics={false} />;
  return <CodexWorking startedAt={startedAt} />;
}

export function AgentPrompt({
  provider,
  ...props
}: React.ComponentProps<typeof CodexPrompt> & { provider: AgentProvider }) {
  if (provider === "claude")
    return (
      <ClaudePrompt
        {...props}
        mode="plan"
        effort={false}
        showShortcuts={false}
      />
    );
  if (provider === "grok")
    return (
      <GrokPrompt
        {...props}
        mode="normal"
        model="Grok · review"
        showShortcuts={false}
      />
    );
  return <CodexPrompt {...props} />;
}
