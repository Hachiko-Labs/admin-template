"use client";

import {
  ArrowDownToLine,
  ArrowUpDown,
  Check,
  Columns3,
  Copy,
  ListFilter,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { downloadFile, money, PROJECTS } from "./platform-data";
import {
  NoResults,
  PlatformPage,
  PlatformSelect,
  StatusBadge,
} from "./platform-ui";

type ApiKey = {
  id: string;
  name: string;
  suffix: string;
  owner: string;
  project: string;
  status: string;
  permission: string;
  created: string;
  expires: string;
  lastUsed: string;
  spend: number;
};

type OptionalColumn =
  | "project"
  | "permissions"
  | "expires"
  | "lastUsed"
  | "spend";

const optionalColumns: { id: OptionalColumn; label: string }[] = [
  { id: "project", label: "Project" },
  { id: "permissions", label: "Permissions" },
  { id: "expires", label: "Expires" },
  { id: "lastUsed", label: "Last used" },
  { id: "spend", label: "Spend" },
];

const defaultVisibleColumns: Record<OptionalColumn, boolean> = {
  project: true,
  permissions: true,
  expires: true,
  lastUsed: true,
  spend: true,
};

const initialKeys: ApiKey[] = [
  {
    id: "key_demo_001",
    name: "Production · support",
    suffix: "a7b2",
    owner: "Support service",
    project: "Support copilot",
    status: "Active",
    permission: "Restricted",
    created: "Aug 24, 2026",
    expires: "Nov 24, 2026",
    lastUsed: "2 min ago",
    spend: 86.42,
  },
  {
    id: "key_demo_002",
    name: "Knowledge indexer",
    suffix: "e91c",
    owner: "Knowledge service",
    project: "Knowledge search",
    status: "Active",
    permission: "Restricted",
    created: "Aug 28, 2026",
    expires: "Nov 28, 2026",
    lastUsed: "12 min ago",
    spend: 54.18,
  },
  {
    id: "key_demo_003",
    name: "Content studio",
    suffix: "ff80",
    owner: "Olivia Martin",
    project: "Content studio",
    status: "Active",
    permission: "All permissions",
    created: "Sep 1, 2026",
    expires: "Dec 1, 2026",
    lastUsed: "38 min ago",
    spend: 31.86,
  },
  {
    id: "key_demo_004",
    name: "Analytics · read only",
    suffix: "09d3",
    owner: "Alex Morgan",
    project: "Support copilot",
    status: "Active",
    permission: "Read only",
    created: "Sep 3, 2026",
    expires: "Dec 3, 2026",
    lastUsed: "1 hr ago",
    spend: 0,
  },
  {
    id: "key_demo_005",
    name: "Staging · support",
    suffix: "bb24",
    owner: "Alex Morgan",
    project: "Support copilot",
    status: "Active",
    permission: "Restricted",
    created: "Sep 4, 2026",
    expires: "Oct 4, 2026",
    lastUsed: "Yesterday",
    spend: 4.29,
  },
  {
    id: "key_demo_006",
    name: "Import migration",
    suffix: "ae64",
    owner: "Knowledge service",
    project: "Knowledge search",
    status: "Expired",
    permission: "Restricted",
    created: "Aug 1, 2026",
    expires: "Sep 1, 2026",
    lastUsed: "Aug 31",
    spend: 0,
  },
  {
    id: "key_demo_007",
    name: "Legacy content pipeline",
    suffix: "cc90",
    owner: "Olivia Martin",
    project: "Content studio",
    status: "Revoked",
    permission: "All permissions",
    created: "Jul 16, 2026",
    expires: "Revoked Sep 7",
    lastUsed: "Sep 7",
    spend: 7.41,
  },
];

export function ApiKeysScreen() {
  const [keys, setKeys] = useState(initialKeys);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All keys");
  const [project, setProject] = useState("all");
  const [descending, setDescending] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [newProject, setNewProject] = useState(PROJECTS[0]);
  const [owner, setOwner] = useState("You");
  const [permission, setPermission] = useState("Restricted");
  const [expiry, setExpiry] = useState("90 days");
  const [secret, setSecret] = useState("");
  const [copied, setCopied] = useState(false);
  const [revoke, setRevoke] = useState<ApiKey | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const detail = keys.find((key) => key.id === detailId);
  const filtered = keys
    .filter(
      (key) =>
        (status === "All keys" || key.status === status) &&
        (project === "all" || key.project === project) &&
        `${key.name} ${key.owner} ${key.id}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => (descending ? b.spend - a.spend : a.spend - b.spend));
  const selectedVisible = filtered.filter((key) =>
    selectedIds.has(key.id),
  ).length;
  const allVisibleSelected =
    filtered.length > 0 && selectedVisible === filtered.length;
  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(label);
      return true;
    } catch {
      toast.error("Could not copy. Select the value and copy it manually.");
      return false;
    }
  }
  function clearFilters() {
    setQuery("");
    setStatus("All keys");
    setProject("all");
  }
  function setAllVisible(checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const key of filtered) {
        if (checked) next.add(key.id);
        else next.delete(key.id);
      }
      return next;
    });
  }
  function reset() {
    setKeys(initialKeys);
    clearFilters();
    setSearchOpen(false);
    setSelectedIds(new Set());
    setVisibleColumns(defaultVisibleColumns);
    setDetailId(null);
    setSecret("");
    toast("Demo keys reset");
  }
  return (
    <PlatformPage
      title="API keys"
      description="Manage how applications and people access your AI workspace."
      onReset={reset}
      actions={
        <Button
          onClick={() => {
            setName("");
            setSecret("");
            setCopied(false);
            setCreateOpen(true);
          }}
        >
          <Plus data-icon="inline-start" />
          Create key
        </Button>
      }
      fullWidth
    >
      <Tabs
        value={status}
        onValueChange={(value) => {
          setStatus(value);
          setSelectedIds(new Set());
        }}
        className="w-fit"
      >
        <TabsList aria-label="Key status">
          {["All keys", "Active", "Expired", "Revoked"].map((s) => (
            <TabsTrigger key={s} value={s}>
              {s === "All keys" ? "All" : s}
              <span className="text-muted-foreground ml-1.5 text-xs">
                {s === "All keys"
                  ? keys.length
                  : keys.filter((key) => key.status === s).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium">
          {selectedVisible
            ? `${selectedVisible} selected`
            : status === "All keys"
              ? `${filtered.length} API ${filtered.length === 1 ? "key" : "keys"}`
              : `${filtered.length} ${status.toLowerCase()} ${filtered.length === 1 ? "key" : "keys"}`}
        </p>
        <div className="flex flex-wrap items-center justify-end gap-1">
          {searchOpen || query ? (
            <InputGroup className="mr-1 w-64">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                autoFocus
                aria-label="Search API keys"
                placeholder="Search name, owner, or ID…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setQuery("");
                    setSearchOpen(false);
                  }
                }}
              />
            </InputGroup>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Search API keys"
              onClick={() => setSearchOpen(true)}
            >
              <Search />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <ListFilter data-icon="inline-start" />
                Filter
                {project !== "all" ? (
                  <span className="bg-foreground text-background ml-0.5 flex size-4 items-center justify-center rounded-full text-[10px]">
                    1
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Project</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={project}
                onValueChange={(value) => {
                  setProject(value);
                  setSelectedIds(new Set());
                }}
              >
                <DropdownMenuRadioItem value="all">
                  All projects
                </DropdownMenuRadioItem>
                {PROJECTS.map((item) => (
                  <DropdownMenuRadioItem key={item} value={item}>
                    {item}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              downloadFile(
                "api-key-inventory.json",
                JSON.stringify(
                  filtered.map(({ suffix: _suffix, ...key }) => key),
                  null,
                  2,
                ),
              )
            }
          >
            <ArrowDownToLine data-icon="inline-start" />
            Export
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Columns3 data-icon="inline-start" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Show columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {optionalColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={visibleColumns[column.id]}
                  onCheckedChange={(checked) =>
                    setVisibleColumns((current) => ({
                      ...current,
                      [column.id]: checked === true,
                    }))
                  }
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="overflow-hidden border-y">
        <Table className="min-w-[1050px]" aria-label="API key inventory">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 pl-4">
                <Checkbox
                  aria-label="Select all visible API keys"
                  checked={
                    allVisibleSelected
                      ? true
                      : selectedVisible > 0
                        ? "indeterminate"
                        : false
                  }
                  onCheckedChange={(checked) => setAllVisible(checked === true)}
                />
              </TableHead>
              <TableHead>Name / owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Key</TableHead>
              {visibleColumns.project ? <TableHead>Project</TableHead> : null}
              {visibleColumns.permissions ? (
                <TableHead>Permissions</TableHead>
              ) : null}
              {visibleColumns.expires ? <TableHead>Expires</TableHead> : null}
              {visibleColumns.lastUsed ? (
                <TableHead>Last used</TableHead>
              ) : null}
              {visibleColumns.spend ? (
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDescending(!descending)}
                    aria-label="Sort keys by spend"
                  >
                    Spend
                    <ArrowUpDown data-icon="inline-end" />
                  </Button>
                </TableHead>
              ) : null}
              <TableHead className="pr-5">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((key) => (
              <TableRow
                key={key.id}
                data-state={selectedIds.has(key.id) ? "selected" : undefined}
                className="hover:bg-muted/30"
              >
                <TableCell className="py-4 pl-4">
                  <Checkbox
                    aria-label={`Select ${key.name}`}
                    checked={selectedIds.has(key.id)}
                    onCheckedChange={(checked) =>
                      setSelectedIds((current) => {
                        const next = new Set(current);
                        if (checked === true) next.add(key.id);
                        else next.delete(key.id);
                        return next;
                      })
                    }
                  />
                </TableCell>
                <TableCell className="py-4">
                  <button
                    className="text-left font-medium whitespace-nowrap hover:underline"
                    onClick={() => setDetailId(key.id)}
                  >
                    {key.name}
                  </button>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {key.owner}
                  </p>
                </TableCell>
                <TableCell>
                  <StatusBadge status={key.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs">
                      demo_···{key.suffix}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Copy tracking ID for ${key.name}`}
                      onClick={() => void copy(key.id, "Tracking ID copied")}
                    >
                      <Copy />
                    </Button>
                  </div>
                </TableCell>
                {visibleColumns.project ? (
                  <TableCell className="text-xs whitespace-nowrap">
                    {key.project}
                  </TableCell>
                ) : null}
                {visibleColumns.permissions ? (
                  <TableCell className="whitespace-nowrap">
                    <Badge variant="secondary">{key.permission}</Badge>
                  </TableCell>
                ) : null}
                {visibleColumns.expires ? (
                  <TableCell className="text-xs whitespace-nowrap">
                    {key.expires}
                  </TableCell>
                ) : null}
                {visibleColumns.lastUsed ? (
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                    {key.lastUsed}
                  </TableCell>
                ) : null}
                {visibleColumns.spend ? (
                  <TableCell className="text-right tabular-nums">
                    {money(key.spend)}
                  </TableCell>
                ) : null}
                <TableCell className="pr-4">
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={key.status !== "Active"}
                      aria-label={`Revoke ${key.name}`}
                      onClick={() => setRevoke(key)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 ? <NoResults onClear={clearFilters} /> : null}
      </div>
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) setSecret("");
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {secret ? "Your demo key is ready" : "Create an API key"}
            </DialogTitle>
            <DialogDescription>
              {secret
                ? "This fictional key is shown once. It cannot authenticate with any service."
                : "Choose an owner, project, and permissions for this credential."}
            </DialogDescription>
          </DialogHeader>
          {secret ? (
            <div className="flex flex-col gap-5">
              <Field>
                <FieldLabel htmlFor="generated-demo-key">Secret key</FieldLabel>
                <Input
                  id="generated-demo-key"
                  readOnly
                  value={secret}
                  className="font-mono text-xs"
                  onFocus={(event) => event.target.select()}
                />
              </Field>
              <Button
                variant="outline"
                onClick={async () => {
                  if (await copy(secret, "Demo key copied")) setCopied(true);
                }}
              >
                {copied ? (
                  <Check data-icon="inline-start" />
                ) : (
                  <Copy data-icon="inline-start" />
                )}
                {copied ? "Copied" : "Copy demo key"}
              </Button>
              <DialogFooter>
                <Button
                  onClick={() => {
                    setCreateOpen(false);
                    setSecret("");
                  }}
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!name.trim()) return;
                const id = `key_demo_${globalThis.crypto?.randomUUID?.().slice(0, 8) ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}`;
                const value = `demo_not_a_real_key_${(globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`).replaceAll("-", "")}`;
                const suffix = value.slice(-4);
                const date = new Date(
                  Date.UTC(
                    2026,
                    8,
                    11 +
                      (expiry === "30 days"
                        ? 30
                        : expiry === "90 days"
                          ? 90
                          : 365),
                  ),
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  timeZone: "UTC",
                });
                setKeys((previous) => [
                  {
                    id,
                    name: name.trim(),
                    suffix,
                    owner:
                      owner === "You" ? "Alex Morgan" : `${newProject} service`,
                    project: newProject,
                    status: "Active",
                    permission,
                    created: "Sep 11, 2026",
                    expires: date,
                    lastUsed: "Never",
                    spend: 0,
                  },
                  ...previous,
                ]);
                clearFilters();
                setSecret(value);
                toast.success("Demo key created");
              }}
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="key-name">Name</FieldLabel>
                  <Input
                    id="key-name"
                    autoFocus
                    required
                    maxLength={60}
                    placeholder="e.g. Production · support"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Owned by</FieldLabel>
                  <PlatformSelect
                    label="Key owner"
                    value={owner}
                    onChange={setOwner}
                    options={["You", "Service account"]}
                    className="w-full"
                  />
                </Field>
                <Field>
                  <FieldLabel>Project</FieldLabel>
                  <PlatformSelect
                    label="New key project"
                    value={newProject}
                    onChange={setNewProject}
                    options={PROJECTS}
                    className="w-full"
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>Permissions</FieldLabel>
                    <PlatformSelect
                      label="Key permissions"
                      value={permission}
                      onChange={setPermission}
                      options={["Restricted", "Read only", "All permissions"]}
                      className="w-full"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Expires after</FieldLabel>
                    <PlatformSelect
                      label="Key expiration"
                      value={expiry}
                      onChange={setExpiry}
                      options={["30 days", "90 days", "1 year"]}
                      className="w-full"
                    />
                  </Field>
                </div>
                <FieldDescription>
                  {permission === "Restricted"
                    ? "Can create responses and read files. Cannot manage keys or billing."
                    : permission === "Read only"
                      ? "Can list and read project resources. Cannot run models or change data."
                      : "Can read and write every resource in this project."}
                </FieldDescription>
              </FieldGroup>
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!name.trim()}>
                  Create key
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!revoke}
        onOpenChange={(open) => {
          if (!open) setRevoke(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke {revoke?.name}?</DialogTitle>
            <DialogDescription>
              This demo credential will become inactive. Applications using it
              would need a replacement key.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevoke(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setKeys((previous) =>
                  previous.map((key) =>
                    key.id === revoke?.id
                      ? { ...key, status: "Revoked", expires: "Revoked Sep 11" }
                      : key,
                  ),
                );
                setRevoke(null);
                toast.success("Demo key revoked");
              }}
            >
              Revoke key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Sheet
        open={!!detail}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader className="pr-6 text-left">
            <SheetTitle>{detail?.name}</SheetTitle>
            <SheetDescription>
              Credential details and access scope
            </SheetDescription>
          </SheetHeader>
          {detail ? (
            <div className="mt-6 flex flex-col gap-6">
              <StatusBadge status={detail.status} />
              <dl className="grid grid-cols-2 gap-5">
                {[
                  ["Tracking ID", detail.id],
                  ["Owner", detail.owner],
                  ["Project", detail.project],
                  ["Created", detail.created],
                  ["Expires", detail.expires],
                  ["Last used", detail.lastUsed],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-muted-foreground text-xs">{label}</dt>
                    <dd className="mt-1 text-sm break-words">{value}</dd>
                  </div>
                ))}
              </dl>
              <Card>
                <CardHeader>
                  <CardTitle>Resource permissions</CardTitle>
                  <CardDescription>{detail.permission}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {["Responses", "Files", "Vector stores", "API keys"].map(
                    (resource) => (
                      <div
                        key={resource}
                        className="flex justify-between text-sm"
                      >
                        <span>{resource}</span>
                        <Badge variant="outline">
                          {detail.permission === "All permissions"
                            ? "Read / write"
                            : detail.permission === "Read only" ||
                                resource === "Files"
                              ? "Read"
                              : resource === "Responses"
                                ? "Write"
                                : "None"}
                        </Badge>
                      </div>
                    ),
                  )}
                </CardContent>
              </Card>
              <Button
                variant="outline"
                onClick={() => void copy(detail.id, "Tracking ID copied")}
              >
                <Copy data-icon="inline-start" />
                Copy tracking ID
              </Button>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </PlatformPage>
  );
}
