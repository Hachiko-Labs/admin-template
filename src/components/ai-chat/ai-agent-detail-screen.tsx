"use client";

import {
  Activity,
  Blocks,
  Bot,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  MessageSquare,
  Pause,
  Play,
  Send,
  Settings2,
} from "lucide-react";
import { type ComponentProps, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import {
  agentApplications,
  agentDetailActivities,
  type AgentDetailActivity,
  agentIdentity,
  agentRoutines,
  agentSkills,
} from "@/components/ai-chat/ai-agent-detail-data";
import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import { NoResults } from "@/components/ai-chat/platform/platform-ui";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Radix's hidden switch input serializes margin differently during SSR in
// the preview browser. Mount it after hydration and reserve its exact space.
const subscribeToHydration = () => () => {};
function AgentSwitch(props: ComponentProps<typeof Switch>) {
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  return hydrated ? (
    <Switch {...props} />
  ) : (
    <span
      aria-hidden="true"
      className="bg-muted inline-block h-5 w-9 shrink-0 rounded-full"
    />
  );
}

const workspaceTab =
  "h-full rounded-none border-b-2 border-transparent px-4 text-sm data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none";

const filters = [
  { value: "all", label: "All" },
  { value: "threads", label: "Threads" },
  { value: "workflows", label: "Workflows" },
  { value: "checks", label: "Checks" },
  { value: "tasks", label: "Tasks" },
];
const views = [
  { value: "skills", label: "Skills", icon: Blocks },
  { value: "schedule", label: "Calendar", icon: CalendarDays },
  { value: "activity", label: "Activity", icon: Activity },
  { value: "identity", label: "Identity", icon: Settings2 },
];

export function AiAgentDetailScreen() {
  const [identity, setIdentity] = useState(agentIdentity);
  const [draft, setDraft] = useState(agentIdentity);
  const [routines, setRoutines] = useState(agentRoutines);
  const [applications, setApplications] = useState(agentApplications);
  const [skills, setSkills] = useState(agentSkills);
  const [activities, setActivities] = useState(agentDetailActivities);
  const [view, setView] = useState("activity");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string[]>(["brief"]);
  const [paused, setPaused] = useState(false);
  const [day, setDay] = useState("wed");
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<
    { question: string; answer: string }[]
  >([]);
  const visible = activities.filter(
    (item) => filter === "all" || item.kind === filter,
  );
  const scheduled = routines.filter(
    (item) =>
      !paused && item.enabled && (item.id !== "weekly" || day === "fri"),
  );
  function record(title: string, response: string) {
    const item: AgentDetailActivity = {
      id:
        globalThis.crypto?.randomUUID?.() ??
        `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
      time: "Now",
      title,
      source: "Workspace",
      kind: "tasks",
      prompt: "Update the agent workspace settings.",
      response,
    };
    setActivities((current) => [item, ...current]);
  }
  function toggleRoutine(id: string, enabled: boolean) {
    const routine = routines.find((item) => item.id === id)!;
    setRoutines((current) =>
      current.map((item) => (item.id === id ? { ...item, enabled } : item)),
    );
    record(
      `${enabled ? "Enabled" : "Paused"} ${routine.title}`,
      `${routine.title} is ${enabled ? "enabled for its next scheduled run" : "paused until you enable it again"}.`,
    );
  }
  function sendMessage(event: React.FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    const answer = `The latest team pulse reviewed 18 account updates and 6 handoffs. Two accounts need an owner check, and one kickoff moved to Thursday. ${paused ? "My background work is currently paused." : `${routines.filter((item) => item.enabled).length} background tasks are enabled.`} This is a sample response from the demo workspace.`;
    setConversation((current) => [
      ...current,
      { question: message.trim(), answer },
    ]);
    setActivities((current) => [
      {
        id:
          globalThis.crypto?.randomUUID?.() ??
          `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
        time: "Now",
        title: "Workspace conversation",
        source: "Chat",
        kind: "threads",
        prompt: message.trim(),
        response: answer,
      },
      ...current,
    ]);
    setMessage("");
  }
  return (
    <AiWorkspaceShell
      hideNavigationSidebar
      headerTitle={`Agents / ${identity.name}`}
    >
      <div className="min-h-0 flex-1 overflow-y-auto lg:overflow-hidden">
        <div className="h-full w-full">
          <div className="grid min-w-0 lg:h-full lg:min-h-0 lg:grid-cols-[340px_minmax(0,1fr)]">
            <aside
              aria-label="Agent profile"
              className="flex min-h-0 min-w-0 flex-col lg:overflow-y-auto"
            >
              <div className="flex flex-col gap-4 p-5">
                <div className="flex items-center gap-3">
                  <div className="bg-muted flex size-12 shrink-0 items-center justify-center rounded-xl">
                    <Bot
                      className="size-6"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <h1 className="text-xl font-semibold tracking-tight">
                      {identity.name}
                    </h1>
                    <p className="text-muted-foreground text-xs leading-5">
                      {identity.role}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-6">
                  {identity.description}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={`Message ${identity.name}`}
                    onClick={() => setChatOpen(true)}
                  >
                    <MessageSquare data-icon="inline-start" />
                    Message
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={paused ? "Resume" : "Pause"}
                    title={paused ? "Resume agent" : "Pause agent"}
                    onClick={() => {
                      setPaused(!paused);
                      record(
                        paused ? "Agent resumed" : "Agent paused",
                        paused
                          ? "Enabled routines will run on their normal schedules."
                          : "All background routines are on hold. You can still review activity and send a demo message.",
                      );
                    }}
                  >
                    {paused ? (
                      <Play data-icon="inline-start" />
                    ) : (
                      <Pause data-icon="inline-start" />
                    )}
                    {paused ? "Resume" : "Pause"}
                  </Button>
                </div>
              </div>
              <Separator />
              <Tabs defaultValue="routines" className="min-w-0">
                <TabsList
                  aria-label="Agent resources"
                  className="h-11 w-full justify-start rounded-none border-b bg-transparent px-2 py-0"
                >
                  <TabsTrigger value="routines" className={workspaceTab}>
                    Background tasks
                  </TabsTrigger>
                  <TabsTrigger value="apps" className={workspaceTab}>
                    Applications
                  </TabsTrigger>
                </TabsList>
                <TabsContent
                  value="routines"
                  className="mt-0 flex flex-col gap-3 p-4"
                >
                  {routines.map((routine) => (
                    <Card key={routine.id} className="overflow-hidden">
                      <CardHeader className="gap-2 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <CardTitle>
                            <span className="text-sm leading-5">
                              {routine.title}
                            </span>
                          </CardTitle>
                          <AgentSwitch
                            aria-label={`Enable ${routine.title}`}
                            checked={routine.enabled}
                            onCheckedChange={(enabled) =>
                              toggleRoutine(routine.id, enabled)
                            }
                          />
                        </div>
                        <CardDescription>{routine.description}</CardDescription>
                      </CardHeader>
                      <CardFooter className="bg-muted/25 flex-wrap justify-between gap-2 border-t px-4 py-2.5">
                        <span
                          className={cn(
                            "flex items-center gap-1.5 text-[11px]",
                            routine.enabled && !paused
                              ? "text-emerald-600"
                              : "text-muted-foreground",
                          )}
                        >
                          <span className="size-1.5 rounded-full bg-current" />
                          {routine.enabled && !paused ? "Active" : "Paused"}
                        </span>
                        <span className="text-muted-foreground text-[11px]">
                          {routine.schedule}
                        </span>
                      </CardFooter>
                    </Card>
                  ))}
                </TabsContent>
                <TabsContent
                  value="apps"
                  className="mt-0 flex flex-col gap-3 p-4"
                >
                  <p className="text-muted-foreground text-xs leading-5">
                    Choose which sample applications are available to this
                    agent.
                  </p>
                  {applications.map((app) => (
                    <Card key={app.name}>
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <CardTitle>
                            <span className="text-sm">{app.name}</span>
                          </CardTitle>
                          <AgentSwitch
                            checked={app.enabled}
                            aria-label={`Enable ${app.name}`}
                            onCheckedChange={(enabled) => {
                              setApplications((current) =>
                                current.map((item) =>
                                  item.name === app.name
                                    ? { ...item, enabled }
                                    : item,
                                ),
                              );
                              record(
                                `${enabled ? "Enabled" : "Disabled"} ${app.name}`,
                                `${app.name} is ${enabled ? "available" : "unavailable"} to the agent in this demo.`,
                              );
                            }}
                          />
                        </div>
                        <CardDescription>{app.detail}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </aside>
            <section
              aria-label="Agent workspace"
              className="min-h-0 min-w-0 border-t lg:overflow-y-auto lg:border-t-0 lg:border-l"
            >
              <Tabs value={view} onValueChange={setView} className="min-w-0">
                <TabsList
                  aria-label="Agent views"
                  className="bg-background sticky top-0 z-10 h-12 w-full justify-start gap-1 overflow-x-auto rounded-none border-b px-4 py-0"
                >
                  {views.map(({ value, label, icon: Icon }) => (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className={cn(workspaceTab, "gap-2")}
                    >
                      <Icon className="size-3.5" />
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent
                  value="activity"
                  className="m-5 max-w-5xl overflow-hidden rounded-lg border"
                >
                  <div className="bg-muted/20 flex items-center justify-between gap-2 border-b px-4 py-3">
                    <h2 className="text-sm font-medium">
                      {identity.name}’s activity
                    </h2>
                    <span className="text-muted-foreground text-xs">
                      Today, 16 September
                    </span>
                  </div>
                  <Tabs
                    value={filter}
                    onValueChange={setFilter}
                    className="min-w-0"
                  >
                    <TabsList
                      aria-label="Activity type"
                      className="h-auto max-w-full justify-start gap-1.5 overflow-x-auto rounded-none bg-transparent px-3 py-2"
                    >
                      {filters.map((item) => (
                        <TabsTrigger
                          key={item.value}
                          value={item.value}
                          className="data-[state=active]:bg-muted rounded-md border px-2.5 py-1 text-xs data-[state=active]:shadow-none"
                        >
                          {item.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <TabsContent
                      value={filter}
                      className="mt-0 overflow-hidden border-t"
                    >
                      {visible.length ? (
                        visible.map((item) => (
                          <Collapsible
                            key={item.id}
                            open={expanded.includes(item.id)}
                            onOpenChange={(open) =>
                              setExpanded((current) =>
                                open
                                  ? [...current, item.id]
                                  : current.filter((id) => id !== item.id),
                              )
                            }
                            className="group border-b last:border-0"
                          >
                            <CollapsibleTrigger asChild>
                              <button className="hover:bg-muted/40 focus-visible:ring-ring flex w-full items-center gap-3 px-4 py-3 text-left focus-visible:ring-2 focus-visible:outline-none">
                                <span className="text-muted-foreground w-10 shrink-0 text-xs tabular-nums">
                                  {item.time}
                                </span>
                                <span className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                                  <span className="text-sm leading-5">
                                    {item.title}
                                  </span>
                                  <span className="text-muted-foreground text-xs">
                                    {item.source}
                                    {item.duration ? ` · ${item.duration}` : ""}
                                  </span>
                                </span>
                                <ChevronDown className="text-muted-foreground size-3.5 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                              </button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="mr-5 mb-5 ml-[68px] flex max-w-prose flex-col gap-4 border-l pl-4">
                                <div className="flex flex-col gap-1.5">
                                  <span className="text-muted-foreground text-xs">
                                    Request
                                  </span>
                                  <p className="text-sm leading-6">
                                    {item.prompt}
                                  </p>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <span className="flex items-center gap-1.5 text-xs text-emerald-600">
                                    <Check className="size-3" />
                                    Completed
                                  </span>
                                  <p className="text-muted-foreground text-sm leading-6">
                                    {item.response}
                                  </p>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))
                      ) : (
                        <NoResults
                          title="No activity yet"
                          description="New activity of this type will appear here."
                        />
                      )}
                    </TabsContent>
                  </Tabs>
                  <p
                    className="text-muted-foreground border-t px-4 py-2.5 text-xs"
                    aria-live="polite"
                  >
                    {visible.length} events · All times in UTC
                  </p>
                </TabsContent>
                <TabsContent value="skills" className="m-6 flex flex-col gap-5">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-base font-medium">
                      What {identity.name} can do
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Reusable skills available for conversations and background
                      work.
                    </p>
                  </div>
                  {skills.map((skill) => (
                    <Card key={skill.name}>
                      <CardHeader className="flex-row items-start justify-between gap-4">
                        <div className="flex flex-col gap-2">
                          <CardTitle>
                            <span className="text-sm">{skill.name}</span>
                          </CardTitle>
                          <CardDescription>{skill.description}</CardDescription>
                        </div>
                        <AgentSwitch
                          aria-label={`Enable ${skill.name}`}
                          checked={skill.enabled}
                          onCheckedChange={(enabled) => {
                            setSkills((current) =>
                              current.map((item) =>
                                item.name === skill.name
                                  ? { ...item, enabled }
                                  : item,
                              ),
                            );
                            record(
                              `${enabled ? "Enabled" : "Disabled"} ${skill.name}`,
                              `The ${skill.name.toLowerCase()} skill is ${enabled ? "available" : "disabled"} for future work.`,
                            );
                          }}
                        />
                      </CardHeader>
                    </Card>
                  ))}
                </TabsContent>
                <TabsContent
                  value="schedule"
                  className="m-6 flex flex-col gap-5"
                >
                  <div className="flex flex-col gap-1">
                    <h2 className="text-base font-medium">This week</h2>
                    <p className="text-muted-foreground text-sm">
                      14–18 September 2026 · UTC
                    </p>
                  </div>
                  <Tabs value={day} onValueChange={setDay}>
                    <TabsList
                      aria-label="Schedule day"
                      className="h-auto w-full justify-between"
                    >
                      {[
                        ["mon", "Mon 14"],
                        ["tue", "Tue 15"],
                        ["wed", "Wed 16"],
                        ["thu", "Thu 17"],
                        ["fri", "Fri 18"],
                      ].map(([value, label]) => (
                        <TabsTrigger
                          key={value}
                          value={value}
                          className="px-2 py-2"
                        >
                          {label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <TabsContent value={day} className="mt-4">
                      {scheduled.length ? (
                        <div className="divide-y rounded-xl border">
                          {scheduled.map((routine) => (
                            <div key={routine.id} className="flex gap-4 p-4">
                              <Clock3 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                              <div className="flex flex-1 flex-col gap-1">
                                <span className="text-sm font-medium">
                                  {routine.title}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                  {routine.schedule}
                                </span>
                              </div>
                              <span className="text-muted-foreground text-xs tabular-nums">
                                {routine.time}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <NoResults
                          title={
                            paused ? "Agent is paused" : "Nothing scheduled"
                          }
                          description="Enable a background task or resume the agent to see upcoming work."
                        />
                      )}
                    </TabsContent>
                  </Tabs>
                </TabsContent>
                <TabsContent value="identity" className="m-6">
                  <form
                    className="flex flex-col gap-6"
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (
                        !draft.name.trim() ||
                        !draft.role.trim() ||
                        !draft.description.trim()
                      )
                        return;
                      const updated = {
                        name: draft.name.trim(),
                        role: draft.role.trim(),
                        description: draft.description.trim(),
                      };
                      setIdentity(updated);
                      setDraft(updated);
                      toast.success("Agent identity updated");
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      <h2 className="text-base font-medium">Agent identity</h2>
                      <p className="text-muted-foreground text-sm">
                        Give your agent a clear role and a useful introduction.
                      </p>
                    </div>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="agent-name">Name</FieldLabel>
                        <Input
                          id="agent-name"
                          value={draft.name}
                          maxLength={40}
                          required
                          onChange={(event) =>
                            setDraft({ ...draft, name: event.target.value })
                          }
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="agent-role">Role</FieldLabel>
                        <Input
                          id="agent-role"
                          value={draft.role}
                          maxLength={80}
                          required
                          onChange={(event) =>
                            setDraft({ ...draft, role: event.target.value })
                          }
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="agent-description">
                          Introduction
                        </FieldLabel>
                        <Textarea
                          id="agent-description"
                          value={draft.description}
                          rows={4}
                          maxLength={320}
                          required
                          onChange={(event) =>
                            setDraft({
                              ...draft,
                              description: event.target.value,
                            })
                          }
                        />
                      </Field>
                    </FieldGroup>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={
                          !draft.name.trim() ||
                          !draft.role.trim() ||
                          !draft.description.trim() ||
                          JSON.stringify(draft) === JSON.stringify(identity)
                        }
                      >
                        Save changes
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDraft(identity)}
                      >
                        Reset
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </section>
          </div>
        </div>
      </div>
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-h-[85svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Message {identity.name}</DialogTitle>
            <DialogDescription>
              A demo conversation using sample agent activity.
            </DialogDescription>
          </DialogHeader>
          <div
            className="flex max-h-72 flex-col gap-4 overflow-y-auto"
            role="log"
          >
            {conversation.length ? (
              conversation.map((turn, index) => (
                <div key={index} className="flex flex-col gap-3">
                  <p className="bg-muted ml-8 rounded-xl px-3 py-2 text-sm">
                    {turn.question}
                  </p>
                  <p className="text-muted-foreground text-sm leading-6">
                    {turn.answer}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground py-4 text-sm">
                Ask for a recap of the latest account changes and team handoffs.
              </p>
            )}
          </div>
          <form onSubmit={sendMessage} className="flex flex-col gap-3">
            <Field>
              <FieldLabel htmlFor="agent-message">Message</FieldLabel>
              <Textarea
                id="agent-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="What needs our attention today?"
              />
            </Field>
            <Button
              type="submit"
              className="self-end"
              disabled={!message.trim()}
            >
              <Send data-icon="inline-start" />
              Send message
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AiWorkspaceShell>
  );
}
