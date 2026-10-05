import snapshot from "./catalog-snapshot.json";

export type CatalogModel = (typeof snapshot.models)[number];
export const MODELS = snapshot.models;
export const SOURCE = snapshot.source;
export const CATEGORIES = [
  "All",
  "Text",
  "Image",
  "Video",
  "Audio",
  "Retrieval",
  "Evaluation",
  "Tools",
];
export const DEVELOPERS = [
  ...new Set(MODELS.map((model) => model.developer)),
].sort();
// These capabilities are covered by the visible icons or verified filter memberships.
export const CAPABILITIES = ["Vision", "Reasoning", "Tool Use", "File Input"];

export function developerName(value: string) {
  const names: Record<string, string> = {
    openai: "OpenAI",
    anthropic: "Anthropic",
    google: "Google",
    meta: "Meta",
    alibaba: "Alibaba",
    zai: "Z.ai",
    spacexai: "xAI",
    xai: "xAI",
    bfl: "Black Forest Labs",
    moonshotai: "Moonshot AI",
    bytedance: "ByteDance",
    deepseek: "DeepSeek",
    mistral: "Mistral",
    nvidia: "NVIDIA",
    minimax: "MiniMax",
    deepinfra: "DeepInfra",
    vertex: "Vertex AI",
    vertexAnthropic: "Vertex AI",
    bedrock: "Bedrock",
    togetherai: "Together AI",
    azure: "Azure",
  };
  return names[value] ?? value.charAt(0).toUpperCase() + value.slice(1);
}

export function priceParts(value: string) {
  const [price, additional] = value.split("+");
  return { price, additional };
}

// Compare rates within their billing unit, never dollars per image against dollars per token.
export function comparePrices(left: string, right: string) {
  const parse = (value: string) => ({
    unit: value === "Free" ? "M" : (value.match(/\/(.+?)(?:\+|$)/)?.[1] ?? "~"),
    amount:
      value === "Free"
        ? 0
        : Number.isNaN(Number.parseFloat(value.replace("$", "")))
          ? Infinity
          : Number.parseFloat(value.replace("$", "")),
  });
  const a = parse(left),
    b = parse(right);
  return a.unit.localeCompare(b.unit) || a.amount - b.amount;
}

export function exportModels(models: CatalogModel[]) {
  const fields = [
    "Model",
    "Category",
    "Developer",
    "Input",
    "Output",
    "Latency",
    "Providers shown",
    "Additional providers",
    "ZDR eligible",
    "No training eligible",
    "Free tier",
    "Capabilities shown",
    "Additional capabilities",
    "Released",
    "Source",
  ];
  const quote = (value: unknown) => `"${String(value).replaceAll('"', '""')}"`;
  const csv = [
    fields,
    ...models.map((m) => [
      m.id,
      m.category,
      developerName(m.developer),
      m.input,
      m.output,
      m.latency,
      m.providers.join("; "),
      m.extraProviders,
      m.zdr,
      m.noTraining,
      m.freeTier,
      m.capabilities.join("; "),
      m.extraCapabilities,
      m.released,
      `https://vercel.com${m.href}`,
    ]),
  ]
    .map((row) => row.map(quote).join(","))
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "model-catalog-2026-09-19.csv";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
