"use client";

import "@/styles/tiptap.css";

import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Bold,
  Check,
  FileText,
  Italic,
  List,
  Maximize2,
  Minimize2,
  PanelRightOpen,
  Redo2,
  RotateCcw,
  Undo2,
  X,
} from "lucide-react";
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
  canApplyDocumentRevision,
  type DocumentRevision,
  type DocumentSelection,
  documentTitle,
  initialWritingDocument,
  initialWritingRevision,
  proposeDocumentText,
  type RevisionStyle,
} from "@/components/ai-chat/ai-document-writing-data";
import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import { AnimatedAgentBlob } from "@/components/ai-chat/animated-agent-blob";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

function WritingAssistantMessage({ children }: { children: React.ReactNode }) {
  return (
    <AiChatMessage
      message={{
        id: "writing-assistant-message",
        role: "assistant",
        parts: [
          {
            type: "custom",
            id: "writing-content",
            name: "writing-content",
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
          <span className="text-muted-foreground text-[11px]">Writing</span>
        </div>
      }
      renderPart={({ part }) => (part.type === "custom" ? children : undefined)}
    />
  );
}

export function AiDocumentWritingScreen() {
  const [instance, setInstance] = React.useState(0);
  return (
    <DocumentWritingWorkspace
      key={instance}
      onReset={() => setInstance((value) => value + 1)}
    />
  );
}

function DocumentWritingWorkspace({ onReset }: { onReset: () => void }) {
  const [documentReady, setDocumentReady] = React.useState(false);
  const [panelOpen, setPanelOpen] = React.useState(true);
  const [expanded, setExpanded] = React.useState(false);
  const [documentVersion, setDocumentVersion] = React.useState(0);
  const [selection, setSelection] = React.useState<DocumentSelection | null>(
    null,
  );
  const [revision, setRevision] = React.useState<DocumentRevision | null>(
    initialWritingRevision,
  );
  const [history, setHistory] = React.useState<DocumentRevision[]>([]);
  const [message, setMessage] = React.useState("");
  const [style, setStyle] = React.useState<RevisionStyle>("concise");
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialWritingDocument,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-label": "Document editor",
        "aria-multiline": "true",
        class:
          "tiptap-editor prose prose-sm prose-neutral dark:prose-invert max-w-none min-h-[620px] outline-none prose-headings:font-semibold prose-h1:text-[30px] prose-h1:leading-tight prose-h1:tracking-tight prose-h1:mb-5 prose-h2:text-base prose-h2:mt-8 prose-h2:mb-3 prose-p:leading-7 prose-p:my-3 prose-li:my-1 selection:bg-chart-2/20",
      },
    },
    onCreate: () => setDocumentReady(true),
    onUpdate: () => setDocumentVersion((current) => current + 1),
    onSelectionUpdate: ({ editor: current }) => {
      const { from, to } = current.state.selection;
      const text = current.state.doc.textBetween(from, to, "\n");
      if (from !== to && text.trim()) setSelection({ from, to, text });
    },
  });
  const editorState = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      current
        ? {
            bold: current.isActive("bold"),
            italic: current.isActive("italic"),
            list: current.isActive("bulletList"),
            heading: current.isActive("heading", { level: 2 })
              ? "heading"
              : "paragraph",
            undo: current.can().undo(),
            redo: current.can().redo(),
          }
        : null,
  });
  const wordCount =
    documentReady && editor
      ? editor.getText().trim().split(/\s+/).filter(Boolean).length
      : null;
  const pending = revision?.status === "pending";
  const stale = pending && revision.documentVersion !== documentVersion;

  function locate(range: DocumentSelection) {
    if (!editor) return;
    if (
      range.from < 0 ||
      range.to > editor.state.doc.content.size ||
      editor.state.doc.textBetween(range.from, range.to, "\n") !== range.text
    ) {
      setSelection(null);
      setPanelOpen(true);
      toast(
        "This passage has changed. Select the current text in the document.",
      );
      return;
    }
    setPanelOpen(true);
    setExpanded(false);
    editor
      .chain()
      .focus()
      .setTextSelection({
        from: Math.min(range.from, editor.state.doc.content.size),
        to: Math.min(range.to, editor.state.doc.content.size),
      })
      .scrollIntoView()
      .run();
  }
  function requestRevision(nextStyle: RevisionStyle, instruction?: string) {
    if (!selection || !editor) {
      toast("Select a passage in the document first");
      setPanelOpen(true);
      return;
    }
    if (selection.from < 0 || selection.to > editor.state.doc.content.size) {
      toast("The passage changed. Select it again.");
      setSelection(null);
      return;
    }
    const rangeText = editor.state.doc.textBetween(
      selection.from,
      Math.min(selection.to, editor.state.doc.content.size),
      "\n",
    );
    if (rangeText !== selection.text) {
      toast("The passage changed. Select it again.");
      setSelection(null);
      return;
    }
    if (pending) {
      toast("Accept or dismiss the current suggestion first");
      return;
    }
    setRevision({
      ...selection,
      id:
        globalThis.crypto?.randomUUID?.() ??
        `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
      documentVersion,
      instruction:
        instruction?.trim() ||
        (nextStyle === "concise"
          ? "Make this passage more concise."
          : "Make this passage clearer."),
      replacement: proposeDocumentText(selection.text, nextStyle),
      status: "pending",
    });
    setMessage("");
    setExpanded(false);
    if (window.matchMedia("(max-width: 979px)").matches) setPanelOpen(false);
  }
  function acceptRevision() {
    if (!editor || !revision) return;
    if (
      revision.documentVersion !== documentVersion ||
      revision.to > editor.state.doc.content.size
    ) {
      toast("The document changed. Select the passage again.");
      return;
    }
    const text = editor.state.doc.textBetween(
      revision.from,
      Math.min(revision.to, editor.state.doc.content.size),
      "\n",
    );
    if (!canApplyDocumentRevision(revision, documentVersion, text)) {
      toast(
        "The document changed. Select the passage again for a fresh suggestion.",
      );
      return;
    }
    const replacement = revision.replacement.trim();
    editor
      .chain()
      .focus()
      .insertContentAt(
        { from: revision.from, to: revision.to },
        { type: "text", text: replacement },
      )
      .run();
    setRevision({ ...revision, status: "accepted" });
    setHistory((current) => [...current, { ...revision, status: "accepted" }]);
    setSelection(null);
    toast("Passage updated. Undo is available in the document toolbar.");
  }
  function dismissRevision() {
    if (!revision) return;
    setHistory((current) => [...current, { ...revision, status: "rejected" }]);
    setRevision({ ...revision, status: "rejected" });
  }
  function reset() {
    onReset();
    toast("Document demo reset");
  }
  function exportDocument() {
    if (!editor) return;
    const blob = new Blob(
      [
        `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${documentTitle}</title><style>body{max-width:760px;margin:60px auto;padding:0 24px;font:16px/1.7 system-ui;color:#202020}h1{line-height:1.2}h2{margin-top:32px}</style></head><body>${editor.getHTML()}</body></html>`,
      ],
      { type: "text/html" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "onboarding-brief.html";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Document exported");
  }
  const documentPanel = (
    <section
      aria-label="Writing document"
      className="bg-muted/30 flex min-h-0 min-w-0 flex-1 flex-col"
    >
      <header className="bg-background flex h-11 shrink-0 items-center gap-2 border-b px-3">
        <FileText className="text-muted-foreground size-3.5" />
        <span className="min-w-0 flex-1 truncate text-xs font-medium">
          onboarding-brief
        </span>
        <span className="text-muted-foreground mr-2 hidden text-[11px] sm:inline">
          {documentVersion ? "Edited in this preview" : "Draft"}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={expanded ? "Show conversation" : "Expand document"}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? <Minimize2 /> : <Maximize2 />}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Close document"
          onClick={() => {
            setPanelOpen(false);
            setExpanded(false);
          }}
        >
          <X />
        </Button>
      </header>
      <div className="bg-background flex shrink-0 flex-wrap items-center gap-1 border-b px-4 py-3">
        <Select
          value={editorState?.heading ?? "paragraph"}
          onValueChange={(value) =>
            value === "heading"
              ? editor?.chain().focus().setHeading({ level: 2 }).run()
              : editor?.chain().focus().setParagraph().run()
          }
        >
          <SelectTrigger
            aria-label="Text style"
            className="h-8 w-30 border-0 shadow-none"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="paragraph">Text</SelectItem>
              <SelectItem value="heading">Heading</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <span className="bg-border mx-1 h-4 w-px" />
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Bold"
          aria-pressed={editorState?.bold}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Italic"
          aria-pressed={editorState?.italic}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Bullet list"
          aria-pressed={editorState?.list}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List />
        </Button>
        <span className="bg-border mx-1 h-4 w-px" />
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Undo document edit"
          disabled={!editorState?.undo}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          <Undo2 />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Redo document edit"
          disabled={!editorState?.redo}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          <Redo2 />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={exportDocument}
        >
          <ArrowDownToLine data-icon="inline-start" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto max-w-[780px] px-4 py-7 sm:px-7">
          <article className="bg-background rounded-sm border px-6 py-9 shadow-xs sm:px-10">
            <div className="text-muted-foreground mb-5 text-[10px] font-medium tracking-[0.16em] uppercase">
              Product strategy · September 2026
            </div>
            <EditorContent editor={editor} />
          </article>
        </div>
      </ScrollArea>
      <footer className="text-muted-foreground bg-background flex shrink-0 items-center justify-between gap-3 border-t px-4 py-2 text-[11px]">
        <span>{wordCount ?? "…"} words</span>
        <span>Select text to revise a passage</span>
      </footer>
      {editor && (
        <BubbleMenu
          editor={editor}
          options={{ placement: "top", offset: 8 }}
          shouldShow={({ editor: current, from, to }) =>
            current.isFocused && from !== to && !pending
          }
        >
          <div
            className="bg-popover flex items-center gap-1 rounded-lg border p-1 shadow-md"
            onMouseDown={(event) => event.preventDefault()}
          >
            <Button
              size="sm"
              variant="ghost"
              onClick={() => requestRevision("concise")}
            >
              Make concise
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => requestRevision("clear")}
            >
              Improve clarity
            </Button>
          </div>
        </BubbleMenu>
      )}
    </section>
  );
  return (
    <AiWorkspaceShell
      headerTitle="Document writing"
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
        panelTitle="Document editor"
        defaultPanelWidthPercent={62}
        codePanelOpen={panelOpen}
        codePanelExpanded={expanded}
        onCodePanelOpenChange={(open) => {
          setPanelOpen(open);
          if (!open) setExpanded(false);
        }}
        codePanel={documentPanel}
        chat={
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex h-11 shrink-0 items-center justify-between border-b px-4">
              <h1 className="text-xs font-medium">Onboarding brief</h1>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Open document"
                onClick={() => setPanelOpen(true)}
              >
                <PanelRightOpen />
              </Button>
            </div>
            <AiConversationScroller
              itemized
              contentClassName="mx-auto w-full max-w-xl px-4 py-7 sm:px-5"
            >
              <AiConversationTurn id="writing-draft" className="pb-8">
                <AiChatMessage
                  message={{
                    id: "writing-request",
                    role: "user",
                    parts: [
                      {
                        type: "text",
                        text: "Turn our onboarding notes into a short recommendation for the product team.",
                      },
                    ],
                  }}
                />
                <WritingAssistantMessage>
                  <div className="flex min-w-0 flex-col gap-4">
                    <p className="text-xs leading-5">
                      The draft is ready beside this conversation. You can edit
                      it directly or select a passage for a focused revision.
                    </p>
                    <button
                      className="hover:bg-muted/40 focus-visible:ring-ring flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
                      onClick={() => setPanelOpen(true)}
                    >
                      <span className="bg-muted flex size-9 items-center justify-center rounded-lg">
                        <FileText className="size-4" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-medium">
                          Onboarding brief
                        </span>
                        <span className="text-muted-foreground block text-xs">
                          Editable document · {wordCount ?? "…"} words
                        </span>
                      </span>
                      <ArrowUpRight className="text-muted-foreground size-4" />
                    </button>
                  </div>
                </WritingAssistantMessage>
              </AiConversationTurn>
              {revision && (
                <AiConversationTurn id="writing-revision">
                  <AiChatMessage
                    message={{
                      id: "writing-revision-request",
                      role: "user",
                      parts: [{ type: "text", text: revision.instruction }],
                    }}
                  />
                  <WritingAssistantMessage>
                    <div className="flex min-w-0 flex-col gap-4">
                      <button
                        className="focus-visible:ring-ring flex flex-col gap-2 border-l-2 py-1 pl-3 text-left focus-visible:ring-2 focus-visible:outline-none"
                        onClick={() => locate(revision)}
                      >
                        <span className="text-muted-foreground block text-[10px] font-medium tracking-wide uppercase">
                          Selected passage
                        </span>
                        <span className="text-muted-foreground line-clamp-3 text-xs leading-5">
                          {revision.text}
                        </span>
                        <span className="block text-xs underline underline-offset-4">
                          Locate in document
                        </span>
                      </button>
                      <div className="overflow-hidden rounded-xl border">
                        <div className="bg-muted/35 flex items-center justify-between border-b px-4 py-3">
                          <span className="text-xs font-medium">
                            Suggested revision
                          </span>
                          <Badge variant="outline">
                            {pending
                              ? "For review"
                              : revision.status === "accepted"
                                ? "Applied"
                                : "Dismissed"}
                          </Badge>
                        </div>
                        <div className="flex flex-col gap-4 p-4">
                          {pending ? (
                            <Field>
                              <FieldLabel
                                htmlFor="document-replacement"
                                className="sr-only"
                              >
                                Proposed replacement
                              </FieldLabel>
                              <Textarea
                                id="document-replacement"
                                className="min-h-32"
                                value={revision.replacement}
                                onChange={(event) =>
                                  setRevision((current) =>
                                    current
                                      ? {
                                          ...current,
                                          replacement: event.target.value,
                                        }
                                      : current,
                                  )
                                }
                              />
                            </Field>
                          ) : (
                            <p className="text-muted-foreground text-sm leading-6">
                              {revision.replacement}
                            </p>
                          )}
                          {stale && (
                            <Alert variant="destructive">
                              <AlertDescription>
                                The document changed after this suggestion.
                                Dismiss it and select the passage again.
                              </AlertDescription>
                            </Alert>
                          )}
                          {pending ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={dismissRevision}
                              >
                                Dismiss
                              </Button>
                              <Button
                                size="sm"
                                disabled={stale || !revision.replacement.trim()}
                                onClick={acceptRevision}
                              >
                                <Check data-icon="inline-start" />
                                Accept edit
                              </Button>
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-xs">
                              {revision.status === "accepted"
                                ? "The selected passage was replaced. The rest of the document is unchanged."
                                : "The document was left unchanged."}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </WritingAssistantMessage>
                </AiConversationTurn>
              )}
              {history.length > 1 && (
                <p className="text-muted-foreground text-xs">
                  {history.filter((item) => item.status === "accepted").length}{" "}
                  edits applied in this session
                </p>
              )}
            </AiConversationScroller>
            <div className="bg-background shrink-0 px-4 pt-3 pb-4 sm:px-5">
              {selection && !pending && (
                <div className="bg-muted/35 mb-2 flex items-center gap-2 rounded-lg border px-3 py-2">
                  <span className="text-muted-foreground min-w-0 flex-1 truncate text-xs">
                    “{selection.text}”
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Clear selected passage"
                    onClick={() => setSelection(null)}
                  >
                    <X />
                  </Button>
                </div>
              )}
              <AiChatComposer
                className="max-w-xl"
                aria-label="Continue writing conversation"
                onSubmit={(event) => {
                  event.preventDefault();
                  requestRevision(style, message);
                }}
              >
                <AiChatComposerEditor
                  aria-label="Revision instruction"
                  className="min-h-16"
                  placeholder={
                    selection
                      ? "How should this passage change?"
                      : "Select a passage to suggest an edit…"
                  }
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
                <AiChatComposerToolbar>
                  <AiChatComposerToolbarGroup>
                    <Select
                      value={style}
                      onValueChange={(value) => {
                        if (value === "concise" || value === "clear")
                          setStyle(value);
                      }}
                    >
                      <SelectTrigger
                        aria-label="Revision style"
                        className="h-7 w-30 border-0 shadow-none"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="concise">More concise</SelectItem>
                          <SelectItem value="clear">More direct</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </AiChatComposerToolbarGroup>
                  <AiChatComposerSubmit
                    disabled={!selection || pending}
                    aria-label="Suggest revision"
                  />
                </AiChatComposerToolbar>
              </AiChatComposer>
              <p className="text-muted-foreground mt-2 text-center text-[10px]">
                Demo suggestions · review before applying
              </p>
            </div>
          </div>
        }
      />
    </AiWorkspaceShell>
  );
}
