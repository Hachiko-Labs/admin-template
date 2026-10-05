// A fixed, fictional workspace. These values are not provider pricing or live usage.
export const PROJECTS = [
  "Support copilot",
  "Knowledge search",
  "Content studio",
];
export const PLATFORM_MODELS = [
  { name: "gpt-4.1", provider: "OpenAI", color: "var(--chart-2)" },
  { name: "claude-sonnet-4", provider: "Anthropic", color: "var(--chart-4)" },
  { name: "gemini-2.5-flash", provider: "Google", color: "var(--chart-1)" },
];
export type UsageRecord = {
  date: string;
  project: string;
  model: string;
  requests: number;
  input: number;
  output: number;
  cached: number;
  cost: number;
  errors: number;
};
export const USAGE: UsageRecord[] = Array.from({ length: 30 }, (_, day) =>
  PROJECTS.flatMap((project, p) =>
    PLATFORM_MODELS.map(({ name }, m) => {
      const wave = [0.78, 0.92, 1.12, 0.96, 1.3, 0.63, 0.54][day % 7];
      const requests = Math.round(
        (180 + p * 53 + m * 37) * wave * (1 + day / 85),
      );
      const input = requests * (830 + m * 171);
      const output = requests * (194 + p * 43);
      return {
        date: new Date(Date.UTC(2026, 7, 13 + day)).toISOString().slice(0, 10),
        project,
        model: name,
        requests,
        input,
        output,
        cached: Math.round(input * (0.26 + p * 0.07)),
        cost:
          Math.round(
            (input * [2, 3, 0.3][m] + output * [8, 15, 2.5][m]) / 10000,
          ) / 100,
        errors: Math.round(requests * (day === 27 && p === 0 ? 0.038 : 0.004)),
      };
    }),
  ),
).flat();

export function selectUsage(days: number, project = "all", model = "all") {
  const first = USAGE[(30 - days) * 9]?.date ?? USAGE[0].date;
  return USAGE.filter(
    (row) =>
      row.date >= first &&
      (project === "all" || row.project === project) &&
      (model === "all" || row.model === model),
  );
}
export function totals(rows: UsageRecord[]) {
  return rows.reduce(
    (sum, row) => ({
      requests: sum.requests + row.requests,
      input: sum.input + row.input,
      output: sum.output + row.output,
      cached: sum.cached + row.cached,
      cost: sum.cost + row.cost,
      errors: sum.errors + row.errors,
    }),
    { requests: 0, input: 0, output: 0, cached: 0, cost: 0, errors: 0 },
  );
}
export function dailyUsage(rows: UsageRecord[]) {
  const days = new Map<string, ReturnType<typeof totals> & { date: string }>();
  for (const row of rows) {
    const prior = days.get(row.date) ?? { date: row.date, ...totals([]) };
    days.set(row.date, {
      date: row.date,
      requests: prior.requests + row.requests,
      input: prior.input + row.input,
      output: prior.output + row.output,
      cached: prior.cached + row.cached,
      cost: prior.cost + row.cost,
      errors: prior.errors + row.errors,
    });
  }
  return [...days.values()];
}
export const compact = (n: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
export const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    n,
  );
export const shortDate = (value: string) =>
  new Date(value + "T12:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

export function downloadFile(
  name: string,
  content: string,
  type = "application/json",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
