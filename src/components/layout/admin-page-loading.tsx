import type { CSSProperties, ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";

type LoadingVariant =
  | "table"
  | "table-metrics"
  | "table-split"
  | "card-grid"
  | "project-cards"
  | "person-cards"
  | "cards-split"
  | "master-detail"
  | "form-table"
  | "list-chart"
  | "product-grid"
  | "kanban"
  | "kanban-metrics"
  | "gantt"
  | "calendar-month"
  | "calendar-week"
  | "inbox-two"
  | "inbox-three"
  | "settings"
  | "settings-tabs"
  | "form"
  | "form-sidebar"
  | "form-rail"
  | "form-stepper"
  | "document-editor"
  | "detail"
  | "detail-split"
  | "detail-gallery"
  | "invoice-preview"
  | "dashboard-grid"
  | "dashboard-charts"
  | "dashboard-sidepanel"
  | "dashboard-metrics"
  | "dashboard-canvas"
  | "todo-list"
  | "todo-empty"
  | "activity"
  | "notifications"
  | "flow-canvas"
  | "accordion";

function Bar({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return <Skeleton className={className} style={style} />;
}

function Header({
  description = true,
  tabs = false,
  action = true,
}: {
  description?: boolean;
  tabs?: boolean;
  action?: boolean;
}) {
  return (
    <div className="border-b px-4 py-4 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Bar className="h-6 w-48 max-w-full" />
          {description && <Bar className="h-3 w-72 max-w-full" />}
        </div>
        {action && <Bar className="h-9 w-28 shrink-0 rounded-md" />}
      </div>
      {tabs && (
        <div className="mt-6 flex gap-5">
          <Bar className="h-4 w-20" />
          <Bar className="h-4 w-16" />
          <Bar className="h-4 w-14" />
        </div>
      )}
    </div>
  );
}

function Toolbar({ filters = 3 }: { filters?: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
      <Bar className="h-9 w-52 max-w-full rounded-md" />
      {Array.from({ length: filters }, (_, index) => (
        <Bar key={index} className="h-9 w-28 rounded-md" />
      ))}
      <Bar className="ml-auto hidden h-9 w-28 rounded-md sm:block" />
    </div>
  );
}

function Table({ rows = 8, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div
      className="min-w-0 overflow-hidden border-t"
      data-loading-shape="table"
    >
      <div
        className="bg-muted/30 grid h-11 items-center gap-3 px-4 sm:px-6"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }, (_, index) => (
          <Bar key={index} className="h-3 w-3/5" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div
          key={row}
          className="grid h-14 items-center gap-3 border-t px-4 sm:px-6"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
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

function Metrics({ count = 4 }: { count?: number }) {
  return (
    <div
      className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
      data-loading-shape="metrics"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="space-y-3 rounded-lg border p-4">
          <Bar className="h-3 w-24" />
          <Bar className="h-7 w-28" />
          <Bar className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

function Chart({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex min-h-48 flex-col rounded-lg border p-4 ${className}`}
      data-loading-shape="chart"
    >
      <Bar className="h-4 w-32" />
      <Bar className="mt-2 h-7 w-24" />
      <div className="mt-auto flex h-24 items-end gap-2 border-b border-dashed pb-2">
        {[48, 70, 56, 82, 65, 90, 72, 85].map((height, index) => (
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

function Cards({
  count = 6,
  media = false,
}: {
  count?: number;
  media?: boolean;
}) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      data-loading-shape={media ? "media-cards" : "cards"}
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border">
          {media && <Bar className="h-36 w-full rounded-none" />}
          <div className="space-y-3 p-4">
            <Bar className="h-5 w-3/5" />
            <Bar className="h-3 w-4/5" />
            <div className="flex justify-between pt-3">
              <Bar className="h-3 w-16" />
              <Bar className="h-3 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({ wide = false }: { wide?: boolean }) {
  return (
    <div className="space-y-2">
      <Bar className="h-3 w-24" />
      <Bar className={`h-10 rounded-md ${wide ? "w-full" : "w-4/5"}`} />
    </div>
  );
}

function Fields({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {Array.from({ length: count }, (_, index) => (
        <Field key={index} wide />
      ))}
    </div>
  );
}

function Split({
  sidebar,
  children,
}: {
  sidebar: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)]"
      data-loading-shape="split"
    >
      <div className="space-y-4 border-r p-4">{sidebar}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function FilterRail() {
  return (
    <>
      <Bar className="h-10 w-full rounded-md" />
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="space-y-2 border-b pb-4">
          <Bar className="h-4 w-28" />
          <Bar className="h-9 w-full rounded-md" />
        </div>
      ))}
    </>
  );
}

function LoadingBody({ variant }: { variant: LoadingVariant }) {
  switch (variant) {
    case "table":
      return (
        <>
          <Header tabs />
          <Toolbar />
          <Table />
        </>
      );
    case "table-metrics":
      return (
        <>
          <Header />
          <div className="p-4 sm:p-6">
            <Metrics />
          </div>
          <Toolbar />
          <Table />
        </>
      );
    case "table-split":
      return (
        <>
          <Header />
          <Split sidebar={<FilterRail />}>
            <Toolbar filters={1} />
            <Table columns={4} />
          </Split>
        </>
      );
    case "card-grid":
      return (
        <>
          <Header />
          <Toolbar />
          <div className="p-4 sm:p-6">
            <Cards />
          </div>
        </>
      );
    case "project-cards":
      return (
        <>
          <Header description={false} />
          <Toolbar />
          <div className="p-4 sm:p-6">
            <Cards media />
          </div>
        </>
      );
    case "person-cards":
      return (
        <>
          <Header />
          <Toolbar filters={1} />
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className="space-y-3 rounded-lg border p-4">
                <Bar className="size-10 rounded-full" />
                <Bar className="h-5 w-2/3" />
                <Bar className="h-3 w-1/2" />
                <div className="flex justify-between border-t pt-3">
                  <Bar className="h-3 w-20" />
                  <Bar className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </>
      );
    case "cards-split":
      return (
        <>
          <Header />
          <Split sidebar={<FilterRail />}>
            <div className="p-4">
              <Cards />
            </div>
          </Split>
        </>
      );
    case "master-detail":
      return (
        <>
          <Header description={false} />
          <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,2fr)_minmax(240px,1fr)]">
            <div className="min-w-0">
              <Toolbar filters={1} />
              <Table columns={4} />
            </div>
            <div className="space-y-5 border-l p-4">
              <Bar className="h-5 w-36" />
              <Bar className="h-3 w-4/5" />
              <Fields count={4} />
            </div>
          </div>
        </>
      );
    case "form-table":
      return (
        <>
          <Header />
          <div className="p-4 sm:p-6">
            <div className="rounded-lg border p-5">
              <Fields count={2} />
            </div>
          </div>
          <Toolbar filters={2} />
          <Table rows={5} />
        </>
      );
    case "list-chart":
      return (
        <>
          <Header />
          <div className="p-4 sm:p-6">
            <Chart className="min-h-64" />
          </div>
          <Toolbar filters={1} />
          <Table rows={5} />
        </>
      );
    case "product-grid":
      return (
        <>
          <Header />
          <div className="p-4 sm:p-6">
            <Metrics />
          </div>
          <Toolbar />
          <div className="p-4 sm:p-6">
            <Cards media />
          </div>
        </>
      );
    case "kanban":
      return (
        <>
          <Header description={false} />
          <Toolbar filters={1} />
          <div
            className="flex min-h-0 flex-1 gap-3 overflow-hidden p-4"
            data-loading-shape="kanban"
          >
            {Array.from({ length: 4 }, (_, column) => (
              <div
                key={column}
                className="bg-muted/40 min-w-44 flex-1 space-y-3 rounded-lg p-3"
              >
                <Bar className="h-5 w-24" />
                {Array.from({ length: 3 }, (_, card) => (
                  <div
                    key={card}
                    className="bg-background space-y-3 rounded-md border p-3"
                  >
                    <Bar className="h-4 w-4/5" />
                    <Bar className="h-3 w-2/3" />
                    <Bar className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      );
    case "kanban-metrics":
      return (
        <>
          <Header description={false} />
          <div className="p-4 sm:p-6">
            <Metrics />
          </div>
          <Toolbar filters={1} />
          <div
            className="flex min-h-0 flex-1 gap-3 overflow-hidden p-4"
            data-loading-shape="kanban"
          >
            {Array.from({ length: 4 }, (_, column) => (
              <div
                key={column}
                className="bg-muted/40 min-w-44 flex-1 space-y-3 rounded-lg p-3"
              >
                <Bar className="h-5 w-24" />
                {Array.from({ length: 3 }, (_, card) => (
                  <div
                    key={card}
                    className="bg-background space-y-3 rounded-md border p-3"
                  >
                    <Bar className="h-4 w-4/5" />
                    <Bar className="h-3 w-2/3" />
                    <Bar className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      );
    case "gantt":
      return (
        <>
          <Header description={false} />
          <Toolbar filters={2} />
          <div
            className="grid flex-1 grid-cols-[220px_minmax(0,1fr)] overflow-hidden border-t"
            data-loading-shape="gantt"
          >
            <div className="border-r">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="flex h-12 items-center border-b px-4">
                  <Bar className="h-3 w-4/5" />
                </div>
              ))}
            </div>
            <div className="relative bg-[linear-gradient(90deg,transparent_calc(100%-1px),var(--border)_0)] bg-[size:12.5%_100%]">
              {[2, 4, 1, 5, 3, 6].map((n, i) => (
                <Bar
                  key={i}
                  className="absolute h-5 rounded-sm"
                  style={{
                    top: `${i * 48 + 16}px`,
                    left: `${n * 9}%`,
                    width: `${20 + i * 3}%`,
                  }}
                />
              ))}
            </div>
          </div>
        </>
      );
    case "calendar-month":
    case "calendar-week":
      return (
        <>
          <Header description={false} />
          <Toolbar filters={2} />
          <div
            className="grid flex-1 grid-cols-7 overflow-hidden border-t"
            data-loading-shape={variant}
          >
            {Array.from(
              { length: variant === "calendar-month" ? 35 : 7 },
              (_, i) => (
                <div
                  key={i}
                  className="min-h-28 space-y-4 border-r border-b p-2"
                >
                  <Bar className="ml-auto h-3 w-5" />
                  {i % 4 === 0 && <Bar className="h-6 w-4/5 rounded-sm" />}
                </div>
              ),
            )}
          </div>
        </>
      );
    case "inbox-two":
    case "inbox-three":
      return (
        <div
          className={`grid min-h-0 flex-1 overflow-hidden ${variant === "inbox-three" ? "md:grid-cols-[220px_260px_minmax(0,1fr)]" : "md:grid-cols-[300px_minmax(0,1fr)]"}`}
          data-loading-shape={variant}
        >
          {variant === "inbox-three" && (
            <div className="space-y-4 border-r p-4">
              <Bar className="h-9 w-full" />
              {Array.from({ length: 6 }, (_, i) => (
                <Bar key={i} className="h-6 w-4/5" />
              ))}
            </div>
          )}
          <div className="space-y-3 border-r p-4">
            <Bar className="h-9 w-full" />
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="space-y-2 border-b pb-3">
                <Bar className="h-4 w-3/4" />
                <Bar className="h-3 w-full" />
                <Bar className="h-3 w-1/2" />
              </div>
            ))}
          </div>
          <div className="space-y-5 p-6">
            <Bar className="h-6 w-2/3" />
            <Bar className="h-3 w-1/3" />
            <Bar className="h-3 w-full" />
            <Bar className="h-3 w-5/6" />
            <Bar className="h-3 w-3/4" />
          </div>
        </div>
      );
    case "settings":
      return (
        <>
          <Header />
          <Split
            sidebar={Array.from({ length: 6 }, (_, i) => (
              <Bar key={i} className="h-8 w-4/5" />
            ))}
          >
            <div className="max-w-2xl space-y-6 p-5">
              <Bar className="h-5 w-32" />
              <Fields count={6} />
            </div>
          </Split>
        </>
      );
    case "settings-tabs":
      return (
        <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
          <Bar className="h-7 w-36" />
          <div className="flex gap-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Bar key={i} className="h-8 w-20" />
            ))}
          </div>
          <div className="space-y-6 rounded-lg border p-5">
            <Bar className="h-5 w-40" />
            <Fields count={6} />
          </div>
        </div>
      );
    case "form":
      return (
        <>
          <Header />
          <div className="max-w-5xl space-y-6 p-4 sm:p-6">
            <div className="rounded-lg border p-5">
              <Fields count={8} />
            </div>
          </div>
        </>
      );
    case "form-sidebar":
      return (
        <>
          <Header />
          <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,2fr)_minmax(240px,1fr)]">
            <div className="space-y-5 rounded-lg border p-5">
              <Bar className="h-5 w-36" />
              <Fields count={8} />
            </div>
            <div className="space-y-4 rounded-lg border p-5">
              <Bar className="h-5 w-32" />
              <Fields count={3} />
            </div>
          </div>
        </>
      );
    case "form-rail":
      return (
        <>
          <Header />
          <div className="grid min-h-0 flex-1 gap-5 p-4 sm:p-6 lg:grid-cols-[180px_minmax(0,1fr)]">
            <div className="space-y-3 rounded-lg border p-4">
              {Array.from({ length: 6 }, (_, i) => (
                <Bar key={i} className="h-8 w-full rounded-md" />
              ))}
            </div>
            <div className="space-y-5 rounded-lg border p-5">
              <Bar className="h-5 w-36" />
              <Bar className="h-3 w-2/3" />
              <Fields count={8} />
            </div>
          </div>
        </>
      );
    case "form-stepper":
      return (
        <>
          <Header />
          <div className="flex gap-3 border-b p-4 sm:px-6">
            {Array.from({ length: 3 }, (_, i) => (
              <Bar key={i} className="h-12 flex-1 rounded-lg" />
            ))}
          </div>
          <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)]">
            <div className="space-y-5 rounded-lg border p-5">
              <Bar className="h-5 w-44" />
              <Fields count={6} />
            </div>
            <div className="space-y-4 rounded-lg border p-5">
              <Bar className="h-5 w-28" />
              <Fields count={3} />
            </div>
          </div>
        </>
      );
    case "document-editor":
      return (
        <>
          <Header description={false} />
          <div
            className="grid min-h-0 flex-1 gap-0 border-t lg:grid-cols-2"
            data-loading-shape="document-editor"
          >
            <div className="space-y-5 border-r p-5">
              <Bar className="h-5 w-36" />
              <Fields count={8} />
            </div>
            <div className="bg-muted/20 p-6">
              <div className="bg-background mx-auto h-full max-w-xl space-y-6 border p-8">
                <Bar className="h-7 w-40" />
                <Bar className="h-3 w-2/3" />
                <div className="h-8" />
                <Table rows={4} columns={4} />
              </div>
            </div>
          </div>
        </>
      );
    case "detail":
      return (
        <>
          <Header tabs />
          <div className="space-y-5 p-4 sm:p-6">
            <Metrics count={4} />
            <div className="rounded-lg border p-5">
              <Bar className="h-5 w-36" />
              <div className="mt-5">
                <Fields count={6} />
              </div>
            </div>
          </div>
        </>
      );
    case "detail-split":
      return (
        <>
          <Header tabs />
          <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,2fr)_minmax(240px,1fr)]">
            <div className="space-y-5">
              <div className="rounded-lg border p-5">
                <Bar className="h-5 w-40" />
                <div className="mt-5">
                  <Fields count={4} />
                </div>
              </div>
              <Table rows={5} columns={4} />
            </div>
            <div className="space-y-4 rounded-lg border p-5">
              <Bar className="h-5 w-28" />
              <Fields count={4} />
            </div>
          </div>
        </>
      );
    case "detail-gallery":
      return (
        <>
          <Header tabs />
          <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)]">
            <div className="space-y-4">
              <Bar className="h-72 w-full rounded-lg" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <Bar key={i} className="size-16 rounded-md" />
                ))}
              </div>
            </div>
            <div className="space-y-4 rounded-lg border p-5">
              <Bar className="h-5 w-28" />
              <Fields count={4} />
            </div>
          </div>
        </>
      );
    case "invoice-preview":
      return (
        <>
          <Header tabs />
          <div className="bg-muted/20 grid min-h-0 flex-1 gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)]">
            <div className="bg-background space-y-5 border p-8">
              <Bar className="h-7 w-40" />
              <Bar className="h-3 w-2/3" />
              <div className="h-6" />
              <Table rows={5} columns={4} />
            </div>
            <div className="bg-background space-y-4 rounded-lg border p-5">
              <Bar className="h-5 w-24" />
              <Fields count={4} />
            </div>
          </div>
        </>
      );
    case "dashboard-grid":
      return (
        <div className="space-y-4 p-4 sm:p-6">
          <Metrics />
          <div className="grid gap-4 lg:grid-cols-2">
            <Chart />
            <Chart />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Chart />
            <Chart />
            <Chart />
          </div>
        </div>
      );
    case "dashboard-charts":
      return (
        <div className="space-y-4 p-4 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <Chart className="min-h-72" />
            <Chart className="min-h-72" />
          </div>
          <Metrics />
          <Table rows={4} />
        </div>
      );
    case "dashboard-sidepanel":
      return (
        <div className="grid min-h-0 flex-1 gap-4 p-4 sm:p-6 lg:grid-cols-[minmax(0,2fr)_minmax(240px,1fr)]">
          <div className="space-y-4">
            <Metrics count={4} />
            <Chart className="min-h-72" />
            <Table rows={4} />
          </div>
          <div className="space-y-4 rounded-lg border p-4">
            <Bar className="h-5 w-32" />
            <Bar className="h-36 w-full" />
            <Fields count={3} />
          </div>
        </div>
      );
    case "dashboard-metrics":
      return (
        <div className="space-y-4 p-4 sm:p-6">
          <Metrics />
          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)]">
            <Chart className="min-h-80" />
            <Chart className="min-h-80" />
          </div>
          <Table rows={4} />
        </div>
      );
    case "dashboard-canvas":
      return (
        <>
          <Header />
          <div
            className="bg-muted/10 min-h-0 flex-1"
            data-loading-shape="canvas"
          />
        </>
      );
    case "todo-list":
      return (
        <div className="mx-auto w-full max-w-3xl space-y-4 p-6">
          <Bar className="h-6 w-40" />
          <div className="flex gap-3">
            <Bar className="h-8 w-48" />
            <Bar className="h-8 w-20" />
          </div>
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="flex h-12 items-center gap-3 border-b">
              <Bar className="size-4 rounded-full" />
              <Bar className="h-4 w-2/3" />
              <Bar className="ml-auto h-3 w-14" />
            </div>
          ))}
        </div>
      );
    case "todo-empty":
      return (
        <div
          className="flex min-h-0 flex-1 flex-col items-center justify-start gap-4 pt-24"
          data-loading-shape="empty-state"
        >
          <Bar className="size-9 rounded-lg" />
          <Bar className="h-5 w-40" />
          <Bar className="h-3 w-56" />
          <Bar className="h-9 w-28 rounded-md" />
        </div>
      );
    case "activity":
    case "notifications":
      return (
        <div className="mx-auto w-full max-w-3xl space-y-5 p-6">
          <Bar className="h-6 w-40" />
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex gap-4 border-b pb-4">
              <Bar className="size-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Bar className="h-4 w-3/4" />
                <Bar className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      );
    case "flow-canvas":
      return (
        <>
          <Header tabs />
          <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="bg-muted/10 relative" data-loading-shape="canvas">
              <Bar className="absolute top-1/3 left-1/4 h-24 w-48 rounded-lg" />
              <Bar className="absolute top-1/2 left-1/2 h-24 w-48 rounded-lg" />
            </div>
            <div className="space-y-4 border-l p-4">
              <Bar className="h-5 w-32" />
              <Fields count={4} />
            </div>
          </div>
        </>
      );
    case "accordion":
      return (
        <>
          <Header description={false} />
          <div className="space-y-3 p-4 sm:p-6">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="rounded-md border">
                <div className="bg-muted/30 flex h-9 items-center gap-3 px-3">
                  <Bar className="h-4 w-24" />
                  <Bar className="h-3 w-10" />
                </div>
                {Array.from({ length: i % 2 === 0 ? 3 : 2 }, (_, j) => (
                  <div
                    key={j}
                    className="flex h-10 items-center gap-3 border-t px-3"
                  >
                    <Bar className="h-3 w-2/3" />
                    <Bar className="ml-auto h-3 w-16" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      );
  }
}

export function AdminPageLoading({
  title,
  variant,
}: {
  title: string;
  variant: LoadingVariant;
}) {
  return (
    <main
      aria-label={`Loading ${title.toLowerCase()}`}
      data-loading-pattern={variant}
      className="bg-background flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-auto"
    >
      <LoadingBody variant={variant} />
    </main>
  );
}
