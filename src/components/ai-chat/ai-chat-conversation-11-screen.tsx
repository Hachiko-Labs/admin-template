"use client";

import {
  Braces,
  Ellipsis,
  Files,
  GitBranch,
  Plus,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import * as React from "react";

import type {
  AiChatArtifactFile,
  AiChatArtifactPart,
} from "@/components/ai-chat/ai-chat-artifact";
import {
  AiChatComposer,
  AiChatComposerAction,
  AiChatComposerEditor,
  AiChatComposerRail,
  AiChatComposerSubmit,
  AiChatComposerToolbar,
  AiChatComposerToolbarGroup,
} from "@/components/ai-chat/ai-chat-composer";
import {
  AiChatMessage,
  type AiChatMessageData,
} from "@/components/ai-chat/ai-chat-message";
import { AiConversationScroller } from "@/components/ai-chat/ai-conversation-scroller";
import { AiConversationShell } from "@/components/ai-chat/ai-conversation-shell";
import {
  AiModelPicker,
  defaultAiModelId,
} from "@/components/ai-chat/ai-model-picker";
import { AnimatedAgentBlob } from "@/components/ai-chat/animated-agent-blob";
import { useMockChat } from "@/components/ai-chat/use-mock-chat";
import { Button } from "@/components/ui/button";

const userMessage: AiChatMessageData = {
  id: "generate-bulk-actions",
  role: "user",
  parts: [
    {
      type: "text",
      text: "Generate a reusable bulk-actions component for our admin tables. It should expose queued, running, succeeded, and failed states, use our existing buttons, and include a focused hook and tests.",
    },
  ],
};

function getArtifactFiles(revision: number): AiChatArtifactFile[] {
  const revisionNote =
    revision > 0
      ? "// Regenerated with an explicit disabled state for zero selections.\n"
      : "";

  return [
    {
      path: "src/components/admin/bulk-actions.tsx",
      language: "tsx",
      code: `${revisionNote}import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

type BulkActionState = "idle" | "queued" | "running" | "succeeded" | "failed";

interface BulkActionsProps {
  selectedCount: number;
  state: BulkActionState;
  onRun: () => void;
  onRetry?: () => void;
}

export function BulkActions({
  selectedCount,
  state,
  onRun,
  onRetry,
}: BulkActionsProps) {
  const pending = state === "queued" || state === "running";

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-background p-2">
      <p className="text-sm font-medium">{selectedCount} selected</p>
      <div className="ml-auto flex items-center gap-2">
        {state === "failed" ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
        <Button
          size="sm"
          disabled={pending || selectedCount === 0}
          onClick={onRun}
        >
          {pending ? <LoaderCircle className="animate-spin" /> : null}
          {state === "queued" ? "Queued" : state === "running" ? "Running" : "Apply"}
        </Button>
      </div>
    </div>
  );
}
`,
    },
    {
      path: "src/components/admin/use-bulk-actions.ts",
      language: "typescript",
      code: `import * as React from "react";
import { useMockChat } from "@/components/ai-chat/use-mock-chat";

type BulkActionState = "idle" | "queued" | "running" | "succeeded" | "failed";

export function useBulkActions(runAction: () => Promise<void>) {
  const [state, setState] = React.useState<BulkActionState>("idle");

  const run = React.useCallback(async () => {
    setState("queued");

    try {
      setState("running");
      await runAction();
      setState("succeeded");
    } catch {
      setState("failed");
    }
  }, [runAction]);

  const reset = React.useCallback(() => setState("idle"), []);

  return { reset, run, state };
}
`,
    },
    {
      path: "src/components/admin/bulk-actions.test.tsx",
      language: "tsx",
      code: `import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BulkActions } from "./bulk-actions";

it("disables the action when no rows are selected", () => {
  render(<BulkActions selectedCount={0} state="idle" onRun={() => {}} />);

  expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
});

it("offers a retry after a failed action", async () => {
  const retry = vi.fn();
  const user = userEvent.setup();

  render(
    <BulkActions
      selectedCount={3}
      state="failed"
      onRun={() => {}}
      onRetry={retry}
    />,
  );

  await user.click(screen.getByRole("button", { name: "Retry" }));
  expect(retry).toHaveBeenCalledOnce();
});
`,
    },
  ];
}

function ResponseActions() {
  return (
    <div className="mt-1 flex items-center gap-1">
      <Button variant="ghost" size="icon-sm" aria-label="Good response">
        <ThumbsUp aria-hidden="true" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Bad response">
        <ThumbsDown aria-hidden="true" />
      </Button>
    </div>
  );
}

export function AiChatConversation11Screen() {
  const [model, setModel] = React.useState(defaultAiModelId);
  const [prompt, setPrompt] = React.useState("");
  const chat = useMockChat();
  const [revision, setRevision] = React.useState(0);
  const [artifactStatus, setArtifactStatus] =
    React.useState<AiChatArtifactPart["status"]>("generated");
  const regenerateTimer = React.useRef<
    ReturnType<typeof setTimeout> | undefined
  >(undefined);

  React.useEffect(
    () => () => {
      if (regenerateTimer.current) clearTimeout(regenerateTimer.current);
    },
    [],
  );

  function regenerateArtifact() {
    if (regenerateTimer.current) clearTimeout(regenerateTimer.current);
    setArtifactStatus("generating");
    regenerateTimer.current = setTimeout(() => {
      setRevision((current) => current + 1);
      setArtifactStatus("generated");
    }, 1300);
  }

  const assistantMessage: AiChatMessageData = {
    id: "generated-bulk-actions-response",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "I kept the state contract separate from the table implementation and packaged the result as three focused files. Select a file to review it, or use the artifact actions to copy, regenerate, download, or close the output.",
      },
      {
        type: "artifact",
        id: "bulk-actions-artifact",
        title: "Admin bulk actions",
        description:
          revision > 0
            ? `Regenerated just now · revision ${revision + 1}`
            : "3 generated files · updated just now",
        files: getArtifactFiles(revision),
        status: artifactStatus,
      },
      {
        type: "text",
        text: "The component stays presentation-focused, while the hook owns the async lifecycle. That keeps it reusable across product, customer, and order tables without coupling it to one data client.",
      },
    ],
  };

  return (
    <AiConversationShell
      activeRecent="Generate admin bulk actions"
      headerTitle="Generated artifacts and code output"
      headerActions={
        <>
          <Button
            variant="ghost"
            size="sm"
            className="hidden h-8 text-xs sm:flex"
          >
            <Share2 aria-hidden="true" />
            Share
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="More actions">
            <Ellipsis aria-hidden="true" />
          </Button>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <h1 className="sr-only">Generated artifacts and code output</h1>
        <AiConversationScroller>
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 md:py-10">
            <AiChatMessage message={userMessage} />
            <AiChatMessage
              message={assistantMessage}
              onRegenerateArtifact={regenerateArtifact}
              assistantAvatar={
                <AnimatedAgentBlob
                  className="size-8"
                  colors={["#050505", "#7c3aed", "#050505"]}
                  silhouette="squircle"
                  phase={0.62}
                  decorative
                />
              }
              assistantHeader={
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[13px] font-medium">
                    Shadcnblocks AI
                  </span>
                  <span className="text-muted-foreground text-xs">
                    Code generator
                  </span>
                </div>
              }
              actions={<ResponseActions />}
            />
          </div>
          <div className="mx-auto w-full max-w-3xl space-y-6 px-4 pb-6">
            {chat.messages.map((message) => (
              <AiChatMessage
                key={message.id}
                message={{
                  id: message.id,
                  role: message.role,
                  parts: [{ type: "text", text: message.text }],
                }}
              />
            ))}
          </div>
        </AiConversationScroller>

        <div className="bg-background shrink-0 px-4 pt-3 pb-4 sm:px-6">
          <AiChatComposer
            aria-label="Continue artifact conversation"
            className="max-w-3xl"
            onSubmit={(event) => {
              event.preventDefault();
              if (chat.send(prompt)) setPrompt("");
            }}
            rail={
              <AiChatComposerRail className="hidden sm:flex">
                <span className="flex items-center gap-1.5">
                  <GitBranch className="size-3.5" aria-hidden="true" />
                  Generated workspace
                </span>
                <span className="flex items-center gap-1.5">
                  <Files className="size-3.5" aria-hidden="true" />3 files
                </span>
              </AiChatComposerRail>
            }
          >
            <AiChatComposerEditor
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Request a change to the generated artifact…"
              className="min-h-16"
            />
            <AiChatComposerToolbar>
              <AiChatComposerToolbarGroup>
                <AiChatComposerAction label="Attach repository context">
                  <Plus aria-hidden="true" />
                </AiChatComposerAction>
                <span className="text-muted-foreground hidden items-center gap-1.5 text-xs sm:flex">
                  <Braces className="size-3.5" aria-hidden="true" />
                  TypeScript
                </span>
              </AiChatComposerToolbarGroup>
              <AiChatComposerToolbarGroup className="shrink-0">
                <AiModelPicker value={model} onValueChange={setModel} />
                <AiChatComposerSubmit disabled={!prompt.trim()} />
              </AiChatComposerToolbarGroup>
            </AiChatComposerToolbar>
          </AiChatComposer>
        </div>
      </div>
    </AiConversationShell>
  );
}
