"use client";

import {
  Check,
  Clipboard,
  Copy,
  Ellipsis,
  FileText,
  Folder,
  RefreshCw,
  Search,
  Share2,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  Workflow,
  X,
} from "lucide-react";
import * as React from "react";

import {
  AiChatComposer,
  AiChatComposerButton,
  AiChatComposerEditor,
  AiChatComposerRail,
  AiChatComposerSubmit,
  AiChatComposerToolbar,
  AiChatComposerToolbarGroup,
} from "@/components/ai-chat/ai-chat-composer";
import { AiChatAddContextAction } from "@/components/ai-chat/ai-chat-context-picker";
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
import { useMockChat } from "@/components/ai-chat/use-mock-chat";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  type ConfirmationApproval,
  ConfirmationRejected,
  ConfirmationRequest,
  type ConfirmationState,
  ConfirmationTitle,
} from "@/components/ai-elements/confirmation";
import { BrandMark } from "@/components/logo";
import { Button } from "@/components/ui/button";

const sources = [
  {
    id: "assistant-ui",
    title: "Thread runtime and approval controls",
    url: "https://github.com/assistant-ui/assistant-ui",
  },
  {
    id: "copilotkit",
    title: "Human-in-the-loop agent actions",
    url: "https://github.com/CopilotKit/CopilotKit",
  },
  {
    id: "cline",
    title: "Tool approval and checkpoint patterns",
    url: "https://github.com/cline/cline",
  },
];

type ApprovalPartData =
  | { kind: "approval-contract" }
  | { kind: "review-activity" };

const conversationMessages: AiChatMessageData<ApprovalPartData>[] = [
  {
    id: "approval-request",
    role: "user",
    parts: [
      {
        type: "text",
        text: "Map the approval states we need for agent tools across all 40 admin screens. Keep the language consistent between chat, workflows, and background runs.",
      },
    ],
  },
  {
    id: "approval-response",
    role: "assistant",
    parts: [
      {
        type: "custom",
        id: "review-activity",
        name: "review-activity",
        data: { kind: "review-activity" },
      },
      {
        type: "text",
        text: `Use one approval contract everywhere an agent can act. The interface should separate the request, the operator's decision, execution, and the final result. That keeps a tool call readable even when it moves from a chat into a background run.

### 1. Awaiting review

Show the tool name, intended change, affected resources, and requested scope. The primary actions are **approve once**, **always allow for this workspace**, and **reject**.

### 2. Approved and running

Preserve who approved the action and when. Replace the decision controls with live progress, elapsed time, and a stop action rather than an indeterminate spinner.

### 3. Resolved

End in succeeded, rejected, cancelled, or failed. Keep the original request and decision attached to the result so an operator can audit it later.`,
      },
      {
        type: "custom",
        id: "approval-contract",
        name: "approval-contract",
        data: { kind: "approval-contract" },
      },
      { type: "sources", sources },
    ],
  },
];

function ReviewActivity() {
  return (
    <ChainOfThought defaultOpen className="px-1.5">
      <ChainOfThoughtHeader>Reviewed approval surfaces</ChainOfThoughtHeader>
      <ChainOfThoughtContent>
        <ChainOfThoughtStep
          icon={Search}
          label="Inventoried every place an agent can act"
          description="Compared chat tool calls, workflow runs, and background jobs."
        >
          <ChainOfThoughtSearchResults>
            <ChainOfThoughtSearchResult>Chat</ChainOfThoughtSearchResult>
            <ChainOfThoughtSearchResult>Workflows</ChainOfThoughtSearchResult>
            <ChainOfThoughtSearchResult>Runs</ChainOfThoughtSearchResult>
          </ChainOfThoughtSearchResults>
        </ChainOfThoughtStep>
        <ChainOfThoughtStep
          icon={Workflow}
          label="Normalized the lifecycle"
          description="Mapped request, decision, execution, and resolution into one state model."
        />
        <ChainOfThoughtStep
          icon={ShieldCheck}
          label="Checked audit and safety requirements"
          description="Kept actor, scope, timestamp, and final outcome attached to every action."
        />
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
}

function ApprovalContract() {
  const [approval, setApproval] = React.useState<ConfirmationApproval>({
    id: "apply-approval-contract",
  });
  const [state, setState] =
    React.useState<ConfirmationState>("approval-requested");

  function respond(approved: boolean, reason?: string) {
    setApproval((current) => ({ ...current, approved, reason }));
    setState(approved ? "output-available" : "output-denied");
  }

  function reset() {
    setApproval({ id: "apply-approval-contract" });
    setState("approval-requested");
  }

  return (
    <div className="px-1.5 pt-1">
      <Confirmation approval={approval} state={state}>
        <ConfirmationRequest>
          <div className="space-y-2">
            <ConfirmationTitle>
              Apply this contract to the admin screen specifications?
            </ConfirmationTitle>
            <p className="text-muted-foreground text-xs leading-5">
              This will standardize approval copy and state names across chat,
              workflows, and background runs. No production actions will run.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["40 screens", "UI copy", "State mapping"].map((scope) => (
                <span
                  key={scope}
                  className="bg-muted rounded-md border px-2 py-0.5 text-[11px]"
                >
                  {scope}
                </span>
              ))}
            </div>
          </div>
        </ConfirmationRequest>
        <ConfirmationAccepted>
          <div className="flex items-start gap-2 text-sm">
            <Check
              className="mt-0.5 size-4 shrink-0 text-emerald-600"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium">
                {approval.reason
                  ? "Always allowed for this workspace"
                  : "Approved for this conversation"}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {approval.reason
                  ? "Future specification-only updates can use the same approved scope."
                  : "The specification update is ready to be queued."}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={reset}
            >
              Review again
            </Button>
          </div>
        </ConfirmationAccepted>
        <ConfirmationRejected>
          <div className="flex items-start gap-2 text-sm">
            <X
              className="text-muted-foreground mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium">Change not approved</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                The proposed contract remains available for review.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={reset}
            >
              Review again
            </Button>
          </div>
        </ConfirmationRejected>
        <ConfirmationActions>
          <ConfirmationAction
            variant="ghost"
            onClick={() => respond(false, "Operator rejected the change")}
          >
            Reject
          </ConfirmationAction>
          <ConfirmationAction
            variant="outline"
            onClick={() => respond(true, "Always allow for this workspace")}
          >
            Always allow
          </ConfirmationAction>
          <ConfirmationAction onClick={() => respond(true)}>
            Approve once
          </ConfirmationAction>
        </ConfirmationActions>
      </Confirmation>
    </div>
  );
}

