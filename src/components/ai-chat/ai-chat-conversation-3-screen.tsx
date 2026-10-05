"use client";

import {
  Check,
  ChevronDown,
  Clipboard,
  Ellipsis,
  FileText,
  Folder,
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
import { AiConversationScroller } from "@/components/ai-chat/ai-conversation-scroller";
import { AiConversationShell } from "@/components/ai-chat/ai-conversation-shell";
import {
  AiModelPicker,
  defaultAiModelId,
} from "@/components/ai-chat/ai-model-picker";
import { AnimatedAgentBlob } from "@/components/ai-chat/animated-agent-blob";
import { useMockChat } from "@/components/ai-chat/use-mock-chat";
import { Button } from "@/components/ui/button";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";

const directions = [
  {
    id: "speed",
    title: "Ship faster",
    description: "Lead with ready-made patterns and implementation speed",
  },
  {
    id: "quality",
    title: "Raise UI quality",
    description: "Position consistency and polish as the primary value",
  },
  {
    id: "scale",
    title: "Scale the team",
    description: "Focus on shared conventions and fewer review cycles",
  },
] as const;

const subscribeToMount = () => () => {};

function getConversationMessages(answer?: string): AiChatMessageData[] {
  return [
    {
      id: "campaign-request",
      role: "user",
      parts: [
        {
          type: "text",
          text: "Build a launch campaign for our new admin template collection. Start with the strongest positioning angle before drafting the assets.",
        },
      ],
    },
    {
      id: "campaign-response",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "I reviewed the collection, recent customer requests, and the strongest-performing launch messages. The product can credibly support three different narratives.",
        },
        {
          type: "tool",
          id: "campaign-analysis",
          label: "Finished campaign analysis",
          detail: "Worked for 2m 46s",
          state: "output-available",
        },
        {
          type: "text",
          text: "Before I produce the brief and creative set, choose the narrative that should control the headline, proof points, and call to action.",
        },
        {
          type: "question",
          id: "campaign-direction",
          question: "Primary campaign direction:",
          answer,
          state: answer ? "answered" : "pending",
        },
      ],
    },
  ];
}

function CampaignAnalysisActivity() {
  return (
    <details className="group px-1.5">
      <summary className="hover:text-foreground w-fit cursor-pointer list-none transition-colors [&::-webkit-details-marker]:hidden">
        <Marker className="w-fit">
          <MarkerIcon>
            <ChevronDown
              className="-rotate-90 transition-transform group-open:rotate-0"
              strokeWidth={1.75}
            />
          </MarkerIcon>
          <MarkerContent>Worked for 2m 46s</MarkerContent>
        </Marker>
      </summary>
      <div className="text-muted-foreground mt-3 ml-2.5 space-y-2 border-l pl-5 text-sm">
        <p>Reviewed product usage and recent sales conversations</p>
        <p>Compared positioning across three audience segments</p>
        <p>Mapped each direction to campaign-ready proof points</p>
      </div>
    </details>
  );
}

