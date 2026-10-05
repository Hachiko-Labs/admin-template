import { z } from "zod";
export interface CommerceOrder {
  id: string;
  customer: string;
  email: string;
  initials: string;
  location: string;
  placed: string;
  status: "Delayed" | "Address check" | "Delivered";
  items: { name: string; variant: string; quantity: number; cents: number }[];
  events: { id: string; date: string; title: string; detail: string }[];
  finding: string;
  recommendation: string;
}
export interface OrderNote {
  id: string;
  text: string;
  author: string;
}
export interface OrderRecord {
  id: string;
  revision: number;
  priority: "Normal" | "High";
  notes: OrderNote[];
  replyDraft: string;
}
export type OrderRecords = Record<string, OrderRecord>;
export interface OrderProposal {
  orderId: string;
  baseRevision: number;
  note: string;
  replyDraft: string;
  priority: "Normal" | "High";
  includeNote: boolean;
  includeReply: boolean;
  includePriority: boolean;
}
export interface OrderTransaction {
  before: OrderRecord;
  afterRevision: number;
}

export const commerceOrders: CommerceOrder[] = [
  {
    id: "1048",
    customer: "Maya Chen",
    email: "maya.chen@example.com",
    initials: "MC",
    location: "Portland, OR",
    placed: "September 3, 2026",
    status: "Delayed",
    items: [
      {
        name: "Everyday carry tote",
        variant: "Canvas / Natural",
        quantity: 1,
        cents: 6800,
      },
      {
        name: "Field notebook",
        variant: "A5 / Slate",
        quantity: 2,
        cents: 1200,
      },
    ],
    events: [
      {
        id: "1048-1",
        date: "Sep 7 · 09:12",
        title: "Delivery exception",
        detail:
          "Carrier reports a sorting delay. A revised delivery date has not been confirmed.",
      },
      {
        id: "1048-2",
        date: "Sep 5 · 16:40",
        title: "Departed fulfillment center",
        detail:
          "Two items packed in one shipment. Tracking reference: DEMO-1048.",
      },
      {
        id: "1048-3",
        date: "Sep 3 · 11:24",
        title: "Order confirmed",
        detail: "Payment received. Original estimated delivery: September 6.",
      },
    ],
    finding:
      "The shipment missed its original estimate and has a carrier exception. There is no confirmed replacement delivery date.",
    recommendation:
      "Flag the order for follow-up and prepare an update that acknowledges the delay without promising a delivery date.",
  },
  {
    id: "1052",
    customer: "Alex Morgan",
    email: "alex.morgan@example.com",
    initials: "AM",
    location: "Austin, TX",
    placed: "September 5, 2026",
    status: "Address check",
    items: [
      {
        name: "Desk organizer",
        variant: "Walnut / Large",
        quantity: 1,
        cents: 8900,
      },
    ],
    events: [
      {
        id: "1052-1",
        date: "Sep 7 · 08:05",
        title: "Address needs confirmation",
        detail:
          "The shipping address is missing an apartment or suite number. No label has been purchased.",
      },
      {
        id: "1052-2",
        date: "Sep 5 · 14:18",
        title: "Payment received",
        detail:
          "The order is packed and awaiting address confirmation before handoff.",
      },
    ],
    finding:
      "This order is ready to ship, but the address is incomplete. Asking the customer to confirm it is safer than guessing a missing field.",
    recommendation:
      "Prepare an address-confirmation reply and leave an internal note. Do not change the address or buy a label yet.",
  },
  {
    id: "1039",
    customer: "Sam Rivera",
    email: "sam.rivera@example.com",
    initials: "SR",
    location: "Denver, CO",
    placed: "September 1, 2026",
    status: "Delivered",
    items: [
      {
        name: "Travel flask",
        variant: "750 ml / Forest",
        quantity: 1,
        cents: 4200,
      },
      {
        name: "Carry sleeve",
        variant: "Recycled felt",
        quantity: 1,
        cents: 1800,
      },
    ],
    events: [
      {
        id: "1039-1",
        date: "Sep 6 · 13:26",
        title: "Delivered",
        detail: "Carrier marked the shipment delivered at the front desk.",
      },
      {
        id: "1039-2",
        date: "Sep 3 · 10:11",
        title: "In transit",
        detail:
          "Package collected by the carrier. Tracking reference: DEMO-1039.",
      },
    ],
    finding:
      "The carrier reports a completed delivery. There is no open shipping exception in this sample record.",
    recommendation:
      "Keep the order at normal priority. A follow-up draft can cite the delivery scan without claiming the customer personally received it.",
  },
];
export const initialOrderRecords: OrderRecords = Object.fromEntries(
  commerceOrders.map((order) => [
    order.id,
    {
      id: order.id,
      revision: 0,
      priority: "Normal",
      replyDraft: "",
      notes: [
        {
          id: `${order.id}-initial`,
          author: "Operations",
          text:
            order.status === "Delayed"
              ? "Customer requested an update when a revised estimate is available."
              : order.status === "Address check"
                ? "Hold shipment until the customer confirms the complete address."
                : "No support request is open for this order.",
        },
      ],
    },
  ]),
);

