"use client";

import {
  BookOpen,
  Captions,
  Clipboard,
  FilePlus2,
  FileText,
  FileVideo,
  Folder,
  Library,
  Mic2,
  PanelRight,
  Pause,
  Play,
  Plus,
  Scissors,
  Search,
  Share2,
  Users,
  Workflow,
  X,
} from "lucide-react";
import * as React from "react";

import {
  AiChatComposer,
  AiChatComposerAction,
  AiChatComposerButton,
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
import { AnimatedAgentBlob } from "@/components/ai-chat/animated-agent-blob";
import { useMockChat } from "@/components/ai-chat/use-mock-chat";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const workspaceNavigation = [
  { icon: BookOpen, label: "Overview" },
  { icon: Library, label: "Source library" },
  { icon: Workflow, label: "Content pipeline" },
];

const productionNavigation = [
  { icon: Mic2, label: "Recordings", active: true },
  { icon: FileText, label: "Drafts" },
  { icon: Users, label: "Speakers" },
];

const recordingProjects = [
  "Future of creative work",
  "Design systems roundtable",
  "Founder interview series",
];

const transcript = [
  {
    speaker: "Maya Chen",
    avatar: "/avatars/avatar-2.png",
    time: "00:18",
    text: "The important shift is not that AI replaces creative judgment. It removes repetitive production work so teams can spend more time shaping the direction.",
  },
  {
    speaker: "Jon Bell",
    avatar: "/avatars/avatar-4.png",
    time: "00:46",
    text: "That changes the skills we reward. Taste, framing, and the ability to make a decision become more valuable than producing endless variations.",
  },
  {
    speaker: "Maya Chen",
    avatar: "/avatars/avatar-2.png",
    time: "01:21",
    text: "The best tools should preserve the source material and make every generated claim traceable back to the conversation.",
  },
  {
    speaker: "Jon Bell",
    avatar: "/avatars/avatar-4.png",
    time: "02:08",
    text: "We also need clear review points. Fast generation is useful only when an editor can understand what changed and approve the result.",
  },
];

const clips = [
  { title: "AI changes the role of the creator", range: "00:18–00:43" },
  { title: "Taste becomes the differentiator", range: "00:46–01:12" },
  { title: "Generated claims need traceability", range: "01:21–01:49" },
];

type RecordingPartData = { kind: "generated-brief" };

const conversationMessages: AiChatMessageData<RecordingPartData>[] = [
  {
    id: "recording-request",
    role: "user",
    parts: [
      {
        type: "text",
        text: "Summarize this recording and create an editorial brief with the key takeaways, supporting moments, and a publishable opening paragraph.",
      },
    ],
  },
  {
    id: "recording-response",
    role: "assistant",
    parts: [
      {
        type: "tool",
        id: "transcribe-recording",
        label: "Transcribed 38-minute video",
        detail: "4 speakers",
        state: "output-available",
      },
      {
        type: "tool",
        id: "search-sources",
        label: "Reviewed linked source material",
        detail: "5 sources",
        state: "output-available",
      },
      {
        type: "tool",
        id: "align-transcript",
        label: "Aligned claims with transcript moments",
        detail: "12 references",
        state: "output-available",
      },
      {
        type: "text",
        text: `AI is not replacing creativity—it is changing where creative professionals spend their attention. Repetitive execution is becoming faster, while direction, taste, storytelling, and accountable decision-making become more important.

### Key takeaways

- **Creative judgment moves upstream.** Teams spend less time producing variations and more time defining the right problem and selecting a direction.
- **Traceability matters.** Generated claims should remain connected to the recording and supporting source material.
- **Review remains essential.** Faster production still needs explicit editorial checkpoints and clear ownership.`,
      },
      {
        type: "custom",
        id: "generated-brief",
        name: "generated-brief",
        data: { kind: "generated-brief" },
      },
    ],
  },
];

function RecordingSidebar() {
  return (
    <ScrollArea className="h-full">
      <div className="pb-4">
        <AiConversationSidebarSection label="Actions">
          {workspaceNavigation.map((item) => (
            <AiConversationSidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
            />
          ))}
        </AiConversationSidebarSection>

        <AiConversationSidebarSection label="Production">
          {productionNavigation.map((item) => (
            <AiConversationSidebarItem
              key={item.label}
              active={item.active}
              icon={item.icon}
              label={item.label}
            />
          ))}
        </AiConversationSidebarSection>

        <AiConversationSidebarSection label="Recording projects">
          {recordingProjects.map((project) => (
            <AiConversationSidebarItem
              key={project}
              active={project === recordingProjects[0]}
              icon={Folder}
              label={project}
            />
          ))}
        </AiConversationSidebarSection>
      </div>
    </ScrollArea>
  );
}

function SourceBundle() {
  return (
    <div className="ml-auto grid w-fit max-w-full gap-1.5">
      <div className="bg-background flex max-w-72 items-center gap-2 rounded-lg border px-2.5 py-2 text-xs shadow-xs">
        <FileVideo className="size-4 shrink-0 text-violet-500" />
        <span className="min-w-0 truncate">creative-work-roundtable.mp4</span>
        <span className="text-muted-foreground shrink-0">38:12</span>
      </div>
      <div className="bg-background flex max-w-72 items-center gap-2 rounded-lg border px-2.5 py-2 text-xs shadow-xs">
        <FileText className="size-4 shrink-0 text-orange-500" />
        <span className="min-w-0 truncate">editorial-research-notes.pdf</span>
        <span className="text-muted-foreground shrink-0">12 pages</span>
      </div>
    </div>
  );
}

function GeneratedBrief({
  onCreateDraft,
  onOpenTranscript,
}: {
  onCreateDraft: () => void;
  onOpenTranscript: () => void;
}) {
  return (
    <div className="space-y-3 px-1.5">
      <button
        type="button"
        onClick={onOpenTranscript}
        className="hover:bg-muted/40 focus-visible:ring-ring flex w-full items-center gap-3 rounded-xl border p-3 text-left shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        <span className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg">
          <FileText className="size-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">
            Future of creative work — editorial brief
          </span>
          <span className="text-muted-foreground block text-xs">
            Generated document · 3 sections
          </span>
        </span>
        <BookOpen className="text-muted-foreground size-4" aria-hidden="true" />
      </button>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onOpenTranscript}>
          <Captions aria-hidden="true" />
          Review transcript
        </Button>
        <Button variant="ghost" size="sm" onClick={onCreateDraft}>
          <FilePlus2 aria-hidden="true" />
          Create social draft
        </Button>
      </div>
    </div>
  );
}

