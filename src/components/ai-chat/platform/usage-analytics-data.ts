// Deterministic demo usage, not live telemetry or current provider pricing.
export const USAGE_PROJECTS = [
  "Support copilot",
  "Knowledge search",
  "Content studio",
] as const;
export const USAGE_MODELS = [
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "OpenAI",
    purpose: "Reasoning & tools",
    color: "#10b981",
    rate: 0.006,
    budget: 600,
    latency: "820 ms",
  },
  {
    id: "claude-sonnet-4",
    name: "Claude Sonnet 4",
    provider: "Anthropic",
    purpose: "Writing & analysis",
    color: "#047857",
    rate: 0.009,
    budget: 500,
    latency: "1.2 s",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    purpose: "Fast responses",
    color: "#6ee7b7",
    rate: 0.0018,
    budget: 150,
    latency: "340 ms",
  },
  {
    id: "mistral-large",
    name: "Mistral Large",
    provider: "Mistral",
    purpose: "Multilingual tasks",
    color: "#a7f3d0",
    rate: 0.004,
    budget: 200,
    latency: "—",
  },
] as const;
export type UsageModel = (typeof USAGE_MODELS)[number];
export type AnalyticsMetric = "requests" | "tokens" | "cost";
export type DailyUsage = {
  date: string;
  model: string;
  project: string;
  requests: number;
  tokens: number;
  cost: number;
  errors: number;
  limited: number;
};
const start = Date.UTC(2025, 8, 28);
export const USAGE_END = "2026-09-24";
export const ANALYTICS_DAYS = Array.from({ length: 362 }, (_, index) =>
  new Date(start + index * 86400000).toISOString().slice(0, 10),
);
export const ANALYTICS_USAGE: DailyUsage[] = ANALYTICS_DAYS.flatMap(
  (date, day) =>
    USAGE_MODELS.flatMap((model, m) =>
      USAGE_PROJECTS.map((project, p) => {
        const quiet = day % 19 < 2 || (day > 77 && day < 111 && day % 4 !== 0);
        const growth = day < 240 ? 0.16 + day / 1300 : 0.38 + (day - 240) / 90;
        const requests =
          m === 3 || quiet
            ? 0
            : Math.round(
                (75 + ((day * 17 + m * 31 + p * 23) % 140)) *
                  [1.8, 0.9, 0.62][m] *
                  [1, 0.64, 0.35][p] *
                  growth *
                  (day % 7 === 0 ? 0.45 : 1),
              );
        return {
          date,
          model: model.id,
          project,
          requests,
          tokens: requests * (1180 + m * 430 + p * 95),
          cost: requests * model.rate,
          errors: Math.round(requests * (m === 1 && day > 355 ? 0.037 : 0.004)),
          limited: Math.round(requests * (day % 8 === 2 ? 0.065 : 0.006)),
        };
      }),
    ),
);
export function usageRows(days: number, project = "all") {
  const since = ANALYTICS_DAYS[Math.max(0, ANALYTICS_DAYS.length - days)];
  return ANALYTICS_USAGE.filter(
    (row) =>
      row.date >= since && (project === "all" || row.project === project),
  );
}
export function sumUsage(rows: DailyUsage[]) {
  return rows.reduce(
    (sum, row) => ({
      requests: sum.requests + row.requests,
      tokens: sum.tokens + row.tokens,
      cost: sum.cost + row.cost,
      errors: sum.errors + row.errors,
      limited: sum.limited + row.limited,
    }),
    { requests: 0, tokens: 0, cost: 0, errors: 0, limited: 0 },
  );
}
export function byDay(rows: DailyUsage[]) {
  const dates = [...new Set(rows.map((row) => row.date))];
  return dates.map((date) => ({
    date,
    ...sumUsage(rows.filter((row) => row.date === date)),
  }));
}
export const usageNumber = (n: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
export const usageMoney = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    n,
  );
export const metricValue = (n: number, metric: AnalyticsMetric) =>
  metric === "cost" ? usageMoney(n) : usageNumber(n);
export const usageDate = (date: string) =>
  new Date(date + "T12:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
export const HOURLY_WEIGHTS = [
  1, 1, 1, 1, 1, 1, 1, 1, 2, 18, 28, 34, 2, 7, 26, 29, 38, 31, 30, 35, 23, 8, 2,
  1,
];
