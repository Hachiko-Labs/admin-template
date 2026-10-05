"use client";

import { ArrowUpRight, Copy, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
import { PLATFORM_MODELS } from "./platform-data";
import { PlatformPage, PlatformSelect } from "./platform-ui";
import { SettingsLayout } from "./settings-layout";

const defaults = {
  name: "Support copilot",
  description:
    "Production support triage, knowledge retrieval, and customer-facing assistance.",
  region: "us-east",
  retention: "30",
  enabled: true,
};
const defaultLimits = PLATFORM_MODELS.map((model, i) => ({
  model: model.name,
  requests: [500, 300, 1000][i],
  tokens: [150000, 100000, 250000][i],
  enabled: true,
}));
export function ProjectSettingsScreen() {
  const [section, setSection] = useState("general");
  const [draft, setDraft] = useState(defaults);
  const [saved, setSaved] = useState(defaults);
  const [limits, setLimits] = useState(defaultLimits);
  const [savedLimits, setSavedLimits] = useState(defaultLimits);
  const [budget, setBudget] = useState("1200");
  const [savedBudget, setSavedBudget] = useState("1200");
  const [accessKey, setAccessKey] = useState(0);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  return (
    <PlatformPage
      title="Project settings"
      description={`${saved.name} · Configure resources and access for this project.`}
      onReset={() => {
        setDraft(defaults);
        setSaved(defaults);
        setLimits(defaultLimits);
        setSavedLimits(defaultLimits);
        setBudget("1200");
        setSavedBudget("1200");
        setAccessKey((n) => n + 1);
        setSection("general");
      }}
      actions={
        <Button variant="outline" size="sm" asChild>
          <Link href="/ai-chat/organization-settings">
            Organization
            <ArrowUpRight data-icon="inline-end" />
          </Link>
        </Button>
      }
    >
      <SettingsLayout
        value={section}
        onChange={setSection}
        sections={[
          { value: "general", label: "General" },
          { value: "limits", label: "Model limits" },
          { value: "members", label: "Members" },
          { value: "groups", label: "Groups" },
          { value: "roles", label: "Roles" },
        ]}
      >
        {section === "general" ? (
          <section className="flex max-w-3xl flex-col gap-6">
            <div>
              <h2 className="text-lg font-semibold">General</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                The identity and operating defaults for this project.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-3">
              <div>
                <p className="text-muted-foreground text-xs">Project ID</p>
                <code className="mt-1 block text-xs">proj_support_8f21</code>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Copy project ID"
                onClick={() =>
                  navigator.clipboard
                    .writeText("proj_support_8f21")
                    .then(() => toast.success("Project ID copied"))
                    .catch(() => toast.error("Clipboard unavailable"))
                }
              >
                <Copy />
              </Button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!draft.name.trim()) return;
                setSaved({ ...draft, name: draft.name.trim() });
                setDraft({ ...draft, name: draft.name.trim() });
                toast.success("Project settings saved");
              }}
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="project-name">Project name</FieldLabel>
                  <Input
                    id="project-name"
                    value={draft.name}
                    maxLength={80}
                    required
                    onChange={(e) =>
                      setDraft({ ...draft, name: e.target.value })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="project-description">
                    Description
                  </FieldLabel>
                  <Textarea
                    id="project-description"
                    value={draft.description}
                    maxLength={500}
                    onChange={(e) =>
                      setDraft({ ...draft, description: e.target.value })
                    }
                  />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>Data region</FieldLabel>
                    <PlatformSelect
                      label="Data region"
                      value={draft.region}
                      onChange={(region) => setDraft({ ...draft, region })}
                      options={[
                        { value: "us-east", label: "US East" },
                        { value: "eu-west", label: "EU West" },
                      ]}
                    />
                    <FieldDescription>
                      Applies to future requests in this demo.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel>Log retention</FieldLabel>
                    <PlatformSelect
                      label="Log retention"
                      value={draft.retention}
                      onChange={(retention) =>
                        setDraft({ ...draft, retention })
                      }
                      options={[
                        { value: "7", label: "7 days" },
                        { value: "30", label: "30 days" },
                        { value: "90", label: "90 days" },
                      ]}
                    />
                  </Field>
                </div>
                <Separator />
                <Field orientation="horizontal">
                  <div className="flex-1">
                    <FieldLabel htmlFor="project-enabled">
                      Accept new requests
                    </FieldLabel>
                    <FieldDescription>
                      Pause new work without removing files or member access.
                    </FieldDescription>
                  </div>
                  <Switch
                    id="project-enabled"
                    checked={draft.enabled}
                    onCheckedChange={(enabled) =>
                      setDraft({ ...draft, enabled })
                    }
                  />
                </Field>
              </FieldGroup>
              <div className="mt-6 flex items-center justify-between gap-3">
                <Badge variant="outline">
                  {saved.enabled ? "Active" : "Paused"}
                </Badge>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!dirty}
                    onClick={() => setDraft(saved)}
                  >
                    Discard
                  </Button>
                  <Button type="submit" disabled={!dirty || !draft.name.trim()}>
                    <Save data-icon="inline-start" />
                    Save changes
                  </Button>
                </div>
              </div>
            </form>
            <Separator />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-medium">Project integrations</h3>
                <p className="text-muted-foreground mt-1 text-xs">
                  Manage endpoints and evaluation providers in their workspaces.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/ai-chat/api-requests">API requests</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/ai-chat/evaluations">Evaluations</Link>
                </Button>
              </div>
            </div>
          </section>
        ) : null}
        {section === "limits" ? (
          <section className="flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-semibold">Model limits</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Control which models this project can use and cap its request
                rate.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSavedLimits(limits);
                setSavedBudget(budget);
                toast.success("Model limits saved");
              }}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Requests / minute</TableHead>
                    <TableHead>Tokens / minute</TableHead>
                    <TableHead>Enabled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {limits.map((limit, i) => (
                    <TableRow key={limit.model}>
                      <TableCell className="font-mono text-xs">
                        {limit.model}
                      </TableCell>
                      <TableCell>
                        <Input
                          aria-label={`${limit.model} requests per minute`}
                          className="w-28"
                          type="number"
                          required
                          min={1}
                          max={100000}
                          value={limit.requests}
                          onChange={(e) =>
                            setLimits((items) =>
                              items.map((item, n) =>
                                n === i
                                  ? {
                                      ...item,
                                      requests: Number(e.target.value),
                                    }
                                  : item,
                              ),
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          aria-label={`${limit.model} tokens per minute`}
                          className="w-32"
                          type="number"
                          required
                          min={1000}
                          max={10000000}
                          step={1000}
                          value={limit.tokens}
                          onChange={(e) =>
                            setLimits((items) =>
                              items.map((item, n) =>
                                n === i
                                  ? { ...item, tokens: Number(e.target.value) }
                                  : item,
                              ),
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          aria-label={`Enable ${limit.model}`}
                          checked={limit.enabled}
                          onCheckedChange={(enabled) =>
                            setLimits((items) =>
                              items.map((item, n) =>
                                n === i ? { ...item, enabled } : item,
                              ),
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Separator className="my-6" />
              <FieldGroup className="max-w-md">
                <Field>
                  <FieldLabel htmlFor="project-budget">
                    Monthly planning budget (USD)
                  </FieldLabel>
                  <Input
                    id="project-budget"
                    type="number"
                    min={1}
                    max={1000000}
                    required
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                  <FieldDescription>
                    A demo planning threshold; it does not change provider
                    billing.
                  </FieldDescription>
                </Field>
              </FieldGroup>
              <div className="mt-6 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setLimits(savedLimits);
                    setBudget(savedBudget);
                  }}
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  disabled={
                    JSON.stringify(limits) === JSON.stringify(savedLimits) &&
                    budget === savedBudget
                  }
                >
                  Save limits
                </Button>
              </div>
            </form>
          </section>
        ) : null}
        <AccessSettings key={accessKey} section={section} scope="project" />
      </SettingsLayout>
    </PlatformPage>
  );
}
