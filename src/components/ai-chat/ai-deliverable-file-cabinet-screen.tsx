"use client";

import {
  ArrowLeft,
  ArrowUpDown,
  Download,
  ExternalLink,
  FileJson,
  Files,
  FileText,
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
  Search,
  Table2,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { AiCodingWorkspace } from "@/components/ai-chat/ai-coding-workspace";
import { AiDeliverableConversation } from "@/components/ai-chat/ai-deliverable-conversation";
import {
  deliverableBytes,
  type DeliverableFile,
  deliverableFiles,
  deliverableMimeTypes,
  deliverableSessions,
  filterDeliverables,
  formatDeliverableBytes,
} from "@/components/ai-chat/ai-deliverable-data";
import { AiDeliverablePreview } from "@/components/ai-chat/ai-deliverable-preview";
import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const fileIcons = {
  markdown: FileText,
  text: FileText,
  json: FileJson,
  csv: Table2,
};
export function downloadDeliverable(file: DeliverableFile) {
  const url = URL.createObjectURL(
    new Blob([file.content], { type: deliverableMimeTypes[file.format] }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function AiDeliverableFileCabinetScreen() {
  const [query, setQuery] = React.useState("");
  const [kind, setKind] = React.useState("all");
  const [origin, setOrigin] = React.useState("all");
  const [sort, setSort] = React.useState("newest");
  const [sessionId, setSessionId] = React.useState("launch-kit");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [panelOpen, setPanelOpen] = React.useState(true);
  const [resetKey, setResetKey] = React.useState(0);
  const rowButtons = React.useRef(new Map<string, HTMLButtonElement>());
  const file = deliverableFiles.find((item) => item.id === selectedId);
  const session = deliverableSessions.find((item) => item.id === sessionId)!;
  const matches = filterDeliverables(
    deliverableFiles,
    query,
    kind,
    origin,
    sort,
  );
  function backToFiles() {
    const id = selectedId;
    setSelectedId(null);
    requestAnimationFrame(() => {
      if (id) rowButtons.current.get(id)?.focus();
    });
  }
  const panel = (
    <section className="@container/cabinet flex min-h-0 min-w-0 flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-3">
        {file ? (
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Back to files"
              onClick={backToFiles}
            >
              <ArrowLeft />
            </Button>
            <span className="truncate text-[13px] font-medium">
              {file.name}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-1">
            <Files className="text-muted-foreground size-4" />
            <h2 className="text-sm font-medium">Files</h2>
            <Badge variant="secondary">{deliverableFiles.length}</Badge>
          </div>
        )}
        <div className="flex shrink-0 items-center gap-1">
          {file ? (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Open file in new tab"
                asChild
              >
                <Link
                  href={`/ai-deliverables/${file.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Download ${file.name}`}
                onClick={() => downloadDeliverable(file)}
              >
                <Download />
              </Button>
            </>
          ) : (
            <Select value={origin} onValueChange={setOrigin}>
              <SelectTrigger
                aria-label="Filter by conversation"
                className="h-8 w-44 border-0 bg-transparent shadow-none"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All conversations</SelectItem>
                  {deliverableSessions.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.title}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Close file cabinet"
            onClick={() => setPanelOpen(false)}
          >
            <PanelRightClose />
          </Button>
        </div>
      </header>
      {file ? (
        <>
          <ScrollArea className="bg-muted/30 min-h-0 min-w-0 flex-1 [&>[data-slot=scroll-area-viewport]>div]:!block">
            <div className="flex flex-col gap-4 p-4 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">
                  {file.format.toUpperCase()} ·{" "}
                  {formatDeliverableBytes(deliverableBytes(file))} · Today,{" "}
                  {file.displayTime}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSessionId(file.sessionId)}
                >
                  <MessageSquare data-icon="inline-start" />
                  Source conversation
                </Button>
              </div>
              <article className="bg-background mx-auto w-full max-w-3xl rounded-xl border p-6 sm:p-8">
                <AiDeliverablePreview file={file} />
              </article>
              <p className="text-muted-foreground text-xs">
                From “
                {
                  deliverableSessions.find(
                    (item) => item.id === file.sessionId,
                  )!.title
                }
                ”
              </p>
            </div>
          </ScrollArea>
        </>
      ) : (
        <>
          <div className="flex shrink-0 items-center gap-2 border-b px-4 py-3">
            <InputGroup className="min-w-0 flex-1">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Search deliverables"
                placeholder="Search files…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </InputGroup>
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger aria-label="Filter file type" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Sort files">
                  <ArrowUpDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
                  <DropdownMenuRadioItem value="newest">
                    Newest first
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name">
                    Name A–Z
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <ScrollArea className="min-h-0 min-w-0 flex-1 [&>[data-slot=scroll-area-viewport]>div]:!block">
            <div className="px-4 py-4">
              <p
                className="text-muted-foreground mb-3 text-xs"
                aria-live="polite"
              >
                {matches.length} {matches.length === 1 ? "file" : "files"} ·{" "}
                {sort === "name" ? "Name A–Z" : "Newest first"}
              </p>
              {matches.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File</TableHead>
                      <TableHead className="hidden text-right @[580px]/cabinet:table-cell">
                        Created
                      </TableHead>
                      <TableHead className="hidden text-right @[480px]/cabinet:table-cell">
                        Size
                      </TableHead>
                      <TableHead className="w-9">
                        <span className="sr-only">Download</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matches.map((item) => {
                      const Icon = fileIcons[item.format];
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="py-3">
                            <button
                              type="button"
                              ref={(node) => {
                                if (node) rowButtons.current.set(item.id, node);
                                else rowButtons.current.delete(item.id);
                              }}
                              onClick={() => setSelectedId(item.id)}
                              className="focus-visible:ring-ring flex w-full min-w-0 items-center gap-3 rounded-sm text-left outline-none focus-visible:ring-2"
                            >
                              <span className="bg-muted/60 text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg border">
                                <Icon className="size-4" />
                              </span>
                              <span className="flex min-w-0 flex-col gap-1">
                                <span className="truncate text-[13px] font-medium">
                                  {item.name}
                                </span>
                                <span className="text-muted-foreground truncate text-[11px]">
                                  {
                                    deliverableSessions.find(
                                      (source) => source.id === item.sessionId,
                                    )!.title
                                  }
                                </span>
                              </span>
                            </button>
                          </TableCell>
                          <TableCell className="text-muted-foreground hidden text-right text-xs whitespace-nowrap @[580px]/cabinet:table-cell">
                            {item.displayTime}
                          </TableCell>
                          <TableCell className="text-muted-foreground hidden text-right text-xs whitespace-nowrap @[480px]/cabinet:table-cell">
                            {formatDeliverableBytes(deliverableBytes(item))}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Download ${item.name}`}
                              onClick={() => downloadDeliverable(item)}
                            >
                              <Download />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Search />
                    </EmptyMedia>
                    <EmptyTitle>No matching files</EmptyTitle>
                    <EmptyDescription>
                      Try another search or clear the filters to see all
                      deliverables.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setQuery("");
                        setKind("all");
                        setOrigin("all");
                      }}
                    >
                      Clear filters
                    </Button>
                  </EmptyContent>
                </Empty>
              )}
            </div>
          </ScrollArea>
          <div className="text-muted-foreground shrink-0 border-t px-4 py-3 text-xs">
            Files generated in 2 conversations · Local demo
          </div>
        </>
      )}
    </section>
  );
  return (
    <AiWorkspaceShell
      headerTitle="Deliverables"
      hideNavigationSidebar
      headerActions={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPanelOpen((value) => !value)}
          >
            <PanelRightOpen data-icon="inline-start" />
            {panelOpen ? "Hide files" : "Open files"}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Reset deliverables demo"
            onClick={() => {
              setQuery("");
              setKind("all");
              setOrigin("all");
              setSort("newest");
              setSelectedId(null);
              setSessionId("launch-kit");
              setResetKey((value) => value + 1);
              setPanelOpen(true);
            }}
          >
            <RotateCcw />
          </Button>
        </>
      }
    >
      <AiCodingWorkspace
        defaultPanelWidthPercent={62}
        codePanelOpen={panelOpen}
        onCodePanelOpenChange={setPanelOpen}
        panelTitle="Deliverable file cabinet"
        codePanel={panel}
        chat={
          <AiDeliverableConversation
            key={`${sessionId}-${resetKey}`}
            session={session}
            selectedId={selectedId}
            onOpenFiles={() => {
              setSelectedId(null);
              setOrigin(sessionId);
              setKind("all");
              setQuery("");
              setPanelOpen(true);
            }}
          />
        }
      />
    </AiWorkspaceShell>
  );
}
