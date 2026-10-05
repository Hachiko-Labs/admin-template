"use client";
import {
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Globe,
  Images,
  Search,
} from "lucide-react";
import Image from "next/image";
import * as React from "react";

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
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

import {
  answerMedia,
  answerSources,
  findAnswerSources,
  researchSteps,
} from "./ai-web-answer-data";
import { AiWorkspaceShell } from "./ai-workspace-shell";

export function AiWebAnswerScreen() {
  const [source, setSource] = React.useState<number | null>(null);
  const [allSources, setAllSources] = React.useState(false);
  const [media, setMedia] = React.useState<number | null>(null);
  const [question, setQuestion] = React.useState("");
  const [followups, setFollowups] = React.useState<
    { question: string; ids: number[] }[]
  >([]);
  const [notice, setNotice] = React.useState("");
  const end = React.useRef<HTMLDivElement>(null);
  const answer = React.useRef<HTMLElement>(null);
  const selected = answerSources.find((s) => s.id === source);
  function submit(q = question) {
    if (!q.trim()) return;
    setFollowups((f) => [
      ...f,
      { question: q.trim(), ids: findAnswerSources(q).map((s) => s.id) },
    ]);
    setQuestion("");
    setTimeout(
      () => end.current?.scrollIntoView({ behavior: "smooth", block: "end" }),
      50,
    );
  }
  function cite(id: number) {
    return (
      <button
        aria-label={`Read source ${id}`}
        onClick={() => setSource(id)}
        className="bg-muted text-muted-foreground hover:text-foreground mx-0.5 inline-flex size-5 items-center justify-center rounded align-middle text-[11px]"
      >
        {id}
      </button>
    );
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        `What can you build with Shadcnblocks?\n\n${Array.from(
          answer.current?.children ?? [],
        )
          .flatMap((e) =>
            e instanceof HTMLElement && e.tagName !== "DIV"
              ? [e.innerText]
              : [],
          )
          .join(
            "\n\n",
          )}\n\nSources\n${answerSources.map((s) => `[${s.id}] ${s.url}`).join("\n")}`,
      );
      setNotice("Answer and source links copied.");
    } catch {
      setNotice("Clipboard unavailable. Open a source to copy its link.");
    }
  }
  return (
    <AiWorkspaceShell
      headerTitle="What can you build with Shadcnblocks?"
      hideNavigationSidebar
      headerActions={
        <Button
          variant="ghost"
          size="icon"
          aria-label="Copy answer and sources"
          onClick={copy}
        >
          <Copy />
        </Button>
      }
    >
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 scroll-pb-40 overflow-y-auto">
          <div className="mx-auto max-w-[1160px] px-5 pt-10 pb-40 md:px-10 md:pt-16">
            <div className="text-muted-foreground mb-9 flex items-center gap-2 text-xs">
              <span>Web answer</span>
              <span>·</span>
              <span>Sources checked September 7, 2026</span>
            </div>
            <h1 className="mb-8 text-3xl font-semibold tracking-tight md:text-4xl">
              What can you build with Shadcnblocks?
            </h1>
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
              <div className="min-w-0">
                <Collapsible className="mb-6 overflow-hidden rounded-lg border">
                  <CollapsibleTrigger
                    aria-label="Research progress · 5 steps"
                    className="hover:bg-muted/40 focus-visible:ring-ring group flex min-h-12 w-full items-center gap-3 px-4 py-3 text-left outline-none focus-visible:ring-1 focus-visible:ring-inset"
                  >
                    <Search className="size-4 shrink-0" />
                    <span className="text-sm font-medium">Research</span>
                    <span className="text-muted-foreground ml-auto text-xs">
                      5 steps completed
                    </span>
                    <ChevronDown className="text-muted-foreground size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="border-t">
                    <ol className="px-4 py-2">
                      {researchSteps.map((step, i) => (
                        <li
                          key={step}
                          className="flex items-start gap-3 py-2 text-xs leading-5"
                        >
                          <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                          <span>
                            {step}{" "}
                            <button
                              aria-label={`Read source ${i + 1}: ${answerSources[i].name}`}
                              onClick={() => setSource(i + 1)}
                              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring ml-1 rounded-sm text-[10px] underline underline-offset-2 outline-none focus-visible:ring-1"
                            >
                              [{i + 1}]
                            </button>
                          </span>
                        </li>
                      ))}
                    </ol>
                  </CollapsibleContent>
                </Collapsible>
                <section aria-label="Sources" className="mb-4">
                  <h2 className="text-muted-foreground mb-2 text-xs font-medium">
                    Sources
                  </h2>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {answerSources.slice(0, 3).map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSource(s.id)}
                        className="bg-muted/30 hover:bg-muted/60 focus-visible:ring-ring border-border/60 flex min-w-0 flex-col gap-1 rounded-lg border px-2.5 py-2 text-left focus-visible:ring-2"
                      >
                        <span className="w-full truncate text-xs font-medium">
                          {
                            [
                              "Shadcnblocks overview",
                              "Browse blocks",
                              "Website templates",
                            ][s.id - 1]
                          }
                        </span>
                        <span className="text-muted-foreground flex w-full items-center gap-1.5 text-[11px]">
                          <Globe className="size-3 shrink-0" />
                          <span className="truncate">{s.name}</span>
                          <span className="ml-auto">· {s.id}</span>
                        </span>
                      </button>
                    ))}
                    <button
                      onClick={() => setAllSources(true)}
                      className="bg-muted/30 hover:bg-muted/60 border-border/60 flex flex-col items-center justify-center gap-1 rounded-lg border px-2.5 py-2 text-xs"
                    >
                      <span className="flex gap-1">
                        <Globe className="bg-background size-5 rounded-full border p-1" />
                        <BookOpen className="bg-background size-5 rounded-full border p-1" />
                      </span>
                      <span>View all 5 sources</span>
                    </button>
                  </div>
                </section>
                <article
                  ref={answer}
                  className="flex flex-col gap-6 text-[16px] leading-7"
                >
                  <h2 className="flex items-center gap-2 text-lg font-medium">
                    <BookOpen className="size-5" />
                    Answer
                  </h2>
                  <p>
                    <strong>
                      Shadcnblocks is a library of ready-made interface
                      sections, components and website templates
                    </strong>{" "}
                    for React, shadcn/ui and Tailwind CSS. Start with a complete
                    design, then adapt its source code to your product.{" "}
                    {cite(1)}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    From a landing page to an application
                  </h2>
                  <section>
                    <h3 className="mb-2 text-lg font-semibold">
                      1. Assemble a product website
                    </h3>
                    <p>
                      Combine a hero, feature sections, testimonials and pricing
                      into a landing page. The block library groups these
                      designs by purpose, so you can browse the section you
                      need. {cite(2)}
                    </p>
                  </section>
                  <section>
                    <h3 className="mb-2 text-lg font-semibold">
                      2. Start from a complete template
                    </h3>
                    <p>
                      For a coordinated website, choose a template with its
                      sections already composed. Browse the Next.js and Astro
                      options and check the framework listed for your chosen
                      design. {cite(3)}
                    </p>
                  </section>
                  <section>
                    <h3 className="mb-2 text-lg font-semibold">
                      3. Build the workspace behind the product
                    </h3>
                    <p>
                      The <strong>Shadcn Admin Kit</strong> brings ecommerce,
                      project management, payments, tasks and developer screens
                      into a shared Next.js application. Its navigation and
                      themes provide a foundation for the workspace surrounding
                      these AI screens. {cite(5)}
                    </p>
                  </section>
                  <section>
                    <h2 className="mb-3 text-2xl font-semibold">
                      How do you bring it into your project?
                    </h2>
                    <p>
                      Pick a block and follow its installation instructions. The
                      <strong> shadcn CLI</strong> adds the source and resolves
                      required components and dependencies. The guide covers
                      registry setup and authentication for premium blocks.{" "}
                      {cite(4)}
                    </p>
                  </section>
                  <p className="text-muted-foreground text-sm">
                    The previews alongside this answer come from Shadcnblocks.
                    Explore a source to browse the actual collection and its
                    installation details.
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={copy}>
                      <Copy data-icon="inline-start" />
                      Copy answer
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAllSources(true)}
                    >
                      Inspect sources
                    </Button>
                  </div>
                </article>
                <section
                  className="mt-8 flex flex-col gap-3"
                  aria-label="Related questions"
                >
                  <h2 className="text-sm font-medium">Explore the sources</h2>
                  {[
                    "Which blocks can I use for a landing page?",
                    "How do I install a block?",
                    "What is included in the Admin Kit?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => submit(q)}
                      className="flex items-center justify-between border-b py-3 text-left text-sm"
                    >
                      {q}
                      <ArrowUpRight className="size-4" />
                    </button>
                  ))}
                </section>
                {followups.map((f, i) => (
                  <section
                    key={i}
                    className="mt-9 flex flex-col gap-4 border-t pt-7"
                  >
                    <h2 className="text-xl font-semibold">{f.question}</h2>
                    <Badge variant="secondary">From the saved sources</Badge>
                    {f.ids.length ? (
                      f.ids.map((id) => (
                        <p key={id} className="text-sm leading-6">
                          {answerSources.find((s) => s.id === id)?.summary}{" "}
                          {cite(id)}
                        </p>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No matching passage in these five saved sources. Try
                        asking about blocks, templates, installation, or the
                        Admin Kit.
                      </p>
                    )}
                  </section>
                ))}
                <div ref={end} />
              </div>
              <aside
                className="flex flex-col gap-5 lg:sticky lg:top-6"
                aria-label="Related media"
              >
                <section>
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <Images className="size-4" />
                    Images
                  </h2>
                  <div className="grid grid-cols-2 gap-2">
                    {answerMedia.map((m, i) => (
                      <button
                        key={m.src}
                        onClick={() => setMedia(i)}
                        className="group relative overflow-hidden rounded-lg border text-left"
                        aria-label={`View image: ${m.title}`}
                      >
                        <Image
                          src={m.src}
                          alt={m.alt}
                          width={500}
                          height={280}
                          className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-105"
                        />
                        <span className="bg-background/90 absolute inset-x-0 bottom-0 truncate px-2 py-1 text-[10px]">
                          {m.title}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-muted-foreground mt-2 text-[11px]">
                    Previews: Shadcnblocks
                  </p>
                </section>
                <a
                  href={answerSources[4].url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-muted/30 hover:bg-muted flex flex-col gap-2 overflow-hidden rounded-xl border p-4"
                >
                  <span className="text-muted-foreground text-xs">
                    Explore the product
                  </span>
                  <span className="flex items-center justify-between text-sm font-medium">
                    Shadcn Admin Kit <ArrowUpRight className="size-4" />
                  </span>
                  <span className="text-muted-foreground text-xs leading-5">
                    The application foundation for dashboards and workspaces.
                  </span>
                </a>
              </aside>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-4">
          <div className="mx-auto grid max-w-[1160px] gap-8 px-5 md:px-10 lg:grid-cols-[minmax(0,1fr)_240px]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              aria-label="Follow-up composer"
              className="bg-background pointer-events-auto relative min-w-0 rounded-full shadow-sm"
            >
              <InputGroup className="h-12 rounded-full px-2 has-[[data-slot=input-group-control]:focus-visible]:ring-1">
                <InputGroupInput
                  aria-label="Ask a follow-up"
                  aria-describedby="web-answer-followup-help"
                  placeholder="Ask a follow-up"
                  value={question}
                  maxLength={500}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="submit"
                    size="icon-sm"
                    variant="default"
                    disabled={!question.trim()}
                    aria-label="Send follow-up"
                  >
                    <ArrowUp />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <p id="web-answer-followup-help" className="sr-only">
                Follow-ups find relevant passages in the five saved sources.
              </p>
              <p role="status" className="sr-only">
                {notice}
              </p>
            </form>
          </div>
        </div>
      </div>
      <Dialog
        open={source !== null || allSources}
        onOpenChange={(open) => {
          if (!open) {
            setSource(null);
            setAllSources(false);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selected ? selected.title : "Sources behind this answer"}
            </DialogTitle>
            <DialogDescription>
              Published sources · checked September 7, 2026
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-5">
            {(selected ? [selected] : answerSources).map((s) => (
              <article
                key={s.id}
                className="flex flex-col gap-2 rounded-xl border p-4"
              >
                <p className="text-muted-foreground text-xs">
                  {s.id} · {s.name}
                </p>
                {!selected && <h3 className="font-medium">{s.title}</h3>}
                <p className="text-sm leading-6">{s.summary}</p>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm underline underline-offset-4"
                >
                  Open publication ↗
                </a>
              </article>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={media !== null}
        onOpenChange={(open) => {
          if (!open) setMedia(null);
        }}
      >
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {media !== null ? answerMedia[media].title : "Image"}
            </DialogTitle>
            <DialogDescription>
              Interface preview published by Shadcnblocks.
            </DialogDescription>
          </DialogHeader>
          {media !== null && (
            <>
              <Image
                src={answerMedia[media].src}
                alt={answerMedia[media].alt}
                width={900}
                height={600}
                className="max-h-[65vh] w-full object-contain"
              />
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  aria-label="Previous image"
                  onClick={() =>
                    setMedia(
                      (media + answerMedia.length - 1) % answerMedia.length,
                    )
                  }
                >
                  <ChevronLeft />
                </Button>
                <a
                  href={answerMedia[media].url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm underline"
                >
                  View Shadcnblocks ↗
                </a>
                <Button
                  variant="outline"
                  aria-label="Next image"
                  onClick={() => setMedia((media + 1) % answerMedia.length)}
                >
                  <ChevronRight />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AiWorkspaceShell>
  );
}
