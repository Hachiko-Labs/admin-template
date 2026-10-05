"use client";
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  CircleAlert,
  Download,
  FileText,
  LockKeyhole,
  Pause,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import {
  type ActivityFilters,
  type AgentRun,
  defaultActivityFilters,
  filterAgentRuns,
  initialAgentRuns,
  type RunAction,
  type RunStatus,
  type StepStatus,
  transitionRun,
} from "@/components/ai-chat/ai-agent-activity-data";
import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { recordValue } from "@/lib/record-value";
import { getScrollMask } from "@/lib/scroll-mask";
import { cn } from "@/lib/utils";

const statuses: Record<RunStatus, { label: string; color: string }> = {
  running: { label: "Running", color: "text-chart-2" },
  review: { label: "Awaiting review", color: "text-warning" },
  blocked: { label: "Blocked by rule", color: "text-destructive" },
  completed: { label: "Completed", color: "text-success" },
  failed: { label: "Failed", color: "text-destructive" },
  cancelled: { label: "Cancelled", color: "text-muted-foreground" },
};
function ActivityFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={label}
        className="w-auto max-w-full min-w-0 gap-3"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function StepIcon({ status }: { status: StepStatus }) {
  const Icon =
    status === "completed"
      ? CheckCircle2
      : status === "blocked"
        ? LockKeyhole
        : status === "failed" || status === "review"
          ? CircleAlert
          : status === "skipped"
            ? X
            : Circle;
  return (
    <Icon
      aria-hidden="true"
      className={cn(
        "mt-0.5 size-3.5 shrink-0",
        status === "waiting" || status === "skipped"
          ? "text-muted-foreground/50"
          : statuses[status].color,
        status === "running" && "motion-safe:animate-pulse",
      )}
    />
  );
}

function RunProgress({ run }: { run: AgentRun }) {
  const completed = run.steps.filter(
    (step) => step.status === "completed",
  ).length;
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8 shrink-0", statuses[run.status].color)}
      aria-hidden="true"
    >
      <circle
        cx="16"
        cy="16"
        r="12"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        className="text-border"
      />
      {run.steps.map((step, index) => (
        <circle
          key={step.title}
          cx="16"
          cy="16"
          r="12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${75.4 / run.steps.length - 5} 75.4`}
          transform={`rotate(${-90 + (index * 360) / run.steps.length} 16 16)`}
          className={
            step.status === "completed"
              ? "text-success"
              : step.status === "waiting" || step.status === "skipped"
                ? "text-border"
                : statuses[step.status].color
          }
        />
      ))}
      {completed === run.steps.length ? (
        <path
          d="m11 16 3 3 7-7"
          stroke="currentColor"
          fill="none"
          strokeWidth="1.8"
        />
      ) : (
        <circle
          cx="16"
          cy="16"
          r="2"
          fill="currentColor"
          className={
            run.status === "running" ? "motion-safe:animate-pulse" : undefined
          }
        />
      )}
    </svg>
  );
}