function CampaignQuestion({
  answer,
  onDismiss,
  onSubmit,
  visible,
}: {
  answer: string;
  onDismiss: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  visible: boolean;
}) {
  const [selectedDirection, setSelectedDirection] = React.useState("");
  const [customDirection, setCustomDirection] = React.useState("");
  const [invalid, setInvalid] = React.useState(false);
  const mounted = React.useSyncExternalStore(
    subscribeToMount,
    () => true,
    () => false,
  );
  const errorId = React.useId();
  const customInput = React.useRef<HTMLInputElement>(null);
  const choices = React.useRef<Array<HTMLInputElement | null>>([]);
  const answerValue =
    selectedDirection === "custom" ? customDirection.trim() : selectedDirection;

  function selectDirection(value: string) {
    setSelectedDirection(value);
    setInvalid(false);
  }

  function submitAnswer(event: React.FormEvent<HTMLFormElement>) {
    if (!answerValue) {
      event.preventDefault();
      setInvalid(true);
      if (selectedDirection === "custom") customInput.current?.focus();
      else choices.current[0]?.focus();
      return;
    }
    onSubmit(event);
  }

  function handleShortcut(event: React.KeyboardEvent<HTMLFormElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      if (!event.repeat) event.currentTarget.requestSubmit();
      return;
    }
    if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
    if (
      event.target instanceof HTMLInputElement &&
      event.target.type === "text"
    )
      return;
    const index = ["1", "2", "3"].indexOf(event.key);
    if (index < 0) return;
    event.preventDefault();
    selectDirection(directions[index].id);
    choices.current[index]?.focus();
  }

  if (!visible) {
    return answer ? (
      <Marker className="bg-muted/45 text-foreground w-fit rounded-xl px-3 py-2.5">
        <MarkerIcon className="flex items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check className="size-3" />
        </MarkerIcon>
        <MarkerContent>Direction submitted: {answer}</MarkerContent>
      </Marker>
    ) : null;
  }

  return (
    <section className="bg-popover text-popover-foreground ring-foreground/5 dark:ring-foreground/10 w-full max-w-xl rounded-xl p-3 shadow-sm ring-1">
      <form
        data-slot="questionnaire"
        data-ready={mounted}
        onSubmit={submitAnswer}
        onKeyDown={handleShortcut}
        className="flex w-full min-w-0 flex-col gap-4"
        noValidate
      >
        <input type="hidden" name="direction" value={answerValue} />
        <fieldset
          data-slot="questionnaire-item"
          className="flex min-w-0 flex-col gap-3 border-0 p-0"
          aria-describedby={invalid ? errorId : undefined}
          aria-invalid={invalid || undefined}
        >
          <legend className="text-sm font-semibold">Choose a direction</legend>
          <p className="text-muted-foreground text-xs leading-5">
            Select a campaign angle or write another response.
          </p>
          <div className="grid min-w-0 gap-2">
            {directions.map((item, index) => (
              <label
                key={item.id}
                className="border-input bg-input/20 hover:bg-input/40 has-checked:border-primary/40 has-checked:bg-primary/10 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex min-h-0 cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-start text-[13px] transition-colors has-focus-visible:ring-3"
              >
                <input
                  ref={(node) => {
                    choices.current[index] = node;
                  }}
                  type="radio"
                  name="campaign-direction-choice"
                  value={item.id}
                  checked={selectedDirection === item.id}
                  onChange={() => selectDirection(item.id)}
                  aria-keyshortcuts={String(index + 1)}
                  className="peer absolute inset-0 z-10 size-full cursor-pointer opacity-0"
                  disabled={!mounted}
                />
                <span
                  aria-hidden="true"
                  className="bg-input/90 peer-checked:bg-primary peer-checked:border-primary mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-transparent"
                >
                  {selectedDirection === item.id ? (
                    <span className="bg-primary-foreground size-2 rounded-full" />
                  ) : null}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1 leading-snug">
                  <span className="font-medium">{item.title}</span>
                  <span className="text-muted-foreground text-xs leading-4">
                    {item.description}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="border-primary/10 bg-background/80 text-muted-foreground pointer-events-none ml-auto flex size-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px]"
                >
                  {index + 1}
                </span>
              </label>
            ))}
            <input
              ref={customInput}
              type="text"
              value={customDirection}
              onChange={(event) => {
                setCustomDirection(event.target.value);
                selectDirection("custom");
              }}
              onFocus={() => {
                if (customDirection.trim()) selectDirection("custom");
              }}
              aria-label="Another campaign direction"
              aria-invalid={invalid || undefined}
              aria-describedby={invalid ? errorId : undefined}
              placeholder="Type another direction"
              className="bg-input/30 focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:border-destructive h-9 min-h-9 w-full min-w-0 rounded-xl border border-transparent px-3 text-[13px] outline-none focus-visible:ring-3"
              disabled={!mounted}
            />
          </div>
          {invalid ? (
            <p id={errorId} role="alert" className="text-destructive text-sm">
              Choose an answer to continue.
            </p>
          ) : null}
        </fieldset>
        <div className="flex min-h-0 justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            disabled={!mounted}
          >
            Dismiss
          </Button>
          <Button type="submit" size="sm" disabled={!mounted}>
            Submit direction
          </Button>
        </div>
      </form>
    </section>
  );
}

export function AiChatConversation3Screen() {
  const [model, setModel] = React.useState(defaultAiModelId);
  const [prompt, setPrompt] = React.useState("");
  const chat = useMockChat();
  const [questionVisible, setQuestionVisible] = React.useState(true);
  const [submittedDirection, setSubmittedDirection] = React.useState("");
  const messages = getConversationMessages(submittedDirection || undefined);

  function submitPrompt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!chat.send(prompt)) return;
    setPrompt("");
  }

  function submitDirection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(
      new FormData(event.currentTarget).get("direction") ?? "",
    );
    const label = directions.find((item) => item.id === value)?.title ?? value;
    setSubmittedDirection(label);
    setQuestionVisible(false);
  }

  return (
    <AiConversationShell
      activeRecent="Choose campaign direction"
      headerTitle="Interactive questions and answers"
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
        <h1 className="sr-only">Interactive questions and answers</h1>

        <AiConversationScroller>
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-9 px-4 py-8 sm:px-6 md:py-10">
            {messages.map((message) => (
              <AiChatMessage
                key={message.id}
                message={message}
                assistantAvatar={
                  <AnimatedAgentBlob
                    className="size-8"
                    colors={["#050505", "#171717", "#050505"]}
                    silhouette="pebble"
                    phase={2.15}
                    decorative
                  />
                }
                assistantHeader={
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-[13px] font-medium">
                      Shadcnblocks AI
                    </span>
                    <span className="text-muted-foreground text-xs">
                      Campaign agent
                    </span>
                  </div>
                }
                renderPart={({ part }) => {
                  if (part.type === "tool" && part.id === "campaign-analysis") {
                    return <CampaignAnalysisActivity />;
                  }
                  if (
                    part.type === "question" &&
                    part.id === "campaign-direction"
                  ) {
                    return (
                      <CampaignQuestion
                        answer={submittedDirection}
                        visible={questionVisible}
                        onDismiss={() => setQuestionVisible(false)}
                        onSubmit={submitDirection}
                      />
                    );
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
                  Launch workspace
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText className="size-3.5" aria-hidden="true" />
                  Campaign brief
                </span>
              </AiChatComposerRail>
            }
          >
            <AiChatComposerEditor
              aria-label="Reply to the campaign agent"
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
