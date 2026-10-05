"use client";

import { ArrowUpRight, Check, Layers, Plus } from "lucide-react";
import { useCallback, useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { SkillsTable } from "./skills-table";
import {
  agentNames,
  initialSkills,
  skillPacks,
  type StudioSkill,
} from "./studio-data";
import { StudioShell } from "./studio-shell";

export function StudioSkillsScreen() {
  const [skills, setSkills] = useState(initialSkills);
  const [selected, setSelected] = useState<StudioSkill | null>(null);
  const openSkill = useCallback((skill: StudioSkill) => {
    setSelected({ ...skill, agents: [...skill.agents] });
  }, []);
  const [installedPacks, setInstalledPacks] = useState<string[]>([]);
  const [pack, setPack] = useState<(typeof skillPacks)[number] | null>(null);
  const [packAgent, setPackAgent] = useState(agentNames[0]);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    description: "",
    instructions: "",
  });
  return (
    <StudioShell active="skills">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="px-5 py-7 sm:px-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Skills</h1>
              <p className="text-muted-foreground mt-1 text-xs">
                A shared way of doing good work.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCreating(true)}
            >
              <Plus className="size-3.5" />
              Create skill
            </Button>
          </div>
          <section aria-labelledby="packs-title">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="packs-title" className="text-sm font-medium">
                Start with a collection
              </h2>
              <span className="text-muted-foreground hidden text-[11px] sm:block">
                Curated for the way your team works
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {skillPacks.map((p, i) => (
                <article
                  key={p.name}
                  className="group overflow-hidden rounded-xl border"
                >
                  <div
                    className={cn(
                      "relative flex h-[106px] items-center justify-center overflow-hidden border-b",
                      i === 0
                        ? "bg-emerald-50 dark:bg-emerald-950/20"
                        : i === 1
                          ? "bg-muted/40"
                          : "bg-stone-50 dark:bg-stone-950/30",
                    )}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 opacity-30",
                        i === 1
                          ? "bg-[radial-gradient(var(--muted-foreground)_1px,transparent_1px)] bg-size-[12px_12px]"
                          : "",
                      )}
                    />
                    {i === 0 ? (
                      <div className="relative flex items-center">
                        <div className="size-14 rounded-full border border-emerald-500/40 bg-emerald-300/15" />
                        <div className="-ml-6 size-14 rounded-full border border-emerald-500/60 bg-emerald-300/25" />
                        <div className="-ml-6 size-14 rounded-full border border-emerald-500/40 bg-emerald-300/15" />
                      </div>
                    ) : i === 1 ? (
                      <div className="relative flex -rotate-6 gap-2">
                        <div className="bg-background flex size-11 items-center justify-center rounded-lg border font-mono text-sm text-emerald-600 shadow-sm">
                          {"</>"}
                        </div>
                        <div className="bg-background mt-4 flex size-11 items-center justify-center rounded-lg border shadow-sm">
                          <Check className="size-5 text-emerald-600" />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-background relative w-28 rotate-[-4deg] space-y-2 rounded-lg border p-3 shadow-sm">
                        <div className="flex gap-2">
                          <span className="size-2 rounded-full bg-emerald-500/70" />
                          <span className="bg-muted h-2 w-14 rounded" />
                        </div>
                        <div className="bg-muted h-1 w-20 rounded" />
                        <div className="bg-muted h-1 w-16 rounded" />
                      </div>
                    )}
                    <span className="text-muted-foreground absolute right-3 bottom-2 text-[10px]">
                      {p.ids.length} skills
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-muted-foreground mb-1.5 text-[10px]">
                      {p.label}
                    </p>
                    <h3 className="text-[13px] font-medium">{p.name}</h3>
                    <p className="text-muted-foreground mt-1 text-xs leading-5">
                      {p.description}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-3 h-7 px-0 text-xs hover:bg-transparent"
                      onClick={() => {
                        setPack(p);
                        setPackAgent(agentNames[0]);
                      }}
                    >
                      {installedPacks.includes(p.name)
                        ? "Manage collection"
                        : "View collection"}
                      <ArrowUpRight className="size-3.5" />
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <SkillsTable skills={skills} onOpen={openSkill} />
        </div>
      </div>
      <Sheet
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-[480px]">
          <SheetHeader className="shrink-0 border-b px-5 py-5 pr-10 text-left">
            <SheetTitle>{selected?.name}</SheetTitle>
            <SheetDescription>{selected?.description}</SheetDescription>
            {selected && (
              <p className="text-muted-foreground text-xs">
                By {selected.author} · Updated {selected.updated}
              </p>
            )}
          </SheetHeader>
          {selected && (
            <>
              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-3">
                <div className="space-y-2">
                  <Label htmlFor="studio-instructions">Instructions</Label>
                  <Textarea
                    id="studio-instructions"
                    className="min-h-40 text-sm leading-6"
                    value={selected.instructions}
                    onChange={(e) =>
                      setSelected({ ...selected, instructions: e.target.value })
                    }
                  />
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-medium">Assigned agents</h3>
                  <p className="text-muted-foreground mb-3 text-xs">
                    An update affects every selected agent.
                  </p>
                  <div className="space-y-2">
                    {agentNames.map((name) => (
                      <label
                        key={name}
                        className="flex items-center gap-3 rounded-md border p-3 text-xs"
                      >
                        <Checkbox
                          checked={selected.agents.includes(name)}
                          onCheckedChange={(v) =>
                            setSelected({
                              ...selected,
                              agents: v
                                ? [...selected.agents, name]
                                : selected.agents.filter((a) => a !== name),
                            })
                          }
                        />
                        {name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="shrink-0 border-t p-4">
                <Button
                  className="w-full"
                  disabled={!selected.instructions.trim()}
                  onClick={() => {
                    setSkills((s) =>
                      s.map((item) =>
                        item.id === selected.id
                          ? { ...selected, updated: "Just now" }
                          : item,
                      ),
                    );
                    setSelected(null);
                    toast.success("Skill and agent assignments saved");
                  }}
                >
                  Save changes
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      <Dialog
        open={!!pack}
        onOpenChange={(open) => {
          if (!open) setPack(null);
        }}
      >
        <DialogContent className="max-h-[90svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{pack?.name}</DialogTitle>
            <DialogDescription>{pack?.description}</DialogDescription>
          </DialogHeader>
          <div className="divide-y rounded-lg border">
            {pack?.ids.map((id) => (
              <div key={id} className="flex items-center gap-3 p-3 text-sm">
                <Layers className="text-muted-foreground size-4" />
                {skills.find((s) => s.id === id)?.name}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pack-agent">Assign collection to</Label>
            <Select value={packAgent} onValueChange={setPackAgent}>
              <SelectTrigger id="pack-agent" className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {agentNames.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => {
              if (!pack) return;
              setSkills((s) =>
                s.map((skill) =>
                  pack.ids.includes(skill.id) &&
                  !skill.agents.includes(packAgent)
                    ? {
                        ...skill,
                        agents: [...skill.agents, packAgent],
                        updated: "Just now",
                      }
                    : skill,
                ),
              );
              setInstalledPacks((p) =>
                p.includes(pack.name) ? p : [...p, pack.name],
              );
              setPack(null);
              toast.success("Collection assigned");
            }}
          >
            Assign {pack?.ids.length} skills
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-h-[90svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create a skill</DialogTitle>
            <DialogDescription>
              Turn a repeatable process into instructions your agents can share.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const name = draft.name.trim();
              if (skills.some((s) => s.name === name)) {
                toast.error("A skill with this name already exists");
                return;
              }
              setSkills((s) => [
                ...s,
                {
                  ...draft,
                  name,
                  id: `custom-${Date.now()}`,
                  category: "Custom",
                  author: "You",
                  updated: "Just now",
                  agents: [],
                },
              ]);
              setDraft({ name: "", description: "", instructions: "" });
              setCreating(false);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="new-name">Name</Label>
              <Input
                id="new-name"
                required
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="customer-brief"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-description">Description</Label>
              <Input
                id="new-description"
                required
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-instructions">Instructions</Label>
              <Textarea
                id="new-instructions"
                required
                value={draft.instructions}
                onChange={(e) =>
                  setDraft({ ...draft, instructions: e.target.value })
                }
              />
            </div>
            <Button
              type="submit"
              disabled={
                !draft.name.trim() ||
                !draft.instructions.trim() ||
                !draft.description.trim()
              }
            >
              Create skill
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </StudioShell>
  );
}
