import { z } from "zod";
export interface ReviewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface RegionNote {
  id: string;
  text: string;
}
export interface VisualRegion {
  id: string;
  title: string;
  box: ReviewBox;
  resolved: boolean;
  observation: string;
  severity?: RegionSeverity;
  notes: RegionNote[];
}

export type RegionSeverity = "action" | "polish" | "fine";

export const severityMeta: Record<RegionSeverity, { label: string }> = {
  action: { label: "Act now" },
  polish: { label: "Polish" },
  fine: { label: "Looks fine" },
};

export const initialVisualRegions: VisualRegion[] = [
  {
    id: "region-1",
    title: "Make order status actionable",
    box: { x: 3, y: 1, width: 56, height: 12 },
    resolved: false,
    observation: "",
    notes: [
      {
        id: "note-1",
        text: "Keep the record itself primary. The assistant should explain the exception, not replace the order details.",
      },
    ],
  },
  {
    id: "region-2",
    title: "Keep line items easy to scan",
    box: { x: 3, y: 69, width: 66, height: 28 },
    resolved: false,
    observation: "",
    notes: [],
  },
  {
    id: "region-3",
    title: "Keep customer context close",
    box: { x: 74, y: 57, width: 24, height: 29 },
    resolved: true,
    observation: "",
    notes: [],
  },
];

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Number.isFinite(n) ? n : min));
/** Local draft engine. No model calls — geometry and title heuristics only. */
function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++)
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash;
}

export function severityFor(region: VisualRegion): RegionSeverity {
  const area = region.box.width * region.box.height;
  const title = region.title.toLowerCase();
  let score = 0;
  if (area <= 90) score += 1;
  if (region.box.y < 12) score += 1;
  if (
    /\b(button|action|status|error|exception|pay|total|price|fail)\b/.test(
      title,
    )
  )
    score += 2;
  else if (
    /\b(scan|read|row|label|title|spacing|align|customer|context)\b/.test(title)
  )
    score += 1;
  return score >= 3 ? "action" : score >= 1 ? "polish" : "fine";
}

function shapeSentence(region: VisualRegion): string {
  const { width, height } = region.box;
  const area = width * height;
  if (area >= 1200)
    return "This is a layout-level region covering much of the view. Settle the hierarchy before polishing details inside it.";
  if (area <= 90)
    return "Small target. Give it breathing room and a hit area that forgives imprecise taps.";
  if (width >= height * 2)
    return "This reads as a horizontal band — operators scan it left to right, so keep one primary value on the leading edge.";
  if (height >= width * 2)
    return "This vertical slice competes with the main column. Keep it quiet unless the current exception lives here.";
  return "Read this region as one unit — its title, value and action should resolve without leaving it.";
}

function positionSentence(region: VisualRegion): string {
  const { x, y, width, height } = region.box;
  if (y < 12)
    return "Top-strip placement means it is seen first; pair any status here with the action that resolves it.";
  if (y + height > 85)
    return "Bottom placement is where totals and confirmations settle; keep numbers comparable at a glance.";
  if (x < 5 && width < 40)
    return "Left-rail position works for identity and navigation, not for exceptions.";
  if (x + width > 95)
    return "Right-edge placement suits secondary context; keep it subordinate to the record.";
  return "";
}

function keywordSentence(region: VisualRegion): string {
  const title = region.title.toLowerCase();
  if (/\b(status|exception|error|fail)\b/.test(title))
    return "An exceptional status should never be the end of the workflow — connect it to its resolving action.";
  if (/\b(button|action|cta)\b/.test(title))
    return "Every action needs a visible consequence: confirm inline or land somewhere that proves it happened.";
  if (/\b(scan|row|total|price|amount|numeric)\b/.test(title))
    return "Preserve a clean numeric edge so values compare without hunting across the page.";
  if (/\b(customer|context|deliver)\b/.test(title))
    return "Keep identity and delivery context beside the order while the exception stays prominent.";
  const fallbacks = [
    "State the decision this region asks the operator to make, then remove everything that does not serve it.",
    "If two elements here answer the same question, one of them is redundant.",
  ];
  return fallbacks[hashSeed(region.id + region.title) % fallbacks.length];
}

export function draftObservation(region: VisualRegion): {
  severity: RegionSeverity;
  text: string;
} {
  const severity = severityFor(region);
  const sentences = [
    shapeSentence(region),
    positionSentence(region),
    keywordSentence(region),
  ].filter(Boolean);
  return { severity, text: sentences.join(" ") };
}

/** Working title from geometry. Only used when the region is still untitled. */
export function draftTitle(region: VisualRegion): string {
  const { x, y, width, height } = region.box;
  if (y < 12) return "Top strip";
  if (y + height > 85) return "Bottom band";
  if (x < 5 && width < 40) return "Left rail";
  if (x + width > 95) return "Right rail";
  const area = width * height;
  if (area >= 1200) return "Large section";
  if (area <= 90) return "Small element";
  if (width >= height * 2) return "Content band";
  if (height >= width * 2) return "Side section";
  return "Region";
}

export function needsTitle(title: string): boolean {
  const trimmed = title.trim();
  return trimmed === "" || /^region \d+$/i.test(trimmed);
}
/** Normalized percentages remain invariant under zoom and viewport resize. */
export function constrainReviewBox(box: ReviewBox): ReviewBox {
  const width = clamp(box.width, 1, 100),
    height = clamp(box.height, 1, 100);
  return {
    x: clamp(box.x, 0, 100 - width),
    y: clamp(box.y, 0, 100 - height),
    width,
    height,
  };
}
export function boxBetweenPoints(
  a: { x: number; y: number },
  b: { x: number; y: number },
): ReviewBox | null {
  const x1 = clamp(a.x, 0, 100),
    x2 = clamp(b.x, 0, 100),
    y1 = clamp(a.y, 0, 100),
    y2 = clamp(b.y, 0, 100);
  if (Math.abs(x2 - x1) < 1 || Math.abs(y2 - y1) < 1) return null;
  return constrainReviewBox({
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  });
}
const reviewBoxSchema = z
  .object({
    x: z.number().nonnegative(),
    y: z.number().nonnegative(),
    width: z.number().min(1),
    height: z.number().min(1),
  })
  .refine(
    (box) => box.x + box.width <= 100.001 && box.y + box.height <= 100.001,
  );
const visualRegionsSchema = z
  .array(
    z.object({
      id: z.string(),
      title: z.string().max(160),
      observation: z.string(),
      severity: z.enum(["action", "polish", "fine"]).optional(),
      resolved: z.boolean(),
      box: reviewBoxSchema,
      notes: z
        .array(z.object({ id: z.string(), text: z.string().max(4000) }))
        .max(500),
    }),
  )
  .max(250)
  .refine(
    (regions) =>
      new Set(regions.map((region) => region.id)).size === regions.length,
  );
export function isVisualRegions(value: unknown): value is VisualRegion[] {
  return visualRegionsSchema.safeParse(value).success;
}
