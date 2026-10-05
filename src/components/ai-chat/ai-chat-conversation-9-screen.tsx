"use client";

import {
  Check,
  Circle,
  Ellipsis,
  GitBranch,
  LoaderCircle,
  RotateCcw,
  Share2,
  ShieldCheck,
  X,
} from "lucide-react";
import * as React from "react";

import {
  AiChatComposer,
  AiChatComposerEditor,
  AiChatComposerSubmit,
  AiChatComposerToolbar,
  AiChatComposerToolbarGroup,
} from "@/components/ai-chat/ai-chat-composer";
import { AiChatAddContextAction } from "@/components/ai-chat/ai-chat-context-picker";
import {
  AiChatMessage,
  type AiChatMessageData,
  type AiChatToolPart,
} from "@/components/ai-chat/ai-chat-message";
import { AiCodingSessionsSidebar } from "@/components/ai-chat/ai-coding-sessions-sidebar";
import { AiConversationScroller } from "@/components/ai-chat/ai-conversation-scroller";
import { AiConversationShell } from "@/components/ai-chat/ai-conversation-shell";
import {
  AiModelPicker,
  defaultAiModelId,
} from "@/components/ai-chat/ai-model-picker";
import { useMockChat } from "@/components/ai-chat/use-mock-chat";
import {
  Checkpoint,
  CheckpointTrigger,
} from "@/components/ai-elements/checkpoint";
import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRejected,
  ConfirmationRequest,
  ConfirmationTitle,
} from "@/components/ai-elements/confirmation";
import {
  Plan,
  PlanContent,
  PlanDescription,
  PlanFooter,
  PlanHeader,
  PlanTitle,
  PlanTrigger,
} from "@/components/ai-elements/plan";
import { BrandMark } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Decision = "approved" | "pending" | "rejected";
type ApprovalScope = "once" | "workspace";
type PlanStepStatus = "active" | "complete" | "pending";

type LifecyclePartData =
  | { kind: "approval" }
  | { kind: "checkpoint" }
  | { kind: "plan" };

const userMessage: AiChatMessageData = {
  id: "migration-request",
  role: "user",
  parts: [
    {
      type: "text",
      text: "Plan and execute a safe migration for the billing webhook handlers. Show me every tool call, stop before changing files, and keep a restore point in case the replay test fails.",
    },
  ],
};

function PlanStep({
  children,
  status,
}: {
  children: React.ReactNode;
  status: PlanStepStatus;
}) {
  return (
    <li
      className={cn(
        "flex items-start gap-2.5 text-xs leading-5",
        status === "pending" && "text-muted-foreground/60",
      )}
    >
      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
        {status === "complete" ? (
          <Check className="size-3.5 text-emerald-600" aria-hidden="true" />
        ) : status === "active" ? (
          <LoaderCircle
            className="size-3.5 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
        ) : (
          <Circle className="size-3 text-current" aria-hidden="true" />
        )}
      </span>
      <span>{children}</span>
    </li>
  );
}

function MigrationPlan({
  decision,
  replayState,
}: {
  decision: Decision;
  replayState: AiChatToolPart["state"];
}) {
  const approved = decision === "approved";
  const replayRunning = replayState === "input-available";
  const replayComplete = replayState === "output-available";

  return (
    <div className="px-1.5">
      <Plan defaultOpen>
        <PlanHeader>
          <div className="min-w-0">
            <PlanTitle>Migrate billing webhooks safely</PlanTitle>
            <PlanDescription>
              Inspect first, request approval, replay signed events, and retain
              a reversible checkpoint.
            </PlanDescription>
          </div>
          <PlanTrigger />
        </PlanHeader>
        <PlanContent>
          <ol className="space-y-2.5">
            <PlanStep status="complete">
              Inspect existing webhook routes and signature utilities
            </PlanStep>
            <PlanStep status={approved ? "complete" : "pending"}>
              Apply one signature-verification boundary to three handlers
            </PlanStep>
            <PlanStep
              status={
                replayComplete
                  ? "complete"
                  : replayRunning
                    ? "active"
                    : "pending"
              }
            >
              Replay a failed, duplicate, and successful billing event
            </PlanStep>
            <PlanStep status={replayComplete ? "complete" : "pending"}>
              Record results and preserve the pre-migration checkpoint
            </PlanStep>
          </ol>
        </PlanContent>
        <PlanFooter className="gap-2">
          <Badge variant="secondary" className="font-normal">
            4 steps
          </Badge>
          <span className="text-muted-foreground ml-auto text-[11px]">
            {decision === "pending"
              ? "Waiting for approval"
              : decision === "rejected"
                ? "Not started"
                : replayComplete
                  ? "Completed"
                  : "In progress"}
          </span>
        </PlanFooter>
      </Plan>
    </div>
  );
}