function VideoThumbnail({
  onPlayingChange,
  playing,
}: {
  onPlayingChange: () => void;
  playing: boolean;
}) {
  return (
    <button
      type="button"
      className="group focus-visible:ring-ring relative aspect-video w-full overflow-hidden rounded-xl bg-black text-left shadow-sm focus-visible:ring-2 focus-visible:outline-none"
      aria-label={playing ? "Pause recording" : "Play recording"}
      aria-pressed={playing}
      onClick={onPlayingChange}
      style={{
        backgroundImage: "url('/images/project-backgrounds/8.png')",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <span className="absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-black/20" />
      <span className="absolute top-3 left-3 rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-white uppercase">
        Video essay
      </span>
      <span className="absolute right-3 bottom-3 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-white tabular-nums">
        38:12
      </span>
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-black/70 text-white shadow-lg ring-1 ring-white/25 transition-transform group-hover:scale-105">
          {playing ? (
            <Pause className="size-5 fill-current" aria-hidden="true" />
          ) : (
            <Play className="ml-0.5 size-5 fill-current" aria-hidden="true" />
          )}
        </span>
      </span>
      <span className="absolute right-4 bottom-7 left-4 text-white">
        <span className="block text-[10px] font-medium tracking-wide text-white/75 uppercase">
          Creative operations roundtable
        </span>
        <span className="mt-0.5 block max-w-[18rem] text-sm leading-5 font-semibold">
          How AI changes the role of the creator
        </span>
      </span>
      <span className="absolute inset-x-0 bottom-0 h-1 bg-white/25">
        <span className="block h-full w-[18%] bg-red-600" />
      </span>
    </button>
  );
}

function RecordingContextPanel({ onClose }: { onClose?: () => void }) {
  const [tab, setTab] = React.useState<"clips" | "transcript">("transcript");
  const [playing, setPlaying] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const filteredTranscript = transcript.filter((item) =>
    `${item.speaker} ${item.text}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="bg-background flex h-full min-h-0 w-full flex-col">
      <div className="flex h-12 shrink-0 items-center gap-1 border-b px-3">
        <Button
          variant={tab === "transcript" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setTab("transcript")}
        >
          <Captions aria-hidden="true" />
          Transcript
        </Button>
        <Button
          variant={tab === "clips" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setTab("clips")}
        >
          <Scissors aria-hidden="true" />
          Clips
        </Button>
        {onClose ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className="ml-auto"
            aria-label="Close recording context"
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </Button>
        ) : null}
      </div>

      {tab === "transcript" ? (
        <>
          <div className="shrink-0 space-y-4 border-b p-4">
            <div>
              <h2 className="text-base font-medium tracking-tight">
                Future of creative work
              </h2>
              <p className="text-muted-foreground mt-1 text-xs">
                38 minutes · 4 speakers · 5 linked sources
              </p>
            </div>
            <VideoThumbnail
              playing={playing}
              onPlayingChange={() => setPlaying((current) => !current)}
            />
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search transcript"
                autoComplete="off"
                name="transcript-search"
                placeholder="Search transcript"
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>
          <ScrollArea className="min-h-0 flex-1">
            <div className="divide-y">
              {filteredTranscript.map((item) => (
                <article key={`${item.speaker}-${item.time}`} className="p-4">
                  <div className="flex items-center gap-2 text-xs">
                    <Avatar className="size-6 border">
                      <AvatarImage
                        src={item.avatar}
                        alt={`${item.speaker} profile photo`}
                      />
                    </Avatar>
                    <span className="font-medium">{item.speaker}</span>
                    <span className="text-muted-foreground ml-auto tabular-nums">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </ScrollArea>
        </>
      ) : (
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-2 p-4">
            <div className="mb-4">
              <h2 className="text-base font-medium">Suggested clips</h2>
              <p className="text-muted-foreground mt-1 text-xs">
                Transcript moments with complete ideas and clean boundaries.
              </p>
            </div>
            {clips.map((clip, index) => (
              <button
                key={clip.title}
                type="button"
                className="hover:bg-muted/50 flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors"
              >
                <span className="bg-muted flex size-8 items-center justify-center rounded-full">
                  <Play className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">
                    {clip.title}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    Clip {index + 1} · {clip.range}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

export function AiChatConversation8Screen() {
  const [model, setModel] = React.useState(defaultAiModelId);
  const [prompt, setPrompt] = React.useState("");
  const chat = useMockChat();
  const [contextOpen, setContextOpen] = React.useState(false);
  const [compact, setCompact] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia("(max-width: 1099px)");
    const update = () => {
      setCompact(query.matches);
      setContextOpen(!query.matches);
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  function openContext() {
    setContextOpen(true);
  }

  return (
    <AiConversationShell
      activeRecent="Synthesize recording"
      headerTitle="Recording synthesis and transcript"
      sidebarScrollMode="nested"
      sidebarContent={<RecordingSidebar />}
      headerActions={
        <>
          <Button
            variant="ghost"
            size="sm"
            className="hidden h-8 text-xs sm:flex"
          >
            <Share2 data-icon="inline-start" aria-hidden="true" />
            Share
          </Button>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex h-12 shrink-0 items-center border-b px-4">
            <span className="text-xs font-medium">Create content</span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="ml-auto size-7"
              aria-label="Toggle recording transcript"
              aria-expanded={contextOpen}
              aria-controls="recording-context-panel"
              onClick={() => setContextOpen((current) => !current)}
            >
              <PanelRight aria-hidden="true" />
            </Button>
          </div>

          <AiConversationScroller>
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-7 px-4 py-7 sm:px-6 md:py-9">
              <SourceBundle />
              {conversationMessages.map((message) => (
                <AiChatMessage
                  key={message.id}
                  message={message}
                  assistantAvatar={
                    <AnimatedAgentBlob
                      className="size-8"
                      colors={["#111827", "#7c3aed", "#f97316"]}
                      silhouette="droplet"
                      phase={1.7}
                      decorative
                    />
                  }
                  assistantHeader={
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-[13px] font-medium">
                        Shadcnblocks AI
                      </span>
                      <span className="text-muted-foreground text-xs">
                        Content agent
                      </span>
                    </div>
                  }
                  renderPart={({ part }) =>
                    part.type === "custom" &&
                    part.data.kind === "generated-brief" ? (
                      <GeneratedBrief
                        onOpenTranscript={openContext}
                        onCreateDraft={() =>
                          setPrompt(
                            "Turn the editorial brief into a concise social post",
                          )
                        }
                      />
                    ) : undefined
                  }
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
              aria-label="Continue recording conversation"
              className="max-w-2xl"
              onSubmit={(event) => {
                event.preventDefault();
                if (chat.send(prompt)) setPrompt("");
              }}
              rail={
                <AiChatComposerRail className="hidden sm:flex">
                  <span className="flex items-center gap-1.5">
                    <Folder className="size-3.5" /> Future of creative work
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileVideo className="size-3.5" /> Video recording
                  </span>
                </AiChatComposerRail>
              }
            >
              <AiChatComposerEditor
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                aria-label="Ask the content agent"
                placeholder="Ask for another format, clip, or revision"
                className="min-h-16"
              />
              <AiChatComposerToolbar>
                <AiChatComposerToolbarGroup>
                  <AiChatComposerAction label="Add source">
                    <Plus aria-hidden="true" />
                  </AiChatComposerAction>
                  <AiChatComposerButton
                    size="sm"
                    className="h-8 gap-1.5 rounded-lg px-2 text-xs font-normal"
                  >
                    <Clipboard aria-hidden="true" />
                    Sources
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

        {contextOpen && !compact ? (
          <aside
            id="recording-context-panel"
            className="hidden min-h-0 w-[25rem] shrink-0 border-l min-[1100px]:flex"
          >
            <RecordingContextPanel onClose={() => setContextOpen(false)} />
          </aside>
        ) : null}
      </div>

      <Sheet
        open={contextOpen && compact}
        onOpenChange={(open) => setContextOpen(open)}
      >
        <SheetContent
          id="recording-context-panel"
          side="right"
          className="h-dvh w-screen max-w-none gap-0 p-0 sm:w-[28rem] sm:max-w-[28rem] [&>button]:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Recording transcript</SheetTitle>
            <SheetDescription>
              Review the source recording, transcript, and suggested clips.
            </SheetDescription>
          </SheetHeader>
          <RecordingContextPanel onClose={() => setContextOpen(false)} />
        </SheetContent>
      </Sheet>
    </AiConversationShell>
  );
}
