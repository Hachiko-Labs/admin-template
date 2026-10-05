"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleCheck,
  ClipboardCheck,
  Download,
  FileText,
  MapPin,
  Package,
  RefreshCw,
  ShieldCheck,
  Truck,
  Undo2,
} from "lucide-react";
import * as React from "react";

import { AiApplicationIcon } from "@/components/ai-chat/ai-application-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import {
  applyOrderProposal,
  commerceOrders,
  createOrderProposal,
  initialOrderRecords,
  isOrderRecords,
  type OrderProposal,
  type OrderTransaction,
  undoOrderProposal,
} from "./ai-commerce-copilot-data";
import { downloadReviewJson, useReviewState } from "./ai-review-utils";
import { AiWorkspaceShell } from "./ai-workspace-shell";

const dollars = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );

export function AiCommerceCopilotScreen() {
  const saved = useReviewState(
    "ai-commerce-copilot-v1",
    initialOrderRecords,
    isOrderRecords,
  );
  const [orderId, setOrderId] = React.useState("1048");
  const [proposals, setProposals] = React.useState<
    Record<string, OrderProposal>
  >({});
  const [undo, setUndo] = React.useState<
    Record<string, OrderTransaction | undefined>
  >({});
  const [notice, setNotice] = React.useState("");
  const [policyOpen, setPolicyOpen] = React.useState(false);
  const [evidenceSelected, setEvidenceSelected] = React.useState(false);
  const timeline = React.useRef<HTMLElement>(null);
  const order = commerceOrders.find((o) => o.id === orderId)!;
  const record = saved.value[orderId];
  const proposal = proposals[orderId] ?? createOrderProposal(order, record);
  const stale = proposal.baseRevision !== record.revision;
  const selectedCount =
    Number(proposal.includeNote) +
    Number(proposal.includeReply) +
    Number(proposal.includePriority);
  const total = order.items.reduce(
    (sum, item) => sum + item.quantity * item.cents,
    0,
  );

  function updateProposal(patch: Partial<OrderProposal>) {
    setProposals((all) => ({ ...all, [orderId]: { ...proposal, ...patch } }));
  }
  function apply() {
    try {
      const result = applyOrderProposal(record, proposal);
      saved.setValue((all) => ({ ...all, [orderId]: result.record }));
      setProposals((all) => ({
        ...all,
        [orderId]: createOrderProposal(order, result.record),
      }));
      setUndo((all) => ({ ...all, [orderId]: result.transaction }));
      setNotice(
        `${selectedCount} ${selectedCount === 1 ? "change" : "changes"} applied to order #${orderId}. No customer message was sent.`,
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Could not apply these changes.",
      );
    }
  }
  function undoLast() {
    const transaction = undo[orderId];
    if (!transaction) return;
    try {
      const restored = undoOrderProposal(record, transaction);
      saved.setValue((all) => ({ ...all, [orderId]: restored }));
      setUndo((all) => ({ ...all, [orderId]: undefined }));
      setNotice(`Last reviewed change undone for order #${orderId}.`);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Could not undo this change.",
      );
    }
  }

  return (
    <AiWorkspaceShell
      headerIcon={<AiApplicationIcon app="commerce" />}
      hideNavigationSidebar
      headerTitle="Commerce / Order workspace"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto xl:overflow-hidden">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-5 py-3 md:px-7">
          <div className="flex flex-wrap gap-1" aria-label="Select order">
            {commerceOrders.map((o) => (
              <Button
                key={o.id}
                size="sm"
                variant={o.id === orderId ? "secondary" : "ghost"}
                aria-pressed={o.id === orderId}
                onClick={() => {
                  setOrderId(o.id);
                  setNotice("");
                  setEvidenceSelected(false);
                }}
                className="text-xs"
              >
                <span className="font-mono">#{o.id}</span>
                <span className="hidden sm:inline">{o.customer}</span>
              </Button>
            ))}
          </div>
          <span className="text-muted-foreground text-[11px]">
            Sample orders · local changes only
          </span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col xl:flex-row">
          <div className="min-w-0 flex-1 xl:overflow-y-auto">
            <div className="mx-auto max-w-[940px] space-y-7 p-5 md:p-7">
              <header>
                <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  Orders <ChevronRight className="size-3" /> Order detail
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Order #{order.id}
                  </h1>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-normal",
                      order.status === "Delivered"
                        ? "border-emerald-600/20 text-emerald-700 dark:text-emerald-400"
                        : "border-amber-600/20 text-amber-700 dark:text-amber-400",
                    )}
                  >
                    {order.status}
                  </Badge>
                  <Badge
                    variant="secondary"
                    data-testid="order-priority"
                    className="font-normal"
                  >
                    {record.priority} priority
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-2 text-xs">
                  Placed {order.placed} · Online store · Paid
                </p>
              </header>
              <section
                className="flex items-start gap-3 rounded-xl border p-4"
                aria-label="Order exception"
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                    order.status === "Delivered"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-400",
                  )}
                >
                  <Truck className="size-4" />
                </span>
                <div>
                  <h2 className="text-sm font-medium">
                    {order.events[0].title}
                  </h2>
                  <p className="text-muted-foreground mt-1 text-[13px] leading-6">
                    {order.events[0].detail}
                  </p>
                </div>
              </section>
              <section
                className="overflow-hidden rounded-xl border"
                aria-label="Order items"
              >
                <div className="flex items-center justify-between border-b px-5 py-3">
                  <h2 className="text-sm font-medium">Items</h2>
                  <span className="text-muted-foreground text-xs">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                    units
                  </span>
                </div>
                {order.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 border-b px-5 py-4 last:border-b-0"
                  >
                    <div className="bg-muted flex size-12 shrink-0 items-center justify-center rounded-lg">
                      <Package
                        className="text-muted-foreground size-5"
                        strokeWidth={1.5}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {item.variant} · Qty {item.quantity}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm tabular-nums">
                      {dollars(item.quantity * item.cents)}
                    </span>
                  </div>
                ))}
                <div className="bg-muted/25 flex justify-between border-t px-5 py-3 text-sm">
                  <span>Total paid</span>
                  <span className="font-semibold tabular-nums">
                    {dollars(total)}
                  </span>
                </div>
              </section>
              <section
                className="grid gap-5 sm:grid-cols-2"
                aria-label="Customer and delivery"
              >
                <div>
                  <h2 className="mb-3 text-sm font-medium">Customer</h2>
                  <div className="flex items-center gap-3">
                    <span className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                      {order.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium">
                        {order.customer}
                      </p>
                      <p className="text-muted-foreground mt-0.5 truncate text-xs">
                        {order.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="mb-3 text-sm font-medium">
                    Delivery destination
                  </h2>
                  <p className="flex items-center gap-2 text-[13px]">
                    <MapPin className="text-muted-foreground size-4" />
                    {order.location}
                  </p>
                  <p className="text-muted-foreground mt-2 text-xs">
                    {order.status === "Address check"
                      ? "Apartment or suite number needs confirmation"
                      : "Address verified in the sample record"}
                  </p>
                </div>
              </section>
              <section
                ref={timeline}
                tabIndex={-1}
                className={cn(
                  "scroll-m-5 rounded-xl border p-5 transition-shadow outline-none",
                  evidenceSelected && "ring-2 ring-blue-500/30",
                )}
                aria-label="Shipment evidence"
              >
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-sm font-medium">Shipment timeline</h2>
                  <Badge variant="outline" className="text-[10px] font-normal">
                    Source S1
                  </Badge>
                </div>
                <div>
                  {order.events.map((event, index) => (
                    <div
                      key={event.id}
                      className="relative flex gap-3 pb-5 last:pb-0"
                    >
                      {index < order.events.length - 1 ? (
                        <div className="bg-border absolute top-4 bottom-0 left-[7px] w-px" />
                      ) : null}
                      <span
                        className={cn(
                          "bg-background relative mt-1 size-4 shrink-0 rounded-full border",
                          index === 0 && "border-foreground/50",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute inset-1 rounded-full",
                            index === 0
                              ? "bg-foreground"
                              : "bg-muted-foreground/40",
                          )}
                        />
                      </span>
                      <div>
                        <p className="text-[13px] font-medium">{event.title}</p>
                        <p className="text-muted-foreground mt-1 text-xs leading-5">
                          {event.detail}
                        </p>
                        <p className="text-muted-foreground mt-1.5 text-[10px]">
                          {event.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section aria-label="Internal order notes">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-medium">
                    Internal notes{" "}
                    <span
                      className="text-muted-foreground ml-1 font-normal"
                      data-testid="note-count"
                    >
                      {record.notes.length}
                    </span>
                  </h2>
                  <span className="text-muted-foreground text-[10px]">
                    Not visible to the customer
                  </span>
                </div>
                <div className="space-y-3">
                  {record.notes.map((note) => (
                    <div key={note.id} className="rounded-lg border p-4">
                      <p className="text-muted-foreground mb-2 text-[11px]">
                        {note.author}
                      </p>
                      <p className="text-[13px] leading-6 break-words whitespace-pre-wrap">
                        {note.text}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
              {record.replyDraft ? (
                <section
                  className="rounded-xl border p-5"
                  aria-label="Saved customer reply"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-medium">Saved reply draft</h2>
                    <Badge variant="secondary" className="font-normal">
                      Not sent
                    </Badge>
                  </div>
                  <p className="text-[13px] leading-6 break-words whitespace-pre-wrap">
                    {record.replyDraft}
                  </p>
                </section>
              ) : null}
            </div>
          </div>
          <aside
            className="bg-muted/15 flex w-full shrink-0 flex-col border-t xl:w-[400px] xl:overflow-y-auto xl:border-t-0 xl:border-l"
            aria-label="Embedded commerce copilot"
          >
            <div className="bg-background flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="size-4" />
                <h2 className="text-sm font-semibold">Order copilot</h2>
              </div>
              <span className="text-muted-foreground text-[10px]">
                Grounded sample analysis
              </span>
            </div>
            <div className="space-y-5 p-5">
              <div className="bg-background flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs">
                <span className="size-1.5 rounded-full bg-emerald-600" />
                <span className="text-muted-foreground">Working with</span>
                <span className="font-medium" data-testid="copilot-context">
                  Order #{order.id}
                </span>
                <span className="text-muted-foreground ml-auto font-mono text-[10px]">
                  rev {record.revision}
                </span>
              </div>
              <div>
                <p className="text-sm leading-6">{order.finding}</p>
                <p className="text-muted-foreground mt-3 text-[13px] leading-6">
                  {order.recommendation}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-background h-7 text-[11px]"
                    onClick={() => {
                      setEvidenceSelected(true);
                      timeline.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                      timeline.current?.focus({ preventScroll: true });
                    }}
                  >
                    <ArrowDownLeft />
                    Shipment events{" "}
                    <span className="text-muted-foreground">S1</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-background h-7 text-[11px]"
                    onClick={() => setPolicyOpen(true)}
                  >
                    <FileText />
                    Support policy{" "}
                    <span className="text-muted-foreground">P1</span>
                  </Button>
                </div>
              </div>
              <div className="bg-background overflow-hidden rounded-xl border shadow-xs">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <h3 className="text-xs font-semibold">Proposed changes</h3>
                  <span className="text-muted-foreground text-[10px]">
                    {selectedCount} selected
                  </span>
                </div>
                <div className="space-y-5 p-4">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-xs font-medium">
                      <Checkbox
                        aria-label="Include internal note"
                        checked={proposal.includeNote}
                        onCheckedChange={(checked) =>
                          updateProposal({ includeNote: checked === true })
                        }
                      />
                      Add internal note
                    </label>
                    <Textarea
                      aria-label="Proposed internal note"
                      value={proposal.note}
                      maxLength={4000}
                      onChange={(e) => updateProposal({ note: e.target.value })}
                      className="min-h-28 resize-y text-xs leading-5"
                    />
                  </div>
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-xs font-medium">
                      <Checkbox
                        aria-label="Include customer reply draft"
                        checked={proposal.includeReply}
                        onCheckedChange={(checked) =>
                          updateProposal({ includeReply: checked === true })
                        }
                      />
                      Save reply draft
                      <span className="text-muted-foreground ml-auto text-[10px] font-normal">
                        Does not send
                      </span>
                    </label>
                    <Textarea
                      aria-label="Proposed customer reply"
                      value={proposal.replyDraft}
                      maxLength={6000}
                      onChange={(e) =>
                        updateProposal({ replyDraft: e.target.value })
                      }
                      className="min-h-36 resize-y text-xs leading-5"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-xs font-medium">
                      <Checkbox
                        aria-label="Include priority change"
                        checked={proposal.includePriority}
                        onCheckedChange={(checked) =>
                          updateProposal({ includePriority: checked === true })
                        }
                      />
                      Set priority
                    </label>
                    <select
                      aria-label="Proposed order priority"
                      value={proposal.priority}
                      onChange={(e) =>
                        updateProposal({
                          priority:
                            e.target.value === "High" ? "High" : "Normal",
                        })
                      }
                      className="bg-background rounded-md border px-2 py-1.5 text-xs"
                    >
                      <option>Normal</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>
                <div className="border-t p-4">
                  {stale ? (
                    <div>
                      <p className="mb-3 flex items-center gap-2 text-xs">
                        <CircleCheck className="size-4 text-emerald-600" />
                        The order has changed since this review.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full"
                        size="sm"
                        onClick={() => {
                          setProposals((all) => ({
                            ...all,
                            [orderId]: createOrderProposal(order, record),
                          }));
                          setNotice(
                            "Proposal refreshed from the current order record.",
                          );
                        }}
                      >
                        <RefreshCw />
                        Prepare a fresh proposal
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      size="sm"
                      disabled={
                        !saved.ready ||
                        selectedCount === 0 ||
                        (proposal.includeNote && !proposal.note.trim()) ||
                        (proposal.includeReply && !proposal.replyDraft.trim())
                      }
                      onClick={apply}
                    >
                      <Check />
                      Apply {selectedCount} reviewed{" "}
                      {selectedCount === 1 ? "change" : "changes"}
                    </Button>
                  )}
                  {undo[orderId] ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-2 w-full text-xs"
                      onClick={undoLast}
                    >
                      <Undo2 />
                      Undo last change
                    </Button>
                  ) : null}
                </div>
              </div>
              <div className="text-muted-foreground flex items-start gap-2 text-[11px] leading-5">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
                <p>
                  Review every field before applying. Changes are stored in this
                  browser; no orders, shipments or messages are changed in an
                  external system.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="px-0 text-xs"
                onClick={() => {
                  downloadReviewJson(`order-${order.id}-review.json`, {
                    order,
                    record,
                    source: "Authored commerce demo",
                    externalActions: false,
                  });
                  setNotice(
                    `Order #${order.id} exported with its current notes and draft.`,
                  );
                }}
              >
                <Download />
                Export this order
                <ArrowUpRight className="ml-1" />
              </Button>
            </div>
            {saved.storageError || notice ? (
              <p
                role="status"
                className="text-muted-foreground px-5 py-3 text-xs"
              >
                {saved.storageError || notice}
              </p>
            ) : null}
          </aside>
        </div>
      </div>
      <Sheet open={policyOpen} onOpenChange={setPolicyOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Customer update policy</SheetTitle>
            <SheetDescription>
              Source P1 · Authored sample policy · Applies to order #{order.id}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-5 px-6 pb-6 text-sm leading-7">
            <section>
              <h3 className="font-semibold">Shipping exceptions</h3>
              <p className="text-muted-foreground mt-1">
                Acknowledge a carrier delay and flag the order for follow-up. Do
                not promise a replacement delivery date until the carrier has
                confirmed it.
              </p>
            </section>
            <section>
              <h3 className="font-semibold">Incomplete addresses</h3>
              <p className="text-muted-foreground mt-1">
                Request confirmation from the customer. Do not infer an
                apartment number, purchase a label or release the shipment
                before confirmation.
              </p>
            </section>
            <section>
              <h3 className="font-semibold">Delivery scans</h3>
              <p className="text-muted-foreground mt-1">
                Describe the carrier’s scan accurately. A delivery scan is not
                proof that the named customer personally received the package.
              </p>
            </section>
            <section className="rounded-lg border p-4">
              <h3 className="font-semibold">Human review boundary</h3>
              <p className="text-muted-foreground mt-1">
                Saving a draft is not sending it. In this showcase, all changes
                are local and reversible.
              </p>
            </section>
          </div>
        </SheetContent>
      </Sheet>
    </AiWorkspaceShell>
  );
}