function ResponseActions() {
  return (
    <div className="mt-1 flex items-center gap-1">
      <Button variant="ghost" size="icon-sm" aria-label="Copy response">
        <Copy aria-hidden="true" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Good response">
        <ThumbsUp aria-hidden="true" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Bad response">
        <ThumbsDown aria-hidden="true" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Regenerate response">
        <RefreshCw aria-hidden="true" />
      </Button>
    </div>
  );
}

export function AiChatConversation1Screen() {
  const [model, setModel] = React.useState(defaultAiModelId);
  const [prompt, setPrompt] = React.useState("");
  const chat = useMockChat();

  function submitPrompt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!chat.send(prompt)) return;
    setPrompt("");
  }

  return (
    <AiConversationShell
      activeRecent="Map agent approval states"
      headerTitle="Typed messages with Markdown"
      headerActions={
        <>
          <Button variant="ghost" size="sm" className="h-8 text-xs">
            <Share2 data-icon="inline-start" aria-hidden="true" />
            Share
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="More actions">
            <Ellipsis aria-hidden="true" />
          </Button>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <h1 className="sr-only">Typed messages with Markdown</h1>
        <AiConversationScroller>
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6 md:py-10">
            {conversationMessages.map((message) => (
              <AiChatMessage
                key={message.id}
                message={message}
                assistantAvatar={
                  <div className="border-border flex size-8 items-center justify-center rounded-lg border">
                    <BrandMark size="sm" />
                  </div>
                }
                assistantHeader={
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-[13px] font-medium">
                      Shadcnblocks AI
                    </span>
                    <span className="text-muted-foreground text-xs">
                      UI agent
                    </span>
                  </div>
                }
                actions={<ResponseActions />}
                renderPart={({ part }) => {
                  if (part.type !== "custom") return undefined;
                  if (part.data.kind === "review-activity") {
                    return <ReviewActivity />;
                  }
                  if (part.data.kind === "approval-contract") {
                    return <ApprovalContract />;
                  }
                  return undefined;
                }}
              />
            ))}
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
            aria-label="Continue conversation"
            className="max-w-2xl"
            onSubmit={submitPrompt}
            rail={
              <AiChatComposerRail className="hidden sm:flex">
                <span className="flex items-center gap-1.5">
                  <Folder className="size-3.5" aria-hidden="true" />
                  AI admin screens
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText className="size-3.5" aria-hidden="true" />
                  Approval state inventory
                </span>
              </AiChatComposerRail>
            }
          >
            <AiChatComposerEditor
              aria-label="Reply to Shadcnblocks AI"
              placeholder="Reply, use @ to add context, or / for commands"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="min-h-16"
            />
            <AiChatComposerToolbar>
              <AiChatComposerToolbarGroup>
                <AiChatAddContextAction />
                <AiChatComposerButton
                  size="sm"
                  className="h-8 gap-1.5 rounded-lg px-2 text-xs font-normal"
                >
                  <Clipboard aria-hidden="true" />
                  Context
                </AiChatComposerButton>
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