function formatRelativeAge(minutesAgo: number) {
  if (minutesAgo < 60)
    return `${minutesAgo} ${minutesAgo === 1 ? "min" : "mins"} ago`;
  if (minutesAgo < 24 * 60) {
    const hours = Math.floor(minutesAgo / 60);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }
  const days = Math.floor(minutesAgo / (24 * 60));
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

function RunRow({
  run,
  open,
  onOpenChange,
  onInspect,
  onAction,
  onOutput,
}: {
  run: AgentRun;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInspect: () => void;
  onAction: (action: RunAction) => void;
  onOutput: () => void;
}) {
  const completed = run.steps.filter(
    (step) => step.status === "completed",
  ).length;
  const systems = [...new Set(run.steps.map((step) => step.system))];
  const timeParts = run.time.split(", ");
  const clock = timeParts.at(-1) ?? run.time;
  const timeContext =
    timeParts.length > 1
      ? timeParts.slice(0, -1).join(", ")
      : formatRelativeAge(run.minutesAgo);
  return (
    <li
      className="relative grid grid-cols-[1fr] gap-2 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6"
      data-run-id={run.id}
    >
      <div className="text-muted-foreground flex items-center gap-2 pl-1 text-[11px] tabular-nums sm:items-start sm:justify-between sm:pt-4">
        <div className="grid min-w-0 flex-1 grid-cols-[72px_minmax(0,1fr)] gap-3">
          <div>
            <p className="text-foreground text-sm leading-none font-medium">
              {clock}
            </p>
            <p className="mt-1 text-[10px]">{timeContext}</p>
          </div>
          <div className="hidden min-w-0 sm:block">
            <p className="text-foreground/80 truncate font-sans text-[11px] font-medium">
              {run.agent}
            </p>
            <p className="mt-0.5 truncate font-mono text-[10px]">{run.id}</p>
          </div>
        </div>
        <span
          className={cn(
            "h-2.5 w-0.5 shrink-0 rounded-full bg-current sm:mt-0.5",
            statuses[run.status].color,
          )}
          aria-hidden="true"
        />
      </div>
      <Collapsible
        open={open}
        onOpenChange={onOpenChange}
        className={cn(
          "overflow-hidden rounded-2xl border transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
          open ? "bg-muted border-transparent" : "bg-card border-border/60",
        )}
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            id={`activity-${run.id}`}
            aria-label={`${open ? "Collapse" : "Expand"} ${run.title}`}
            className={cn(
              "focus-visible:ring-ring flex w-full items-start gap-3 text-left transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] focus-visible:ring-2 focus-visible:outline-none sm:items-center",
              open
                ? "bg-muted rounded-t-2xl p-4 sm:p-5"
                : "bg-card hover:bg-muted/20 rounded-2xl p-4 sm:p-5",
            )}
          >
            <RunProgress run={run} />
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <h2 className="text-sm leading-5 font-medium">{run.title}</h2>
                <p className="text-muted-foreground mt-0.5 truncate text-xs">
                  <span className="sm:hidden">
                    {run.agent}
                    <span className="mx-1.5">·</span>
                    <span className="font-mono text-[10px]">{run.id}</span>
                  </span>
                  <span className="hidden sm:inline">
                    {systems.join(" → ")}
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-[11px] sm:flex-col sm:items-end sm:gap-0.5">
                <span className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "size-1.5 rounded-full bg-current",
                      statuses[run.status].color,
                    )}
                    aria-hidden="true"
                  />
                  {statuses[run.status].label}
                  <span className="text-muted-foreground tabular-nums">
                    {run.duration}
                  </span>
                </span>
                <span className="text-muted-foreground">
                  {completed} of {run.steps.length} completed
                </span>
              </div>
            </div>
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "text-muted-foreground mt-2 size-3.5 shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none sm:mt-0",
                open && "rotate-180",
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent
          forceMount
          inert={!open ? true : undefined}
          aria-hidden={!open}
          className="agent-run-details"
        >
          <div className="agent-run-details-clip">
            <div className="px-2 pb-2">
              <div className="bg-card border-border/50 flex flex-col gap-4 rounded-xl border px-4 py-4 sm:px-5 sm:py-5 sm:pl-[64px]">
                <ol
                  className="divide-border/50 flex flex-col divide-y"
                  aria-label={`Steps for ${run.title}`}
                >
                  {run.steps.map((step, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2.5 py-3 first:pt-0 last:pb-0"
                    >
                      <StepIcon status={step.status} />
                      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p
                            className={cn(
                              "text-xs font-medium",
                              (step.status === "waiting" ||
                                step.status === "skipped") &&
                                "text-muted-foreground",
                            )}
                          >
                            {step.title}
                            {step.status === "skipped" ? " · skipped" : ""}
                          </p>
                          <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
                            {step.system}
                            <span className="mx-1">·</span>
                            {step.detail}
                          </p>
                        </div>
                        {step.status === "review" ? (
                          <Button size="sm" onClick={onInspect}>
                            Review
                            <ArrowUpRight data-icon="inline-end" />
                          </Button>
                        ) : step.status === "blocked" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={onInspect}
                          >
                            View rule
                          </Button>
                        ) : step.status === "failed" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onAction({ type: "retry" })}
                          >
                            <RotateCcw data-icon="inline-start" />
                            Retry step
                          </Button>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
                {run.decision ? (
                  <p className="text-muted-foreground flex items-start gap-2 text-xs">
                    <ShieldCheck
                      className="mt-0.5 size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    {run.decision}
                  </p>
                ) : null}
                {run.status === "completed" && run.output ? (
                  <div>
                    <Button variant="outline" size="sm" onClick={onOutput}>
                      <FileText data-icon="inline-start" />
                      View output
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}

function RunInspector({
  run,
  onAction,
}: {
  run: AgentRun;
  onAction: (action: RunAction) => void;
}) {
  const [note, setNote] = React.useState("");
  const [discount, setDiscount] = React.useState("20");
  const [rejectionError, setRejectionError] = React.useState(false);
  const invalidDiscount =
    discount.trim() === "" ||
    !Number.isFinite(Number(discount)) ||
    Number(discount) < 0 ||
    Number(discount) > 20;
  const isReview = run.status === "review";
  return (
    <>
      <SheetHeader className="border-border/70 shrink-0 border-b pr-8 pb-4 text-left">
        <div className="text-muted-foreground mb-1 flex items-center gap-2 text-xs">
          <span
            className={cn(
              "size-1.5 rounded-full",
              isReview ? "bg-warning" : "bg-destructive",
            )}
          />
          {isReview ? "Approval required" : "Blocked by policy"}
        </div>
        <SheetTitle className="text-xl tracking-tight">
          {isReview ? "Review customer export" : "Review discount request"}
        </SheetTitle>
        <SheetDescription className="text-xs">
          {run.agent}
          <span className="mx-2">·</span>
          <span className="font-mono text-[11px]">{run.id}</span>
        </SheetDescription>
      </SheetHeader>
      <ScrollArea className="min-h-0 flex-1">
        <div className="grid gap-4 py-4 pr-3 pl-1">
          <section
            className="border-border/60 bg-muted/25 overflow-hidden rounded-xl border"
            aria-label="Request summary"
          >
            <div className="border-border/60 border-b px-4 py-2.5">
              <p className="text-sm font-medium">{run.title}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {isReview
                  ? "Customer reporting workspace"
                  : "Harborline Apps · annual team plan"}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-3 p-4">
              <div>
                <dt className="text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase">
                  {isReview ? "Records to export" : "Requested discount"}
                </dt>
                <dd className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
                  {isReview ? "3,120" : "35%"}
                </dd>
              </div>
              <div className="border-border/60 border-l pl-4">
                <dt className="text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase">
                  {isReview ? "Without review" : "Policy limit"}
                </dt>
                <dd className="text-muted-foreground mt-1 text-2xl font-semibold tracking-tight tabular-nums">
                  {isReview ? "700" : "20%"}
                </dd>
              </div>
            </dl>
            <div className="border-border/60 text-muted-foreground flex items-start gap-2 border-t px-4 py-2.5 text-xs">
              <ShieldCheck
                className="mt-0.5 size-3.5 shrink-0"
                aria-hidden="true"
              />
              <p className="leading-relaxed">
                {isReview
                  ? "2,420 records above the automatic export limit. Your approval applies to this run only."
                  : "The requested discount exceeds the limit. Revise this request to continue; the policy stays unchanged."}
              </p>
            </div>
          </section>
          {!isReview ? (
            <section
              className="flex items-center justify-between gap-4 border-b pb-4"
              aria-label="Destination"
            >
              <span className="text-muted-foreground text-xs">
                Update destination
              </span>
              <div className="text-right">
                <p className="text-sm font-medium">Salesforce</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Deal #9031 · Harborline Apps
                </p>
              </div>
            </section>
          ) : null}
          {isReview ? (
            <>
              <section aria-label="Export manifest" className="grid gap-4">
                <div className="flex items-center gap-3">
                  <span className="bg-muted/50 flex size-9 shrink-0 items-center justify-center rounded-lg">
                    <FileText className="text-muted-foreground size-4" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium">
                      Customer health report
                    </h3>
                    <p className="text-muted-foreground mt-1 text-[11px]">
                      Export manifest · 3,120 active accounts
                    </p>
                  </div>
                </div>
                <dl className="divide-y border-y text-xs">
                  <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3 py-3">
                    <dt className="text-muted-foreground">Send to</dt>
                    <dd>
                      <span className="font-medium">Tableau</span>
                      <span className="text-muted-foreground mx-2">/</span>
                      <span className="text-muted-foreground">
                        Revenue workspace
                      </span>
                    </dd>
                  </div>
                  <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3 py-3">
                    <dt className="text-muted-foreground">Include</dt>
                    <dd>
                      <ul className="grid grid-cols-2 gap-x-3 gap-y-2">
                        {[
                          "Account name",
                          "Plan",
                          "Revenue",
                          "Renewal date",
                          "Health score",
                        ].map((field) => (
                          <li key={field} className="flex items-start gap-1.5">
                            <Check
                              className="text-muted-foreground mt-0.5 size-3 shrink-0"
                              aria-hidden="true"
                            />
                            {field}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3 py-3">
                    <dt className="text-muted-foreground">Exclude</dt>
                    <dd className="text-muted-foreground flex items-start gap-1.5 leading-relaxed">
                      <LockKeyhole className="mt-0.5 size-3 shrink-0" />
                      Payment details and personal contact fields
                    </dd>
                  </div>
                  <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3 py-3">
                    <dt className="text-muted-foreground">Then notify</dt>
                    <dd className="leading-relaxed">
                      Dashboard owner
                      <span className="text-muted-foreground mx-1.5">via</span>
                      Slack
                    </dd>
                  </div>
                </dl>
              </section>
              <FieldGroup>
                <Field data-invalid={rejectionError}>
                  <FieldLabel htmlFor="review-note">
                    Review note{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional for approval)
                    </span>
                  </FieldLabel>
                  <Textarea
                    id="review-note"
                    value={note}
                    onChange={(event) => {
                      setNote(event.target.value);
                      setRejectionError(false);
                    }}
                    placeholder="Add a decision note for the agent…"
                    className="min-h-20 resize-y rounded-lg shadow-none"
                    aria-invalid={rejectionError}
                    aria-describedby="review-note-help"
                  />
                  <FieldDescription id="review-note-help">
                    {rejectionError
                      ? "Add a reason before rejecting this request."
                      : "A rejection needs a reason so the agent knows what to change."}
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </>
          ) : (
            <>
              <FieldGroup>
                <Field data-invalid={invalidDiscount}>
                  <FieldLabel htmlFor="discount-value">
                    Revised discount (%)
                  </FieldLabel>
                  <Input
                    id="discount-value"
                    type="number"
                    min={0}
                    max={20}
                    step="0.5"
                    value={discount}
                    onChange={(event) => setDiscount(event.target.value)}
                    aria-invalid={invalidDiscount}
                    aria-describedby="discount-help"
                  />
                  <FieldDescription id="discount-help">
                    {invalidDiscount
                      ? "Enter a discount between 0% and 20%."
                      : "The policy stays unchanged. Only this deal’s request will be revised."}
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </>
          )}
        </div>
      </ScrollArea>
      <SheetFooter className="border-border/70 shrink-0 gap-2 border-t pt-3">
        {isReview ? (
          <>
            <Button
              variant="outline"
              onClick={() => {
                if (!note.trim()) {
                  setRejectionError(true);
                  document.getElementById("review-note")?.focus();
                  return;
                }
                onAction({ type: "reject", note });
              }}
            >
              Reject request
            </Button>
            <Button onClick={() => onAction({ type: "approve", note })}>
              <Check data-icon="inline-start" />
              Approve this run
            </Button>
          </>
        ) : (
          <Button
            disabled={invalidDiscount}
            onClick={() =>
              onAction({ type: "revise-discount", value: Number(discount) })
            }
          >
            Revise and continue
            <ArrowUpRight data-icon="inline-end" />
          </Button>
        )}
      </SheetFooter>
    </>
  );
}

export function AiAgentActivityScreen() {
  const [runs, setRuns] = React.useState(initialAgentRuns);
  const [filters, setFilters] = React.useState(defaultActivityFilters);
  const [expanded, setExpanded] = React.useState(
    new Set(["run_84f2", "run_78de"]),
  );
  const [inspecting, setInspecting] = React.useState<string | null>(null);
  const [outputId, setOutputId] = React.useState<string | null>(null);
  const [live, setLive] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState("");
  const returnFocusRef = React.useRef<HTMLElement | null>(null);
  const returnRunRef = React.useRef<string | null>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const visible = filterAgentRuns(runs, filters);
  const periodRuns = filterAgentRuns(runs, {
    ...defaultActivityFilters,
    period: filters.period,
  });
  const attentionCount = periodRuns.filter((run) =>
    ["review", "blocked", "failed"].includes(run.status),
  ).length;
  const selected = runs.find((run) => run.id === inspecting);
  const output = runs.find((run) => run.id === outputId)?.output;
  const filtered = Object.entries(filters).some(
    ([key, value]) =>
      key !== "sort" &&
      value !== recordValue({ ...defaultActivityFilters }, key),
  );

  React.useEffect(() => {
    if (!live) return;
    const timer = window.setInterval(
      () =>
        setRuns((current) =>
          current.map((run) => transitionRun(run, { type: "advance" })),
        ),
      3000,
    );
    return () => window.clearInterval(timer);
  }, [live]);

  React.useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;
    const update = () => {
      const mask = getScrollMask(
        viewport.scrollTop,
        Math.max(0, viewport.scrollHeight - viewport.clientHeight),
      );
      viewport.style.maskImage = mask;
      viewport.style.webkitMaskImage = mask;
    };
    update();
    viewport.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    observer.observe(content);
    return () => {
      viewport.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  function rememberFocus(id: string) {
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    returnRunRef.current = id;
  }
  function restoreFocus(event: Event) {
    event.preventDefault();
    const opener = returnFocusRef.current;
    const target = opener?.isConnected
      ? opener
      : document.getElementById(`activity-${returnRunRef.current}`);
    if (target) target.focus({ preventScroll: true });
    else
      document
        .querySelector<HTMLInputElement>('[aria-label="Search runs or IDs"]')
        ?.focus();
  }
  function setFilter(key: keyof ActivityFilters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
    viewportRef.current?.scrollTo({ top: 0 });
  }
  function applyAction(id: string, action: RunAction) {
    setRuns((current) =>
      current.map((run) => (run.id === id ? transitionRun(run, action) : run)),
    );
    setInspecting(null);
    setExpanded((current) => new Set(current).add(id));
    if (action.type !== "reject") setLive(true);
    const message =
      action.type === "approve"
        ? "Export approved for this run. Execution resumed."
        : action.type === "reject"
          ? "Request rejected. Remaining steps cancelled."
          : action.type === "retry"
            ? "Retry started from the failed step."
            : "Discount revised. Execution resumed within the policy limit.";
    setAnnouncement(message);
    toast(message);
  }
  function reset() {
    setRuns(initialAgentRuns);
    setFilters(defaultActivityFilters);
    setExpanded(new Set(["run_84f2", "run_78de"]));
    setLive(false);
    viewportRef.current?.scrollTo({ top: 0 });
    setAnnouncement("Demo activity reset.");
  }

  return (
    <AiWorkspaceShell
      headerTitle="Agent activity"
      hideNavigationSidebar
      headerActions={
        <>
          <span className="text-muted-foreground mr-2 hidden text-xs sm:block">
            Demo workspace
          </span>
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw data-icon="inline-start" />
            Reset
          </Button>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 px-4 pt-6 pb-5 sm:px-8 sm:pt-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Activity
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  Every agent run, from first step to outcome.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 pt-1 text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <span className="bg-chart-2 size-1.5 rounded-full" />
                  {
                    periodRuns.filter((run) => run.status === "running").length
                  }{" "}
                  running
                </span>
                <button
                  onClick={() => setFilter("status", "attention")}
                  className="text-muted-foreground hover:text-foreground focus-visible:ring-ring flex items-center gap-1.5 rounded-sm focus-visible:ring-2 focus-visible:outline-none"
                >
                  <span className="bg-warning size-1.5 rounded-full" />
                  {attentionCount} need attention
                </button>
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <span className="bg-success size-1.5 rounded-full" />
                  {
                    periodRuns.filter((run) => run.status === "completed")
                      .length
                  }{" "}
                  completed
                </span>
              </div>
            </div>
            <div
              role="search"
              aria-label="Filter agent activity"
              className="flex flex-wrap items-center gap-2"
            >
              <InputGroup className="w-full sm:w-64">
                <InputGroupInput
                  aria-label="Search runs or IDs"
                  placeholder="Search runs or IDs"
                  value={filters.query}
                  onChange={(event) => setFilter("query", event.target.value)}
                />
                <InputGroupAddon>
                  <Search aria-hidden="true" />
                </InputGroupAddon>
              </InputGroup>
              <ActivityFilter
                label="Time period"
                value={filters.period}
                onChange={(value) => setFilter("period", value)}
                options={[
                  { value: "1h", label: "Last hour" },
                  { value: "24h", label: "Last 24 hours" },
                  { value: "7d", label: "Last 7 days" },
                ]}
              />
              <ActivityFilter
                label="Run status"
                value={filters.status}
                onChange={(value) => setFilter("status", value)}
                options={[
                  { value: "all", label: "Status" },
                  { value: "attention", label: "Needs attention" },
                  ...Object.entries(statuses).map(([value, status]) => ({
                    value,
                    label: status.label,
                  })),
                ]}
              />
              {filtered ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setFilters(defaultActivityFilters);
                    viewportRef.current?.scrollTo({ top: 0 });
                  }}
                >
                  <X data-icon="inline-start" />
                  Clear filters
                </Button>
              ) : null}
              <Button
                size="sm"
                className="ml-auto"
                aria-pressed={live}
                onClick={() => setLive((current) => !current)}
              >
                {live ? (
                  <Pause data-icon="inline-start" />
                ) : (
                  <Play data-icon="inline-start" />
                )}
                {live ? "Pause" : "Resume"}
              </Button>
            </div>
          </div>
        </div>
        <Separator />
        <div
          ref={viewportRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
          tabIndex={0}
          role="region"
          aria-label="Agent runs"
        >
          <div
            ref={contentRef}
            className="mx-auto w-full max-w-[88rem] px-3 pt-8 pb-16 sm:px-6 xl:px-8"
          >
            {visible.length ? (
              <div className="relative">
                <span className="text-muted-foreground absolute -top-5 left-0 hidden text-[10px] font-medium tracking-wide sm:block">
                  Today
                </span>
                <ol
                  className="relative flex flex-col gap-3"
                  aria-label="Run timeline"
                >
                  {visible.map((run) => (
                    <RunRow
                      key={run.id}
                      run={run}
                      open={expanded.has(run.id)}
                      onOpenChange={(open) =>
                        setExpanded((current) => {
                          const next = new Set(current);
                          if (open) next.add(run.id);
                          else next.delete(run.id);
                          return next;
                        })
                      }
                      onInspect={() => {
                        rememberFocus(run.id);
                        setInspecting(run.id);
                      }}
                      onAction={(action) => applyAction(run.id, action)}
                      onOutput={() => {
                        rememberFocus(run.id);
                        setOutputId(run.id);
                      }}
                    />
                  ))}
                </ol>
              </div>
            ) : (
              <Empty className="min-h-72">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Search />
                  </EmptyMedia>
                  <EmptyTitle>No runs match these filters</EmptyTitle>
                  <EmptyDescription>
                    Try another status, time period, or search term.
                  </EmptyDescription>
                </EmptyHeader>
                <Button
                  variant="outline"
                  onClick={() => setFilters(defaultActivityFilters)}
                >
                  Clear filters
                </Button>
              </Empty>
            )}
            {visible.length ? (
              <p className="text-muted-foreground mt-8 text-center text-xs">
                You’re all caught up for this period.
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      <Sheet
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setInspecting(null);
        }}
      >
        <SheetContent
          onCloseAutoFocus={restoreFocus}
          className="flex h-dvh max-h-dvh w-full flex-col gap-0 overflow-hidden sm:max-w-lg"
        >
          {selected ? (
            <RunInspector
              key={selected.id}
              run={selected}
              onAction={(action) => applyAction(selected.id, action)}
            />
          ) : null}
        </SheetContent>
      </Sheet>
      <Sheet
        open={Boolean(output)}
        onOpenChange={(open) => {
          if (!open) setOutputId(null);
        }}
      >
        <SheetContent
          onCloseAutoFocus={restoreFocus}
          className="flex h-dvh max-h-dvh w-full flex-col gap-0 overflow-hidden sm:max-w-lg"
        >
          <SheetHeader className="border-border/70 shrink-0 border-b pr-8 pb-5 text-left">
            <SheetTitle>Run output</SheetTitle>
            <SheetDescription>{output?.name}</SheetDescription>
          </SheetHeader>
          <ScrollArea className="min-h-0 flex-1">
            <pre className="bg-muted my-6 overflow-x-auto rounded-lg p-4 text-xs leading-relaxed">
              {output?.content}
            </pre>
          </ScrollArea>
          {output ? (
            <SheetFooter className="border-border/70 shrink-0 border-t pt-4">
              <Button
                onClick={() => {
                  const url = URL.createObjectURL(
                    new Blob([output.content], {
                      type: "text/plain;charset=utf-8",
                    }),
                  );
                  const anchor = document.createElement("a");
                  anchor.href = url;
                  anchor.download = output.name;
                  anchor.click();
                  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
                }}
              >
                <Download data-icon="inline-start" />
                Download output
              </Button>
            </SheetFooter>
          ) : null}
        </SheetContent>
      </Sheet>
    </AiWorkspaceShell>
  );
}
