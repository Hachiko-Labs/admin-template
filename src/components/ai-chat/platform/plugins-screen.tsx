"use client";

import { Check, CircleAlert, Plus, Search, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  SiDropbox,
  SiFigma,
  SiGithub,
  SiGmail,
  SiJira,
  SiNotion,
  SiSlack,
  SiTrello,
} from "react-icons/si";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { downloadFile } from "./platform-data";
import { NoResults, PlatformPage, PlatformSelect } from "./platform-ui";

const catalog = [
  {
    id: "github",
    name: "GitHub",
    provider: "GitHub, Inc.",
    description:
      "GitHub: Search repositories, inspect pull requests, and bring code context into conversations.",
    category: "Developer tools",
    icon: SiGithub,
    iconClassName: "text-foreground",
    tools: ["search_repositories", "read_pull_requests", "inspect_issues"],
    steps: 2,
    permissions: ["Read repository metadata", "Read issues and pull requests"],
    result:
      "Repository access verified. Three tools returned valid sample results.",
    featured: true,
  },
  {
    id: "figma",
    name: "Figma",
    provider: "Figma, Inc.",
    description:
      "Figma: Read design files, inspect component properties, and connect product context to your assistant.",
    category: "Design tools",
    icon: SiFigma,
    iconClassName: "text-[#f24e1e]",
    tools: ["read_design_files", "inspect_components", "export_assets"],
    steps: 4,
    permissions: ["Read selected design files", "Export preview assets"],
    result: "Design access verified. Component metadata is available.",
    featured: true,
  },
  {
    id: "notion",
    name: "Notion",
    provider: "Notion Labs, Inc.",
    description:
      "Notion: Search team knowledge and retrieve pages from approved workspaces.",
    category: "Productivity",
    icon: SiNotion,
    iconClassName: "text-foreground",
    tools: ["search_pages", "read_page", "list_databases"],
    steps: 4,
    permissions: ["Read shared pages", "Search shared databases"],
    result: "Workspace search completed. Shared pages are readable.",
    featured: false,
  },
  {
    id: "slack",
    name: "Slack",
    provider: "Slack Technologies",
    description:
      "Slack: Search messages, summarize channels, and ground answers in recent team conversations.",
    category: "Communication",
    icon: SiSlack,
    iconClassName: "text-[#e01e5a]",
    tools: ["search_messages", "read_thread", "list_channels"],
    steps: 4,
    permissions: ["Read approved channels", "Search message history"],
    result: "Channel access verified. Recent messages are available.",
    featured: true,
  },
  {
    id: "jira",
    name: "Jira",
    provider: "Atlassian",
    description:
      "Jira: Find issues, review sprint progress, and pull delivery context into project conversations.",
    category: "Productivity",
    icon: SiJira,
    iconClassName: "text-[#1868db]",
    tools: ["search_issues", "read_sprint", "read_project"],
    steps: 3,
    permissions: ["Read issue details", "Read project and sprint metadata"],
    result: "Project access verified. Jira issues are ready to search.",
    featured: false,
  },
  {
    id: "dropbox",
    name: "Dropbox",
    provider: "Dropbox, Inc.",
    description:
      "Dropbox: Locate files and retrieve approved workspace documents without leaving the conversation.",
    category: "Storage",
    icon: SiDropbox,
    iconClassName: "text-[#0061ff]",
    tools: ["search_files", "read_file", "list_folders"],
    steps: 2,
    permissions: ["Read selected folders", "Search file metadata"],
    result: "Folder access verified. Files are available for retrieval.",
    featured: false,
  },
  {
    id: "gmail",
    name: "Gmail",
    provider: "Google",
    description:
      "Gmail: Find approved email threads and use customer context in assistant responses.",
    category: "Communication",
    icon: SiGmail,
    iconClassName: "text-[#ea4335]",
    tools: ["search_messages", "read_message", "read_thread"],
    steps: 3,
    permissions: ["Read approved mailboxes", "Search email metadata"],
    result: "Mailbox access verified. Sample threads were retrieved.",
    featured: false,
  },
  {
    id: "trello",
    name: "Trello",
    provider: "Atlassian",
    description:
      "Trello: Read boards, cards, and checklists to keep project answers current and actionable.",
    category: "Productivity",
    icon: SiTrello,
    iconClassName: "text-[#0c66e4]",
    tools: ["list_boards", "read_cards", "read_checklists"],
    steps: 3,
    permissions: ["Read selected boards", "Read cards and checklists"],
    result: "Board access verified. Cards and checklists are available.",
    featured: false,
  },
] as const;

type Installation = {
  id: (typeof catalog)[number]["id"];
  enabled: boolean;
  project: string;
  tools: string[];
  health: "connected" | "attention";
};

