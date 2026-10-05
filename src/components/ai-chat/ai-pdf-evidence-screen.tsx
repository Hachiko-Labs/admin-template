"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  FileText,
  ListTree,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { toast } from "sonner";

import {
  AiChatComposer,
  AiChatComposerEditor,
  AiChatComposerSubmit,
  AiChatComposerToolbar,
  AiChatComposerToolbarGroup,
} from "@/components/ai-chat/ai-chat-composer";
import { AiChatMessage } from "@/components/ai-chat/ai-chat-message";
import { AiCodingWorkspace } from "@/components/ai-chat/ai-coding-workspace";
import {
  AiConversationScroller,
  AiConversationTurn,
} from "@/components/ai-chat/ai-conversation-scroller";
import {
  answerEvidenceQuestion,
  type EvidenceAnswer,
  evidenceDocumentTitle,
  evidencePages,
  evidencePdfUrl,
  findEvidencePassage,
  initialEvidenceAnswer,
  parseEvidencePage,
  searchEvidence,
} from "@/components/ai-chat/ai-pdf-evidence-data";
import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import { AnimatedAgentBlob } from "@/components/ai-chat/animated-agent-blob";
import {
  InlineCitation,
  InlineCitationText,
} from "@/components/ai-elements/inline-citation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface EvidenceTurn {
  id: string;
  question: string;
  answer: EvidenceAnswer;
}
const initialTurn: EvidenceTurn = {
  id: "first-week-findings",
  question:
    "What is getting in the way of a team's first shared result? Use the report and show me the evidence.",
  answer: initialEvidenceAnswer,
};

