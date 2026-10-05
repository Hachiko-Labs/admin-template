"use client";

import {
  Bot,
  Check,
  CheckCheck,
  Code2,
  Copy,
  FileSearch,
  GitBranch,
  History,
  Play,
  RotateCcw,
  Save,
  ShieldCheck,
  Square,
  Terminal,
  Wrench,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { PLATFORM_MODELS } from "./platform-data";
import { PlatformPage, PlatformSelect, StatusBadge } from "./platform-ui";

type Configuration = {
  name: string;
  description: string;
  instructions: string;
  model: string;
  environment: string;
  output: string;
  tools: string[];
  approval: boolean;
  maxTurns: number;
};
const defaults: Configuration = {
  name: "Support triage",
  description: "Resolve common questions and route the rest to the right team.",
  instructions:
    "You are a helpful support specialist for Acme.\n\n1. Identify the customer's issue and its urgency.\n2. Search the help center for an approved answer.\n3. Cite the article you use, and be clear about next steps.\n4. Escalate billing disputes or account security issues to a human.\n\nBe warm, concise, and never promise an action you cannot perform.",
  model: "gpt-4.1",
  environment: "Support · production",
  output: "Text",
  tools: ["file_search", "create_ticket"],
  approval: true,
  maxTurns: 12,
};
const toolOptions = [
  {
    id: "file_search",
    name: "Search knowledge",
    icon: FileSearch,
    description: "Find answers in the customer help center.",
    scope: "Read only",
  },
  {
    id: "create_ticket",
    name: "Create support ticket",
    icon: Wrench,
    description: "Route unresolved issues to the support team.",
    scope: "Requires approval",
  },
  {
    id: "code_interpreter",
    name: "Code interpreter",
    icon: Terminal,
    description: "Analyze attached CSV files in an isolated runtime.",
    scope: "Sandboxed",
  },
];
type Revision = {
  number: number;
  date: string;
  note: string;
  config: Configuration;
};
const revisions: Revision[] = [
  {
    number: 3,
    date: "Sep 11, 2026 · 10:24",
    note: "Add escalation policy and source citations",
    config: defaults,
  },
  {
    number: 2,
    date: "Sep 8, 2026 · 15:42",
    note: "Connect the customer help center",
    config: {
      ...defaults,
      approval: false,
      instructions:
        "Answer customer questions using the help center. Keep responses concise and helpful.",
      tools: ["file_search"],
    },
  },
];

export function AgentConfigScreen() {
  const [draft, setDraft] = useState<Configuration>(defaults);
  const [saved, setSaved] = useState<Configuration>(defaults);
  const [versions, setVersions] = useState(revisions);
  const [tab, setTab] = useState("configuration");
  const [previewTab, setPreviewTab] = useState("test");
  const [prompt, setPrompt] = useState(
    "A customer was charged twice for their subscription. How should we help?",
  );
  const [phase, setPhase] = useState(0);
  const [result, setResult] = useState<{
    prompt: string;
    text: string;
    config: Configuration;
  } | null>(null);
  const [inspecting, setInspecting] = useState<Revision | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );
  const dirty =
    JSON.stringify({ ...draft, tools: [...new Set(draft.tools)].sort() }) !==
    JSON.stringify({ ...saved, tools: [...new Set(saved.tools)].sort() });
  const valid =
    !!draft.name.trim() &&
    !!draft.instructions.trim() &&
    draft.maxTurns >= 1 &&
    draft.maxTurns <= 50;
  function patch(change: Partial<Configuration>) {
    setDraft((previous) => ({ ...previous, ...change }));
  }
  function stop() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setPhase(0);
  }
  function run() {
    if (!prompt.trim() || !valid) return;
    stop();
    const snapshot = { ...draft, tools: [...draft.tools] };
    const input = prompt.trim();
    setResult(null);
    setPhase(1);
    let step = 1;
    timer.current = setInterval(() => {
      step++;
      if (step < 4) {
        setPhase(step);
        return;
      }
      stop();
      const text =
        snapshot.output === "JSON"
          ? JSON.stringify(
              {
                category: "billing",
                urgency: "high",
                action: snapshot.tools.includes("create_ticket")
                  ? "escalate_to_billing"
                  : "provide_escalation_instructions",
                requires_approval: snapshot.approval,
                source: snapshot.tools.includes("file_search")
                  ? "Billing policy · section 4.2"
                  : null,
              },
              null,
              2,
            )
          : `I’d first check whether both charges have settled or one is a temporary authorization.${snapshot.tools.includes("file_search") ? " Our billing policy recommends collecting both transaction IDs before investigating." : " I don’t have access to the help center in this configuration."}\n\n${snapshot.tools.includes("create_ticket") ? (snapshot.approval ? "A billing escalation is prepared and waiting for human approval. No ticket has been sent." : "The scripted preview would create a billing escalation with the transaction details.") : "Direct the customer to the billing team with the dates and amounts of both charges."}\n\n${snapshot.tools.includes("file_search") ? "Source: Billing policy · section 4.2" : "Avoid promising a refund until the charges are verified."}`;
      setResult({ prompt: input, text, config: snapshot });
    }, 600);
  }
  const code = JSON.stringify(
    {
      name: draft.name,
      model: draft.model,
      instructions: draft.instructions,
      environment: draft.environment,
      tools: draft.tools.map((name) => ({ name })),
      output_format: draft.output.toLowerCase(),
      require_approval: draft.approval,
      max_turns: draft.maxTurns,
    },
    null,
    2,
  );
  return (
    <PlatformPage
      title="Agent configuration"
      description="Shape how your agent thinks, uses tools, and hands work back to you."
      actions={
        <>
          <Badge variant={dirty ? "outline" : "secondary"}>
            {dirty ? "Unsaved changes" : `Version ${versions[0].number}`}
          </Badge>
          <Button
            variant="outline"
            disabled={!dirty}
            onClick={() => {
              setDraft(saved);
              toast("Draft changes discarded");
            }}
          >
            <RotateCcw data-icon="inline-start" />
            Discard
          </Button>
          <Button
            disabled={!dirty || !valid}
            onClick={() => {
              const next = {
                ...draft,
                name: draft.name.trim(),
                instructions: draft.instructions.trim(),
              };
              setDraft(next);
              setSaved(next);
              setVersions((prior) => [
                {
                  number: prior[0].number + 1,
                  date: "Sep 11, 2026 · Just now",
                  note: "Configuration updated",
                  config: next,
                },
                ...prior,
              ]);
              toast.success("Agent version saved");
            }}
          >
            <Save data-icon="inline-start" />
            Save version
          </Button>
        </>
      }
    >
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(350px,0.9fr)]">
        <div className="min-w-0">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-5" aria-label="Agent editor sections">
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="tools">
                Tools{" "}
                <span className="ml-1.5 text-xs">{draft.tools.length}</span>
              </TabsTrigger>
              <TabsTrigger value="versions">Versions</TabsTrigger>
            </TabsList>
            <TabsContent value="configuration">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex size-10 items-center justify-center rounded-xl">
                      <Bot className="size-5" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <CardTitle>{draft.name || "Untitled agent"}</CardTitle>
                      <CardDescription>
                        Support copilot · agent_support_triage
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="agent-name">Name</FieldLabel>
                      <Input
                        id="agent-name"
                        value={draft.name}
                        maxLength={60}
                        onChange={(event) =>
                          patch({ name: event.target.value })
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="agent-description">
                        Description
                      </FieldLabel>
                      <Input
                        id="agent-description"
                        value={draft.description}
                        maxLength={180}
                        onChange={(event) =>
                          patch({ description: event.target.value })
                        }
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel>Model</FieldLabel>
                        <PlatformSelect
                          label="Agent model"
                          value={draft.model}
                          onChange={(model) => patch({ model })}
                          options={PLATFORM_MODELS.map((m) => m.name)}
                          className="w-full"
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Environment</FieldLabel>
                        <PlatformSelect
                          label="Agent environment"
                          value={draft.environment}
                          onChange={(environment) => patch({ environment })}
                          options={[
                            "Support · production",
                            "Development sandbox",
                            "Research runtime",
                          ]}
                          className="w-full"
                        />
                      </Field>
                    </div>
                    <Field>
                      <div className="flex items-center justify-between gap-2">
                        <FieldLabel htmlFor="agent-instructions">
                          Instructions
                        </FieldLabel>
                        <span className="text-muted-foreground text-xs">
                          {draft.instructions.length} characters
                        </span>
                      </div>
                      <Textarea
                        id="agent-instructions"
                        className="min-h-64 resize-y text-sm leading-relaxed"
                        maxLength={12000}
                        value={draft.instructions}
                        onChange={(event) =>
                          patch({ instructions: event.target.value })
                        }
                      />
                      <FieldDescription>
                        Define the goal, boundaries, and when to ask a person
                        for help.
                      </FieldDescription>
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel>Output format</FieldLabel>
                        <PlatformSelect
                          label="Agent output format"
                          value={draft.output}
                          onChange={(output) => patch({ output })}
                          options={["Text", "JSON"]}
                          className="w-full"
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="agent-max-turns">
                          Maximum turns
                        </FieldLabel>
                        <Input
                          id="agent-max-turns"
                          type="number"
                          min={1}
                          max={50}
                          value={draft.maxTurns}
                          onChange={(event) =>
                            patch({ maxTurns: Number(event.target.value) })
                          }
                        />
                      </Field>
                    </div>
                  </FieldGroup>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tools">
              <Card>
                <CardHeader>
                  <CardTitle>Tools & permissions</CardTitle>
                  <CardDescription>
                    Only enabled tools are available to this agent.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <FieldSet>
                      <FieldLegend>Connected tools</FieldLegend>
                      {toolOptions.map(({ icon: Icon, ...tool }) => (
                        <Field
                          orientation="horizontal"
                          key={tool.id}
                          className="rounded-lg border p-4"
                        >
                          <Checkbox
                            id={`agent-tool-${tool.id}`}
                            checked={draft.tools.includes(tool.id)}
                            onCheckedChange={(checked) =>
                              patch({
                                tools: checked
                                  ? [...draft.tools, tool.id]
                                  : draft.tools.filter((id) => id !== tool.id),
                              })
                            }
                          />
                          <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <FieldLabel htmlFor={`agent-tool-${tool.id}`}>
                              <Icon className="size-4" />
                              {tool.name}
                            </FieldLabel>
                            <FieldDescription>
                              {tool.description}
                            </FieldDescription>
                            <span className="text-muted-foreground mt-1 text-xs">
                              {tool.scope}
                            </span>
                          </div>
                        </Field>
                      ))}
                    </FieldSet>
                    <Field
                      orientation="horizontal"
                      className="rounded-lg border p-4"
                    >
                      <div className="flex-1">
                        <FieldLabel htmlFor="agent-approval">
                          Require approval for writes
                        </FieldLabel>
                        <FieldDescription>
                          Pause before creating a ticket or changing external
                          data.
                        </FieldDescription>
                      </div>
                      <Switch
                        id="agent-approval"
                        checked={draft.approval}
                        onCheckedChange={(approval) => patch({ approval })}
                      />
                    </Field>
                  </FieldGroup>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="versions">
              <Card>
                <CardHeader>
                  <CardTitle>Version history</CardTitle>
                  <CardDescription>
                    Review earlier instructions and restore them as a draft.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {versions.map((revision, i) => (
                    <button
                      key={revision.number}
                      onClick={() => setInspecting(revision)}
                      className="hover:bg-muted/50 flex items-start gap-3 rounded-lg border p-4 text-left transition-colors"
                    >
                      <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-md">
                        <GitBranch className="size-4" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            Version {revision.number}
                          </span>
                          {i === 0 ? (
                            <Badge variant="secondary">Current</Badge>
                          ) : null}
                        </div>
                        <p className="text-sm">{revision.note}</p>
                        <p className="text-muted-foreground text-xs">
                          Alex Morgan · {revision.date}
                        </p>
                      </div>
                      <History className="text-muted-foreground size-4" />
                    </button>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <Card className="min-w-0 xl:sticky xl:top-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Preview</CardTitle>
              <Badge variant="outline">Scripted test</Badge>
            </div>
            <CardDescription>
              Try the billing scenario with your current configuration.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <Tabs value={previewTab} onValueChange={setPreviewTab}>
              <TabsList className="mb-4" aria-label="Agent preview mode">
                <TabsTrigger value="test">Test agent</TabsTrigger>
                <TabsTrigger value="code">
                  <Code2 className="mr-1.5 size-3.5" />
                  Configuration JSON
                </TabsTrigger>
              </TabsList>
              <TabsContent value="test" className="flex flex-col gap-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{draft.model}</span>
                  <span className="text-muted-foreground">
                    {draft.tools.length} tools enabled
                  </span>
                </div>
                {!result && !phase ? (
                  <div className="bg-muted/30 flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center">
                    <Bot className="text-muted-foreground size-7" />
                    <p className="text-sm font-medium">
                      See your agent’s approach
                    </p>
                    <p className="text-muted-foreground max-w-xs text-xs">
                      Run the sample scenario to preview tool choices,
                      approvals, and the response format.
                    </p>
                  </div>
                ) : null}
                {phase ? (
                  <div
                    className="flex min-h-48 flex-col gap-4 rounded-lg border p-5"
                    role="status"
                    aria-live="polite"
                  >
                    {[
                      "Reading the request",
                      "Checking available tools",
                      "Preparing a response",
                    ].map((label, i) => (
                      <div
                        key={label}
                        className="flex items-center gap-3 text-sm"
                      >
                        {phase > i + 1 ? (
                          <Check className="text-success size-4" />
                        ) : (
                          <span className="bg-muted-foreground/30 size-4 rounded-full" />
                        )}
                        <span>{label}</span>
                        {phase === i + 1 ? (
                          <span className="text-muted-foreground ml-auto text-xs">
                            In progress
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
                {result ? (
                  <div className="flex flex-col gap-4" aria-live="polite">
                    <div className="bg-muted rounded-lg p-4 text-sm">
                      {result.prompt}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status="Completed" />
                      {result.config.tools.includes("file_search") ? (
                        <Badge variant="outline">
                          <FileSearch className="mr-1.5 size-3" />
                          Help center searched
                        </Badge>
                      ) : null}
                      {result.config.approval &&
                      result.config.tools.includes("create_ticket") ? (
                        <Badge variant="outline">
                          <ShieldCheck className="mr-1.5 size-3" />
                          Approval required
                        </Badge>
                      ) : null}
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="mb-3 flex items-center gap-2 text-xs font-medium">
                        <Bot className="size-4" />
                        {result.config.name}
                      </div>
                      <pre className="font-sans text-sm leading-relaxed break-words whitespace-pre-wrap">
                        {result.text}
                      </pre>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Recorded scenario · {result.config.model} · No external
                      actions
                    </p>
                  </div>
                ) : null}
                <Field>
                  <FieldLabel htmlFor="agent-test-prompt">
                    Test message
                  </FieldLabel>
                  <Textarea
                    id="agent-test-prompt"
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    maxLength={2000}
                    className="min-h-24"
                    disabled={phase > 0}
                  />
                </Field>
                <div className="flex justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      stop();
                      setResult(null);
                    }}
                  >
                    Clear preview
                  </Button>
                  {phase ? (
                    <Button variant="outline" onClick={stop}>
                      <Square data-icon="inline-start" />
                      Stop test
                    </Button>
                  ) : (
                    <Button disabled={!prompt.trim() || !valid} onClick={run}>
                      <Play data-icon="inline-start" />
                      Run test
                    </Button>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="code">
                <div className="bg-muted/40 overflow-hidden rounded-lg border">
                  <div className="flex items-center justify-between border-b px-4 py-2">
                    <span className="font-mono text-xs">agent.config.json</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Copy agent configuration"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(code);
                          toast.success("Configuration copied");
                        } catch {
                          toast.error("Could not copy configuration");
                        }
                      }}
                    >
                      <Copy />
                    </Button>
                  </div>
                  <pre className="max-h-[560px] overflow-auto p-4 font-mono text-xs leading-relaxed">
                    {code}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
            <div className="text-muted-foreground flex items-start gap-2 border-t pt-4 text-xs">
              <CheckCheck className="size-4 shrink-0" />
              <p>
                The preview demonstrates a fixed billing scenario. Model, tools,
                output format, and approval settings shape the example;
                instructions are not executed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Dialog
        open={!!inspecting}
        onOpenChange={(open) => {
          if (!open) setInspecting(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Version {inspecting?.number}</DialogTitle>
            <DialogDescription>
              {inspecting?.note} · {inspecting?.date}
            </DialogDescription>
          </DialogHeader>
          <pre className="bg-muted max-h-72 overflow-y-auto rounded-lg p-4 font-sans text-sm leading-relaxed whitespace-pre-wrap">
            {inspecting?.config.instructions}
          </pre>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInspecting(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                if (inspecting) {
                  setDraft({ ...inspecting.config });
                  setTab("configuration");
                  setInspecting(null);
                  toast("Version restored as a draft");
                }
              }}
            >
              Restore as draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PlatformPage>
  );
}