export function createOrderProposal(
  order: CommerceOrder,
  record: OrderRecord,
): OrderProposal {
  const first = order.customer.split(" ")[0];
  const body =
    order.status === "Delayed"
      ? `Hi ${first}, your order #${order.id} has encountered a carrier sorting delay. The original delivery estimate has passed, and a revised date has not yet been confirmed. We’re sorry for the delay. We will share a new estimate once it is confirmed.`
      : order.status === "Address check"
        ? `Hi ${first}, your order #${order.id} is packed and ready. Before we ship it, could you confirm the complete delivery address, including your apartment or suite number? We have not purchased a shipping label yet.`
        : `Hi ${first}, the carrier marked order #${order.id} delivered to the front desk on September 6. Please check there first and let us know if you need help locating the package.`;
  return {
    orderId: order.id,
    baseRevision: record.revision,
    note: `${order.finding} ${order.recommendation}`,
    replyDraft: body,
    priority: order.status === "Delayed" ? "High" : "Normal",
    includeNote: true,
    includeReply: true,
    includePriority: order.status === "Delayed" && record.priority !== "High",
  };
}
export function applyOrderProposal(
  record: OrderRecord,
  proposal: OrderProposal,
) {
  if (record.id !== proposal.orderId)
    throw new Error("This proposal belongs to a different order.");
  if (record.revision !== proposal.baseRevision)
    throw new Error(
      "The order changed after this proposal was prepared. Refresh the proposal before applying it.",
    );
  if (
    !proposal.includeNote &&
    !proposal.includeReply &&
    !proposal.includePriority
  )
    throw new Error("Select at least one change to apply.");
  if (
    proposal.includeNote &&
    (!proposal.note.trim() ||
      proposal.note.length > 4000 ||
      record.notes.length >= 500)
  )
    throw new Error(
      "Add a note under 4,000 characters. A record can hold up to 500 notes.",
    );
  if (
    proposal.includeReply &&
    (!proposal.replyDraft.trim() || proposal.replyDraft.length > 6000)
  )
    throw new Error("The reply draft must contain 1–6,000 characters.");
  if (proposal.priority !== "Normal" && proposal.priority !== "High")
    throw new Error("Choose a valid priority.");
  const next: OrderRecord = {
    ...record,
    revision: record.revision + 1,
    notes: proposal.includeNote
      ? [
          ...record.notes,
          {
            id: `${record.id}-review-${record.revision + 1}`,
            author: "You · reviewed proposal",
            text: proposal.note.trim(),
          },
        ]
      : record.notes,
    replyDraft: proposal.includeReply
      ? proposal.replyDraft.trim()
      : record.replyDraft,
    priority: proposal.includePriority ? proposal.priority : record.priority,
  };
  return {
    record: next,
    transaction: { before: record, afterRevision: next.revision },
  };
}
export function undoOrderProposal(
  record: OrderRecord,
  transaction: OrderTransaction,
): OrderRecord {
  if (
    record.id !== transaction.before.id ||
    record.revision !== transaction.afterRevision
  )
    throw new Error("A newer change exists. Undo would overwrite it.");
  return { ...transaction.before, revision: record.revision + 1 };
}
const orderRecordsSchema = z
  .record(
    z.string(),
    z.object({
      id: z.string(),
      revision: z.number().nonnegative().refine(Number.isSafeInteger),
      priority: z.enum(["Normal", "High"]),
      replyDraft: z.string().max(6000),
      notes: z
        .array(
          z.object({
            id: z.string(),
            author: z.string(),
            text: z.string().max(4000),
          }),
        )
        .max(500),
    }),
  )
  .refine(
    (records) =>
      Object.keys(records).length === commerceOrders.length &&
      commerceOrders.every((order) => records[order.id]?.id === order.id),
  );
export function isOrderRecords(value: unknown): value is OrderRecords {
  return orderRecordsSchema.safeParse(value).success;
}