function MigrationApproval({
  decision,
  onApprove,
  onReject,
  scope,
}: {
  decision: Decision;
  onApprove: (scope: ApprovalScope) => void;
  onReject: () => void;
  scope: ApprovalScope;
}) {
  const approved = decision === "approved";
  const rejected = decision === "rejected";

  return (
    <div className="px-1.5">
      <Confirmation
        approval={{
          id: "billing-webhook-migration",
          approved: approved ? true : rejected ? false : undefined,
          reason: approved ? scope : undefined,
        }}
        state={
          approved
            ? "output-available"
            : rejected
              ? "output-denied"
              : "approval-requested"
        }
      >
        <ConfirmationRequest>
          <div className="space-y-1.5">
            <ConfirmationTitle>
              Allow changes to three billing webhook handlers?
            </ConfirmationTitle>
            <p className="text-muted-foreground text-xs leading-5">
              The agent can edit handler code and run local replay fixtures. It
              cannot deploy, rotate secrets, or contact the production API.
            </p>
          </div>
        </ConfirmationRequest>
        <ConfirmationAccepted>
          <div className="flex items-start gap-2 text-sm">
            <ShieldCheck
              className="mt-0.5 size-4 shrink-0 text-emerald-600"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium">
                {scope === "workspace"
                  ? "Allowed for this workspace"
                  : "Approved once"}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Execution remains limited to the reviewed plan and local
                fixtures.
              </p>
            </div>
          </div>
        </ConfirmationAccepted>
        <ConfirmationRejected>
          <div className="flex items-start gap-2 text-sm">
            <X
              className="text-muted-foreground mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium">Migration not approved</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                No files were changed and no replay fixtures were run.
              </p>
            </div>
          </div>
        </ConfirmationRejected>
        <ConfirmationActions>
          <ConfirmationAction variant="ghost" onClick={onReject}>
            Reject
          </ConfirmationAction>
          <ConfirmationAction
            variant="outline"
            onClick={() => onApprove("workspace")}
          >
            Always allow
          </ConfirmationAction>
          <ConfirmationAction onClick={() => onApprove("once")}>
            Approve once
          </ConfirmationAction>
        </ConfirmationActions>
      </Confirmation>
    </div>
  );
}

function RestoreCheckpoint({ onRestore }: { onRestore: () => void }) {
  return (
    <Checkpoint className="px-1.5 py-1">
      <span className="shrink-0 text-xs">Before webhook migration</span>
      <CheckpointTrigger
        className="h-7 shrink-0 px-2 text-xs"
        tooltip="Restore the thread and execution state to this checkpoint"
        onClick={onRestore}
      >
        <RotateCcw aria-hidden="true" />
        Restore
      </CheckpointTrigger>
    </Checkpoint>
  );
}

