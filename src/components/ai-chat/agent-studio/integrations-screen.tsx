"use client";

import {
  Check,
  CheckCheck,
  CircleCheck,
  LoaderCircle,
  Plus,
  ShieldCheck,
  Unplug,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { IntegrationsNavigation } from "./integrations-navigation";
import { type Connector, connectors } from "./studio-data";
import { StudioShell } from "./studio-shell";

export function StudioIntegrationsScreen() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [connected, setConnected] = useState(
    connectors.filter((c) => c.connected).map((c) => c.id),
  );
  const [selected, setSelected] = useState<Connector | null>(null);
  const [scopes, setScopes] = useState<Record<string, string[]>>({});
  const [scope, setScope] = useState<string[]>(["Read selected resources"]);
  const [verified, setVerified] = useState<"idle" | "testing" | "passed">(
    "idle",
  );
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [reason, setReason] = useState("");
  const [requested, setRequested] = useState<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function inspect(item: Connector) {
    if (timer.current) clearTimeout(timer.current);
    setSelected(item);
    setScope(scopes[item.id] ?? ["Read selected resources"]);
    setVerified("idle");
  }
  const visible = connectors.filter(
    (c) =>
      (category === "All" ||
        (category === "Connected"
          ? connected.includes(c.id)
          : c.category === category)) &&
      (c.name + c.description)
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );
  const groups =
    category === "All" && !query.trim()
      ? [
          {
            title: "Recommended for your workspace",
            items: visible.filter((c) => c.recommended),
          },
          {
            title: "Explore more connections",
            items: visible.filter((c) => !c.recommended),
          },
        ]
      : [
          {
            title: `${category === "All" ? "Search results" : category} · ${visible.length}`,
            items: visible,
          },
        ];
  return (
    <StudioShell
      active="integrations"
      sidebarContent={
        <IntegrationsNavigation
          category={category}
          query={query}
          connectedCount={connected.length}
          onCategoryChange={setCategory}
          onQueryChange={setQuery}
        />
      }
    >
      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1140px] px-5 py-7 sm:px-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  Integrations
                </h1>
                <p className="text-muted-foreground mt-1 text-xs">
                  Your tools, working together.
                </p>
              </div>
              <div className="flex w-full gap-2 sm:w-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRequestOpen(true)}
                >
                  Request app
                </Button>
              </div>
            </div>

            <div className="relative mb-8 flex min-h-[146px] items-center overflow-hidden rounded-xl border border-emerald-200/60 bg-emerald-50/60 px-6 py-6 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <div className="pointer-events-none absolute -top-24 right-12 size-72 rounded-full border border-emerald-400/15 shadow-[0_0_0_40px_color-mix(in_oklab,var(--color-emerald-400)_5%,transparent),0_0_0_80px_color-mix(in_oklab,var(--color-emerald-400)_4%,transparent)]" />
              <div className="relative max-w-[260px]">
                <span className="text-[10px] font-medium tracking-widest text-emerald-700 dark:text-emerald-400">
                  BETTER CONTEXT. BETTER WORK.
                </span>
                <h2 className="mt-2 text-lg leading-6 font-medium">
                  Bring your workspace
                  <br />
                  into the conversation.
                </h2>
                <p className="text-muted-foreground mt-2 text-xs">
                  {connected.length} connections ready for your agents
                </p>
              </div>
              <div className="relative ml-auto hidden space-y-3 pl-5 xl:block">
                <div className="bg-background/80 flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] shadow-sm">
                  <CheckCheck className="size-3.5 text-emerald-600" />
                  12 customer signals linked to their sources
                </div>
                <div className="bg-background/80 ml-7 flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] shadow-sm">
                  <CircleCheck className="size-3.5 text-emerald-600" />
                  Weekly brief ready for review
                </div>
              </div>
            </div>
            <div className="space-y-8">
              {groups.map((group) => (
                <section key={group.title} aria-label={group.title}>
                  <h2 className="text-muted-foreground mb-3 text-xs font-medium">
                    {group.title}
                  </h2>
                  <div className="grid gap-x-8 md:grid-cols-2">
                    {group.items.map((item) => {
                      const Icon = item.icon,
                        installed = connected.includes(item.id);
                      return (
                        <article
                          key={item.id}
                          className="border-border/50 flex min-w-0 items-center gap-3 border-b py-4"
                        >
                          <div className="bg-background flex size-9 shrink-0 items-center justify-center rounded-lg border shadow-xs">
                            <Icon className="size-[18px]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-[13px] font-medium">
                              {item.name}
                            </h3>
                            <p className="text-muted-foreground mt-0.5 text-[11px] leading-4">
                              {item.description}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant={installed ? "ghost" : "outline"}
                            className={cn(
                              "h-7 shrink-0 gap-1 px-2 text-[11px]",
                              installed && "bg-muted/60",
                            )}
                            aria-label={`${installed ? "Manage" : "Connect"} ${item.name}`}
                            onClick={() => inspect(item)}
                          >
                            {installed ? (
                              <>
                                <Check className="size-3" />
                                Connected
                              </>
                            ) : (
                              "Connect"
                            )}
                          </Button>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
              {!visible.length && (
                <div className="rounded-lg border border-dashed py-12 text-center">
                  <p className="text-sm">No connections found</p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      setQuery("");
                      setCategory("All");
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </div>
            {requested.length > 0 && (
              <p className="mt-6 text-xs text-emerald-700 dark:text-emerald-400">
                Requested in this demo: {requested.join(", ")}
              </p>
            )}
            <p className="text-muted-foreground mt-9 text-[11px]">
              Demo connections · No external account is connected. Changes last
              while this screen is open.
            </p>
          </div>
        </div>
      </div>
      <Sheet
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-[420px]">
          <SheetHeader className="shrink-0 border-b px-5 py-5 pr-10 text-left">
            <SheetTitle>{selected?.name}</SheetTitle>
            <SheetDescription>{selected?.description}</SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-3">
            <div className="bg-muted/50 rounded-lg border p-4">
              <p className="text-sm font-medium">
                {connected.includes(selected?.id ?? "")
                  ? "Connected to Northstar"
                  : "Set up a demo connection"}
              </p>
              <p className="text-muted-foreground mt-1 text-xs leading-5">
                Choose what agents can access. This preview uses sample data and
                does not request credentials.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-medium">Allowed actions</h3>
              {[
                "Read selected resources",
                "Create drafts",
                "Write after human approval",
              ].map((action) => (
                <label
                  key={action}
                  className="flex items-center gap-3 rounded-md border p-3 text-xs"
                >
                  <Checkbox
                    checked={scope.includes(action)}
                    onCheckedChange={(v) => {
                      setScope(
                        v
                          ? [...scope, action]
                          : scope.filter((s) => s !== action),
                      );
                      setVerified("idle");
                    }}
                  />
                  {action}
                </label>
              ))}
            </div>
            <div>
              <h3 className="mb-2 text-xs font-medium">Connection check</h3>
              <p className="text-muted-foreground mb-3 text-xs">
                {verified === "passed"
                  ? "Sample access check passed. Selected actions are available."
                  : "Verify the selected actions against a sample response."}
              </p>
              <Button
                variant="outline"
                size="sm"
                disabled={!scope.length || verified === "testing"}
                onClick={() => {
                  setVerified("testing");
                  timer.current = setTimeout(() => setVerified("passed"), 600);
                }}
              >
                {verified === "testing" ? (
                  <LoaderCircle className="size-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="size-3.5" />
                )}
                {verified === "testing" ? "Checking…" : "Test connection"}
              </Button>
            </div>
          </div>
          <div className="shrink-0 space-y-2 border-t p-4">
            <Button
              className="w-full"
              disabled={!scope.length}
              onClick={() => {
                if (!selected) return;
                setConnected((c) =>
                  c.includes(selected.id) ? c : [...c, selected.id],
                );
                setScopes((s) => ({ ...s, [selected.id]: scope }));
                toast.success(`${selected.name} connection saved in this demo`);
                setSelected(null);
              }}
            >
              Save connection
            </Button>
            {connected.includes(selected?.id ?? "") && (
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setConnected((c) => c.filter((id) => id !== selected?.id));
                  setSelected(null);
                }}
              >
                <Unplug className="size-3.5" />
                Disconnect in demo
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent className="max-h-[90svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request a connection</DialogTitle>
            <DialogDescription>
              Save an app suggestion in this demo workspace.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setRequested((r) => [...r, requestName.trim()]);
              setRequestName("");
              setReason("");
              setRequestOpen(false);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="app-name">App name</Label>
              <Input
                id="app-name"
                required
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="app-reason">What would you use it for?</Label>
              <Textarea
                id="app-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <Button disabled={!requestName.trim()} type="submit">
              <Plus className="size-4" />
              Save request
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </StudioShell>
  );
}
