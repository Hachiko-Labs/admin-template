"use client";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Check,
  Download,
  LoaderCircle,
  PanelRightClose,
  PanelRightOpen,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Square,
  X,
} from "lucide-react";
import * as React from "react";

import { AiCodingWorkspace } from "@/components/ai-chat/ai-coding-workspace";
import {
  initialResearchBrief,
  moveResearchRow,
  type ResearchBrief,
  researchBriefMarkdown,
  type ResearchDemoRun,
  type ResearchRow,
  researchSourceTypes,
  startResearchDemo,
  transitionResearchDemo,
  validateResearchBrief,
} from "@/components/ai-chat/ai-research-brief-data";
import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

function downloadBrief(brief: ResearchBrief) {
  const url = URL.createObjectURL(
    new Blob([researchBriefMarkdown(brief)], {
      type: "text/markdown;charset=utf-8",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "research-brief.md";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function ResearchRows({
  rows,
  kind,
  errors,
  onChange,
}: {
  rows: ResearchRow[];
  kind: "question" | "step";
  errors: Record<string, string>;
  onChange: (rows: ResearchRow[]) => void;
}) {
  const refs = React.useRef(new Map<string, HTMLTextAreaElement>());
  const addRef = React.useRef<HTMLButtonElement>(null);
  return (
    <FieldGroup className="gap-3">
      {rows.map((row, index) => (
        <Field key={row.id} data-invalid={!!errors[row.id]} className="gap-2">
          <FieldLabel htmlFor={row.id} className="sr-only">
            {kind === "question" ? "Question" : "Step"} {index + 1}
          </FieldLabel>
          <InputGroup>
            <InputGroupTextarea
              id={row.id}
              ref={(node) => {
                if (node) refs.current.set(row.id, node);
                else refs.current.delete(row.id);
              }}
              value={row.text}
              rows={2}
              maxLength={500}
              aria-invalid={!!errors[row.id]}
              aria-describedby={errors[row.id] ? `${row.id}-error` : undefined}
              onChange={(event) =>
                onChange(
                  rows.map((item) =>
                    item.id === row.id
                      ? { ...item, text: event.target.value }
                      : item,
                  ),
                )
              }
            />
            <InputGroupAddon align="block-end" className="justify-end">
              <span className="mr-auto text-xs tabular-nums">
                {kind === "step" ? "Step" : "Question"} {index + 1}
              </span>
              {kind === "step" ? (
                <>
                  <InputGroupButton
                    size="icon-xs"
                    aria-label={`Move step ${index + 1} up`}
                    disabled={index === 0}
                    onClick={() => onChange(moveResearchRow(rows, row.id, -1))}
                  >
                    <ArrowUp />
                  </InputGroupButton>
                  <InputGroupButton
                    size="icon-xs"
                    aria-label={`Move step ${index + 1} down`}
                    disabled={index === rows.length - 1}
                    onClick={() => onChange(moveResearchRow(rows, row.id, 1))}
                  >
                    <ArrowDown />
                  </InputGroupButton>
                </>
              ) : null}
              <InputGroupButton
                size="icon-xs"
                aria-label={`Remove ${kind} ${index + 1}`}
                onClick={() => {
                  const focusId = rows[index + 1]?.id ?? rows[index - 1]?.id;
                  onChange(rows.filter((item) => item.id !== row.id));
                  requestAnimationFrame(() => {
                    if (focusId) refs.current.get(focusId)?.focus();
                    else addRef.current?.focus();
                  });
                }}
              >
                <X />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {errors[row.id] ? (
            <FieldError id={`${row.id}-error`}>{errors[row.id]}</FieldError>
          ) : null}
        </Field>
      ))}
      <Button
        ref={addRef}
        variant="ghost"
        size="sm"
        className="self-start"
        disabled={rows.length >= 8}
        onClick={() => {
          const id = `${kind}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}`;
          onChange([...rows, { id, text: "" }]);
          requestAnimationFrame(() => refs.current.get(id)?.focus());
        }}
      >
        <Plus data-icon="inline-start" />
        Add {kind}
      </Button>
      {rows.length >= 8 ? (
        <FieldDescription>Up to 8 {kind}s per brief.</FieldDescription>
      ) : null}
      {errors[kind === "question" ? "questions" : "steps"] ? (
        <FieldError>
          {errors[kind === "question" ? "questions" : "steps"]}
        </FieldError>
      ) : null}
    </FieldGroup>
  );
}

export function AiResearchBriefBuilderScreen() {
  const [brief, setBrief] = React.useState<ResearchBrief>(() =>
    structuredClone(initialResearchBrief),
  );
  const [run, setRun] = React.useState<ResearchDemoRun | null>(null);
  const [panelOpen, setPanelOpen] = React.useState(true);
  const [submitted, setSubmitted] = React.useState(false);
  const [resultOpen, setResultOpen] = React.useState(false);
  const errors = submitted ? validateResearchBrief(brief) : {};
  const locked = run !== null;
  const busy = run?.status === "running" || run?.status === "paused";
  const progress = run
    ? Math.round((run.completed / run.brief.steps.length) * 100)
    : 0;
  const resultRef = React.useRef<HTMLDivElement>(null);
  const objectiveRef = React.useRef<HTMLTextAreaElement>(null);
  const validationRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (run?.status !== "running") return;
    const timer = window.setTimeout(
      () =>
        setRun((previous) =>
          previous ? transitionResearchDemo(previous, "tick") : null,
        ),
      2300,
    );
    return () => window.clearTimeout(timer);
  }, [run]);
  function update<K extends keyof ResearchBrief>(
    key: K,
    value: ResearchBrief[K],
  ) {
    if (!locked) setBrief((previous) => ({ ...previous, [key]: value }));
  }
  function act(action: "pause" | "resume" | "stop") {
    setRun((previous) =>
      previous ? transitionResearchDemo(previous, action) : null,
    );
  }
  function start() {
    setSubmitted(true);
    const next = startResearchDemo(brief);
    if (!next) {
      // The brief pane is behind the sheet on compact screens.
      setPanelOpen(false);
      requestAnimationFrame(() => validationRef.current?.focus());
      return;
    }
    setRun(next);
    setResultOpen(false);
    setPanelOpen(true);
  }
  function edit() {
    setRun(null);
    setResultOpen(false);
    setPanelOpen(false);
    requestAnimationFrame(() => objectiveRef.current?.focus());
  }

  const plan = (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium">
            {run ? "Research run" : "Research plan"}
          </h2>
          <Badge variant="secondary">
            {run ? "Demo" : `${brief.steps.length} steps`}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Close research plan"
          onClick={() => setPanelOpen(false)}
        >
          <PanelRightClose />
        </Button>
      </header>
      <ScrollArea className="bg-muted/30 min-h-0 flex-1 [&>[data-slot=scroll-area-viewport]>div]:!block">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 p-5 sm:p-7">
          {run ? (
            <>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span role="status">
                    {run.status === "running"
                      ? "Running the demo"
                      : run.status === "paused"
                        ? "Run paused"
                        : run.status === "stopped"
                          ? "Run stopped"
                          : "Demo complete"}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {run.completed} / {run.brief.steps.length}
                  </span>
                </div>
                <Progress
                  value={progress}
                  aria-valuenow={progress}
                  aria-label="Demo run progress"
                />
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Simulated steps using your saved brief. No live searches or
                  source retrieval.
                </p>
              </div>
              <ol className="bg-background divide-y overflow-hidden rounded-xl border">
                {run.brief.steps.map((step, index) => (
                  <li key={step.id} className="flex gap-3 p-4">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center">
                      {index < run.completed ? (
                        <Check className="text-success size-4" />
                      ) : index === run.completed &&
                        run.status === "running" ? (
                        <LoaderCircle
                          className="size-4 animate-spin motion-reduce:animate-none"
                          aria-hidden="true"
                        />
                      ) : (
                        <span className="text-muted-foreground text-xs tabular-nums">
                          {index + 1}
                        </span>
                      )}
                    </span>
                    <div className="flex min-w-0 flex-col gap-1">
                      <p className="text-sm leading-relaxed break-words">
                        {step.text}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {index < run.completed
                          ? "Simulated · complete"
                          : index === run.completed
                            ? run.status === "paused"
                              ? "Paused"
                              : run.status === "stopped"
                                ? "Stopped"
                                : "Simulating…"
                            : "Queued"}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              {run.status === "complete" ? (
                <Alert>
                  <Check />
                  <AlertTitle>Ready for a research handoff</AlertTitle>
                  <AlertDescription>
                    Your scope, questions, and plan are captured. The outline
                    leaves evidence open for a researcher to fill in.
                  </AlertDescription>
                </Alert>
              ) : null}
              {run.status === "stopped" ? (
                <Alert>
                  <Square />
                  <AlertTitle>
                    Stopped after {run.completed}{" "}
                    {run.completed === 1 ? "step" : "steps"}
                  </AlertTitle>
                  <AlertDescription>
                    Your brief is preserved. Edit the plan to start a new run.
                  </AlertDescription>
                </Alert>
              ) : null}
              {run.status === "complete" ? (
                <Button
                  variant="outline"
                  className="self-start"
                  onClick={() => {
                    setResultOpen((value) => !value);
                    if (!resultOpen)
                      requestAnimationFrame(() => resultRef.current?.focus());
                  }}
                >
                  {resultOpen ? "Hide outline" : "Preview brief outline"}
                  <ArrowUpRight data-icon="inline-end" />
                </Button>
              ) : null}
              {resultOpen ? (
                <article
                  ref={resultRef}
                  tabIndex={-1}
                  aria-label="Brief outline"
                  className="bg-background focus-visible:ring-ring flex flex-col gap-5 rounded-xl border p-5 outline-none focus-visible:ring-2"
                >
                  <div>
                    <p className="text-muted-foreground mb-2 text-xs">
                      RESEARCH HANDOFF
                    </p>
                    <h3 className="text-lg font-semibold tracking-tight break-words">
                      {run.brief.objective}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {run.brief.audience} · {run.brief.region} ·{" "}
                    {run.brief.period}
                  </p>
                  <Separator />
                  {run.brief.questions.map((question) => (
                    <section key={question.id} className="flex flex-col gap-2">
                      <h4 className="text-sm font-medium break-words">
                        {question.text}
                      </h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Evidence pending. Add supporting passages, source dates,
                        conflicting findings, and remaining uncertainty.
                      </p>
                    </section>
                  ))}
                  <p className="text-muted-foreground text-xs">
                    No findings have been verified. Download includes all scope
                    constraints and plan steps.
                  </p>
                </article>
              ) : null}
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold tracking-tight">
                  A plan you can shape.
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Edit the sequence before starting. Keep the work focused on
                  the questions in your brief.
                </p>
              </div>
              <div className="bg-background rounded-xl border p-4">
                <FieldSet>
                  <FieldLegend className="sr-only">Plan steps</FieldLegend>
                  <ResearchRows
                    kind="step"
                    rows={brief.steps}
                    errors={errors}
                    onChange={(rows) => update("steps", rows)}
                  />
                </FieldSet>
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs leading-relaxed">
                <dt className="text-muted-foreground">Coverage</dt>
                <dd>
                  {brief.questions.filter((row) => row.text.trim()).length}{" "}
                  research questions
                </dd>
                <dt className="text-muted-foreground">Sources</dt>
                <dd>{brief.sources.join(" · ") || "Choose a source type"}</dd>
                <dt className="text-muted-foreground">Deliverable</dt>
                <dd>Decision brief with evidence and open questions</dd>
              </dl>
            </>
          )}
        </div>
      </ScrollArea>
      <footer className="flex shrink-0 flex-col gap-3 border-t p-4">
        {busy ? (
          <div className="flex gap-2">
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => act(run?.status === "paused" ? "resume" : "pause")}
            >
              {run?.status === "paused" ? (
                <Play data-icon="inline-start" />
              ) : (
                <Pause data-icon="inline-start" />
              )}
              {run?.status === "paused" ? "Resume" : "Pause"}
            </Button>
            <Button variant="outline" onClick={() => act("stop")}>
              <Square data-icon="inline-start" />
              Stop
            </Button>
          </div>
        ) : run ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={edit}>
              Edit brief
            </Button>
            <Button className="flex-1" onClick={() => downloadBrief(run.brief)}>
              <Download data-icon="inline-start" />
              Download brief
            </Button>
          </div>
        ) : (
          <>
            <Button onClick={start}>
              <Play data-icon="inline-start" />
              Start demo run
            </Button>
            <p className="text-muted-foreground text-center text-xs">
              Runs locally · No external services
            </p>
          </>
        )}
      </footer>
    </section>
  );

  return (
    <AiWorkspaceShell
      headerTitle="Research brief"
      hideNavigationSidebar
      headerActions={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPanelOpen((value) => !value)}
          >
            <PanelRightOpen data-icon="inline-start" />
            {panelOpen ? "Hide plan" : "Open plan"}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Reset research brief demo"
            onClick={() => {
              setRun(null);
              setBrief(structuredClone(initialResearchBrief));
              setSubmitted(false);
              setResultOpen(false);
              setPanelOpen(true);
            }}
          >
            <RotateCcw />
          </Button>
        </>
      }
    >
      <AiCodingWorkspace
        defaultPanelWidthPercent={44}
        codePanelOpen={panelOpen}
        onCodePanelOpenChange={setPanelOpen}
        panelTitle="Research plan"
        codePanel={plan}
        chat={
          <div className="flex min-h-0 flex-1 flex-col">
            <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-5">
              <h2 className="text-sm font-medium">Your brief</h2>
              <Badge variant="outline">
                {locked ? "Run snapshot" : "Draft"}
              </Badge>
            </header>
            <ScrollArea className="min-h-0 flex-1 [&>[data-slot=scroll-area-viewport]>div]:!block">
              <div className="mx-auto flex w-full max-w-2xl flex-col gap-7 px-5 py-7 sm:px-8">
                <div className="flex flex-col gap-2">
                  <p className="text-muted-foreground text-xs">
                    RESEARCH / NEW BRIEF
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Start with the right question.
                  </h1>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Define the decision, set the boundaries, and shape the work
                    before research begins.
                  </p>
                </div>
                {Object.keys(errors).length && !run ? (
                  <Alert
                    variant="destructive"
                    ref={validationRef}
                    tabIndex={-1}
                  >
                    <AlertTitle>Review your brief</AlertTitle>
                    <AlertDescription>
                      <ul className="list-inside list-disc">
                        {Object.values(errors)
                          .filter(
                            (value, index, values) =>
                              values.indexOf(value) === index,
                          )
                          .map((message) => (
                            <li key={message}>{message}</li>
                          ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                ) : null}
                {locked ? (
                  <p className="text-muted-foreground text-xs">
                    This run uses the brief below.{" "}
                    {busy
                      ? "Pause or stop the run in the plan pane."
                      : "Choose Edit brief to revise it for a new run."}
                  </p>
                ) : null}
                <FieldSet disabled={locked}>
                  <FieldLegend className="sr-only">Research brief</FieldLegend>
                  <FieldGroup>
                    <Field data-invalid={!!errors.objective}>
                      <FieldLabel htmlFor="research-objective">
                        What do you want to learn?
                      </FieldLabel>
                      <Textarea
                        ref={objectiveRef}
                        id="research-objective"
                        rows={3}
                        maxLength={1000}
                        value={brief.objective}
                        aria-invalid={!!errors.objective}
                        onChange={(event) =>
                          update("objective", event.target.value)
                        }
                      />
                      {errors.objective ? (
                        <FieldError>{errors.objective}</FieldError>
                      ) : null}
                    </Field>
                    <Field data-invalid={!!errors.audience}>
                      <FieldLabel htmlFor="research-audience">
                        Who is this for?
                      </FieldLabel>
                      <Input
                        id="research-audience"
                        maxLength={200}
                        value={brief.audience}
                        aria-invalid={!!errors.audience}
                        onChange={(event) =>
                          update("audience", event.target.value)
                        }
                      />
                      {errors.audience ? (
                        <FieldError>{errors.audience}</FieldError>
                      ) : null}
                    </Field>
                    <Separator />
                    <FieldSet>
                      <FieldLegend>Research questions</FieldLegend>
                      <ResearchRows
                        kind="question"
                        rows={brief.questions}
                        errors={errors}
                        onChange={(rows) => update("questions", rows)}
                      />
                    </FieldSet>
                    <Separator />
                    <FieldSet>
                      <FieldLegend>Scope & sources</FieldLegend>
                      <FieldGroup className="gap-5">
                        <FieldGroup className="@md/field-group:flex-row">
                          <Field>
                            <FieldLabel htmlFor="research-region">
                              Region
                            </FieldLabel>
                            <Select
                              disabled={locked}
                              value={brief.region}
                              onValueChange={(value) => update("region", value)}
                            >
                              <SelectTrigger
                                id="research-region"
                                aria-controls="research-region-options"
                                className="w-full"
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent id="research-region-options">
                                <SelectGroup>
                                  {[
                                    "North America",
                                    "Europe",
                                    "Asia Pacific",
                                    "Global",
                                  ].map((value) => (
                                    <SelectItem key={value} value={value}>
                                      {value}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field>
                            <FieldLabel htmlFor="research-period">
                              Publication window
                            </FieldLabel>
                            <Select
                              disabled={locked}
                              value={brief.period}
                              onValueChange={(value) => update("period", value)}
                            >
                              <SelectTrigger
                                id="research-period"
                                aria-controls="research-period-options"
                                className="w-full"
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent id="research-period-options">
                                <SelectGroup>
                                  {[
                                    "Past 3 months",
                                    "Past 12 months",
                                    "Past 3 years",
                                    "Any time",
                                  ].map((value) => (
                                    <SelectItem key={value} value={value}>
                                      {value}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </Field>
                        </FieldGroup>
                        <FieldSet>
                          <FieldLegend variant="label">
                            Allowed source types
                          </FieldLegend>
                          <FieldGroup className="gap-3">
                            {researchSourceTypes.map((source, index) => (
                              <Field
                                key={source}
                                orientation="horizontal"
                                data-invalid={!!errors.sources}
                              >
                                <Checkbox
                                  disabled={locked}
                                  id={`research-source-${index}`}
                                  checked={brief.sources.includes(source)}
                                  aria-invalid={!!errors.sources}
                                  onCheckedChange={(checked) =>
                                    update(
                                      "sources",
                                      checked === true
                                        ? [...brief.sources, source]
                                        : brief.sources.filter(
                                            (value) => value !== source,
                                          ),
                                    )
                                  }
                                />
                                <FieldLabel
                                  htmlFor={`research-source-${index}`}
                                >
                                  {source}
                                </FieldLabel>
                              </Field>
                            ))}
                          </FieldGroup>
                          {errors.sources ? (
                            <FieldError>{errors.sources}</FieldError>
                          ) : null}
                        </FieldSet>
                        <Field>
                          <FieldLabel htmlFor="research-exclusions">
                            Leave out{" "}
                            <span className="text-muted-foreground font-normal">
                              (optional)
                            </span>
                          </FieldLabel>
                          <Textarea
                            id="research-exclusions"
                            rows={2}
                            maxLength={1000}
                            value={brief.exclusions}
                            onChange={(event) =>
                              update("exclusions", event.target.value)
                            }
                          />
                        </Field>
                      </FieldGroup>
                    </FieldSet>
                  </FieldGroup>
                </FieldSet>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setPanelOpen(true)}>
                    Review plan
                    <ArrowUpRight data-icon="inline-end" />
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        }
      />
    </AiWorkspaceShell>
  );
}
