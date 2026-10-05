"use client";

import {
  ArrowUpRight,
  Building2,
  Copy,
  KeyRound,
  Plus,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

import { AccessSettings } from "./access-settings";
import { downloadFile, money } from "./platform-data";
import { PlatformPage, PlatformSelect, StatusBadge } from "./platform-ui";
import { SettingsLayout } from "./settings-layout";

type AdminKey = {
  id: string;
  name: string;
  scopes: string[];
  status: "Active" | "Revoked";
  created: string;
};
type Project = {
  id: string;
  name: string;
  description: string;
  budget: number;
  members: number;
  status: "Active" | "Archived";
};
const defaults = {
  name: "Shadcnblocks Studio",
  contact: "platform@example.com",
  timezone: "UTC",
  defaultRole: "Reader",
};
const initialKeys: AdminKey[] = [
  {
    id: "admin_01",
    name: "Infrastructure automation",
    scopes: ["Read organization", "Manage projects"],
    status: "Active",
    created: "Aug 24, 2026",
  },
  {
    id: "admin_02",
    name: "Billing export",
    scopes: ["Read organization", "Read billing"],
    status: "Active",
    created: "Sep 2, 2026",
  },
];
const initialProjects: Project[] = [
  {
    id: "proj_support_8f21",
    name: "Support copilot",
    description: "Production support triage and knowledge retrieval.",
    budget: 1200,
    members: 4,
    status: "Active",
  },
  {
    id: "proj_research_201a",
    name: "Knowledge search",
    description: "Research assistants and internal documentation.",
    budget: 600,
    members: 3,
    status: "Active",
  },
  {
    id: "proj_content_48bf",
    name: "Content studio",
    description: "Editorial workflows and creative experiments.",
    budget: 400,
    members: 2,
    status: "Active",
  },
];
const scopes = [
  "Read organization",
  "Manage projects",
  "Manage members",
  "Read billing",
];
export function OrganizationSettingsScreen() {
  const [section, setSection] = useState("general");
  const [draft, setDraft] = useState(defaults);
  const [saved, setSaved] = useState(defaults);
  const [features, setFeatures] = useState({
    sharedProjects: true,
    externalPlugins: false,
    evalProviders: true,
  });
  const [savedFeatures, setSavedFeatures] = useState(features);
  const [keys, setKeys] = useState(initialKeys);
  const [projects, setProjects] = useState(initialProjects);
  const [dialog, setDialogValue] = useState<
    "key" | "project" | "verification" | null
  >(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  function setDialog(value: "key" | "project" | "verification" | null) {
    if (value !== null) setDialogValue(value);
    setDialogOpen(value !== null);
  }
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedScopes, setSelectedScopes] = useState([scopes[0]]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [revoke, setRevoke] = useState<AdminKey | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [projectBudget, setProjectBudget] = useState("");
  const [error, setError] = useState("");
  const [accessKey, setAccessKey] = useState(0);
  const project = projects.find((p) => p.id === selected);
  const sections = [
    { value: "general", label: "General" },
    { value: "features", label: "Verification & features" },
    { value: "admin-keys", label: "Admin keys" },
    { value: "members", label: "Members" },
    { value: "invitations", label: "Invitations" },
    { value: "groups", label: "Groups" },
    { value: "roles", label: "Roles" },
    { value: "projects", label: "Projects" },
  ];
  return (
    <PlatformPage
      title="Organization settings"
      description={`${saved.name} · Organization-wide identity, access, and projects.`}
      actions={
        <Button variant="outline" size="sm" asChild>
          <Link href="/ai-chat/billing">
            Billing
            <ArrowUpRight data-icon="inline-end" />
          </Link>
        </Button>
      }
      onReset={() => {
        setDraft(defaults);
        setSaved(defaults);
        setKeys(initialKeys);
        setProjects(initialProjects);
        setFeatures({
          sharedProjects: true,
          externalPlugins: false,
          evalProviders: true,
        });
        setSavedFeatures({
          sharedProjects: true,
          externalPlugins: false,
          evalProviders: true,
        });
        setAccessKey((n) => n + 1);
        setSection("general");
      }}
    >
      <SettingsLayout value={section} onChange={setSection} sections={sections}>
        {section === "general" ? (
          <section className="flex max-w-3xl flex-col gap-6">
            <div>
              <h2 className="text-lg font-semibold">Organization profile</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Defaults shared by every project in this organization.
              </p>
            </div>
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <span className="bg-muted grid size-12 place-items-center rounded-lg">
                <Building2 className="size-5" />
              </span>
              <div>
                <p className="text-sm font-medium">{saved.name}</p>
                <code className="text-muted-foreground text-xs">
                  org_studio_0192
                </code>
              </div>
              <Badge variant="outline" className="ml-auto">
                Team workspace
              </Badge>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!draft.name.trim()) return;
                setSaved({ ...draft, name: draft.name.trim() });
                setDraft({ ...draft, name: draft.name.trim() });
                toast.success("Organization profile saved");
              }}
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="organization-name">
                    Organization name
                  </FieldLabel>
                  <Input
                    id="organization-name"
                    value={draft.name}
                    required
                    maxLength={80}
                    onChange={(e) =>
                      setDraft({ ...draft, name: e.target.value })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="organization-contact">
                    Contact email
                  </FieldLabel>
                  <Input
                    id="organization-contact"
                    type="email"
                    value={draft.contact}
                    required
                    onChange={(e) =>
                      setDraft({ ...draft, contact: e.target.value })
                    }
                  />
                  <FieldDescription>
                    Shown in demo organization communications.
                  </FieldDescription>
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>Time zone</FieldLabel>
                    <PlatformSelect
                      label="Organization time zone"
                      value={draft.timezone}
                      onChange={(timezone) => setDraft({ ...draft, timezone })}
                      options={[
                        "UTC",
                        "America/New_York",
                        "Europe/London",
                        "Asia/Kolkata",
                      ]}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Default member role</FieldLabel>
                    <PlatformSelect
                      label="Default member role"
                      value={draft.defaultRole}
                      onChange={(defaultRole) =>
                        setDraft({ ...draft, defaultRole })
                      }
                      options={["Reader", "Developer"]}
                    />
                  </Field>
                </div>
              </FieldGroup>
              <div className="mt-6 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDraft(saved)}
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  disabled={
                    JSON.stringify(draft) === JSON.stringify(saved) ||
                    !draft.name.trim()
                  }
                >
                  Save changes
                </Button>
              </div>
            </form>
          </section>
        ) : null}
        {section === "features" ? (
          <section className="flex max-w-3xl flex-col gap-6">
            <div>
              <h2 className="text-lg font-semibold">Verification & features</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Review your organization identity and optional capabilities.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 rounded-lg border p-5">
              <ShieldCheck className="text-success size-6" />
              <div className="flex-1">
                <h3 className="text-sm font-medium">Organization verified</h3>
                <p className="text-muted-foreground mt-1 text-xs">
                  Shadcnblocks Studio LLC · Demo verification completed Aug 20
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialog("verification")}
              >
                View details
              </Button>
            </div>
            <FieldGroup>
              {(
                [
                  [
                    "sharedProjects",
                    "Shared project access",
                    "Allow members to discover projects shared with their groups.",
                  ],
                  [
                    "externalPlugins",
                    "External plugins",
                    "Allow project owners to install plugins from outside the organization.",
                  ],
                  [
                    "evalProviders",
                    "External evaluation providers",
                    "Allow approved providers in evaluation workspaces.",
                  ],
                ] as const
              ).map(([key, label, body]) => (
                <Field
                  key={key}
                  orientation="horizontal"
                  className="border-b pb-5"
                >
                  <div className="flex-1">
                    <FieldLabel htmlFor={`org-feature-${key}`}>
                      {label}
                    </FieldLabel>
                    <FieldDescription>{body}</FieldDescription>
                  </div>
                  <Switch
                    id={`org-feature-${key}`}
                    checked={features[key]}
                    onCheckedChange={(checked) =>
                      setFeatures({ ...features, [key]: checked })
                    }
                  />
                </Field>
              ))}
            </FieldGroup>
            <div className="flex justify-end">
              <Button
                disabled={
                  JSON.stringify(features) === JSON.stringify(savedFeatures)
                }
                onClick={() => {
                  setSavedFeatures(features);
                  toast.success("Feature preferences saved");
                }}
              >
                Save preferences
              </Button>
            </div>
          </section>
        ) : null}
        {section === "admin-keys" ? (
          <section className="flex flex-col gap-5">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Admin keys</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Scoped credentials for organization administration.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setName("");
                  setSelectedScopes([scopes[0]]);
                  setError("");
                  setDialog("key");
                }}
              >
                <Plus data-icon="inline-start" />
                Create admin key
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Scopes</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <KeyRound className="text-muted-foreground size-4" />
                        <div>
                          <p className="font-medium">{key.name}</p>
                          <code className="text-muted-foreground text-[11px]">
                            demo_admin_••••{key.id.slice(-4)}
                          </code>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {key.scopes.map((scope) => (
                          <span
                            key={scope}
                            className="text-muted-foreground text-xs"
                          >
                            {scope}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{key.created}</TableCell>
                    <TableCell>
                      <StatusBadge status={key.status} />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={key.status === "Revoked"}
                        onClick={() => setRevoke(key)}
                      >
                        Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-muted-foreground text-xs">
              Admin keys do not run models. Manage project API keys in the API
              Platform section.
            </p>
          </section>
        ) : null}
        {section === "projects" ? (
          <section className="flex flex-col gap-5">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Projects</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Each project has its own resources, members, and planning
                  budget.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadFile(
                      "organization-projects.json",
                      JSON.stringify(projects, null, 2),
                    )
                  }
                >
                  Export
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setName("");
                    setDescription("");
                    setError("");
                    setDialog("project");
                  }}
                >
                  <Plus data-icon="inline-start" />
                  Create project
                </Button>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Budget / month</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-muted-foreground mt-1 max-w-sm text-xs">
                        {p.description}
                      </p>
                    </TableCell>
                    <TableCell>{p.members}</TableCell>
                    <TableCell className="tabular-nums">
                      {money(p.budget)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelected(p.id);
                          setProjectBudget(String(p.budget));
                        }}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        ) : null}
        <AccessSettings
          key={accessKey}
          section={section}
          scope="organization"
          defaultRole={saved.defaultRole}
        />
      </SettingsLayout>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog === "key"
                ? "Create admin key"
                : dialog === "project"
                  ? "Create project"
                  : "Verification details"}
            </DialogTitle>
            <DialogDescription>
              {dialog === "verification"
                ? "Illustrative organization verification record."
                : "Changes are saved only in this demo session."}
            </DialogDescription>
          </DialogHeader>
          {dialog === "verification" ? (
            <dl className="grid grid-cols-2 gap-5 text-sm">
              {[
                ["Legal name", "Shadcnblocks Studio LLC"],
                ["Country", "United States"],
                ["Status", "Verified (demo)"],
                ["Review date", "Aug 20, 2026"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-muted-foreground text-xs">{label}</dt>
                  <dd className="mt-1">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!name.trim()) {
                  setError("Enter a name.");
                  return;
                }
                if (dialog === "key") {
                  if (!selectedScopes.length) {
                    setError("Choose at least one scope.");
                    return;
                  }
                  const id =
                    globalThis.crypto?.randomUUID?.() ??
                    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
                  setKeys((items) => [
                    ...items,
                    {
                      id,
                      name: name.trim(),
                      scopes: selectedScopes,
                      status: "Active",
                      created: "Sep 11, 2026",
                    },
                  ]);
                  setNewKey(`demo_not_a_real_admin_key_${id}`);
                } else {
                  if (
                    projects.some(
                      (p) => p.name.toLowerCase() === name.trim().toLowerCase(),
                    )
                  ) {
                    setError("A project with this name already exists.");
                    return;
                  }
                  setProjects((items) => [
                    ...items,
                    {
                      id: `proj_${globalThis.crypto?.randomUUID?.().slice(0, 8) ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}`,
                      name: name.trim(),
                      description: description.trim(),
                      budget: 100,
                      members: 1,
                      status: "Active",
                    },
                  ]);
                  toast.success("Project created");
                }
                setDialog(null);
              }}
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="org-item-name">Name</FieldLabel>
                  <Input
                    id="org-item-name"
                    required
                    maxLength={80}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>
                {dialog === "key" ? (
                  <Field>
                    <FieldLabel>Scopes</FieldLabel>
                    {scopes.map((scope, i) => (
                      <Field key={scope} orientation="horizontal">
                        <Checkbox
                          id={`admin-scope-${i}`}
                          checked={selectedScopes.includes(scope)}
                          onCheckedChange={(checked) =>
                            setSelectedScopes((items) =>
                              checked
                                ? [...items, scope]
                                : items.filter((s) => s !== scope),
                            )
                          }
                        />
                        <FieldLabel htmlFor={`admin-scope-${i}`}>
                          {scope}
                        </FieldLabel>
                      </Field>
                    ))}
                  </Field>
                ) : (
                  <Field>
                    <FieldLabel htmlFor="org-project-description">
                      Description
                    </FieldLabel>
                    <Textarea
                      id="org-project-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </Field>
                )}
                {error ? (
                  <p role="alert" className="text-destructive text-sm">
                    {error}
                  </p>
                ) : null}
              </FieldGroup>
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialog(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!newKey}
        onOpenChange={(open) => {
          if (!open) setNewKey(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy your demo key</DialogTitle>
            <DialogDescription>
              This fake credential is shown once and cannot authenticate any
              request.
            </DialogDescription>
          </DialogHeader>
          <code className="bg-muted rounded-md p-3 text-xs break-all">
            {newKey}
          </code>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                navigator.clipboard
                  .writeText(newKey ?? "")
                  .then(() => toast.success("Demo key copied"))
                  .catch(() => toast.error("Clipboard unavailable"))
              }
            >
              <Copy data-icon="inline-start" />
              Copy
            </Button>
            <Button onClick={() => setNewKey(null)}>Done</Button>
          </DialogFooter>
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
              The key will be marked revoked in this demo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevoke(null)}>
              Keep key
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setKeys((items) =>
                  items.map((key) =>
                    key.id === revoke?.id ? { ...key, status: "Revoked" } : key,
                  ),
                );
                setRevoke(null);
                toast.success("Admin key revoked");
              }}
            >
              Revoke key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Sheet
        open={!!project}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{project?.name}</SheetTitle>
            <SheetDescription>{project?.description}</SheetDescription>
          </SheetHeader>
          {project ? (
            <div className="flex flex-col gap-6 px-4 pb-6">
              <StatusBadge status={project.status} />
              <code className="text-muted-foreground text-xs">
                {project.id}
              </code>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setProjects((items) =>
                    items.map((p) =>
                      p.id === project.id
                        ? { ...p, budget: Number(projectBudget) }
                        : p,
                    ),
                  );
                  toast.success("Project budget saved");
                }}
              >
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="org-project-budget">
                      Monthly planning budget (USD)
                    </FieldLabel>
                    <Input
                      id="org-project-budget"
                      type="number"
                      min={1}
                      max={1000000}
                      required
                      value={projectBudget}
                      onChange={(e) => setProjectBudget(e.target.value)}
                    />
                  </Field>
                </FieldGroup>
                <Button type="submit" className="mt-4">
                  Save budget
                </Button>
              </form>
              <Separator />
              {project.id === "proj_support_8f21" ? (
                <Button variant="outline" asChild>
                  <Link href="/ai-chat/project-settings">
                    Open project settings
                    <ArrowUpRight data-icon="inline-end" />
                  </Link>
                </Button>
              ) : null}
              <Button
                variant="outline"
                onClick={() => {
                  setProjects((items) =>
                    items.map((p) =>
                      p.id === project.id
                        ? {
                            ...p,
                            status:
                              p.status === "Active" ? "Archived" : "Active",
                          }
                        : p,
                    ),
                  );
                  toast.success(
                    project.status === "Active"
                      ? "Project archived in demo"
                      : "Project restored",
                  );
                }}
              >
                {project.status === "Active"
                  ? "Archive project"
                  : "Restore project"}
              </Button>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </PlatformPage>
  );
}
