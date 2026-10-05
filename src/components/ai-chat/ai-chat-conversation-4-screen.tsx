"use client";

import {
  CalendarDays,
  Check,
  Clipboard,
  Copy,
  Ellipsis,
  FileText,
  Folder,
  Lightbulb,
  Mail,
  RefreshCw,
  Share2,
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
import {
  AiConversationSidebarItem,
  AiConversationSidebarSection,
} from "@/components/ai-chat/ai-conversation-navigation";
import { AiConversationScroller } from "@/components/ai-chat/ai-conversation-scroller";
import { AiConversationShell } from "@/components/ai-chat/ai-conversation-shell";
import {
  AiModelPicker,
  defaultAiModelId,
} from "@/components/ai-chat/ai-model-picker";
import { useMockChat } from "@/components/ai-chat/use-mock-chat";
import { Button } from "@/components/ui/button";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const meetingGroups = [
  {
    label: "Today",
    meetings: ["Weekly kickoff", "Company all-hands"],
  },
  {
    label: "Yesterday",
    meetings: ["Audio test meeting", "1:1 with Brian", "1:1 with Alex"],
  },
  {
    label: "This week",
    meetings: [
      "Project kickoff",
      "Team sync with Jordan",
      "Design review with Maya",
      "Initial concepts discussion",
    ],
  },
];

const insights = [
  "Activation improved 12.5% after simplifying the first-run checklist",
  "The template launch remains on schedule for Thursday",
  "Support volume fell 18% after the navigation update",
  "Enterprise onboarding needs a clearer owner for security reviews",
  "The team will test the new table density defaults this week",
];

type MeetingArtifactData = { kind: "meeting-summary" };

const meetingMessage: AiChatMessageData<MeetingArtifactData> = {
  id: "weekly-kickoff-summary",
  role: "assistant",
  parts: [
    {
      type: "custom",
      id: "meeting-summary",
      name: "meeting-summary",
      data: { kind: "meeting-summary" },
    },
  ],
};

function MeetingSidebarContent() {
  return (
    <>
      <AiConversationSidebarSection label="Actions">
        <AiConversationSidebarItem active icon={Lightbulb} label="Insights" />
      </AiConversationSidebarSection>

      {meetingGroups.map((group) => (
        <AiConversationSidebarSection key={group.label} label={group.label}>
          {group.meetings.map((meeting) => (
            <AiConversationSidebarItem
              key={meeting}
              active={meeting === "Weekly kickoff"}
              label={meeting}
            />
          ))}
        </AiConversationSidebarSection>
      ))}
    </>
  );
}

function MeetingArtifact({
  completedActions,
  copied,
  setCopied,
  toggleAction,
}: {
  completedActions: string[];
  copied: boolean;
  setCopied: React.Dispatch<React.SetStateAction<boolean>>;
  toggleAction: (action: string) => void;
}) {
  const copyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            Monday, 9:30 AM · 42 minutes
          </div>
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
            Weekly kickoff
          </h1>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs">
          <RefreshCw aria-hidden="true" />
          Regenerate
        </Button>
      </div>

      <p className="text-muted-foreground mt-6 max-w-2xl text-base leading-7">
        The team reported stronger activation and lower support volume. This
        week centers on shipping the template collection, clarifying enterprise
        onboarding ownership, and validating the new product table density
        system.
      </p>

      <section className="mt-10">
        <h2 className="text-muted-foreground text-sm font-medium">Summary</h2>
        <div className="mt-5 ml-2.5 border-l pl-6">
          {insights.map((insight, index) => (
            <div
              key={insight}
              className={cn(
                "relative pb-4 text-sm leading-6 last:pb-0",
                completedActions.includes(insight) &&
                  "text-muted-foreground line-through",
              )}
            >
              <button
                type="button"
                aria-label={
                  completedActions.includes(insight)
                    ? "Mark insight incomplete"
                    : "Mark insight complete"
                }
                aria-pressed={completedActions.includes(insight)}
                onClick={() => toggleAction(insight)}
                className={cn(
                  "bg-muted ring-background absolute top-1 -left-[31px] flex size-3 items-center justify-center rounded-full ring-4 transition-colors",
                  completedActions.includes(insight) && "bg-emerald-500",
                )}
              >
                {completedActions.includes(insight) ? (
                  <Check className="size-2.5 text-white" aria-hidden="true" />
                ) : null}
              </button>
              <span className="text-muted-foreground mr-2 text-xs tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              {insight}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-muted-foreground text-sm font-medium">Actions</h2>
          <Marker className="w-fit text-xs">
            <MarkerIcon>
              <Check className="text-emerald-500" />
            </MarkerIcon>
            <MarkerContent>Generated from transcript</MarkerContent>
          </Marker>
        </div>

        <div className="overflow-hidden rounded-xl border shadow-xs">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-blue-500 text-white">
                <Mail className="size-3.5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium">Follow-up email</p>
                <p className="text-muted-foreground text-xs">Ready to review</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Copy email draft"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    "To: product-team@acme.co\nSubject: Weekly kickoff — decisions and next steps\n\nHi team,\n\nThanks for a focused kickoff. Activation and support trends are moving in the right direction, and the template launch remains on track for Thursday.\n\nThis week we’ll confirm an owner for enterprise security reviews and validate the balanced table density before the release candidate is cut.\n\nThanks!",
                  );
                } catch {
                  return;
                }
                setCopied(true);
                if (copyTimer.current) clearTimeout(copyTimer.current);
                copyTimer.current = setTimeout(() => setCopied(false), 1600);
              }}
            >
              {copied ? (
                <Check className="text-emerald-500" aria-hidden="true" />
              ) : (
                <Copy aria-hidden="true" />
              )}
            </Button>
          </div>
          <Separator />

          <dl className="grid grid-cols-[5.5rem_minmax(0,1fr)] text-sm">
            <dt className="text-muted-foreground border-b px-4 py-3">To</dt>
            <dd className="border-b px-4 py-3">product-team@acme.co</dd>
            <dt className="text-muted-foreground border-b px-4 py-3">
              Subject
            </dt>
            <dd className="border-b px-4 py-3">
              Weekly kickoff — decisions and next steps
            </dd>
          </dl>

          <div className="space-y-4 px-4 py-5 text-sm leading-6 sm:px-6">
            <p>Hi team,</p>
            <p>
              Thanks for a focused kickoff. Activation and support trends are
              moving in the right direction, and the template launch remains on
              track for Thursday.
            </p>
            <p>
              This week we’ll confirm an owner for enterprise security reviews
              and validate the balanced table density before the release
              candidate is cut.
            </p>
            <p>Thanks!</p>
          </div>
        </div>
      </section>
    </>
  );
}

