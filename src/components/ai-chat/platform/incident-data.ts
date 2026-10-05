export type IncidentSeverity = "critical" | "high" | "medium" | "low";

export interface IncidentDay {
  date: string;
  label: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export const incidentSeverities: {
  id: IncidentSeverity;
  label: string;
  color: string;
}[] = [
  { id: "critical", label: "Critical", color: "#b91c1c" },
  { id: "high", label: "High", color: "#ef4444" },
  { id: "medium", label: "Medium", color: "#f59e0b" },
  { id: "low", label: "Low", color: "#a3a3a3" },
];

const dayTotals = [
  8, 18, 15, 12, 62, 118, 108, 188, 102, 22, 8, 18, 15, 9, 24, 78, 98, 195, 210,
  62, 112, 24, 9, 18, 28, 9, 24, 22, 32, 22, 11,
];

const severityMix: [number, number, number, number][] = [
  [0.38, 0.38, 0.24, 0],
  [0.4, 0.35, 0.25, 0],
  [0.35, 0.4, 0.25, 0],
  [0.3, 0.4, 0.3, 0],
  [0.55, 0.3, 0.15, 0],
  [0.3, 0.5, 0.2, 0],
  [0.35, 0.4, 0.25, 0],
  [0.28, 0.42, 0.3, 0],
  [0.35, 0.4, 0.25, 0],
  [0.3, 0.4, 0.3, 0],
  [0, 0.3, 0.6, 0.1],
  [0, 0.35, 0.55, 0.1],
  [0, 0.3, 0.6, 0.1],
  [0, 0.25, 0.6, 0.15],
  [0, 0.4, 0.5, 0.1],
  [0.35, 0.4, 0.25, 0],
  [0.17, 0.33, 0.5, 0],
  [0.16, 0.34, 0.5, 0],
  [0.3, 0.45, 0.25, 0],
  [0.35, 0.4, 0.25, 0],
  [0.3, 0.5, 0.2, 0],
  [0, 0.35, 0.5, 0.15],
  [0, 0.3, 0.55, 0.15],
  [0, 0.4, 0.45, 0.15],
  [0, 0.35, 0.5, 0.15],
  [0, 0.3, 0.55, 0.15],
  [0, 0.4, 0.45, 0.15],
  [0.35, 0.4, 0.25, 0],
  [0, 0.35, 0.5, 0.15],
  [0, 0.3, 0.4, 0.3],
  [0, 0.35, 0.5, 0.15],
];

const weekdays = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

function splitTotal(total: number, mix: [number, number, number, number]) {
  const raw = mix.map((m) => Math.round(total * m));
  const drift = total - raw.reduce((a, b) => a + b, 0);
  raw[1] += drift;
  return raw;
}

export const incidentDays: IncidentDay[] = dayTotals.map((total, i) => {
  const day = i + 1;
  const mix: [number, number, number, number] = severityMix[i] ?? [
    0.25, 0.35, 0.3, 0.1,
  ];
  const [critical, high, medium, low] = splitTotal(total, mix);
  return {
    date: `2026-08-${String(day).padStart(2, "0")}`,
    label: `Aug ${day}`,
    critical,
    high,
    medium,
    low,
  };
});

export function incidentDayTotal(d: IncidentDay): number {
  return d.critical + d.high + d.medium + d.low;
}

export function incidentWeekday(date: string): string {
  // 2026-08-01 is a Saturday.
  const day = Number(date.slice(8, 10));
  return weekdays[(day - 1) % 7];
}

export interface IncidentBucket {
  name: string;
  detail: string;
  incidents: number;
}

export const incidentsByEndpoint: IncidentBucket[] = [
  {
    name: "POST /v1/chat/completions",
    detail: "Timeouts during the Aug 17 spike",
    incidents: 412,
  },
  {
    name: "POST /v1/embeddings",
    detail: "Rate-limit errors on batch jobs",
    incidents: 268,
  },
  {
    name: "GET /v1/vector-stores/files",
    detail: "Stale reads after region failover",
    incidents: 154,
  },
  {
    name: "POST /v1/audio/transcriptions",
    detail: "Payload rejections over 25 MB",
    incidents: 96,
  },
  {
    name: "GET /v1/models",
    detail: "Cache misses at edge PoPs",
    incidents: 41,
  },
];

export const incidentsByRegion: IncidentBucket[] = [
  {
    name: "us-east",
    detail: "Primary region · Aug 17 spike",
    incidents: 388,
  },
  {
    name: "eu-west",
    detail: "Failover saturation",
    incidents: 246,
  },
  {
    name: "ap-south",
    detail: "Elevated 5xx on embeddings",
    incidents: 172,
  },
  {
    name: "us-west",
    detail: "Edge cache misses",
    incidents: 118,
  },
  {
    name: "eu-central",
    detail: "Isolated auth errors",
    incidents: 47,
  },
];

/** Scripted summary computed from the static dataset. No model calls. */
export function incidentSummary(
  severities: IncidentSeverity[] = ["critical", "high", "medium", "low"],
): string {
  const totals = incidentDays.map((d) => ({
    day: d,
    total: severities.reduce((sum, s) => sum + d[s], 0),
  }));
  const peak = totals.reduce((a, b) => (b.total > a.total ? b : a));
  const grand = totals.reduce((sum, t) => sum + t.total, 0);
  const top = [...incidentsByEndpoint].sort(
    (a, b) => b.incidents - a.incidents,
  )[0];
  return `Peak on ${incidentWeekday(peak.day.date)}, ${peak.day.label} — ${peak.total.toLocaleString()} of ${grand.toLocaleString()} August incidents. ${top.name} leads endpoints at ${top.incidents}.`;
}

export interface IncidentRow {
  id: string;
  severity: IncidentSeverity;
  title: string;
  period: string;
  duration: string;
  node: string;
  active: boolean;
}

export const incidentRows: IncidentRow[] = [
  {
    id: "INC-4399",
    severity: "critical",
    title: "Chat completions timeout spike (5001)",
    period: "Aug 17, 14:02 – Now",
    duration: "41 min",
    node: "us-east",
    active: true,
  },
  {
    id: "INC-4398",
    severity: "high",
    title: "Embeddings rate-limit errors (8080)",
    period: "Aug 17, 13:20 – Now",
    duration: "6 min 12 sec",
    node: "POST /v1/embeddings",
    active: true,
  },
  {
    id: "INC-4397",
    severity: "low",
    title: "Edge cache misses (7090)",
    period: "Aug 17, 13:01 – Now",
    duration: "26 min 37 sec",
    node: "us-west",
    active: true,
  },
  {
    id: "INC-4396",
    severity: "critical",
    title: "Region failover saturation (0003)",
    period: "Aug 17, 12:20 – Aug 17, 12:23",
    duration: "3 min 54 sec",
    node: "eu-west",
    active: false,
  },
  {
    id: "INC-4395",
    severity: "medium",
    title: "Batch queue depth rising (4201)",
    period: "Aug 17, 12:13 – Aug 17, 12:20",
    duration: "7 min 21 sec",
    node: "POST /v1/batch",
    active: false,
  },
  {
    id: "INC-4394",
    severity: "critical",
    title: "Chat completions timeout spike (5001)",
    period: "Aug 8, 11:13 – Aug 8, 12:46",
    duration: "1 hr 33 min",
    node: "us-east",
    active: false,
  },
  {
    id: "INC-4393",
    severity: "high",
    title: "Vector store stale reads (8080)",
    period: "Aug 8, 10:20 – Aug 8, 10:21",
    duration: "43 sec",
    node: "eu-west",
    active: false,
  },
  {
    id: "INC-4392",
    severity: "high",
    title: "Audio payload rejections (8080)",
    period: "Aug 8, 10:20 – Aug 8, 10:20",
    duration: "8 sec",
    node: "ap-south",
    active: false,
  },
  {
    id: "INC-4391",
    severity: "medium",
    title: "Webhook delivery retries (4201)",
    period: "Aug 5, 09:14 – Aug 5, 09:31",
    duration: "17 min",
    node: "POST /v1/webhooks",
    active: false,
  },
  {
    id: "INC-4390",
    severity: "low",
    title: "Model list cache misses (7090)",
    period: "Aug 3, 08:02 – Aug 3, 08:09",
    duration: "7 min",
    node: "eu-central",
    active: false,
  },
];

export function incidentRowsCsv(rows: IncidentRow[]): string {
  const esc = (v: string) => `"${v.replaceAll('"', '""')}"`;
  return [
    [
      "Incident ID",
      "Severity",
      "Incident",
      "Period",
      "Duration",
      "Node",
      "Active",
    ]
      .map(esc)
      .join(","),
    ...rows.map((r) =>
      [
        r.id,
        r.severity,
        r.title,
        r.period,
        r.duration,
        r.node,
        String(r.active),
      ]
        .map(esc)
        .join(","),
    ),
  ].join("\n");
}
