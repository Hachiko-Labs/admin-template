"use client";

import {
  Bot,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Code2,
  Ellipsis,
  FolderGit2,
  GitBranch,
  History,
  ListChecks,
  MessageSquare,
  Plus,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Timer,
  TimerReset,
  Webhook,
  Zap,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import {
  AiChatComposer,
  AiChatComposerButton,
  AiChatComposerEditor,
  AiChatComposerToolbar,
  AiChatComposerToolbarGroup,
} from "@/components/ai-chat/ai-chat-composer";
import {
  AiConversationSidebarItem,
  AiConversationSidebarSection,
} from "@/components/ai-chat/ai-conversation-navigation";
import { AiConversationShell } from "@/components/ai-chat/ai-conversation-shell";
import {
  AiModelPicker,
  defaultAiModelId,
} from "@/components/ai-chat/ai-model-picker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { recordValue } from "@/lib/record-value";
import { cn } from "@/lib/utils";

type AutomationPreset = {
  id: string;
  prompt: string;
  title: string;
};

const automationPresets: AutomationPreset[] = [
  {
    id: "story",
    title: "Refine incoming product story",
    prompt:
      "Review the newly created product story, clarify its outcome and acceptance criteria, and apply the guidance in PRODUCT_REVIEW.md.",
  },
  {
    id: "release",
    title: "Review weekly release notes",
    prompt:
      "Review this week's release notes, flag unclear customer impact, and prepare a concise publish-ready summary.",
  },
  {
    id: "support",
    title: "Triage support escalations",
    prompt:
      "Inspect new high-priority escalations, group related reports, and prepare an actionable engineering handoff.",
  },
];

const repositories = [
  { label: "admin-console", value: "admin-console" },
  { label: "design-system", value: "design-system" },
  { label: "customer-portal", value: "customer-portal" },
];

const branchesByRepository = {
  "admin-console": [
    { label: "main", value: "main" },
    { label: "release/august", value: "release-august" },
    { label: "feat/automation", value: "feat-automation" },
  ],
  "design-system": [
    { label: "main", value: "main" },
    { label: "next", value: "next" },
  ],
  "customer-portal": [
    { label: "main", value: "main" },
    { label: "release/candidate", value: "release-candidate" },
  ],
} satisfies Record<string, Array<{ label: string; value: string }>>;

const conversations = [
  { label: "New conversation", value: "new" },
  { label: "Continue product review", value: "product-review" },
  { label: "Continue release planning", value: "release-planning" },
];

const efforts = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

const runtimes = [
  { label: "Workspace agent", value: "workspace-agent" },
  { label: "Review agent", value: "review-agent" },
  { label: "Research agent", value: "research-agent" },
];

const triggerLabels = {
  hourly: "Every hour",
  daily: "Every day at 9:00",
  weekly: "Every Monday at 9:00",
  custom: "Custom schedule",
  once: "Run once at a specific time",
  manual: "Run once after creation",
  webhook: "When an external event arrives",
} satisfies Record<string, string>;

function optionLabel(
  options: Array<{ label: string; value: string }>,
  value: string,
  fallback: string,
) {
  return options.find((option) => option.value === value)?.label ?? fallback;
}

function InlineSelect({
  disabled,
  icon: Icon,
  label,
  onValueChange,
  options,
  value,
}: {
  disabled?: boolean;
  icon: React.ElementType;
  label: string;
  onValueChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="text-muted-foreground h-8 min-w-0 gap-1.5 px-1.5 text-xs font-medium"
        >
          <Icon className="size-3.5 shrink-0" strokeWidth={1.75} />
          <span className="max-w-40 truncate">
            {optionLabel(options, value, label)}
          </span>
          <ChevronDown className="size-3 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ComposerSelect({
  align = "start",
  icon: Icon,
  label,
  onValueChange,
  options,
  value,
}: {
  align?: "start" | "end";
  icon: React.ElementType;
  label: string;
  onValueChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <AiChatComposerButton
          type="button"
          size="sm"
          className="h-8 max-w-44 gap-1.5 rounded-lg px-2 text-xs font-normal"
        >
          <Icon className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{optionLabel(options, value, label)}</span>
          <ChevronDown className="text-muted-foreground size-3.5 shrink-0" />
        </AiChatComposerButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StepLabel({
  children,
  number,
}: {
  children: React.ReactNode;
  number: number;
}) {
  return (
    <div className="text-muted-foreground mb-2.5 flex items-center gap-2 text-xs font-medium">
      <span className="bg-muted text-foreground grid size-6 place-items-center rounded-full text-[11px] tabular-nums">
        {number}
      </span>
      <span>{children}</span>
    </div>
  );
}

function AutomationSidebar({
  activePreset,
  onPresetChange,
}: {
  activePreset: string;
  onPresetChange: (id: string) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <AiConversationSidebarSection label="Actions">
        <AiConversationSidebarItem
          active
          icon={ListChecks}
          label="Automations"
        />
        <AiConversationSidebarItem
          icon={History}
          label="Run history"
          href="/ai-chat/automation-run-history"
        />
      </AiConversationSidebarSection>
      <ScrollArea className="min-h-0 flex-1 [&>[data-slot=scroll-area-viewport]>div]:!block">
        <AiConversationSidebarSection label="Saved automations">
          {automationPresets.map((preset) => (
            <AiConversationSidebarItem
              key={preset.id}
              active={activePreset === preset.id}
              icon={TimerReset}
              label={preset.title}
              onClick={() => onPresetChange(preset.id)}
            />
          ))}
        </AiConversationSidebarSection>
      </ScrollArea>
    </div>
  );
}

function TriggerMenu({
  onSelect,
  open,
  onOpenChange,
}: {
  onSelect: (trigger: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  function select(trigger: string) {
    onSelect(trigger);
    onOpenChange(false);
  }

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:bg-muted/60 hover:text-foreground flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm transition-colors"
        >
          <Plus className="size-4" />
          Add trigger
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="w-64 rounded-xl p-1.5 shadow-xl"
      >
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="rounded-lg px-2.5 py-2">
            <Clock3 className="text-muted-foreground" />
            <span>Scheduled</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48 rounded-xl p-1.5 shadow-xl">
            <DropdownMenuItem
              className="rounded-lg px-2.5 py-2"
              onSelect={() => select("hourly")}
            >
              <Timer /> Hourly
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-lg px-2.5 py-2"
              onSelect={() => select("daily")}
            >
              <CalendarDays /> Daily
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-lg px-2.5 py-2"
              onSelect={() => select("weekly")}
            >
              <CalendarDays /> Weekly
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-lg px-2.5 py-2"
              onSelect={() => select("custom")}
            >
              <Code2 /> Custom schedule
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem
          className="rounded-lg px-2.5 py-2"
          onSelect={() => select("once")}
        >
          <Clock3 />
          <span className="flex-1">Once at…</span>
          <span className="text-muted-foreground text-[11px]">then pause</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-lg px-2.5 py-2"
          onSelect={() => select("manual")}
        >
          <Zap />
          <span className="flex-1">Run once</span>
          <span className="text-muted-foreground text-[11px]">test</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-lg px-2.5 py-2"
          onSelect={() => select("webhook")}
        >
          <Webhook />
          <span className="flex-1">Webhook</span>
          <span className="text-muted-foreground text-[11px]">
            Connected apps
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AiChatAutomation1Screen() {
  const initialPreset = automationPresets[0]!;
  const [activePreset, setActivePreset] = React.useState(initialPreset.id);
  const [title, setTitle] = React.useState(initialPreset.title);
  const [prompt, setPrompt] = React.useState(initialPreset.prompt);
  const [enabled, setEnabled] = React.useState(true);
  const [repository, setRepository] = React.useState("admin-console");
  const [branch, setBranch] = React.useState("main");
  const [conversation, setConversation] = React.useState("new");
  const [model, setModel] = React.useState(defaultAiModelId);
  const [effort, setEffort] = React.useState("high");
  const [runtime, setRuntime] = React.useState("workspace-agent");
  const [trigger, setTrigger] = React.useState("");
  const [triggerMenuOpen, setTriggerMenuOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [checksEnabled, setChecksEnabled] = React.useState(true);
  const [repairAttempts, setRepairAttempts] = React.useState("1");
  const [timeLimit, setTimeLimit] = React.useState("30");
  const [created, setCreated] = React.useState(false);

  const branchOptions = repository
    ? (recordValue(branchesByRepository, repository) ?? [])
    : [];
  const canCreate = Boolean(
    title.trim() && prompt.trim() && repository && branch && trigger,
  );

  function loadPreset(id: string) {
    const preset = automationPresets.find((item) => item.id === id);
    if (!preset) return;
    setActivePreset(id);
    setTitle(preset.title);
    setPrompt(preset.prompt);
    setCreated(false);
  }

  function resetForm() {
    setActivePreset(initialPreset.id);
    setTitle(initialPreset.title);
    setPrompt(initialPreset.prompt);
    setEnabled(true);
    setRepository("admin-console");
    setBranch("main");
    setConversation("new");
    setModel(defaultAiModelId);
    setEffort("high");
    setRuntime("workspace-agent");
    setTrigger("");
    setSettingsOpen(false);
    setChecksEnabled(true);
    setRepairAttempts("1");
    setTimeLimit("30");
    setCreated(false);
    setTriggerMenuOpen(false);
  }

  function createAutomation() {
    if (!canCreate) return;
    setCreated(true);
  }

  return (
    <AiConversationShell
      sidebarScrollMode="nested"
      headerTitle="Automations"
      headerActions={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Automation actions"
            >
              <Ellipsis aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/ai-chat/automation-run-history">Run history</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/original/settings">Workspace settings</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
      hideSidebarFooter
      sidebarContent={
        <AutomationSidebar
          activePreset={activePreset}
          onPresetChange={loadPreset}
        />
      }
    >
      <h1 className="sr-only">Create automation</h1>

      <div className="text-muted-foreground flex h-11 shrink-0 items-center gap-1 border-b px-4 text-xs sm:px-6">
        <span>Automations</span>
        <span aria-hidden="true">/</span>
        <span className="text-foreground">New automation</span>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto w-full max-w-4xl px-4 py-7 sm:px-7 sm:py-10 lg:px-10">
          <header className="mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <input
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setCreated(false);
                }}
                aria-label="Automation name"
                className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-2xl font-semibold tracking-[-0.03em] outline-none sm:text-[28px]"
                placeholder="Untitled automation"
              />
              <div className="flex shrink-0 items-center gap-2 sm:pt-0.5">
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={!canCreate || created}
                  onClick={createAutomation}
                >
                  {created ? (
                    <>
                      <Check data-icon="inline-start" /> Created
                    </>
                  ) : (
                    "Create"
                  )}
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1">
              <div className="flex h-8 items-center gap-2 px-1.5 text-xs font-medium">
                <Switch
                  checked={enabled}
                  onCheckedChange={setEnabled}
                  aria-label="Automation active"
                  className="scale-90"
                />
                <span
                  className={cn(
                    enabled ? "text-emerald-600" : "text-muted-foreground",
                  )}
                >
                  {enabled ? "Active" : "Paused"}
                </span>
              </div>
              <span className="bg-border h-4 w-px" />
              <InlineSelect
                icon={FolderGit2}
                label="Select repository"
                value={repository}
                options={repositories}
                onValueChange={(value) => {
                  setRepository(value);
                  setBranch("");
                  setCreated(false);
                }}
              />
              <span className="bg-border h-4 w-px" />
              <InlineSelect
                disabled={!repository}
                icon={GitBranch}
                label="Select branch"
                value={branch}
                options={branchOptions}
                onValueChange={(value) => {
                  setBranch(value);
                  setCreated(false);
                }}
              />
              <span className="bg-border h-4 w-px" />
              <InlineSelect
                disabled={!branch}
                icon={MessageSquare}
                label="New conversation"
                value={conversation}
                options={conversations}
                onValueChange={setConversation}
              />
            </div>
          </header>

          <div className="space-y-8">
            <section>
              <StepLabel number={1}>What the agent should do</StepLabel>
              <AiChatComposer
                aria-label="Agent instructions"
                className="max-w-none"
                onSubmit={(event) => event.preventDefault()}
              >
                <AiChatComposerEditor
                  value={prompt}
                  onChange={(event) => {
                    setPrompt(event.target.value);
                    setCreated(false);
                  }}
                  submitOnEnter={false}
                  aria-label="Agent instructions"
                  placeholder="Describe the outcome, constraints, and what not to touch…"
                  className="min-h-32"
                />
                <AiChatComposerToolbar>
                  <AiChatComposerToolbarGroup className="flex-wrap">
                    <AiModelPicker
                      value={model}
                      onValueChange={(value) => {
                        setModel(value);
                        setCreated(false);
                      }}
                      align="start"
                    />
                    <ComposerSelect
                      icon={Zap}
                      label="Effort"
                      value={effort}
                      options={efforts}
                      onValueChange={(value) => {
                        setEffort(value);
                        setCreated(false);
                      }}
                    />
                  </AiChatComposerToolbarGroup>
                  <AiChatComposerToolbarGroup side="end">
                    <ComposerSelect
                      align="end"
                      icon={Bot}
                      label="Select agent"
                      value={runtime}
                      options={runtimes}
                      onValueChange={(value) => {
                        setRuntime(value);
                        setCreated(false);
                      }}
                    />
                  </AiChatComposerToolbarGroup>
                </AiChatComposerToolbar>
              </AiChatComposer>
            </section>

            <section>
              <StepLabel number={2}>When it should run</StepLabel>
              <div className="space-y-2">
                {trigger ? (
                  <div className="bg-card flex min-h-13 items-center gap-3 rounded-xl border px-3.5 py-2.5 shadow-xs">
                    <span className="bg-muted grid size-8 shrink-0 place-items-center rounded-lg">
                      {trigger === "webhook" ? (
                        <Webhook className="size-3.5" aria-hidden="true" />
                      ) : trigger === "manual" ? (
                        <Zap className="size-3.5" aria-hidden="true" />
                      ) : (
                        <Clock3 className="size-3.5" aria-hidden="true" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {recordValue(triggerLabels, trigger)}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {trigger === "manual"
                          ? "Start it yourself with Run now"
                          : trigger === "webhook"
                            ? "Runs when a connected app sends an event"
                            : "Uses your current timezone"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Remove trigger"
                      onClick={() => {
                        setTrigger("");
                        setCreated(false);
                      }}
                    >
                      <RotateCcw />
                    </Button>
                  </div>
                ) : null}

                <div className="bg-card rounded-xl border p-1 shadow-xs">
                  <TriggerMenu
                    open={triggerMenuOpen}
                    onOpenChange={setTriggerMenuOpen}
                    onSelect={(value) => {
                      setTrigger(value);
                      setCreated(false);
                    }}
                  />
                </div>
              </div>
            </section>

            <section>
              <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
                <div className="flex flex-wrap items-center gap-2">
                  <CollapsibleTrigger asChild>
                    <Button type="button" variant="ghost" size="sm">
                      <Settings2 aria-hidden="true" />
                      {settingsOpen ? "Hide settings" : "Settings"}
                    </Button>
                  </CollapsibleTrigger>
                  {!settingsOpen ? (
                    <span className="text-muted-foreground text-xs">
                      {checksEnabled
                        ? `Checks on · ${repairAttempts || "0"} repair · ${timeLimit || "30"} min`
                        : "Checks off"}
                    </span>
                  ) : null}
                </div>

                <CollapsibleContent>
                  <div className="bg-card mt-2 space-y-4 rounded-xl border p-4 shadow-xs">
                    <label className="flex cursor-pointer items-start gap-3">
                      <Checkbox
                        checked={checksEnabled}
                        onCheckedChange={(checked) => {
                          setChecksEnabled(checked === true);
                          setCreated(false);
                        }}
                        className="mt-0.5"
                      />
                      <span>
                        <span className="flex items-center gap-1.5 text-sm font-medium">
                          <ShieldCheck className="size-4" aria-hidden="true" />
                          Run project checks when a run ends
                        </span>
                        <span className="text-muted-foreground mt-1 block text-xs leading-5">
                          Verification only runs for unattended turns and can
                          retry a failed check before the run stops.
                        </span>
                      </span>
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="automation-repair-attempts">
                          Repair attempts
                        </Label>
                        <Input
                          id="automation-repair-attempts"
                          type="number"
                          min="0"
                          max="3"
                          disabled={!checksEnabled}
                          value={repairAttempts}
                          onChange={(event) => {
                            setRepairAttempts(event.target.value);
                            setCreated(false);
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="automation-time-limit">
                          Time limit (minutes)
                        </Label>
                        <Input
                          id="automation-time-limit"
                          type="number"
                          min="1"
                          value={timeLimit}
                          onChange={(event) => {
                            setTimeLimit(event.target.value);
                            setCreated(false);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </section>
          </div>

          <p aria-live="polite" className="text-muted-foreground mt-6 text-xs">
            {created
              ? trigger === "manual"
                ? "Automation created and ready to run manually."
                : trigger === "webhook"
                  ? "Automation created and waiting for an external event."
                  : "Automation created and ready for its next scheduled run."
              : !repository
                ? "Select a repository to continue."
                : !branch
                  ? "Select a branch to continue."
                  : !trigger
                    ? "Add a trigger to create this automation."
                    : "Ready to create this automation."}
          </p>
        </div>
      </ScrollArea>
    </AiConversationShell>
  );
}