const initialInstallations: Installation[] = [
  {
    id: "github",
    enabled: true,
    project: "Support copilot",
    tools: [...catalog[0].tools],
    health: "connected",
  },
  {
    id: "notion",
    enabled: true,
    project: "Knowledge search",
    tools: [...catalog[2].tools],
    health: "attention",
  },
  {
    id: "slack",
    enabled: true,
    project: "All projects",
    tools: [...catalog[3].tools],
    health: "connected",
  },
];

const categories = [
  "All apps",
  "Connected",
  "Developer tools",
  "Communication",
  "Productivity",
  "Design tools",
  "Storage",
] as const;

export function PluginsScreen() {
  const [installed, setInstalled] =
    useState<Installation[]>(initialInstallations);
  const [category, setCategory] =
    useState<(typeof categories)[number]>("All apps");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [installing, setInstalling] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [project, setProject] = useState("Support copilot");
  const [enabled, setEnabled] = useState(true);
  const [allowed, setAllowed] = useState<string[]>([]);
  const [test, setTest] = useState<"idle" | "running" | "passed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const plugin = catalog.find((item) => item.id === (selected ?? installing));
  const selectedInstallation = installed.find((item) => item.id === selected);
  const normalizedQuery = query.trim().toLowerCase();
  const visible = catalog.filter((item) => {
    const installation = installed.find((entry) => entry.id === item.id);
    const matchesCategory =
      category === "All apps" ||
      (category === "Connected" && !!installation) ||
      item.category === category;
    const matchesQuery = `${item.name} ${item.provider} ${item.description}`
      .toLowerCase()
      .includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });

  function clearTest() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setTest("idle");
  }

  function open(id: string, isNew = false) {
    clearTest();
    const item = catalog.find((entry) => entry.id === id)!;
    const settings = installed.find((entry) => entry.id === id);
    setProject(settings?.project ?? "Support copilot");
    setEnabled(settings?.enabled ?? true);
    setAllowed(settings?.tools ?? [...item.tools]);
    if (isNew) setInstalling(id);
    else setSelected(id);
  }

  function save() {
    if (!plugin) return;
    const entry: Installation = {
      id: plugin.id,
      project,
      enabled,
      tools: allowed,
      health: "connected",
    };
    setInstalled((items) =>
      items.some((item) => item.id === entry.id)
        ? items.map((item) => (item.id === entry.id ? entry : item))
        : [...items, entry],
    );
    setInstalling(null);
    setSelected(null);
    toast.success(
      `${plugin.name} ${installing ? "connected to the demo workspace" : "settings saved"}`,
    );
  }

  function toggleConnection(id: string, value: boolean) {
    const installation = installed.find((item) => item.id === id);
    const item = catalog.find((entry) => entry.id === id)!;
    if (!installation) {
      open(id, true);
      return;
    }
    setInstalled((items) =>
      items.map((entry) =>
        entry.id === id ? { ...entry, enabled: value } : entry,
      ),
    );
    toast.success(`${item.name} ${value ? "enabled" : "paused"}`);
  }

  const config = (
    <FieldGroup>
      <Field>
        <FieldLabel>Project access</FieldLabel>
        <PlatformSelect
          label="Plugin project access"
          value={project}
          onChange={(value) => {
            setProject(value);
            clearTest();
          }}
          options={[
            "Support copilot",
            "Knowledge search",
            "Research assistant",
            "All projects",
          ]}
          className="w-full"
        />
      </Field>
      <Field orientation="horizontal">
        <div className="flex-1 space-y-1">
          <FieldLabel htmlFor="plugin-enabled">Enable connection</FieldLabel>
          <FieldDescription>
            Allow assistants to call the selected tools.
          </FieldDescription>
        </div>
        <Switch
          id="plugin-enabled"
          checked={enabled}
          onCheckedChange={(value) => {
            setEnabled(value);
            clearTest();
          }}
        />
      </Field>
      <Field>
        <FieldLabel>Available tools</FieldLabel>
        <div className="divide-y rounded-lg border">
          {plugin?.tools.map((tool) => (
            <label
              key={tool}
              className="hover:bg-muted/40 flex cursor-pointer items-center gap-3 px-3 py-3 transition-colors"
            >
              <Checkbox
                checked={allowed.includes(tool)}
                onCheckedChange={(value) => {
                  clearTest();
                  setAllowed((items) =>
                    value
                      ? [...items, tool]
                      : items.filter((item) => item !== tool),
                  );
                }}
              />
              <code className="text-xs">{tool}</code>
            </label>
          ))}
        </div>
        <FieldDescription>
          Select at least one tool to enable this connection.
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Permissions</FieldLabel>
        <div className="bg-muted/35 space-y-2 rounded-lg p-3">
          {plugin?.permissions.map((permission) => (
            <div
              key={permission}
              className="text-muted-foreground flex items-center gap-2 text-xs"
            >
              <ShieldCheck className="size-3.5" />
              {permission}
            </div>
          ))}
        </div>
      </Field>
    </FieldGroup>
  );

  return (
    <PlatformPage
      title="Plugins"
      description="Connect the tools your team already uses and make them available to assistants."
      fullWidth
      onReset={() => {
        clearTest();
        setInstalled(initialInstallations);
        setSelected(null);
        setInstalling(null);
        setRemoving(false);
        setQuery("");
        setCategory("All apps");
      }}
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Integration request opened")}
          >
            Request integration
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setCategory("All apps");
              setQuery("");
            }}
          >
            <Plus data-icon="inline-start" />
            Browse all
          </Button>
        </>
      }
    >
      <section className="bg-card overflow-hidden rounded-xl border">
        <div className="flex flex-col gap-4 border-b px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-5">
          <div className="min-w-0">
            <p className="text-sm font-medium">Connection gallery</p>
            <p className="text-muted-foreground truncate text-xs">
              {installed.filter((item) => item.enabled).length} active ·{" "}
              {catalog.length} available
            </p>
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              aria-label="Search plugins"
              placeholder="Search integrations…"
              className="bg-background h-9 pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b px-3 py-2 [scrollbar-width:none] lg:px-5">
          {categories.map((item) => {
            const count =
              item === "All apps"
                ? catalog.length
                : item === "Connected"
                  ? installed.length
                  : catalog.filter((pluginItem) => pluginItem.category === item)
                      .length;
            return (
              <Button
                key={item}
                variant="ghost"
                size="sm"
                aria-pressed={category === item}
                className={cn(
                  "text-muted-foreground shrink-0 gap-1.5 rounded-lg px-3 font-normal",
                  category === item &&
                    "bg-muted text-foreground hover:bg-muted font-medium",
                )}
                onClick={() => setCategory(item)}
              >
                {item}
                <span
                  className={cn(
                    "text-muted-foreground text-[11px] tabular-nums",
                    category === item && "text-foreground/65",
                  )}
                >
                  {count}
                </span>
              </Button>
            );
          })}
        </div>

        <CardContent className="p-4 lg:p-5">
          {visible.length ? (
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {visible.map((item) => {
                const installation = installed.find(
                  (entry) => entry.id === item.id,
                );
                const connected = !!installation;
                const attention = installation?.health === "attention";
                const Icon = item.icon;

                return (
                  <Card
                    key={item.id}
                    className="group hover:border-foreground/20 gap-0 overflow-hidden py-0 shadow-none transition-[border-color,box-shadow] duration-200 hover:shadow-sm"
                  >
                    <CardHeader className="gap-0 px-6 pt-6 pb-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="bg-background flex size-11 shrink-0 items-center justify-center rounded-xl border shadow-xs">
                            <Icon
                              className={cn("size-6", item.iconClassName)}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h2 className="truncate text-base font-semibold tracking-tight">
                                {item.name}
                              </h2>
                              {item.featured && !connected ? (
                                <Badge className="h-5 px-1.5 text-[10px]">
                                  New
                                </Badge>
                              ) : null}
                            </div>
                            <p className="text-muted-foreground truncate text-xs">
                              By {item.provider}
                            </p>
                          </div>
                        </div>
                        <Switch
                          aria-label={`${connected && installation.enabled ? "Disable" : "Enable"} ${item.name}`}
                          checked={connected && installation.enabled}
                          onCheckedChange={(value) =>
                            toggleConnection(item.id, value)
                          }
                        />
                      </div>
                      <p
                        className="text-muted-foreground mt-7 truncate text-sm leading-5"
                        title={item.description}
                      >
                        {item.description}
                      </p>
                      <div className="mt-5 flex flex-wrap items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className="rounded-md text-[10px] font-medium tracking-wide uppercase"
                        >
                          {item.category}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="rounded-md text-[10px] font-medium tracking-wide uppercase"
                        >
                          {item.steps} steps
                        </Badge>
                      </div>
                    </CardHeader>

                    <div
                      className={cn(
                        "bg-muted/35 mt-auto flex min-h-14 items-center justify-between gap-3 border-t px-6 py-3",
                      )}
                    >
                      <div className="flex min-w-0 items-center">
                        {attention ? (
                          <Badge
                            variant="outline"
                            className="border-destructive/15 bg-destructive/8 text-destructive h-6 gap-1.5 rounded-md px-2 text-[10px] font-medium tracking-wide uppercase"
                          >
                            <CircleAlert className="size-3 shrink-0" />
                            Connection error
                          </Badge>
                        ) : installation && !installation.enabled ? (
                          <Badge
                            variant="secondary"
                            className="h-6 rounded-md px-2 text-[10px] font-medium tracking-wide uppercase"
                          >
                            Paused
                          </Badge>
                        ) : null}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground -mr-2 shrink-0 font-normal"
                        onClick={() => open(item.id, !connected)}
                      >
                        View instruction
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <NoResults
              title="No matching integrations"
              description="Try another category or clear your search."
              onClear={() => {
                setQuery("");
                setCategory("All apps");
              }}
            />
          )}
        </CardContent>
      </section>

      <p className="text-muted-foreground px-1 text-xs">
        Connections use scripted sample results. Configuration stays in this
        demo workspace.
      </p>

      <Dialog
        open={!!installing}
        onOpenChange={(value) => {
          if (!value) setInstalling(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <div className="mb-2 flex items-center gap-3">
              {plugin ? (
                <div className="bg-background flex size-10 items-center justify-center rounded-xl border shadow-xs">
                  <plugin.icon className={cn("size-5", plugin.iconClassName)} />
                </div>
              ) : null}
              <div>
                <DialogTitle>Connect {plugin?.name}</DialogTitle>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  By {plugin?.provider}
                </p>
              </div>
            </div>
            <DialogDescription>
              Choose where this connection can be used and review its tool
              permissions.
            </DialogDescription>
          </DialogHeader>
          {config}
          <DialogFooter>
            <Button variant="outline" onClick={() => setInstalling(null)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!allowed.length}>
              Connect integration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet
        open={!!selected}
        onOpenChange={(value) => {
          if (!value) {
            clearTest();
            setSelected(null);
          }
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <div className="mb-2 flex items-center gap-3">
              {plugin ? (
                <div className="bg-background flex size-10 items-center justify-center rounded-xl border shadow-xs">
                  <plugin.icon className={cn("size-5", plugin.iconClassName)} />
                </div>
              ) : null}
              <div>
                <SheetTitle>{plugin?.name}</SheetTitle>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  By {plugin?.provider}
                </p>
              </div>
            </div>
            <SheetDescription>{plugin?.description}</SheetDescription>
          </SheetHeader>
          <div className="space-y-6 px-4 pb-5">
            {selectedInstallation?.health === "attention" ? (
              <div className="border-destructive/20 bg-destructive/5 text-destructive flex items-start gap-2 rounded-lg border p-3 text-xs leading-5">
                <CircleAlert className="mt-0.5 size-4 shrink-0" />
                Reconnect this integration to restore access to its selected
                tools.
              </div>
            ) : null}
            {config}
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Connection test</p>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!enabled || !allowed.length || test === "running"}
                  onClick={() => {
                    clearTest();
                    setTest("running");
                    timer.current = setTimeout(() => {
                      setTest("passed");
                      timer.current = null;
                    }, 650);
                  }}
                >
                  {test === "running" ? "Testing…" : "Run demo test"}
                </Button>
              </div>
              <p className="text-muted-foreground mt-2 text-xs leading-5">
                {!enabled
                  ? "Enable the connection to test its selected tools."
                  : test === "passed"
                    ? plugin?.result
                    : "Verify the selected configuration using a scripted response."}
              </p>
              {test === "passed" ? (
                <div
                  role="status"
                  className="text-success mt-3 flex items-center gap-1.5 text-xs"
                >
                  <Check className="size-3.5" />
                  {allowed.length} tools passed
                </div>
              ) : null}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                downloadFile(
                  `${plugin?.id}-plugin.json`,
                  JSON.stringify(
                    {
                      plugin: plugin?.id,
                      project,
                      enabled,
                      tools: allowed,
                      demo: true,
                    },
                    null,
                    2,
                  ),
                )
              }
            >
              Export configuration
            </Button>
          </div>
          <SheetFooter className="mt-auto flex-row justify-between">
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={() => setRemoving(true)}
            >
              Remove connection
            </Button>
            <Button onClick={save} disabled={!allowed.length}>
              Save changes
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={removing} onOpenChange={setRemoving}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {plugin?.name}?</DialogTitle>
            <DialogDescription>
              Its tools will no longer be available in this demo workspace. You
              can reconnect it at any time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoving(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setInstalled((items) =>
                  items.filter((item) => item.id !== selected),
                );
                clearTest();
                setRemoving(false);
                setSelected(null);
              }}
            >
              Remove connection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PlatformPage>
  );
}
