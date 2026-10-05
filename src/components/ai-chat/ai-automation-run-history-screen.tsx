"use client";
import {
  Check,
  ChevronDown,
  Download,
  LoaderCircle,
  RotateCcw,
  ShieldAlert,
  X,
} from "lucide-react";
import * as React from "react";

import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
type Run = {
  id: string;
  automation: string;
  event: string;
  status: "Success" | "Error" | "Blocked" | "Running";
  time: string;
  duration: string;
  code: string;
  message: string;
  input: Record<string, string>;
  output: string;
  replayOf?: string;
};
const initialRuns: Run[] = [
  {
    id: "exec-205",
    automation: "Weekly project brief",
    event: "schedule.weekly",
    status: "Success",
    time: "09:00",
    duration: "8.2s",
    code: "200",
    message: "Brief prepared and saved to the workspace.",
    input: { project: "Product planning", period: "Previous week" },
    output:
      "# Weekly project brief\n\n- Onboarding evidence reviewed.\n- First-session outline prepared.\n- Retention impact remains a validation question.",
  },
  {
    id: "exec-204",
    automation: "Support digest",
    event: "support.digest.ready",
    status: "Error",
    time: "08:45",
    duration: "10.0s",
    code: "504",
    message: "The demo delivery endpoint did not respond before the timeout.",
    input: { queue: "Customer support", destination: "workspace-digest" },
    output: "",
  },
  {
    id: "exec-203",
    automation: "Document review",
    event: "document.updated",
    status: "Blocked",
    time: "08:30",
    duration: "0.2s",
    code: "Policy",
    message:
      "The requested folder is outside this automation’s approved scope.",
    input: { document: "Planning notes", folder: "Restricted archive" },
    output: "",
  },
  {
    id: "exec-202",
    automation: "Support digest",
    event: "support.digest.ready",
    status: "Success",
    time: "08:00",
    duration: "4.6s",
    code: "200",
    message: "Support themes summarized in the workspace.",
    input: { queue: "Customer support", destination: "workspace-digest" },
    output:
      "# Support digest\n\n- Invitation clarity is a recurring theme.\n- Import guidance needs a visible next step.\n- Permission questions cluster around sharing.",
  },
  {
    id: "exec-201",
    automation: "Document review",
    event: "document.updated",
    status: "Success",
    time: "07:30",
    duration: "3.1s",
    code: "200",
    message: "Review note saved with two follow-up questions.",
    input: { document: "Onboarding outline", folder: "Product planning" },
    output:
      "# Document review\n\nThe outline supports solo setup. Validate invitation clarity and keep retention claims out of the recommendation.",
  },
];
export function AiAutomationRunHistoryScreen() {
  const [runs, setRuns] = React.useState(initialRuns);
  const [status, setStatus] = React.useState("All outcomes");
  const [automation, setAutomation] = React.useState("All automations");
  const [expanded, setExpanded] = React.useState<string | null>("exec-204");
  const [pending, setPending] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => {
      setRuns((current) =>
        current.map((r) =>
          r.id === pending
            ? {
                ...r,
                status: "Success",
                duration: "1.8s",
                code: "200",
                message:
                  "Demo replay completed. A new digest was saved locally.",
                output:
                  "# Replayed support digest\n\nThe fixture event was processed successfully in this local replay. No external endpoint was contacted.",
              }
            : r,
        ),
      );
      setPending(null);
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [pending]);
  const visible = runs.filter(
    (r) =>
      (status === "All outcomes" || r.status === status) &&
      (automation === "All automations" || r.automation === automation),
  );
  function replay(run: Run) {
    if (pending || run.status !== "Error") return;
    const id = `exec-${201 + runs.length}`;
    setRuns((current) => [
      {
        ...run,
        id,
        status: "Running",
        time: "Just now",
        duration: "—",
        code: "Pending",
        message: "Processing the captured demo event.",
        replayOf: run.id,
        output: "",
      },
      ...current,
    ]);
    setPending(id);
    setExpanded(id);
    setStatus("All outcomes");
    setAutomation("All automations");
  }
  function download(run: Run) {
    const url = URL.createObjectURL(
      new Blob([run.output], { type: "text/markdown;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${run.id}-output.md`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <AiWorkspaceShell
      headerTitle="Automation history"
      hideNavigationSidebar
      headerActions={
        <>
          <Badge variant="outline">Demo events</Badge>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Reset run history"
            onClick={() => {
              setPending(null);
              setRuns(initialRuns);
              setExpanded("exec-204");
              setStatus("All outcomes");
              setAutomation("All automations");
            }}
          >
            <RotateCcw />
          </Button>
        </>
      }
    >
      <div className="flex-1 overflow-auto px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p className="text-muted-foreground mb-3 text-xs tracking-widest uppercase">
              Automation observability
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Every trigger leaves a record.
            </h1>
            <p className="text-muted-foreground mt-3 text-sm">
              Inspect outcomes, trace captured inputs and replay a failed demo
              event.
            </p>
          </div>
          <div
            className="mb-4 flex flex-wrap gap-1"
            aria-label="Filter automation"
          >
            {[
              "All automations",
              "Weekly project brief",
              "Support digest",
              "Document review",
            ].map((item) => (
              <Button
                key={item}
                size="sm"
                variant={automation === item ? "secondary" : "ghost"}
                aria-pressed={automation === item}
                onClick={() => setAutomation(item)}
              >
                {item}
              </Button>
            ))}
          </div>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
            <div
              className="flex flex-wrap gap-1"
              aria-label="Filter run outcome"
            >
              {["All outcomes", "Success", "Error", "Blocked"].map((item) => (
                <Button
                  key={item}
                  size="sm"
                  variant={status === item ? "outline" : "ghost"}
                  aria-pressed={status === item}
                  onClick={() => setStatus(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
            <p className="text-muted-foreground text-xs" aria-live="polite">
              {visible.length} runs ·{" "}
              {runs.filter((r) => r.status === "Success").length} successful
            </p>
          </div>
          <h2 className="text-muted-foreground mb-5 text-xs font-medium">
            September 6, 2026 · Demo history
          </h2>
          <ol className="space-y-2">
            {visible.map((run) => {
              const Icon =
                run.status === "Success"
                  ? Check
                  : run.status === "Error"
                    ? X
                    : run.status === "Blocked"
                      ? ShieldAlert
                      : LoaderCircle;
              return (
                <li
                  key={run.id}
                  className="grid grid-cols-[54px_minmax(0,1fr)] gap-3 sm:grid-cols-[70px_minmax(0,1fr)]"
                >
                  <span className="text-muted-foreground pt-5 font-mono text-xs">
                    {run.time}
                  </span>
                  <Collapsible
                    open={expanded === run.id}
                    onOpenChange={(value) => setExpanded(value ? run.id : null)}
                    className="overflow-hidden rounded-lg border"
                  >
                    <CollapsibleTrigger className="group focus-visible:outline-ring flex w-full items-center gap-3 p-4 text-left focus-visible:outline-2">
                      <span
                        className={cn(
                          "bg-muted grid size-8 shrink-0 place-items-center rounded-full",
                          run.status === "Error" &&
                            "bg-destructive/10 text-destructive",
                        )}
                      >
                        <Icon
                          className={cn(
                            "size-4",
                            run.status === "Running" && "animate-spin",
                          )}
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">
                            {run.automation}
                          </span>
                          <Badge variant="outline">{run.status}</Badge>
                          {run.replayOf && (
                            <Badge variant="secondary">Replay</Badge>
                          )}
                        </span>
                        <span className="text-muted-foreground mt-1.5 block font-mono text-xs">
                          {run.id} · {run.event}
                        </span>
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {run.duration}
                      </span>
                      <ChevronDown className="text-muted-foreground size-4 transition-transform group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t px-4 py-5 sm:pl-15">
                        <p className="mb-4 text-sm leading-6">{run.message}</p>
                        {run.replayOf && (
                          <p className="text-muted-foreground mb-4 text-xs">
                            New attempt for {run.replayOf}. The original record
                            is unchanged.
                          </p>
                        )}
                        <Tabs defaultValue="response">
                          <TabsList aria-label={`${run.id} details`}>
                            <TabsTrigger value="response">Response</TabsTrigger>
                            <TabsTrigger value="input">
                              Captured event
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="response">
                            <pre
                              tabIndex={0}
                              className="bg-muted/40 max-h-48 overflow-auto rounded-md border p-4 font-mono text-xs leading-6"
                            >
                              {JSON.stringify(
                                {
                                  status: run.code,
                                  message: run.message,
                                  duration: run.duration,
                                },
                                null,
                                2,
                              )}
                            </pre>
                          </TabsContent>
                          <TabsContent value="input">
                            <pre
                              tabIndex={0}
                              className="bg-muted/40 max-h-48 overflow-auto rounded-md border p-4 font-mono text-xs leading-6"
                            >
                              {JSON.stringify(
                                { event: run.event, ...run.input },
                                null,
                                2,
                              )}
                            </pre>
                          </TabsContent>
                        </Tabs>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          {run.status === "Error" && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!!pending}
                              onClick={() => replay(run)}
                            >
                              <RotateCcw />
                              Replay demo event
                            </Button>
                          )}
                          {run.status === "Blocked" && (
                            <p className="text-muted-foreground text-xs">
                              Scope must be revised before this event can run.
                            </p>
                          )}
                          {run.output && (
                            <>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    View saved output
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>{run.automation}</DialogTitle>
                                    <DialogDescription>
                                      Saved demo output · {run.id}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="max-h-80 overflow-auto text-sm leading-7 whitespace-pre-wrap">
                                    {run.output}
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => download(run)}
                              >
                                <Download />
                                Download
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </li>
              );
            })}
          </ol>
          {!visible.length && (
            <div className="border border-dashed p-10 text-center">
              <p className="text-sm">No runs match these filters.</p>
              <Button
                className="mt-4"
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatus("All outcomes");
                  setAutomation("All automations");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
          <p className="text-muted-foreground mt-6 text-xs">
            Replay uses the captured local fixture. No webhook is sent and no
            schedule is changed.
          </p>
        </div>
      </div>
    </AiWorkspaceShell>
  );
}