export function AiChatConversation4Screen() {
  const [model, setModel] = React.useState(defaultAiModelId);
  const [prompt, setPrompt] = React.useState("");
  const chat = useMockChat();
  const [copied, setCopied] = React.useState(false);
  const [completedActions, setCompletedActions] = React.useState<string[]>([]);

  function submitPrompt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!chat.send(prompt)) return;
    setPrompt("");
  }

  function toggleAction(action: string) {
    setCompletedActions((current) =>
      current.includes(action)
        ? current.filter((item) => item !== action)
        : [...current, action],
    );
  }

  return (
    <AiConversationShell
      activeRecent="Summarize weekly kickoff"
      headerTitle="Custom artifacts and actions"
      sidebarContent={<MeetingSidebarContent />}
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
        <AiConversationScroller>
          <article className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 md:py-12">
            <AiChatMessage
              message={meetingMessage}
              renderPart={({ part }) =>
                part.type === "custom" &&
                part.data.kind === "meeting-summary" ? (
                  <MeetingArtifact
                    completedActions={completedActions}
                    copied={copied}
                    setCopied={setCopied}
                    toggleAction={toggleAction}
                  />
                ) : undefined
              }
            />
          </article>
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
            aria-label="Ask about this meeting"
            className="max-w-2xl"
            onSubmit={submitPrompt}
            rail={
              <AiChatComposerRail className="hidden sm:flex">
                <span className="flex items-center gap-1.5">
                  <Folder className="size-3.5" aria-hidden="true" />
                  Product team
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText className="size-3.5" aria-hidden="true" />
                  Weekly kickoff transcript
                </span>
              </AiChatComposerRail>
            }
          >
            <AiChatComposerEditor
              aria-label="Ask about the weekly kickoff"
              placeholder="Ask about the meeting or request another action"
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
                  Transcript
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
