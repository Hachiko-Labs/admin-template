import type { CSSProperties } from "react";

import { Skeleton } from "@/components/ui/skeleton";

type AiLoadingPattern =
  | "pricing"
  | "analytics-inspector"
  | "artifact-review"
  | "prompt-editor"
  | "automation-form"
  | "chat-split-terminal"
  | "file-cabinet"
  | "agent-detail"
  | "filter-table"
  | "composer-1"
  | "composer-2"
  | "composer-3"
  | "composer-4"
  | "composer-5"
  | "composer-6"
  | "composer-7"
  | "document-writing"
  | "commerce"
  | "incident-detail"
  | "review"
  | "tokenizer"
  | "inspection"
  | "article"
  | "chat"
  | "chat-artifact"
  | "chat-terminal"
  | "chat-queue"
  | "catalog"
  | "metrics-table"
  | "analytics"
  | "timeline"
  | "workflow-timeline"
  | "board"
  | "settings"
  | "form-preview"
  | "canvas"
  | "document-compare"
  | "document-chat"
  | "knowledge"
  | "workflow"
  | "profile"
  | "model-detail"
  | "audio"
  | "mobile"
  | "matrix"
  | "billing"
  | "skills"
  | "cards";

function Bar({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return <Skeleton className={className} style={style} />;
}

function TopBar({ actions = true }: { actions?: boolean }) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between px-4 shadow-[inset_0_-1px_0_var(--border)] md:h-[var(--ai-workspace-header-height,3.5rem)]">
      <Bar className="h-4 w-36" />
      {actions && <Bar className="h-7 w-28 rounded-md" />}
    </div>
  );
}

function FormFields({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="space-y-2">
          <Bar className="h-3 w-24" />
          <Bar className="h-9 w-full rounded-md" />
        </div>
      ))}
    </div>
  );
}

