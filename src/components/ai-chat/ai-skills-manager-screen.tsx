"use client";

import {
  BookOpen,
  Check,
  Download,
  FileText,
  ListChecks,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { type ComponentProps, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import {
  type ManagedSkill,
  managedSkills,
} from "@/components/ai-chat/ai-skills-manager-data";
import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import { NoResults } from "@/components/ai-chat/platform/platform-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const subscribe = () => () => {};
function SkillSwitch(props: ComponentProps<typeof Switch>) {
  // Avoid the Radix hidden input's server/client style serialization mismatch.
  const hydrated = useSyncExternalStore(
    subscribe,
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
const icons = { Writing: FileText, Analysis: BookOpen, Operations: ListChecks };
const emptyDraft = { name: "", description: "", instructions: "" };

export function AiSkillsManagerScreen() {
  const [skills, setSkills] = useState(managedSkills);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [editing, setEditing] = useState(false);
  const [instructions, setInstructions] = useState("");
  const selected = skills.find((skill) => skill.id === selectedId);
  const matches = (skill: ManagedSkill) =>
    `${skill.name} ${skill.description} ${skill.author} ${skill.category}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
  const installed = skills.filter((skill) => skill.installed && matches(skill));
  const addedOrder = [
    "Just now",
    "Today",
    "Yesterday",
    "13 Sep",
    "12 Sep",
    "11 Sep",
    "10 Sep",
  ];
  const recent = [...skills]
    .reverse()
    .sort((a, b) => addedOrder.indexOf(a.added) - addedOrder.indexOf(b.added))
    .filter(matches);
  const installedCount = skills.filter((skill) => skill.installed).length;
  const enabledCount = skills.filter(
    (skill) => skill.installed && skill.enabled,
  ).length;
  function openSkill(skill: ManagedSkill) {
    setSelectedId(skill.id);
    setInstructions(skill.instructions);
    setEditing(false);
  }
  function install(skill: ManagedSkill) {
    setSkills((current) =>
      current.map((item) =>
        item.id === skill.id
          ? { ...item, installed: true, enabled: true }
          : item,
      ),
    );
    toast.success(`${skill.name} installed`);
  }
  function createSkill(event: React.FormEvent) {
    event.preventDefault();
    if (
      !draft.name.trim() ||
      !draft.description.trim() ||
      !draft.instructions.trim()
    )
      return;
    const skill: ManagedSkill = {
      id:
        globalThis.crypto?.randomUUID?.() ??
        `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
      name: draft.name.trim(),
      description: draft.description.trim(),
      instructions: draft.instructions.trim(),
      author: "You",
      category: "Operations",
      installed: true,
      enabled: true,
      added: "Just now",
    };
    setSkills((current) => [...current, skill]);
    setCreating(false);
    setDraft(emptyDraft);
    setQuery("");
    toast.success(`${skill.name} created and enabled`);
  }
  return (
    <AiWorkspaceShell hideNavigationSidebar headerTitle="Skills">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-9 px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
          <header className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">Skills</h1>
              <p className="text-muted-foreground text-sm">
                Reusable instructions for your team’s everyday work.
              </p>
            </div>
            <Button onClick={() => setCreating(true)}>
              <Plus data-icon="inline-start" />
              Create skill
            </Button>
          </header>
          <section
            aria-labelledby="installed-heading"
            className="flex flex-col gap-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <h2 id="installed-heading" className="text-sm font-medium">
                  Installed
                </h2>
                <span className="text-muted-foreground text-xs">
                  {enabledCount} enabled · {installedCount} total
                </span>
              </div>
              <InputGroup className="w-full sm:w-64">
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput
                  aria-label="Search skills"
                  placeholder="Search skills…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </InputGroup>
            </div>
            {installed.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {installed.map((skill) => (
                  <Card
                    key={skill.id}
                    className="flex items-center gap-4 px-4 py-4"
                  >
                    <button
                      onClick={() => openSkill(skill)}
                      aria-label={`View ${skill.name}`}
                      className="focus-visible:ring-ring flex min-w-0 flex-1 flex-col gap-1.5 rounded-sm text-left focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <span className="text-sm font-medium">{skill.name}</span>
                      <span className="text-muted-foreground line-clamp-1 text-xs leading-5">
                        {skill.description}
                      </span>
                    </button>
                    <SkillSwitch
                      aria-label={`Enable ${skill.name}`}
                      checked={skill.enabled}
                      onCheckedChange={(enabled) =>
                        setSkills((current) =>
                          current.map((item) =>
                            item.id === skill.id ? { ...item, enabled } : item,
                          ),
                        )
                      }
                    />
                  </Card>
                ))}
              </div>
            ) : (
              <NoResults
                title={
                  query ? "No installed skills match" : "No skills installed"
                }
                description={
                  query
                    ? "Try another name, category, or author."
                    : "Browse recently added skills below to get started."
                }
                onClear={query ? () => setQuery("") : undefined}
              />
            )}
          </section>
          <Separator />
          <section
            aria-labelledby="recent-heading"
            className="flex flex-col gap-4"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="recent-heading" className="text-sm font-medium">
                Recently added
              </h2>
              <span className="text-muted-foreground text-xs">
                {recent.length} skills
              </span>
            </div>
            {recent.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {recent.map((skill) => {
                  const Icon = icons[skill.category];
                  return (
                    <Card key={skill.id} className="flex flex-col">
                      <CardHeader className="flex-1 gap-3 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-lg">
                              <Icon className="size-4" aria-hidden="true" />
                            </div>
                            <CardTitle>
                              <button
                                onClick={() => openSkill(skill)}
                                className="focus-visible:ring-ring rounded-sm text-left text-sm leading-5 hover:underline focus-visible:ring-2 focus-visible:outline-none"
                              >
                                {skill.name}
                              </button>
                            </CardTitle>
                          </div>
                          <span className="text-muted-foreground shrink-0 text-[11px]">
                            {skill.added}
                          </span>
                        </div>
                        <CardDescription>{skill.description}</CardDescription>
                      </CardHeader>
                      <CardFooter className="justify-between gap-3 px-5 pb-4">
                        <span className="text-muted-foreground text-xs">
                          By {skill.author}
                        </span>
                        <Button
                          variant={skill.installed ? "ghost" : "outline"}
                          size="sm"
                          onClick={() =>
                            skill.installed ? openSkill(skill) : install(skill)
                          }
                          aria-label={`${skill.installed ? "Manage" : "Install"} ${skill.name}`}
                        >
                          {skill.installed ? (
                            <Check data-icon="inline-start" />
                          ) : (
                            <Download data-icon="inline-start" />
                          )}
                          {skill.installed ? "Installed" : "Install"}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <NoResults title="No skills found" onClear={() => setQuery("")} />
            )}
          </section>
          <p className="text-muted-foreground pb-2 text-xs">
            Demo workspace · Changes apply to this session.
          </p>
        </div>
      </div>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedId(null);
            setEditing(false);
          }
        }}
      >
        <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>{selected.description}</DialogDescription>
              </DialogHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{selected.category}</Badge>
                <span className="text-muted-foreground text-xs">
                  By {selected.author}
                </span>
              </div>
              <Separator />
              {editing ? (
                <Field>
                  <FieldLabel htmlFor="skill-instructions">
                    Instructions
                  </FieldLabel>
                  <Textarea
                    id="skill-instructions"
                    rows={10}
                    value={instructions}
                    onChange={(event) => setInstructions(event.target.value)}
                  />
                </Field>
              ) : (
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-medium">Instructions</h3>
                  <p className="text-muted-foreground text-sm leading-6 whitespace-pre-wrap">
                    {selected.instructions}
                  </p>
                </div>
              )}
              <DialogFooter className="gap-2 sm:justify-between">
                {editing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditing(false);
                        setInstructions(selected.instructions);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      disabled={!instructions.trim()}
                      onClick={() => {
                        setSkills((current) =>
                          current.map((item) =>
                            item.id === selected.id
                              ? { ...item, instructions: instructions.trim() }
                              : item,
                          ),
                        );
                        setEditing(false);
                        toast.success("Instructions saved");
                      }}
                    >
                      Save instructions
                    </Button>
                  </>
                ) : selected.installed ? (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSkills((current) =>
                          current.map((item) =>
                            item.id === selected.id
                              ? { ...item, installed: false, enabled: false }
                              : item,
                          ),
                        );
                        toast.success(`${selected.name} removed`);
                      }}
                    >
                      <Trash2 data-icon="inline-start" />
                      Remove
                    </Button>
                    <Button variant="outline" onClick={() => setEditing(true)}>
                      Edit instructions
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => install(selected)}>
                    <Download data-icon="inline-start" />
                    Install skill
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create a skill</DialogTitle>
            <DialogDescription>
              Describe a repeatable task and how it should be handled.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createSkill} className="flex flex-col gap-5">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="new-skill-name">Name</FieldLabel>
                <Input
                  id="new-skill-name"
                  placeholder="e.g. Account review"
                  maxLength={70}
                  required
                  value={draft.name}
                  onChange={(event) =>
                    setDraft({ ...draft, name: event.target.value })
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="new-skill-description">
                  Description
                </FieldLabel>
                <Input
                  id="new-skill-description"
                  placeholder="When should this skill be used?"
                  maxLength={220}
                  required
                  value={draft.description}
                  onChange={(event) =>
                    setDraft({ ...draft, description: event.target.value })
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="new-skill-instructions">
                  Instructions
                </FieldLabel>
                <Textarea
                  id="new-skill-instructions"
                  rows={6}
                  placeholder="Explain the steps, expected output, and important constraints…"
                  maxLength={12000}
                  required
                  value={draft.instructions}
                  onChange={(event) =>
                    setDraft({ ...draft, instructions: event.target.value })
                  }
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreating(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !draft.name.trim() ||
                  !draft.description.trim() ||
                  !draft.instructions.trim()
                }
              >
                Create and enable
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AiWorkspaceShell>
  );
}
