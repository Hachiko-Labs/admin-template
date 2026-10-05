"use client";

import {
  Ellipsis,
  GitBranch,
  Plus,
  Share2,
  ShieldCheck,
  TerminalSquare,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import * as React from "react";

import {
  AiChatComposer,
  AiChatComposerAction,
  AiChatComposerEditor,
  AiChatComposerRail,
  AiChatComposerSubmit,
  AiChatComposerToolbar,
  AiChatComposerToolbarGroup,
} from "@/components/ai-chat/ai-chat-composer";
import type { AiChatSandboxPart } from "@/components/ai-chat/ai-chat-execution";
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

type VerificationPhase = "failed" | "passed" | "running";

const userMessage: AiChatMessageData = {
  id: "verify-bulk-actions",
  role: "user",
  parts: [
    {
      type: "text",
      text: "Run the generated bulk-actions tests in an isolated environment. If anything fails, show me the exact test and application frame before changing the artifact.",
    },
  ],
};

const testCode = `import { render, screen } from "@testing-library/react";
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
    <BulkActions selectedCount={3} state="failed" onRun={() => {}} onRetry={retry} />,
  );

  await user.click(screen.getByRole("button", { name: "Retry" }));
  expect(retry).toHaveBeenCalledOnce();
});`;

const failedOutput = `RUN  v3.2.4 /workspace

❯ src/components/admin/bulk-actions.test.tsx (2 tests | 1 failed) 428ms
  × disables the action when no rows are selected 251ms
    → expected element to be disabled
  ✓ offers a retry after a failed action 177ms

Test Files  1 failed (1)
Tests       1 failed | 1 passed (2)
Duration    428ms`;

const runningOutput = `$ pnpm vitest run src/components/admin/bulk-actions.test.tsx

RUN  v3.2.4 /workspace
⠋ collecting tests
⠋ bulk-actions.test.tsx`;

const passedOutput = `RUN  v3.2.4 /workspace

✓ src/components/admin/bulk-actions.test.tsx (2 tests) 371ms
  ✓ disables the action when no rows are selected 206ms
  ✓ offers a retry after a failed action 165ms

Test Files  1 passed (1)
Tests       2 passed (2)
Duration    371ms`;

const failureTrace = `AssertionError: expected element to be disabled
    at BulkActionsTest (src/components/admin/bulk-actions.test.tsx:9:61)
    at runTest (node_modules/@vitest/runner/dist/index.js:781:11)
    at runSuite (node_modules/@vitest/runner/dist/index.js:909:15)
    at runFiles (node_modules/@vitest/runner/dist/index.js:958:5)
    at startTests (node_modules/@vitest/runner/dist/index.js:967:3)`;

function getAssistantMessage(phase: VerificationPhase): AiChatMessageData {
  const running = phase === "running";
  const passed = phase === "passed";

  const parts: AiChatMessageData["parts"] = [
    {
      type: "text",
      text:
        phase === "failed"
          ? "The isolated run completed with one focused failure. The retry behavior passes, but the zero-selection action is still enabled."
          : running
            ? "I applied the smallest fix—disable Apply when the selection count is zero—and started the same isolated test command again."
            : "The rerun completed successfully. Both interaction contracts now pass in the isolated test environment.",
    },
    {
      type: "sandbox",
      id: "bulk-actions-sandbox",
      title: "Verify bulk-actions.test.tsx",
      detail: running
        ? "Vitest · isolated workspace · running"
        : passed
          ? "Vitest · 2 tests passed · exit 0"
          : "Vitest · 1 test failed · exit 1",
      filename: "src/components/admin/bulk-actions.test.tsx",
      language: "tsx",
      code: testCode,
      output: running ? runningOutput : passed ? passedOutput : failedOutput,
      retryLabel: "Fix and rerun",
      state: running
        ? "input-available"
        : passed
          ? "output-available"
          : "output-error",
    },
    {
      type: "test-results",
      id: "bulk-actions-test-results",
      summary: running
        ? { passed: 0, failed: 0, skipped: 0, running: 2, total: 2 }
        : passed
          ? { passed: 2, failed: 0, skipped: 0, total: 2, duration: 371 }
          : { passed: 1, failed: 1, skipped: 0, total: 2, duration: 428 },
      suites: [
        {
          name: "BulkActions interaction contract",
          status: running ? "running" : passed ? "passed" : "failed",
          tests: running
            ? [
                {
                  name: "disables the action when no rows are selected",
                  status: "running",
                },
                {
                  name: "offers a retry after a failed action",
                  status: "running",
                },
              ]
            : [
                {
                  name: "disables the action when no rows are selected",
                  status: passed ? "passed" : "failed",
                  duration: passed ? 206 : 251,
                  error: passed
                    ? undefined
                    : "Expected Apply to be disabled when selectedCount is 0.",
                },
                {
                  name: "offers a retry after a failed action",
                  status: "passed",
                  duration: passed ? 165 : 177,
                },
              ],
        },
      ],
    },
  ];

  if (phase === "failed") {
    parts.push({
      type: "stack-trace",
      id: "bulk-actions-stack-trace",
      trace: failureTrace,
      defaultOpen: true,
    });
  }

  parts.push({
    type: "text",
    text: passed
      ? "The artifact is now verified for the two requested behaviors. No production code was executed and nothing was deployed."
      : running
        ? "The sandbox is rerunning only the focused test file."
        : "The first application frame points to the zero-selection assertion. The proposed fix is limited to the existing button’s disabled condition.",
  });

  return {
    id: "verify-bulk-actions-response",
    role: "assistant",
    parts,
  };
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

export function AiChatConversation12Screen() {
  const [model, setModel] = React.useState(defaultAiModelId);
  const [prompt, setPrompt] = React.useState("");
  const chat = useMockChat();
  const [phase, setPhase] = React.useState<VerificationPhase>("failed");
  const rerunTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  React.useEffect(
    () => () => {
      if (rerunTimer.current) clearTimeout(rerunTimer.current);
    },
    [],
  );

  function fixAndRerun(part: AiChatSandboxPart) {
    if (part.id !== "bulk-actions-sandbox" || phase === "running") return;
    if (rerunTimer.current) clearTimeout(rerunTimer.current);
    setPhase("running");
    rerunTimer.current = setTimeout(() => setPhase("passed"), 1600);
  }

  return (
    <AiConversationShell
      activeRecent="Verify generated bulk actions"
      headerTitle="Code execution and verification"
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
        <h1 className="sr-only">Code execution and verification</h1>
        <AiConversationScroller>
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6 md:py-10">
            <AiChatMessage message={userMessage} />
            <AiChatMessage
              message={getAssistantMessage(phase)}
              onRetrySandbox={fixAndRerun}
              assistantAvatar={
                <AnimatedAgentBlob
                  className="size-8"
                  colors={["#050505", "#059669", "#050505"]}
                  silhouette="orb"
                  phase={0.7}
                  decorative
                />
              }
              assistantHeader={
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[13px] font-medium">
                    Shadcnblocks AI
                  </span>
                  <span className="text-muted-foreground text-xs">
                    Verification agent
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
            aria-label="Continue verification conversation"
            className="max-w-2xl"
            onSubmit={(event) => {
              event.preventDefault();
              if (chat.send(prompt)) setPrompt("");
            }}
            rail={
              <AiChatComposerRail className="hidden sm:flex">
                <span className="flex items-center gap-1.5">
                  <TerminalSquare className="size-3.5" aria-hidden="true" />
                  Isolated test runner
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5" aria-hidden="true" />
                  No deployment access
                </span>
              </AiChatComposerRail>
            }
          >
            <AiChatComposerEditor
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Ask about the failure, fix, or rerun…"
              className="min-h-16"
            />
            <AiChatComposerToolbar>
              <AiChatComposerToolbarGroup>
                <AiChatComposerAction label="Attach test context">
                  <Plus aria-hidden="true" />
                </AiChatComposerAction>
                <span className="text-muted-foreground hidden items-center gap-1.5 text-xs sm:flex">
                  <GitBranch className="size-3.5" aria-hidden="true" />
                  Artifact revision 1
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
