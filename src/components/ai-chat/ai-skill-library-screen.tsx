"use client";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Download,
  FileText,
  History,
  Maximize2,
  Plus,
  RotateCcw,
  Upload,
} from "lucide-react";
import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
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
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import {
  isLibrarySkill,
  type LibrarySkill,
  parseUploadedSkill,
  reviseSkill,
  skillMarkdown,
} from "./ai-skill-library-data";
import { AiWorkspaceShell } from "./ai-workspace-shell";

function SkillInstructions({ skill }: { skill: LibrarySkill }) {
  const base = skill.origin ? skill.origin.replace(/SKILL\.md$/, "") : "";
  return (
    <div className="[&_pre]:bg-muted [&_code]:bg-muted [&_blockquote]:text-muted-foreground text-sm leading-7 break-words [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_code]:rounded [&_code]:px-1 [&_code]:font-mono [&_code]:text-xs [&_h1]:mb-4 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:font-semibold [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-4 [&_pre]:my-4 [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:p-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            const resolved = href?.startsWith("#")
              ? href
              : href && /^https?:\/\//.test(href)
                ? href
                : href && base
                  ? new URL(href, base).href
                  : undefined;
            return (
              <a
                href={resolved}
                target={resolved?.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="text-primary decoration-primary/30 hover:decoration-primary underline underline-offset-4"
              >
                {children}
              </a>
            );
          },
          table: ({ children }) => <Table>{children}</Table>,
          thead: ({ children }) => <TableHeader>{children}</TableHeader>,
          tbody: ({ children }) => <TableBody>{children}</TableBody>,
          tr: ({ children }) => <TableRow>{children}</TableRow>,
          th: ({ children }) => (
            <TableHead className="min-w-32 whitespace-normal">
              {children}
            </TableHead>
          ),
          td: ({ children }) => (
            <TableCell className="align-top whitespace-normal">
              {children}
            </TableCell>
          ),
          img: ({ alt }) => <span>{alt}</span>,
        }}
      >
        {skill.content}
      </ReactMarkdown>
    </div>
  );
}
export function AiSkillLibraryScreen({ initial }: { initial: LibrarySkill[] }) {
  const [skills, setSkills] = React.useState(initial);
  const [slug, setSlug] = React.useState(initial[0].slug);
  const [editing, setEditing] = React.useState<
    "metadata" | "instructions" | "new" | null
  >(null);
  const [name, setName] = React.useState("");
  const [newSlug, setNewSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [content, setContent] = React.useState("");
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [uploadData, setUploadData] = React.useState<
    | (Pick<LibrarySkill, "name" | "description" | "content"> & {
        fileName: string;
        fileBytes: number;
      })
    | null
  >(null);
  const [uploadSlug, setUploadSlug] = React.useState("");
  const [uploadError, setUploadError] = React.useState("");
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const [showDetail, setShowDetail] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [notice, setNotice] = React.useState("");
  const [error, setError] = React.useState("");
  const skill = skills.find((s) => s.slug === slug) ?? skills[0];
  const original = initial.find((s) => s.slug === skill.slug);
  const hasRepositoryEdits =
    !!original &&
    (skill.name !== original.name ||
      skill.description !== original.description ||
      skill.content !== original.content);
  const reader = React.useRef<HTMLDivElement>(null);
  const detail = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("skill-library-v1");
      if (raw) {
        const stored = JSON.parse(raw);
        if (
          Array.isArray(stored) &&
          stored.length &&
          stored.every(isLibrarySkill) &&
          new Set(stored.map((s) => s.slug)).size === stored.length
        )
          setSkills(stored);
      }
    } catch {
      setNotice(
        "Saved browser edits could not be loaded. Repository files are shown.",
      );
    }
    setReady(true);
  }, []);
  React.useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem("skill-library-v1", JSON.stringify(skills));
    } catch {
      setNotice(
        "Browser storage unavailable. Export your edited file to keep it.",
      );
    }
  }, [skills, ready]);
  function select(next: string) {
    setSlug(next);
    setShowDetail(true);
    setNotice("");
    if (reader.current) reader.current.scrollTop = 0;
    if (detail.current) detail.current.scrollTop = 0;
  }
  function edit(kind: "metadata" | "instructions" | "new") {
    setEditing(kind);
    setError("");
    setName(kind === "new" ? "" : skill.name);
    setNewSlug(kind === "new" ? "" : skill.slug);
    setDescription(kind === "new" ? "" : skill.description);
    setContent(
      kind === "new"
        ? "# New skill\n\nDescribe when to use this skill and the steps to follow."
        : skill.content,
    );
  }
  function save() {
    if (!name.trim() || !description.trim()) {
      setError("Name and description are required.");
      return;
    }
    if (
      editing === "new" &&
      (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(newSlug) ||
        skills.some((s) => s.slug === newSlug))
    ) {
      setError(
        "Choose a unique slug using lowercase letters, numbers and hyphens (up to 64 characters).",
      );
      return;
    }
    if (editing === "instructions" && !content.trim()) {
      setError("Instructions cannot be empty.");
      return;
    }
    if (editing === "new") {
      setSkills((s) => [
        ...s,
        {
          slug: newSlug,
          name: name.trim(),
          description: description.trim(),
          content,
          origin: "",
          local: true,
          edited: true,
          version: 1,
        },
      ]);
      select(newSlug);
    } else
      setSkills((s) =>
        s.map((item) =>
          item.slug === skill.slug
            ? reviseSkill(item, {
                name: name.trim(),
                description: description.trim(),
                content,
              })
            : item,
        ),
      );
    setEditing(null);
    setNotice("Saved in this browser. Export SKILL.md to keep a file copy.");
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([skillMarkdown(skill)], { type: "text/markdown" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${skill.slug}-SKILL.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <AiWorkspaceShell headerTitle="Skills" hideNavigationSidebar>
      <div className="bg-background flex min-h-0 flex-1">
        <aside
          aria-label="Skill list"
          className={cn(
            "bg-background flex w-full shrink-0 flex-col overflow-hidden md:w-[280px] md:border-r lg:w-[310px]",
            showDetail && "hidden md:flex",
          )}
        >
          <header className="relative flex h-12 shrink-0 items-center border-b px-5">
            <h1 className="text-sm font-semibold">All Skills</h1>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2"
              aria-label="Add skill"
              onClick={() => edit("new")}
              disabled={!ready}
            >
              <Plus />
            </Button>
          </header>
          <div className="border-b px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              disabled={!ready}
              onClick={() => {
                setUploadData(null);
                setUploadSlug("");
                setUploadError("");
                setUploadOpen(true);
              }}
            >
              <Upload data-icon="inline-start" />
              Upload skill
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pt-1 pb-3">
            {skills.map((item, index) => (
              <div key={item.slug} className="relative px-2">
                {skill.slug === item.slug && (
                  <span className="bg-primary absolute inset-y-0 left-0 w-0.5" />
                )}
                <button
                  aria-current={skill.slug === item.slug ? "page" : undefined}
                  onClick={() => select(item.slug)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                      e.preventDefault();
                      const next =
                        (index +
                          (e.key === "ArrowDown" ? 1 : -1) +
                          skills.length) %
                        skills.length;
                      select(skills[next].slug);
                      e.currentTarget.parentElement?.parentElement
                        ?.querySelectorAll("button")
                        [next]?.focus();
                    }
                  }}
                  className={cn(
                    "hover:bg-muted/60 flex w-full min-w-0 items-start gap-3 rounded-lg px-3 py-4 text-left outline-offset-[-2px]",
                    skill.slug === item.slug && "bg-muted/70",
                  )}
                >
                  <FileText className="text-muted-foreground/60 mt-1 size-3.5 shrink-0" />
                  <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className="truncate text-sm font-medium">
                      {item.name}
                    </span>
                    <span className="text-muted-foreground truncate text-xs leading-5">
                      {item.description}
                    </span>
                  </span>
                </button>
                {index < skills.length - 1 && (
                  <div className="border-border/40 mx-5 ml-10 border-b" />
                )}
              </div>
            ))}
          </div>
        </aside>
        <section
          className={cn(
            "bg-background flex min-w-0 flex-1 flex-col overflow-hidden",
            !showDetail && "hidden md:flex",
          )}
        >
          <header className="relative flex h-12 shrink-0 items-center justify-center border-b">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Back to skills"
              className="absolute left-2 md:hidden"
              onClick={() => setShowDetail(false)}
            >
              <ArrowLeft />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  {skill.name}
                  <ChevronDown data-icon="inline-end" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={() => setHistoryOpen(true)}>
                    <History />
                    Version history
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      setUploadData(null);
                      setUploadSlug(skill.slug);
                      setUploadError("");
                      setUploadOpen(true);
                    }}
                  >
                    <Upload />
                    Upload new version
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={download}>
                    <Download />
                    Export SKILL.md
                  </DropdownMenuItem>
                  {skill.origin && (
                    <DropdownMenuItem asChild>
                      <a href={skill.origin} target="_blank" rel="noreferrer">
                        Open upstream source
                      </a>
                    </DropdownMenuItem>
                  )}
                  {original && (
                    <DropdownMenuItem
                      disabled={!hasRepositoryEdits}
                      onSelect={() => {
                        setSkills((s) =>
                          s.map((item) =>
                            item.slug === skill.slug
                              ? reviseSkill(item, original)
                              : item,
                          ),
                        );
                        setNotice(
                          "Repository version restored in this browser.",
                        );
                      }}
                    >
                      <RotateCcw />
                      Restore repository version
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <div ref={detail} className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto flex max-w-[1100px] flex-col gap-8 px-5 pt-7 pb-10 lg:px-10">
              <div className="flex items-start gap-3">
                <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-md">
                  <FileText className="text-muted-foreground size-7" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold">{skill.name}</h2>
                  <p className="text-muted-foreground mt-0.5 truncate text-sm">
                    {skill.description}
                  </p>
                </div>
              </div>
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between pl-1">
                  <h3 className="text-base font-semibold">Metadata</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => edit("metadata")}
                    disabled={!ready}
                    aria-label="Edit metadata"
                  >
                    Edit
                  </Button>
                </div>
                <dl className="divide-border/30 bg-background divide-y rounded-lg border py-2">
                  {[
                    ["Slug", skill.slug],
                    ["Version", `v${skill.version ?? 1}`],
                    ...(skill.fileName
                      ? [
                          ["Uploaded file", skill.fileName],
                          [
                            "File size",
                            `${((skill.fileBytes ?? 0) / 1024).toFixed(1)} KB`,
                          ],
                          [
                            "Uploaded",
                            new Date(skill.uploadedAt!).toLocaleString(),
                          ],
                        ]
                      : []),
                    ["Name", skill.name],
                    ["Description", skill.description],
                    [
                      "Source",
                      skill.fileName
                        ? "Uploaded in this browser"
                        : skill.local
                          ? "Created in this browser"
                          : `Cloudflare skills · repository${hasRepositoryEdits ? " · browser edits" : ""}`,
                    ],
                  ].map(([label, value]) => (
                    <div key={label} className="flex gap-3 px-4 py-3 text-sm">
                      <dt className="text-muted-foreground w-24 shrink-0 lg:w-[120px]">
                        {label}
                      </dt>
                      <dd className="min-w-0 flex-1 leading-6 break-words">
                        {value}
                      </dd>
                    </div>
                  ))}
                  <div className="flex gap-3 px-4 py-3 text-sm">
                    <dt className="text-muted-foreground w-24 shrink-0 lg:w-[120px]">
                      Location
                    </dt>
                    <dd className="min-w-0 break-all">
                      {skill.local ? (
                        `skills/${skill.slug}/SKILL.md`
                      ) : (
                        <a
                          href={`/ai-chat/skill-library/${skill.slug}/SKILL.md`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline"
                        >
                          skills/{skill.slug}/SKILL.md
                        </a>
                      )}
                    </dd>
                  </div>
                </dl>
              </section>
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between pl-1">
                  <h3 className="text-base font-semibold">Instructions</h3>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Expand instructions"
                      onClick={() => setExpanded(true)}
                    >
                      <Maximize2 />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => edit("instructions")}
                      disabled={!ready}
                      aria-label="Edit instructions"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
                <div
                  ref={reader}
                  className="bg-background max-h-[540px] overflow-auto rounded-lg border p-6"
                >
                  <SkillInstructions skill={skill} />
                </div>
              </section>
              {notice && (
                <p
                  role="status"
                  className="text-muted-foreground flex items-start gap-2 text-xs"
                >
                  <Check className="size-3.5 shrink-0" />
                  {notice}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent
          className={cn(
            "max-h-[90vh] overflow-auto",
            editing === "instructions" && "sm:max-w-4xl",
          )}
        >
          <DialogHeader>
            <DialogTitle>
              {editing === "new"
                ? "Add skill"
                : editing === "instructions"
                  ? "Edit instructions"
                  : "Edit metadata"}
            </DialogTitle>
            <DialogDescription>
              Save changes in this browser, then export the skill file.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <FieldGroup>
              {editing === "new" && (
                <Field>
                  <FieldLabel htmlFor="skill-slug">Slug</FieldLabel>
                  <Input
                    id="skill-slug"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    maxLength={64}
                    required
                  />
                  <FieldDescription>
                    Unique directory name, such as release-review.
                  </FieldDescription>
                </Field>
              )}
              {editing !== "instructions" && (
                <>
                  <Field>
                    <FieldLabel htmlFor="skill-name">Name</FieldLabel>
                    <Input
                      id="skill-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={120}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="skill-description">
                      Description
                    </FieldLabel>
                    <Textarea
                      id="skill-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={4000}
                      required
                    />
                  </Field>
                </>
              )}
              {editing === "instructions" && (
                <Field>
                  <FieldLabel htmlFor="skill-instructions">
                    Markdown instructions
                  </FieldLabel>
                  <Textarea
                    id="skill-instructions"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[50vh] font-mono text-xs"
                    maxLength={150000}
                    required
                  />
                </Field>
              )}
            </FieldGroup>
            {error && (
              <p role="alert" className="text-destructive mt-3 text-sm">
                {error}
              </p>
            )}
            <DialogFooter className="mt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editing === "new" ? "Create skill" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload skill</DialogTitle>
            <DialogDescription>
              Import a Markdown skill into this browser. Existing slugs receive
              a new version.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="skill-upload-file">Markdown file</FieldLabel>
              <Input
                id="skill-upload-file"
                type="file"
                accept=".md,text/markdown"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  setUploadData(null);
                  setUploadError("");
                  if (!file) return;
                  try {
                    if (
                      !file.name.toLowerCase().endsWith(".md") ||
                      file.size > 150000
                    )
                      throw new Error(
                        "Choose a .md file no larger than 150 KB.",
                      );
                    const parsed = parseUploadedSkill(await file.text());
                    setUploadData({
                      ...parsed,
                      fileName: file.name,
                      fileBytes: file.size,
                    });
                    setUploadSlug(
                      (current) =>
                        current ||
                        parsed.name
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-|-$/g, "")
                          .slice(0, 64),
                    );
                  } catch (err) {
                    setUploadError(
                      err instanceof Error
                        ? err.message
                        : "Unable to read this file.",
                    );
                  }
                }}
              />
              <FieldDescription>
                Include name and description in YAML frontmatter, followed by
                Markdown instructions.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="upload-skill-slug">Skill slug</FieldLabel>
              <Input
                id="upload-skill-slug"
                value={uploadSlug}
                maxLength={64}
                onChange={(e) => setUploadSlug(e.target.value)}
              />
            </Field>
            {uploadData ? (
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium">{uploadData.name}</p>
                <p className="text-muted-foreground mt-2 text-xs leading-5">
                  {uploadData.description}
                </p>
                <p className="text-muted-foreground mt-3 text-xs">
                  {uploadData.fileName} ·{" "}
                  {(uploadData.fileBytes / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : null}
            {skills.some((item) => item.slug === uploadSlug) ? (
              <p className="text-muted-foreground text-xs">
                This adds v
                {(skills.find((item) => item.slug === uploadSlug)!.version ??
                  1) + 1}{" "}
                to {uploadSlug}. The current version remains in history.
              </p>
            ) : null}
          </FieldGroup>
          {uploadError ? (
            <p role="alert" className="text-destructive text-sm">
              {uploadError}
            </p>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!uploadData}
              onClick={() => {
                if (
                  !uploadData ||
                  !/^[a-z0-9][a-z0-9-]{0,63}$/.test(uploadSlug)
                ) {
                  setUploadError(
                    "Use lowercase letters, numbers, and hyphens for the slug.",
                  );
                  return;
                }
                const patch = {
                  ...uploadData,
                  uploadedAt: new Date().toISOString(),
                };
                setSkills((items) =>
                  items.some((item) => item.slug === uploadSlug)
                    ? items.map((item) =>
                        item.slug === uploadSlug
                          ? {
                              ...reviseSkill(item, patch),
                              local: true,
                              origin: "",
                            }
                          : item,
                      )
                    : [
                        ...items,
                        {
                          ...patch,
                          slug: uploadSlug,
                          origin: "",
                          local: true,
                          edited: true,
                          version: 1,
                        },
                      ],
                );
                select(uploadSlug);
                setUploadOpen(false);
                setNotice(
                  "Skill uploaded in this browser. No instructions were executed.",
                );
              }}
            >
              Import skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Version history</DialogTitle>
            <DialogDescription>
              {skill.name} · Current version {skill.version ?? 1}. Up to 20
              previous versions are kept in this browser.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border p-4">
            <p className="text-sm font-medium">
              v{skill.version ?? 1} · Current
            </p>
            <p className="text-muted-foreground mt-1 text-xs">{skill.name}</p>
          </div>
          {skill.history?.length ? (
            <div className="divide-y rounded-lg border">
              {skill.history.map((revision) => (
                <div key={revision.version} className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">
                        v{revision.version} · {revision.name}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Saved {new Date(revision.savedAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSkills((items) =>
                          items.map((item) =>
                            item.slug === skill.slug
                              ? reviseSkill(item, {
                                  name: revision.name,
                                  description: revision.description,
                                  content: revision.content,
                                })
                              : item,
                          ),
                        );
                        setHistoryOpen(false);
                        setNotice(
                          `Restored v${revision.version} as a new version.`,
                        );
                      }}
                    >
                      Restore v{revision.version}
                    </Button>
                  </div>
                  <details>
                    <summary className="cursor-pointer text-xs">
                      Inspect version
                    </summary>
                    <pre className="bg-muted mt-3 max-h-64 overflow-auto rounded-md p-3 text-xs whitespace-pre-wrap">
                      {skillMarkdown({ ...skill, ...revision })}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-6 text-center text-sm">
              Edit or upload a new version to start the history.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryOpen(false)}>
              Close history
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{skill.name}</DialogTitle>
            <DialogDescription>Skill instructions</DialogDescription>
          </DialogHeader>
          <SkillInstructions skill={skill} />
        </DialogContent>
      </Dialog>
    </AiWorkspaceShell>
  );
}