export function AiChatConversation9Screen() {
  const [model, setModel] = React.useState(defaultAiModelId);
  const [prompt, setPrompt] = React.useState("");
  const chat = useMockChat();
  const [decision, setDecision] = React.useState<Decision>("pending");
  const [scope, setScope] = React.useState<ApprovalScope>("once");
  const [replayState, setReplayState] =
    React.useState<AiChatToolPart["state"]>("output-error");
  const retryTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  React.useEffect(
    () => () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
    },
    [],
  );

  function approve(nextScope: ApprovalScope) {
    setScope(nextScope);
    setDecision("approved");
  }

  function restore() {
    if (retryTimer.current) clearTimeout(retryTimer.current);
    setDecision("pending");
    setScope("once");
    setReplayState("output-error");
  }

  function retryReplay() {
    if (retryTimer.current) clearTimeout(retryTimer.current);
    setReplayState("input-available");
    retryTimer.current = setTimeout(() => {
      setReplayState("output-available");
    }, 1200);
  }

  const assistantParts: AiChatMessageData<LifecyclePartData>["parts"] = [
    {
      type: "text",
      text: "I mapped the migration into a reversible four-step plan. I will stop at the approval boundary before editing any handler.",
    },
    {
      type: "custom",
      id: "migration-plan",
      name: "migration-plan",
      data: { kind: "plan" },
    },
    {
      type: "custom",
      id: "migration-approval",
      name: "migration-approval",
      data: { kind: "approval" },
    },
  ];

  if (decision === "approved") {
    assistantParts.push(
      {
        type: "custom",
        id: "pre-migration-checkpoint",
        name: "pre-migration-checkpoint",
        data: { kind: "checkpoint" },
      },
      {
        type: "tool",
        id: "inspect-webhooks",
        label: "Inspect billing webhook routes",
        detail: "3 handlers · 2 shared utilities",
        state: "output-available",
        input: {
          paths: [
            "src/app/api/webhooks/invoice/route.ts",
            "src/app/api/webhooks/payment/route.ts",
            "src/app/api/webhooks/subscription/route.ts",
          ],
          inspect: ["signature verification", "idempotency", "error policy"],
        },
        output: {
          handlers: 3,
          sharedVerification: false,
          idempotencyCoverage: "2 of 3",
        },
      },
      {
        type: "tool",
        id: "replay-events",
        label: "Replay signed billing events",
        detail:
          replayState === "input-available"
            ? "Running 3 fixtures"
            : replayState === "output-available"
              ? "3 fixtures passed"
              : "1 fixture failed",
        state: replayState,
        input: {
          fixtures: [
            "invoice.failed",
            "payment.duplicate",
            "payment.succeeded",
          ],
          environment: "local",
        },
        output:
          replayState === "output-available"
            ? {
                passed: 3,
                failed: 0,
                duplicateEventsIgnored: 1,
              }
            : undefined,
        error:
          replayState === "output-error"
            ? "payment.duplicate returned 500 instead of an idempotent 200 response"
            : undefined,
        retryable: true,
      },
      {
        type: "text",
        text:
          replayState === "output-error"
            ? "The migration is paused at the replay failure. The checkpoint is still available, and no deployment has occurred."
            : replayState === "input-available"
              ? "The replay is running against local fixtures. Production remains untouched."
              : "All replay fixtures now pass, including the duplicate-event case. The migration is ready for review, but it has not been deployed.",
      },
    );
  } else if (decision === "rejected") {
    assistantParts.push({
      type: "text",
      text: "Understood. I kept the plan for reference and did not start execution.",
    });
  }

  const assistantMessage: AiChatMessageData<LifecyclePartData> = {
    id: "migration-agent-response",
    role: "assistant",
    parts: assistantParts,
  };

  return (
    <AiConversationShell
      activeRecent="Plan billing webhook migration"
      hideSidebarFooter
      sidebarScrollMode="nested"
      sidebarContent={<AiCodingSessionsSidebar />}
      headerTitle="Agent plan, execution, and checkpoints"
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
        <h1 className="sr-only">Agent plan, execution, and checkpoints</h1>
        <AiConversationScroller>
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6 md:py-10">
            <AiChatMessage message={userMessage} />
            <AiChatMessage
              message={assistantMessage}
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
                    Migration agent
                  </span>
                </div>
              }
              onRetryPart={(part) => {
                if (part.type === "tool" && part.id === "replay-events") {
                  retryReplay();
                }
              }}
              renderPart={({ part }) => {
                if (part.type !== "custom") return undefined;
                if (part.data.kind === "plan") {
                  return (
                    <MigrationPlan
                      decision={decision}
                      replayState={replayState}
                    />
                  );
                }
                if (part.data.kind === "approval") {
                  return (
                    <MigrationApproval
                      decision={decision}
                      scope={scope}
                      onApprove={approve}
                      onReject={() => setDecision("rejected")}
                    />
                  );
                }
                if (part.data.kind === "checkpoint") {
                  return <RestoreCheckpoint onRestore={restore} />;
                }
                return undefined;
              }}
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
            aria-label="Continue migration conversation"
            className="max-w-2xl"
            onSubmit={(event) => {
              event.preventDefault();
              if (chat.send(prompt)) setPrompt("");
            }}
          >
            <AiChatComposerEditor
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Ask about the plan, tool output, or checkpoint…"
              className="min-h-16"
            />
            <AiChatComposerToolbar>
              <AiChatComposerToolbarGroup>
                <AiChatAddContextAction />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                >
                  <GitBranch aria-hidden="true" />
                  Migration
                </Button>
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