function Table({ columns = 6, rows = 8 }: { columns?: number; rows?: number }) {
  return (
    <div
      className="min-w-0 overflow-hidden rounded-lg border"
      data-loading-shape="table"
    >
      <div
        className="bg-muted/40 grid h-10 items-center gap-3 px-3"
        style={{ gridTemplateColumns: `repeat(${columns},minmax(0,1fr))` }}
      >
        {Array.from({ length: columns }, (_, index) => (
          <Bar key={index} className="h-3 w-3/5" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div
          key={row}
          className="grid h-12 items-center gap-3 border-t px-3"
          style={{ gridTemplateColumns: `repeat(${columns},minmax(0,1fr))` }}
        >
          {Array.from({ length: columns }, (_, column) => (
            <Bar
              key={column}
              className={column === 0 ? "h-4 w-4/5" : "h-3 w-3/5"}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function Metrics() {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      data-loading-shape="metrics"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="space-y-3 rounded-lg border p-4">
          <Bar className="h-3 w-24" />
          <Bar className="h-7 w-28" />
          <Bar className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

function Chart() {
  return (
    <div
      className="flex min-h-56 flex-col rounded-lg border p-4"
      data-loading-shape="chart"
    >
      <Bar className="h-4 w-28" />
      <Bar className="mt-2 h-6 w-20" />
      <div className="mt-auto flex h-24 items-end gap-2 border-b border-dashed pb-2">
        {[45, 65, 55, 80, 70, 95, 68, 88].map((height, index) => (
          <Bar
            key={index}
            className="w-full rounded-t-sm"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function ThreadSidebar() {
  return (
    <aside
      className="hidden w-56 shrink-0 flex-col gap-3 border-r p-3 md:flex"
      data-loading-shape="thread-sidebar"
    >
      <Bar className="h-8 w-36" />
      <Bar className="h-8 w-full rounded-md" />
      <Bar className="h-8 w-4/5" />
      <Bar className="mt-4 h-3 w-24" />
      {Array.from({ length: 8 }, (_, i) => (
        <Bar key={i} className="h-6 w-full" />
      ))}
    </aside>
  );
}

function ComposerDock({
  command = false,
  rail = false,
}: {
  command?: boolean;
  rail?: boolean;
} = {}) {
  return (
    <div
      className="mt-auto overflow-hidden rounded-xl border"
      data-loading-shape="composer-dock"
    >
      <div className="p-4">
        <Bar className={command ? "h-4 w-1/2" : "h-4 w-2/3"} />
        <Bar className="mt-3 h-4 w-1/3" />
      </div>
      <div className="flex items-center gap-3 px-4 pb-3">
        <Bar className="size-7 rounded-full" />
        <Bar className="h-7 w-20 rounded-md" />
        <Bar className="ml-auto size-8 rounded-full" />
      </div>
      {rail ? (
        <div className="flex h-10 items-center gap-2 border-t px-4">
          <Bar className="h-3 w-36" />
          <div className="ml-auto flex gap-1">
            {Array.from({ length: 4 }, (_, i) => (
              <Bar key={i} className="size-5 rounded-md" />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ComposerHeading({
  align = "center",
  subtitle = true,
}: {
  align?: "center" | "left";
  subtitle?: boolean;
}) {
  return (
    <div
      className={
        align === "center"
          ? "flex flex-col items-center gap-2 text-center"
          : "flex flex-col items-start gap-3"
      }
      data-loading-shape="composer-heading"
    >
      <Bar className="size-7 rounded-lg" />
      <Bar className="h-7 w-64 max-w-[70vw]" />
      {subtitle ? <Bar className="h-3 w-80 max-w-[80vw]" /> : null}
    </div>
  );
}

function ComposerShortcutRow({ count = 4 }: { count?: number }) {
  return (
    <div
      className="flex gap-2 overflow-hidden"
      data-loading-shape="composer-shortcuts"
    >
      {Array.from({ length: count }, (_, i) => (
        <Bar
          key={i}
          className="h-9 shrink-0 rounded-xl"
          style={{ width: `${112 + (i % 3) * 18}px` }}
        />
      ))}
    </div>
  );
}

function ComposerCards({
  bordered = false,
  count = 3,
}: {
  bordered?: boolean;
  count?: number;
}) {
  return (
    <div
      className={
        bordered ? "grid border-y sm:grid-cols-3" : "grid gap-4 sm:grid-cols-3"
      }
      data-loading-shape="composer-cards"
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={
            bordered
              ? `flex min-h-44 flex-col gap-3 px-5 py-6 ${
                  i > 0 ? "border-t sm:border-t-0 sm:border-l" : ""
                }`
              : "flex min-h-36 flex-col gap-3 rounded-2xl border p-5"
          }
        >
          <Bar className="size-5 rounded-md" />
          <Bar className="mt-auto h-4 w-28" />
          <Bar className="h-3 w-full" />
          <Bar className="h-3 w-3/4" />
          {bordered ? <Bar className="mt-2 h-8 w-20 rounded-md" /> : null}
        </div>
      ))}
    </div>
  );
}

function ChatThread({
  artifact,
}: {
  artifact?: "card" | "terminal" | "queue";
}) {
  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-5 overflow-hidden p-5">
      <Bar className="ml-auto h-16 w-2/3 rounded-xl" />
      <div className="flex items-center gap-2">
        <Bar className="size-7 rounded-full" />
        <Bar className="h-4 w-28" />
      </div>
      <Bar className="h-3 w-4/5" />
      <Bar className="h-3 w-3/5" />
      {artifact === "card" && (
        <div className="space-y-3 rounded-lg border p-4">
          <Bar className="h-4 w-32" />
          <Bar className="h-3 w-full" />
          <Bar className="h-3 w-5/6" />
          <Bar className="h-24 w-full rounded-md" />
        </div>
      )}
      {artifact === "terminal" && (
        <div className="h-52 space-y-3 rounded-lg bg-zinc-900 p-4">
          <Bar className="h-3 w-3/4 bg-zinc-700" />
          <Bar className="h-3 w-2/3 bg-zinc-700" />
          <Bar className="h-3 w-4/5 bg-zinc-700" />
          <Bar className="h-3 w-1/2 bg-zinc-700" />
        </div>
      )}
      {artifact === "queue" && (
        <div className="space-y-3 rounded-lg border p-4">
          <Bar className="h-4 w-32" />
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 border-t pt-3">
              <Bar className="size-4 rounded-full" />
              <Bar className="h-3 w-4/5" />
            </div>
          ))}
        </div>
      )}
      <ComposerDock />
    </div>
  );
}

function PageHeader() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2">
        <Bar className="h-7 w-48" />
        <Bar className="h-3 w-72 max-w-full" />
      </div>
      <Bar className="h-9 w-28 rounded-md" />
    </div>
  );
}

function Canvas({ dots = false }: { dots?: boolean }) {
  return (
    <div
      className={`min-h-0 flex-1 ${dots ? "bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-[size:16px_16px]" : "bg-muted/10"}`}
      data-loading-shape="canvas"
    />
  );
}

function Inspector() {
  return (
    <aside
      className="hidden w-60 shrink-0 space-y-4 border-l p-4 lg:block"
      data-loading-shape="inspector"
    >
      <Bar className="h-5 w-28" />
      <Bar className="h-3 w-full" />
      <FormFields rows={5} />
    </aside>
  );
}

function EditorToolbar() {
  return (
    <div className="flex h-10 items-center gap-3 border-b px-3">
      <Bar className="h-4 w-20" />
      {Array.from({ length: 6 }, (_, i) => (
        <Bar key={i} className="size-6 rounded-md" />
      ))}
      <Bar className="ml-auto h-7 w-20 rounded-md" />
    </div>
  );
}

function LoadingBody({ pattern }: { pattern: AiLoadingPattern }) {
  switch (pattern) {
    case "agent-detail":
      return (
        <>
          <TopBar />
          <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="space-y-4 border-r p-4">
              <Bar className="size-12 rounded-lg" />
              <Bar className="h-6 w-36" />
              <Bar className="h-3 w-48" />
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="space-y-2 rounded-lg border p-3">
                  <Bar className="h-4 w-32" />
                  <Bar className="h-3 w-full" />
                  <Bar className="h-3 w-3/4" />
                </div>
              ))}
            </div>
            <div className="space-y-4 overflow-auto p-5">
              <div className="flex gap-5 border-b pb-3">
                {Array.from({ length: 4 }, (_, i) => (
                  <Bar key={i} className="h-4 w-20" />
                ))}
              </div>
              <Bar className="h-8 w-64" />
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="flex items-center gap-4 border-b py-3">
                  <Bar className="h-3 w-12" />
                  <Bar className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          </div>
        </>
      );
    case "filter-table":
      return (
        <>
          <TopBar />
          <div className="flex min-h-0 flex-1">
            <aside className="hidden w-52 shrink-0 space-y-4 border-r p-4 md:block">
              <Bar className="h-5 w-20" />
              <FormFields rows={5} />
            </aside>
            <div className="min-w-0 flex-1 space-y-4 overflow-auto p-4">
              <div className="flex gap-3">
                <Bar className="h-9 w-64 rounded-md" />
                <Bar className="h-9 w-28 rounded-md" />
              </div>
              <Bar className="h-14 w-full" />
              <Table columns={7} rows={10} />
            </div>
          </div>
        </>
      );
    case "composer-1":
      return (
        <div className="flex min-h-0 flex-1">
          <ThreadSidebar />
          <div className="flex min-w-0 flex-1 items-center justify-center px-6">
            <div className="w-full max-w-[720px] space-y-7">
              <ComposerHeading />
              <ComposerDock />
            </div>
          </div>
        </div>
      );
    case "composer-2":
      return (
        <div className="flex min-h-0 flex-1">
          <ThreadSidebar />
          <div className="flex min-w-0 flex-1 items-center justify-center px-6">
            <div className="w-full max-w-[720px] space-y-7">
              <ComposerHeading />
              <div className="bg-muted/30 space-y-2 rounded-2xl border p-2">
                <div className="grid gap-2 sm:grid-cols-3">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div
                      key={i}
                      className="bg-background flex items-center gap-2 rounded-lg border p-2"
                    >
                      <Bar className="size-8 shrink-0 rounded-md" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Bar className="h-3 w-4/5" />
                        <Bar className="h-2 w-3/5" />
                      </div>
                    </div>
                  ))}
                </div>
                <ComposerDock />
              </div>
            </div>
          </div>
        </div>
      );
    case "composer-3":
      return (
        <div className="flex min-h-0 flex-1">
          <ThreadSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="mx-auto flex w-full max-w-[760px] flex-1 flex-col justify-center gap-5 px-6 py-8">
              <ComposerHeading />
              <ComposerDock />
              <ComposerCards />
            </div>
          </div>
        </div>
      );
    case "composer-4":
      return (
        <div className="flex min-h-0 flex-1">
          <ThreadSidebar />
          <div className="min-w-0 flex-1 overflow-auto px-6 py-10">
            <div className="mx-auto w-full max-w-4xl space-y-10">
              <div className="max-w-[720px] space-y-6">
                <ComposerHeading align="left" subtitle={false} />
                <ComposerDock rail />
              </div>
              <ComposerCards bordered />
              <div className="space-y-4">
                <Bar className="h-6 w-36" />
                <div className="grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 2 }, (_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border p-4"
                    >
                      <Bar className="size-9 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Bar className="h-4 w-32" />
                        <Bar className="h-3 w-4/5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    case "composer-5":
      return (
        <div className="flex min-h-0 flex-1">
          <ThreadSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar />
            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-5 px-6 py-8">
              <ComposerHeading />
              <ComposerShortcutRow />
              <ComposerDock rail />
            </div>
          </div>
        </div>
      );
    case "composer-6":
      return (
        <div className="bg-muted/30 flex min-h-0 flex-1">
          <div className="hidden lg:flex">
            <ThreadSidebar />
          </div>
          <div className="flex min-w-0 flex-1 flex-col p-2">
            <div className="flex h-10 items-end gap-2 px-2">
              <Bar className="h-8 w-32 rounded-t-lg" />
              <Bar className="h-8 w-28 rounded-t-lg" />
              <Bar className="size-7 rounded-md" />
            </div>
            <div className="bg-background flex min-h-0 flex-1 flex-col rounded-xl border">
              <div className="mx-auto flex w-full max-w-[760px] flex-1 flex-col justify-center gap-6 px-6 py-8">
                <ComposerHeading />
                <ComposerDock />
                <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="flex items-center gap-3 py-2">
                      <Bar className="size-6 rounded-md" />
                      <Bar className="h-3 flex-1" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    case "composer-7":
      return (
        <div className="flex min-h-0 flex-1">
          <ThreadSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar />
            <div className="mx-auto flex w-full max-w-[760px] flex-1 flex-col px-6 py-8">
              <div className="flex flex-1 flex-col items-center justify-center gap-6">
                <ComposerHeading />
                <ComposerShortcutRow count={3} />
              </div>
              <ComposerDock command />
            </div>
          </div>
        </div>
      );
    case "document-writing":
      return (
        <>
          <TopBar />
          <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[240px_minmax(0,1fr)]">
            <div className="flex flex-col space-y-4 border-r p-4">
              <Bar className="h-5 w-36" />
              <Bar className="ml-auto h-16 w-4/5 rounded-lg" />
              <Bar className="h-3 w-full" />
              <Bar className="h-3 w-4/5" />
              <Bar className="h-20 w-full rounded-lg" />
              <ComposerDock />
            </div>
            <div className="flex min-w-0 flex-col">
              <EditorToolbar />
              <div className="bg-muted/20 flex-1 overflow-auto p-5">
                <div className="bg-background mx-auto min-h-full max-w-2xl space-y-5 border p-8">
                  <Bar className="h-7 w-44" />
                  {Array.from({ length: 12 }, (_, i) => (
                    <Bar
                      key={i}
                      className={i % 3 === 0 ? "h-3 w-2/3" : "h-3 w-full"}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      );
    case "commerce":
      return (
        <>
          <TopBar />
          <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-5 overflow-auto p-5">
              <Bar className="h-8 w-40" />
              <div className="space-y-3 rounded-lg border p-5">
                <Bar className="h-5 w-40" />
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="flex justify-between border-b py-3">
                    <Bar className="h-4 w-36" />
                    <Bar className="h-4 w-20" />
                  </div>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-4 rounded-lg border p-4">
                  <FormFields rows={3} />
                </div>
                <div className="space-y-4 rounded-lg border p-4">
                  <FormFields rows={3} />
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-4 border-l p-4">
              <Bar className="h-5 w-32" />
              <Bar className="h-20 w-full rounded-lg" />
              <Bar className="h-24 w-full rounded-lg" />
              <ComposerDock />
            </div>
          </div>
        </>
      );
    case "incident-detail":
      return (
        <>
          <TopBar />
          <div className="space-y-5 overflow-auto p-5">
            <PageHeader />
            <div className="flex gap-4 border-b pb-3">
              <Bar className="h-4 w-20" />
              <Bar className="h-4 w-20" />
              <Bar className="h-4 w-20" />
            </div>
            <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div className="space-y-4 rounded-lg border p-4">
                <FormFields rows={5} />
              </div>
              <div className="space-y-4">
                <Chart />
                <Metrics />
              </div>
            </div>
          </div>
        </>
      );
    case "review":
      return (
        <>
          <TopBar />
          <div className="grid min-h-0 flex-1 gap-3 overflow-hidden p-4 lg:grid-cols-[180px_minmax(0,1fr)_220px]">
            <aside className="space-y-3 border-r pr-3">
              <Bar className="h-6 w-28" />
              {Array.from({ length: 8 }, (_, i) => (
                <Bar key={i} className="h-9 w-full" />
              ))}
            </aside>
            <div className="space-y-4 overflow-auto rounded-lg border p-5">
              <Bar className="h-6 w-40" />
              {Array.from({ length: 9 }, (_, i) => (
                <Bar
                  key={i}
                  className={i % 3 === 0 ? "h-5 w-3/4" : "h-3 w-full"}
                />
              ))}
            </div>
            <aside className="space-y-4 border-l pl-3">
              <Bar className="h-6 w-28" />
              <FormFields rows={4} />
            </aside>
          </div>
        </>
      );
    case "tokenizer":
      return (
        <>
          <TopBar />
          <div className="space-y-5 overflow-auto p-5">
            <PageHeader />
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="space-y-3 rounded-lg border p-4">
                  <Bar className="h-3 w-24" />
                  <Bar className="h-7 w-14" />
                </div>
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3 rounded-lg border p-4">
                <Bar className="h-4 w-20" />
                <Bar className="h-64 w-full rounded-md" />
              </div>
              <div className="space-y-3 rounded-lg border p-4">
                <Bar className="h-4 w-28" />
                <Bar className="h-64 w-full rounded-md" />
              </div>
            </div>
          </div>
        </>
      );
    case "inspection":
      return (
        <>
          <TopBar />
          <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_240px]">
            <div className="bg-muted/20 p-5">
              <div className="bg-background h-full w-full space-y-4 rounded-lg border p-5">
                <Bar className="h-8 w-2/3" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Bar className="h-40 w-full rounded-md" />
                  <Bar className="h-40 w-full rounded-md" />
                </div>
                <Bar className="h-24 w-full rounded-md" />
              </div>
            </div>
            <div className="space-y-4 border-l p-4">
              <Bar className="h-6 w-32" />
              <FormFields rows={5} />
            </div>
          </div>
        </>
      );
    case "article":
      return (
        <>
          <TopBar />
          <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_220px]">
            <article className="mx-auto w-full max-w-3xl space-y-5 overflow-auto p-6">
              <Bar className="h-9 w-3/4" />
              <Bar className="h-4 w-2/3" />
              {Array.from({ length: 12 }, (_, i) => (
                <Bar
                  key={i}
                  className={i % 4 === 0 ? "h-6 w-3/5" : "h-3 w-full"}
                />
              ))}
            </article>
            <aside className="space-y-3 border-l p-4">
              <Bar className="h-5 w-28" />
              {Array.from({ length: 4 }, (_, i) => (
                <Bar key={i} className="aspect-video w-full rounded-md" />
              ))}
            </aside>
          </div>
        </>
      );
    case "chat-split-terminal":
      return (
        <>
          <TopBar />
          <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="flex min-w-0 flex-col border-r">
              <ChatThread artifact="card" />
            </div>
            <div className="flex min-h-0 flex-col bg-zinc-950 p-4">
              <div className="flex gap-3 border-b border-zinc-700 pb-3">
                <Bar className="h-4 w-20 bg-zinc-700" />
                <Bar className="h-4 w-16 bg-zinc-700" />
              </div>
              <div className="space-y-3 pt-5">
                {Array.from({ length: 16 }, (_, i) => (
                  <Bar
                    key={i}
                    className={`h-3 bg-zinc-700 ${i % 3 === 0 ? "w-1/3" : i % 3 === 1 ? "w-4/5" : "w-3/5"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      );
    case "file-cabinet":
      return (
        <>
          <TopBar />
          <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[240px_minmax(0,1fr)]">
            <div className="flex flex-col space-y-4 border-r p-4">
              <Bar className="h-5 w-32" />
              <Bar className="ml-auto h-16 w-4/5 rounded-lg" />
              <Bar className="h-3 w-full" />
              <Bar className="h-3 w-4/5" />
              <ComposerDock />
            </div>
            <div className="min-w-0 space-y-4 overflow-auto p-4">
              <div className="flex gap-3">
                <Bar className="h-9 w-64 rounded-md" />
                <Bar className="h-9 w-28 rounded-md" />
              </div>
              <Table columns={4} rows={10} />
            </div>
          </div>
        </>
      );
    case "pricing":
      return (
        <>
          <TopBar />
          <div className="space-y-5 overflow-auto p-5">
            <PageHeader />
            <div className="space-y-3 rounded-lg border p-4">
              <Bar className="h-4 w-36" />
              <Bar className="h-3 w-full rounded-full" />
              <div className="flex justify-between">
                <Bar className="h-3 w-24" />
                <Bar className="h-3 w-20" />
              </div>
            </div>
            <div className="flex gap-3">
              <Bar className="h-9 w-64 rounded-md" />
              <Bar className="h-9 w-28 rounded-md" />
            </div>
            <Table columns={4} rows={8} />
          </div>
        </>
      );
    case "analytics-inspector":
      return (
        <>
          <TopBar />
          <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_250px]">
            <div className="space-y-4 overflow-auto p-5">
              <PageHeader />
              <Chart />
              <Table columns={6} rows={8} />
            </div>
            <Inspector />
          </div>
        </>
      );
    case "artifact-review":
      return (
        <>
          <TopBar />
          <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[240px_minmax(0,1fr)]">
            <div className="flex flex-col space-y-4 border-r p-4">
              <Bar className="h-5 w-32" />
              <Bar className="ml-auto h-14 w-4/5 rounded-lg" />
              <Bar className="h-3 w-full" />
              <Bar className="h-3 w-4/5" />
              <ComposerDock />
            </div>
            <div className="min-w-0 space-y-4 overflow-auto p-4">
              <div className="flex gap-3">
                <Bar className="h-7 w-20 rounded-md" />
                <Bar className="h-7 w-20 rounded-md" />
              </div>
              <div className="grid min-h-96 gap-4 lg:grid-cols-2">
                {Array.from({ length: 2 }, (_, panel) => (
                  <div key={panel} className="space-y-4 rounded-lg border p-4">
                    <Bar className="h-5 w-32" />
                    {Array.from({ length: 12 }, (_, i) => (
                      <Bar
                        key={i}
                        className={i % 3 === 0 ? "h-4 w-2/3" : "h-3 w-full"}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      );
    case "prompt-editor":
      return (
        <>
          <TopBar />
          <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[180px_minmax(0,1fr)_250px]">
            <aside className="hidden space-y-3 border-r p-4 lg:block">
              <Bar className="h-5 w-24" />
              {Array.from({ length: 7 }, (_, i) => (
                <Bar key={i} className="h-8 w-full" />
              ))}
            </aside>
            <div className="space-y-4 overflow-auto p-4">
              <Bar className="h-6 w-40" />
              <Bar className="h-9 w-full rounded-md" />
              <Bar className="h-52 w-full rounded-lg" />
              <Bar className="h-28 w-full rounded-lg" />
            </div>
            <aside className="space-y-4 border-l p-4">
              <Bar className="h-5 w-28" />
              <FormFields rows={4} />
            </aside>
          </div>
        </>
      );
    case "automation-form":
      return (
        <>
          <TopBar />
          <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[220px_minmax(0,1fr)]">
            <aside className="hidden space-y-3 border-r p-4 lg:block">
              <Bar className="h-5 w-28" />
              {Array.from({ length: 7 }, (_, i) => (
                <Bar key={i} className="h-8 w-full" />
              ))}
            </aside>
            <div className="mx-auto w-full max-w-3xl space-y-5 overflow-auto p-6">
              <PageHeader />
              <FormFields rows={3} />
              <div className="space-y-4 rounded-lg border p-4">
                <Bar className="h-5 w-28" />
                <Bar className="h-24 w-full rounded-md" />
              </div>
              <Bar className="h-9 w-32 rounded-md" />
            </div>
          </div>
        </>
      );
    case "chat":
    case "chat-artifact":
    case "chat-terminal":
    case "chat-queue":
      return (
        <div className="flex min-h-0 flex-1">
          <ThreadSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar />
            <ChatThread
              artifact={
                pattern === "chat-artifact"
                  ? "card"
                  : pattern === "chat-terminal"
                    ? "terminal"
                    : pattern === "chat-queue"
                      ? "queue"
                      : undefined
              }
            />
          </div>
        </div>
      );
    case "catalog":
      return (
        <>
          <TopBar />
          <div className="space-y-5 overflow-auto p-5">
            <PageHeader />
            <div className="flex gap-3">
              <Bar className="h-9 w-64 rounded-md" />
              <Bar className="h-9 w-28 rounded-md" />
              <Bar className="h-9 w-28 rounded-md" />
            </div>
            <Table rows={9} />
          </div>
        </>
      );
    case "metrics-table":
      return (
        <>
          <TopBar />
          <div className="space-y-5 overflow-auto p-5">
            <PageHeader />
            <Metrics />
            <Table rows={7} />
          </div>
        </>
      );
    case "analytics":
      return (
        <>
          <TopBar />
          <div className="space-y-5 overflow-auto p-5">
            <PageHeader />
            <div className="grid gap-4 lg:grid-cols-2">
              <Chart />
              <Chart />
            </div>
            <Table rows={5} />
          </div>
        </>
      );
    case "timeline":
      return (
        <>
          <TopBar />
          <div className="mx-auto w-full max-w-4xl space-y-5 overflow-auto p-5">
            <PageHeader />
            <Bar className="h-9 w-64 rounded-md" />
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="flex gap-4 border-b pb-4">
                <Bar className="size-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Bar className="h-4 w-3/5" />
                  <Bar className="h-3 w-full" />
                  <Bar className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </>
      );
    case "workflow-timeline":
      return (
        <>
          <TopBar />
          <div className="space-y-5 overflow-auto p-5">
            <PageHeader />
            <div className="grid grid-cols-[220px_minmax(0,1fr)] overflow-hidden rounded-lg border">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="contents">
                  <div className="flex h-12 items-center border-r border-b px-3">
                    <Bar className="h-4 w-4/5" />
                  </div>
                  <div className="flex items-center border-b px-3">
                    <Bar
                      className="h-3 rounded-sm"
                      style={{ width: `${30 + i * 7}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      );
    case "board":
      return (
        <>
          <TopBar />
          <div className="space-y-4 overflow-auto p-5">
            <PageHeader />
            <div className="grid gap-4 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="bg-muted/30 space-y-3 rounded-lg p-3">
                  <Bar className="h-5 w-32" />
                  {Array.from({ length: 3 }, (_, j) => (
                    <div
                      key={j}
                      className="bg-background space-y-3 rounded-lg border p-4"
                    >
                      <Bar className="h-4 w-4/5" />
                      <Bar className="h-3 w-full" />
                      <Bar className="h-3 w-2/3" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      );
    case "settings":
      return (
        <>
          <TopBar />
          <div className="space-y-5 overflow-auto p-5">
            <PageHeader />
            <div className="grid gap-5 md:grid-cols-[180px_minmax(0,1fr)]">
              <div className="space-y-3">
                {Array.from({ length: 7 }, (_, i) => (
                  <Bar key={i} className="h-8 w-full rounded-md" />
                ))}
              </div>
              <div className="max-w-2xl space-y-5 rounded-lg border p-5">
                <Bar className="h-5 w-36" />
                <FormFields rows={5} />
              </div>
            </div>
          </div>
        </>
      );
    case "form-preview":
      return (
        <>
          <TopBar />
          <div className="grid min-h-0 flex-1 gap-4 overflow-hidden p-5 lg:grid-cols-2">
            <div className="space-y-5 rounded-lg border p-5">
              <Bar className="h-6 w-40" />
              <FormFields rows={6} />
            </div>
            <div className="space-y-5 rounded-lg border p-5">
              <Bar className="h-5 w-28" />
              <Bar className="h-32 w-full rounded-md" />
              <FormFields rows={3} />
            </div>
          </div>
        </>
      );
    case "canvas":
      return (
        <>
          <TopBar />
          <EditorToolbar />
          <Canvas dots />
        </>
      );
    case "document-compare":
      return (
        <>
          <TopBar />
          <EditorToolbar />
          <div className="bg-muted/20 grid min-h-0 flex-1 gap-4 overflow-hidden p-5 lg:grid-cols-2">
            {Array.from({ length: 2 }, (_, panel) => (
              <div
                key={panel}
                className="bg-background space-y-5 overflow-hidden rounded-lg border p-6"
              >
                <Bar className="h-6 w-40" />
                {Array.from({ length: 11 }, (_, i) => (
                  <Bar
                    key={i}
                    className={i % 4 === 0 ? "h-4 w-2/3" : "h-3 w-full"}
                  />
                ))}
              </div>
            ))}
          </div>
        </>
      );
    case "document-chat":
      return (
        <>
          <TopBar />
          <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-2">
            <div className="flex flex-col border-r p-5">
              <Bar className="ml-auto h-14 w-3/4 rounded-lg" />
              <Bar className="mt-6 h-3 w-full" />
              <Bar className="mt-3 h-3 w-4/5" />
              <ComposerDock />
            </div>
            <div className="bg-muted/20 overflow-auto p-6">
              <div className="bg-background mx-auto min-h-full max-w-md space-y-5 border p-6">
                <Bar className="h-6 w-40" />
                {Array.from({ length: 9 }, (_, i) => (
                  <Bar key={i} className="h-3 w-full" />
                ))}
              </div>
            </div>
          </div>
        </>
      );
    case "knowledge":
      return (
        <>
          <TopBar />
          <div className="grid min-h-0 flex-1 lg:grid-cols-[200px_minmax(0,1fr)_220px]">
            <div className="space-y-3 border-r p-3">
              <Bar className="h-8 w-full" />
              {Array.from({ length: 8 }, (_, i) => (
                <Bar key={i} className="h-10 w-full" />
              ))}
            </div>
            <div className="space-y-5 overflow-auto p-6">
              <Bar className="h-7 w-48" />
              {Array.from({ length: 11 }, (_, i) => (
                <Bar
                  key={i}
                  className={i % 3 === 0 ? "h-4 w-2/3" : "h-3 w-full"}
                />
              ))}
            </div>
            <Inspector />
          </div>
        </>
      );
    case "workflow":
      return (
        <>
          <TopBar />
          <div className="grid min-h-0 flex-1 lg:grid-cols-[240px_minmax(0,1fr)_220px]">
            <div className="flex flex-col space-y-4 border-r p-4">
              <Bar className="h-5 w-28" />
              <Bar className="h-24 w-full rounded-lg" />
              <Bar className="h-3 w-full" />
              <ComposerDock />
            </div>
            <Canvas />
            <Inspector />
          </div>
        </>
      );
    case "profile":
      return (
        <>
          <TopBar />
          <div className="mx-auto w-full max-w-3xl space-y-5 overflow-auto p-6 text-center">
            <Bar className="mx-auto size-20 rounded-full" />
            <Bar className="mx-auto h-7 w-40" />
            <Bar className="mx-auto h-4 w-60" />
            <Metrics />
            <Chart />
          </div>
        </>
      );
    case "model-detail":
      return (
        <>
          <TopBar />
          <div className="grid min-h-0 flex-1 gap-5 overflow-auto p-5 lg:grid-cols-[minmax(0,2fr)_220px]">
            <div className="space-y-5">
              <PageHeader />
              <div className="grid gap-3 sm:grid-cols-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <Bar key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
              <div className="rounded-lg border p-4">
                <FormFields rows={4} />
              </div>
            </div>
            <div className="space-y-4 rounded-lg border p-4">
              <Bar className="h-5 w-28" />
              <FormFields rows={5} />
            </div>
          </div>
        </>
      );
    case "audio":
      return (
        <>
          <TopBar />
          <div className="space-y-5 overflow-auto p-5">
            <PageHeader />
            <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
              <div className="space-y-4 rounded-lg border p-4">
                <FormFields rows={5} />
              </div>
              <div className="space-y-5">
                <Bar className="h-28 w-full rounded-lg" />
                <div className="flex h-24 items-center gap-1 rounded-lg border p-4">
                  {Array.from({ length: 40 }, (_, i) => (
                    <Bar
                      key={i}
                      className="w-full"
                      style={{ height: `${20 + ((i * 17) % 70)}%` }}
                    />
                  ))}
                </div>
                <Bar className="h-36 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </>
      );
    case "mobile":
      return (
        <>
          <TopBar />
          <div className="grid min-h-0 flex-1 lg:grid-cols-[240px_minmax(0,1fr)_300px]">
            <div className="space-y-5 border-r p-4">
              <Bar className="h-4 w-28" />
              <Bar className="h-20 w-full rounded-lg" />
              <ComposerDock />
            </div>
            <div className="space-y-3 border-r p-4">
              {Array.from({ length: 12 }, (_, i) => (
                <Bar
                  key={i}
                  className={i % 3 === 0 ? "h-3 w-1/2" : "h-3 w-4/5"}
                />
              ))}
            </div>
            <div className="flex justify-center p-5">
              <div className="h-full w-52 rounded-[32px] border-4 p-4">
                <Bar className="mx-auto h-4 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </>
      );
    case "matrix":
      return (
        <>
          <TopBar />
          <div className="space-y-5 overflow-auto p-5">
            <PageHeader />
            <Table columns={5} rows={8} />
          </div>
        </>
      );
    case "billing":
      return (
        <>
          <TopBar />
          <div className="space-y-5 overflow-auto p-5">
            <PageHeader />
            <div className="flex gap-3">
              <Bar className="h-8 w-20" />
              <Bar className="h-8 w-28" />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-5 rounded-lg border p-5">
                <Bar className="h-4 w-28" />
                <Bar className="h-8 w-36" />
                <Bar className="h-3 w-3/4" />
              </div>
              <div className="space-y-5 rounded-lg border p-5">
                <Bar className="h-4 w-36" />
                <FormFields rows={2} />
              </div>
            </div>
          </div>
        </>
      );
    case "skills":
      return (
        <>
          <TopBar />
          <div className="grid min-h-0 flex-1 lg:grid-cols-[240px_minmax(0,1fr)]">
            <div className="space-y-3 border-r p-4">
              <Bar className="h-9 w-full" />
              {Array.from({ length: 8 }, (_, i) => (
                <Bar key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
            <div className="space-y-5 overflow-auto p-6">
              <Bar className="h-7 w-40" />
              <Bar className="h-3 w-2/3" />
              <div className="rounded-lg border p-5">
                <FormFields rows={4} />
              </div>
            </div>
          </div>
        </>
      );
    case "cards":
      return (
        <>
          <TopBar />
          <div className="space-y-5 overflow-auto p-5">
            <PageHeader />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className="space-y-4 rounded-lg border p-4">
                  <Bar className="size-8 rounded-md" />
                  <Bar className="h-5 w-3/5" />
                  <Bar className="h-3 w-full" />
                  <Bar className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </>
      );
  }
}

export function AiPageLoading({
  title,
  pattern,
}: {
  title: string;
  pattern: AiLoadingPattern;
}) {
  return (
    <main
      aria-label={`Loading ${title.toLowerCase()}`}
      data-loading-pattern={pattern}
      className="bg-background flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
    >
      <LoadingBody pattern={pattern} />
    </main>
  );
}