export function AiPdfEvidenceScreen() {
  const [turns, setTurns] = React.useState<EvidenceTurn[]>([initialTurn]);
  const [draft, setDraft] = React.useState("");
  const [panelOpen, setPanelOpen] = React.useState(true);
  const [pageNumber, setPageNumber] = React.useState(2);
  const [pageInput, setPageInput] = React.useState("2");
  const [zoom, setZoom] = React.useState("fit");
  const [selectedId, setSelectedId] = React.useState<string | null>(
    "setup-friction",
  );
  const [outlineOpen, setOutlineOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [searchIndex, setSearchIndex] = React.useState(0);
  const [imageError, setImageError] = React.useState(false);
  const [imageAttempt, setImageAttempt] = React.useState(0);
  const [copied, setCopied] = React.useState(false);
  const [returnTarget, setReturnTarget] = React.useState<string | null>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const pageRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const selected = selectedId ? findEvidencePassage(selectedId) : undefined;
  const page = evidencePages[pageNumber - 1];
  const searchResults = searchEvidence(query);

  function goToPage(next: number, passageId: string | null = null) {
    const valid = Math.max(1, Math.min(evidencePages.length, next));
    setPageNumber(valid);
    setPageInput(String(valid));
    setSelectedId(passageId);
    setCopied(false);
    setImageError(false);
    setOutlineOpen(false);
  }
  function openPassage(id: string, triggerId?: string) {
    const passage = findEvidencePassage(id);
    if (!passage) return;
    setPanelOpen(true);
    goToPage(passage.page, passage.id);
    if (triggerId) setReturnTarget(triggerId);
  }
  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const passage = selectedId ? findEvidencePassage(selectedId) : undefined;
    const ratio = (pageRef.current?.clientWidth ?? page.width) / page.width;
    viewport.scrollTo({
      top: passage ? Math.max(0, passage.rect.y * ratio - 80) : 0,
      left: 0,
    });
  }, [pageNumber, selectedId, zoom, panelOpen, page.width]);
  React.useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  function returnToAnswer() {
    setPanelOpen(false);
    const target = returnTarget;
    setReturnTarget(null);
    requestAnimationFrame(() => {
      if (target) document.getElementById(target)?.focus();
    });
  }
  function submitQuestion(question: string) {
    if (!question.trim()) return;
    setTurns((current) => [
      ...current,
      {
        id:
          globalThis.crypto?.randomUUID?.() ??
          `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
        question: question.trim(),
        answer: answerEvidenceQuestion(question),
      },
    ]);
    setDraft("");
  }
  function navigateSearch(direction: number) {
    if (!searchResults.length) return;
    const next =
      (searchIndex + direction + searchResults.length) % searchResults.length;
    setSearchIndex(next);
    openPassage(searchResults[next].id);
  }
  async function copyPassage() {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(
        `“${selected.text}”\n${evidenceDocumentTitle}, p. ${selected.page} (fictional demo report)`,
      );
      setCopied(true);
      toast("Passage and page reference copied");
    } catch {
      toast.error("Could not copy the passage. Try again.");
    }
  }
  function reset() {
    setTurns([initialTurn]);
    setDraft("");
    setPanelOpen(true);
    setZoom("fit");
    setQuery("");
    setSearchOpen(false);
    setReturnTarget(null);
    goToPage(2, "setup-friction");
  }

  const documentPanel = (
    <section
      aria-label="PDF evidence reader"
      className="flex h-full min-h-0 w-full min-w-0 flex-col"
    >
      <div className="flex h-11 shrink-0 items-center gap-2 border-b px-3">
        <FileText className="text-muted-foreground size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-xs">
          first-week-research.pdf
        </span>
        <Button variant="ghost" size="icon-sm" asChild>
          <a href={evidencePdfUrl} download aria-label="Download original PDF">
            <Download />
          </a>
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Close PDF reader"
          onClick={returnToAnswer}
        >
          <X />
        </Button>
      </div>
      <div
        role="toolbar"
        aria-label="PDF navigation"
        className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b px-3 py-2"
      >
        <div className="flex items-center gap-1">
          <Popover open={outlineOpen} onOpenChange={setOutlineOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Document outline"
              >
                <ListTree />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-2">
              <nav aria-label="Report outline" className="flex flex-col gap-1">
                {evidencePages.map((item) => (
                  <Button
                    key={item.number}
                    variant={pageNumber === item.number ? "secondary" : "ghost"}
                    className="justify-start"
                    onClick={() => goToPage(item.number)}
                  >
                    <span className="text-muted-foreground mr-2 tabular-nums">
                      {item.number}
                    </span>
                    {item.section}
                  </Button>
                ))}
              </nav>
            </PopoverContent>
          </Popover>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Search PDF"
            aria-pressed={searchOpen}
            onClick={() => setSearchOpen((value) => !value)}
          >
            <Search />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Previous PDF page"
            disabled={pageNumber === 1}
            onClick={() => goToPage(pageNumber - 1)}
          >
            <ChevronLeft />
          </Button>
          <Input
            aria-label="PDF page number"
            inputMode="numeric"
            value={pageInput}
            className="h-7 w-10 px-1 text-center"
            onChange={(event) => setPageInput(event.target.value)}
            onBlur={() => goToPage(parseEvidencePage(pageInput, pageNumber))}
            onKeyDown={(event) => {
              if (event.key === "Enter")
                goToPage(parseEvidencePage(pageInput, pageNumber));
            }}
          />
          <span className="text-muted-foreground text-xs">
            / {evidencePages.length}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Next PDF page"
            disabled={pageNumber === evidencePages.length}
            onClick={() => goToPage(pageNumber + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
        <Select value={zoom} onValueChange={setZoom}>
          <SelectTrigger aria-label="PDF zoom" className="h-7 w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="fit">Fit width</SelectItem>
              <SelectItem value="1">100%</SelectItem>
              <SelectItem value="1.25">125%</SelectItem>
              <SelectItem value="1.5">150%</SelectItem>
              <SelectItem value="2">200%</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {searchOpen && (
        <div className="flex shrink-0 items-center gap-2 border-b px-3 py-2">
          <InputGroup className="h-8">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              ref={searchRef}
              aria-label="Search report text"
              placeholder="Find in report…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSearchIndex(0);
                const matches = searchEvidence(event.target.value);
                if (matches.length) openPassage(matches[0].id);
                else setSelectedId(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && searchResults.length)
                  navigateSearch(1);
                if (event.key === "Escape") setSearchOpen(false);
              }}
            />
          </InputGroup>
          <span
            role="status"
            className="text-muted-foreground shrink-0 text-xs tabular-nums"
          >
            {query.trim()
              ? searchResults.length
                ? `${searchIndex + 1} / ${searchResults.length}`
                : "No matches"
              : ""}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={!searchResults.length}
            aria-label="Previous search result"
            onClick={() => navigateSearch(-1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={!searchResults.length}
            aria-label="Next search result"
            onClick={() => navigateSearch(1)}
          >
            <ChevronRight />
          </Button>
        </div>
      )}
      {selected && (
        <div className="bg-muted/30 flex shrink-0 items-center gap-2 border-b px-3 py-2">
          <span className="bg-chart-2 size-1.5 shrink-0 rounded-full" />
          <span className="min-w-0 flex-1 truncate text-xs">
            {selected.title}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Copy cited passage"
            onClick={copyPassage}
          >
            {copied ? <Check /> : <Copy />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Clear passage highlight"
            onClick={() => setSelectedId(null)}
          >
            <X />
          </Button>
        </div>
      )}
      <div
        ref={viewportRef}
        className="bg-muted/40 min-h-0 flex-1 overflow-auto overscroll-contain p-4 sm:p-6"
        aria-label={`PDF page ${pageNumber}: ${page.title}`}
        tabIndex={0}
      >
        {imageError ? (
          <Alert>
            <AlertDescription className="flex flex-col gap-3">
              The page preview could not load.
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setImageError(false);
                  setImageAttempt((value) => value + 1);
                }}
              >
                Retry page preview
              </Button>
              <a
                className="underline"
                href={evidencePdfUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open the original PDF
              </a>
            </AlertDescription>
          </Alert>
        ) : (
          <div
            ref={pageRef}
            className="relative mx-auto shrink-0 overflow-hidden rounded-sm shadow-sm"
            style={{
              width: zoom === "fit" ? "100%" : `${page.width * Number(zoom)}px`,
              aspectRatio: `${page.width} / ${page.height}`,
            }}
          >
            <Image
              key={`${page.number}-${imageAttempt}`}
              src={page.image}
              width={page.width}
              height={page.height}
              alt={`Page ${page.number}: ${page.title}. Select a passage to inspect its evidence.`}
              unoptimized
              priority
              className="block h-auto w-full"
              onError={() => setImageError(true)}
            />
            {page.blocks.map((block) => (
              <button
                key={block.id}
                type="button"
                aria-label={`Select passage: ${block.title}`}
                aria-pressed={selectedId === block.id}
                onClick={() => openPassage(block.id)}
                className={cn(
                  "hover:bg-chart-2/10 focus-visible:border-chart-2 absolute rounded-sm border-2 border-transparent transition-colors focus-visible:outline-none",
                  selectedId === block.id && "border-chart-2/60 bg-chart-2/15",
                )}
                style={{
                  left: `${(block.rect.x / page.width) * 100}%`,
                  top: `${(block.rect.y / page.height) * 100}%`,
                  width: `${(block.rect.width / page.width) * 100}%`,
                  height: `${(block.rect.height / page.height) * 100}%`,
                }}
              >
                <span className="sr-only">{block.text}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="text-muted-foreground flex shrink-0 items-center justify-between gap-2 border-t px-3 py-2 text-[11px]">
        <span>
          Page {pageNumber} of {evidencePages.length} · {page.section}
        </span>
        {returnTarget ? (
          <Button variant="ghost" size="sm" onClick={returnToAnswer}>
            <ArrowLeft data-icon="inline-start" />
            Back to answer
          </Button>
        ) : (
          <span>Demo research report</span>
        )}
      </div>
    </section>
  );

  return (
    <AiWorkspaceShell
      headerTitle="PDF evidence"
      hideNavigationSidebar
      headerActions={
        <>
          <span className="text-muted-foreground hidden text-xs sm:inline">
            Demo workspace
          </span>
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw data-icon="inline-start" />
            Reset
          </Button>
        </>
      }
    >
      <AiCodingWorkspace
        panelTitle="PDF reader"
        defaultPanelWidthPercent={60}
        codePanelOpen={panelOpen}
        onCodePanelOpenChange={setPanelOpen}
        codePanel={documentPanel}
        chat={
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b px-4">
              <h1 className="truncate text-xs font-medium">
                First-week research
              </h1>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={panelOpen ? "Hide PDF reader" : "Open PDF reader"}
                aria-pressed={panelOpen}
                onClick={() => setPanelOpen((value) => !value)}
              >
                {panelOpen ? <PanelRightClose /> : <PanelRightOpen />}
              </Button>
            </div>
            <AiConversationScroller
              itemized
              contentClassName="mx-auto w-full max-w-xl px-4 py-7 sm:px-5"
            >
              {turns.map((turn, index) => (
                <AiConversationTurn
                  key={turn.id}
                  id={turn.id}
                  className={index < turns.length - 1 ? "pb-8" : undefined}
                >
                  <AiChatMessage
                    message={{
                      id: `${turn.id}-user`,
                      role: "user",
                      parts: [{ type: "text", text: turn.question }],
                    }}
                  />
                  <AiChatMessage
                    message={{
                      id: `${turn.id}-answer`,
                      role: "assistant",
                      parts: [
                        {
                          type: "custom",
                          id: `${turn.id}-evidence`,
                          name: "evidence",
                          data: null,
                        },
                      ],
                    }}
                    assistantAvatar={
                      <AnimatedAgentBlob
                        className="size-7"
                        colors={["#050505", "#334155", "#050505"]}
                        silhouette="squircle"
                        phase={1.2}
                        decorative
                      />
                    }
                    assistantHeader={
                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-xs font-medium">
                          Shadcnblocks AI
                        </span>
                        <span className="text-muted-foreground text-[11px]">
                          Research
                        </span>
                      </div>
                    }
                    renderPart={() => (
                      <div className="flex min-w-0 flex-col gap-4 text-xs leading-5">
                        <p>{turn.answer.intro}</p>
                        {turn.answer.claims.map((claim, claimIndex) => {
                          const passage = findEvidencePassage(claim.passageId)!;
                          const triggerId = `cite-${turn.id}-${claimIndex}`;
                          return (
                            <p key={claim.passageId}>
                              <InlineCitation>
                                <InlineCitationText>
                                  {claim.text}
                                </InlineCitationText>
                                <Button
                                  id={triggerId}
                                  variant={
                                    selectedId === passage.id
                                      ? "secondary"
                                      : "outline"
                                  }
                                  size="sm"
                                  className="mx-1 inline-flex h-5 rounded-full px-2 align-baseline"
                                  aria-label={`View evidence on page ${passage.page}: ${passage.title}`}
                                  aria-pressed={selectedId === passage.id}
                                  onClick={() =>
                                    openPassage(passage.id, triggerId)
                                  }
                                >
                                  p. {passage.page}
                                </Button>
                              </InlineCitation>
                            </p>
                          );
                        })}
                        {!!turn.answer.claims.length && (
                          <Collapsible>
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="px-0"
                              >
                                <FileText data-icon="inline-start" />1 source ·{" "}
                                {turn.answer.claims.length} passages
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="mt-2 flex flex-col gap-2 rounded-lg border p-3">
                                <span className="font-medium">
                                  {evidenceDocumentTitle}
                                </span>
                                <span className="text-muted-foreground">
                                  3 pages · Fictional research report
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="justify-start"
                                  onClick={() => {
                                    setPanelOpen(true);
                                    goToPage(1);
                                  }}
                                >
                                  <BookOpenText data-icon="inline-start" />
                                  Read report
                                </Button>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                      </div>
                    )}
                  />
                </AiConversationTurn>
              ))}
            </AiConversationScroller>
            <div className="bg-background shrink-0 px-4 pt-3 pb-4 sm:px-5">
              <div className="mb-3 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    submitQuestion("What are the limits of this study?")
                  }
                >
                  Study limitations
                  <ArrowRight data-icon="inline-end" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    submitQuestion("What should we test in the pilot?")
                  }
                >
                  Pilot plan
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>
              <AiChatComposer
                className="max-w-xl"
                aria-label="Ask about this PDF"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitQuestion(draft);
                }}
              >
                <AiChatComposerEditor
                  aria-label="Question about the report"
                  className="min-h-16"
                  placeholder="Ask about the report…"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                />
                <AiChatComposerToolbar>
                  <AiChatComposerToolbarGroup>
                    <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                      <FileText className="size-3.5" />1 report
                    </span>
                  </AiChatComposerToolbarGroup>
                  <AiChatComposerSubmit disabled={!draft.trim()} />
                </AiChatComposerToolbar>
              </AiChatComposer>
              <p className="text-muted-foreground mt-2 text-center text-[10px]">
                Prepared demo answers · verify against the cited passage
              </p>
            </div>
          </div>
        }
      />
    </AiWorkspaceShell>
  );
}
