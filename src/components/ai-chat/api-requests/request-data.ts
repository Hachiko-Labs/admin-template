export type ApiRequest = {
  id: string;
  timestamp: number;
  source: string;
  provider: string;
  model: string;
  project: string;
  environment: string;
  status: number;
  latency: number;
  ttft: number;
  input: number;
  output: number;
  cost: number;
  cache: string;
  endpoint: string;
  key: string;
  region: string;
};

export const DEMO_END = Date.UTC(2026, 8, 11, 14, 30);
export const MODELS = [
  { provider: "OpenAI", model: "gpt-4.1" },
  { provider: "Anthropic", model: "claude-sonnet-4" },
  { provider: "OpenAI", model: "gpt-4.1-mini" },
  { provider: "Google", model: "gemini-2.5-flash" },
  { provider: "Anthropic", model: "claude-opus-4" },
];
export const LOG_SOURCES = [
  "Responses",
  "Agents",
  "SDK traces",
  "Realtime",
  "Completions",
  "Conversations",
  "ChatKit",
];
const ENDPOINTS = [
  "/v1/responses",
  "/v1/agents/runs",
  "/v1/traces",
  "/v1/realtime/sessions",
  "/v1/chat/completions",
  "/v1/conversations",
  "/v1/chatkit/sessions",
];
export const FACETS = [
  { key: "source", label: "Log source", options: LOG_SOURCES },
  { key: "status", label: "Status", options: ["200", "429", "500", "503"] },
  {
    key: "provider",
    label: "Provider",
    options: ["OpenAI", "Anthropic", "Google"],
  },
  { key: "model", label: "Model", options: MODELS.map((m) => m.model) },
  {
    key: "project",
    label: "Project",
    options: ["Support copilot", "Knowledge search", "Content studio"],
  },
  {
    key: "environment",
    label: "Environment",
    options: ["Production", "Preview"],
  },
  { key: "cache", label: "Cache", options: ["Hit", "Miss", "Bypass"] },
] as const;
export type FacetKey = (typeof FACETS)[number]["key"];
export type RequestFilters = Record<FacetKey, string[]> & {
  q: string;
  hours: number;
  from: number;
  to: number;
  minLatency: number;
  minTtft: number;
  minCost: number;
};
export const DEFAULT_FILTERS: RequestFilters = {
  q: "",
  hours: 24,
  from: 0,
  to: 0,
  minLatency: 0,
  minTtft: 0,
  minCost: 0,
  source: [],
  status: [],
  provider: [],
  model: [],
  project: [],
  environment: [],
  cache: [],
};

// Deterministic, fictional traffic. Costs are sample values, not provider pricing.
export function makeRequest(index: number, timestamp: number): ApiRequest {
  const hash = (n: number) =>
    ((index * 9301 + n * 49297 + 233) % 233280) / 233280;
  const model = MODELS[index % MODELS.length];
  const incident =
    timestamp >= DEMO_END - 90 * 60000 && timestamp < DEMO_END - 30 * 60000;
  const status =
    incident && index % 3 === 0
      ? 429
      : index % 37 === 0
        ? 503
        : index % 53 === 0
          ? 500
          : 200;
  const cache = status !== 200 ? "Bypass" : index % 4 === 0 ? "Hit" : "Miss";
  const input = 280 + Math.floor(hash(3) * 4400);
  const output = status !== 200 ? 0 : 90 + Math.floor(hash(8) * 1800);
  const latency =
    status === 429
      ? 130 + Math.floor(hash(4) * 250)
      : cache === "Hit"
        ? 160 + Math.floor(hash(4) * 400)
        : 680 + Math.floor(hash(4) * 7400);
  return {
    id: `req_${(0xa14c9000 + index * 173).toString(16)}-${(0xe820 + index).toString(16)}-4a91`,
    timestamp,
    source: LOG_SOURCES[index % LOG_SOURCES.length],
    ...model,
    status,
    cache,
    input,
    output,
    latency,
    ttft:
      status !== 200 ? 0 : Math.min(latency, 80 + Math.floor(hash(6) * 1900)),
    cost:
      status !== 200
        ? 0
        : Number(
            (
              (input * 0.0000012 + output * 0.0000048) *
              (index % 5 === 4 ? 3 : 1)
            ).toFixed(5),
          ),
    project: ["Support copilot", "Knowledge search", "Content studio"][
      index % 3
    ],
    environment: index % 9 === 0 ? "Preview" : "Production",
    endpoint: ENDPOINTS[index % LOG_SOURCES.length],
    key: index % 9 === 0 ? "preview-key · …7d2a" : "production-key · …9f81",
    region: ["iad1", "fra1", "sfo1"][index % 3],
  };
}
function buildSampleTraffic(): ApiRequest[] {
  let seed = 0x91a4c;
  const ages = [0];
  for (let i = 1; i < 720; i++) {
    seed += 0x6d2b79f5;
    let value = Math.imul(seed ^ (seed >>> 15), seed | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    const random = ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    ages.push(Math.floor(random * 86400000));
  }
  ages.sort((a, b) => a - b);
  return ages.map((age, index) => makeRequest(720 - index, DEMO_END - age));
}

export const INITIAL_REQUESTS = buildSampleTraffic();

export function matchesRequest(
  row: ApiRequest,
  filters: RequestFilters,
  end: number,
  omit?: FacetKey,
  ignoreTime = false,
) {
  if (
    !ignoreTime &&
    (row.timestamp < (filters.from || end - filters.hours * 3600000) ||
      row.timestamp > (filters.to || end))
  )
    return false;
  if (
    row.latency < filters.minLatency ||
    row.ttft < filters.minTtft ||
    row.cost < filters.minCost
  )
    return false;
  if (
    FACETS.some(
      ({ key }) =>
        key !== omit &&
        filters[key].length > 0 &&
        !filters[key].includes(String(row[key])),
    )
  )
    return false;
  return filters.q
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .every((term) => {
      if (!term) return true;
      const split = term.indexOf(":");
      if (split > 0) {
        const key = term.slice(0, split),
          value = term.slice(split + 1);
        const field = new Map<string, string | number>([
          ["source", row.source],
          ["model", row.model],
          ["provider", row.provider],
          ["status", row.status],
          ["cache", row.cache],
          ["environment", row.environment],
          ["region", row.region],
        ]).get(key);
        if (field !== undefined)
          return String(field).toLowerCase().includes(value);
      }
      return [
        row.id,
        row.source,
        row.model,
        row.provider,
        row.project,
        row.endpoint,
        row.key,
        row.region,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
}
export const formatTime = (timestamp: number) =>
  new Date(timestamp).toISOString().slice(11, 19);
export const formatMs = (ms: number) =>
  ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${ms} ms`;
export const formatCost = (cost: number) => `$${cost.toFixed(4)}`;
export const statusLabel = (status: number) =>
  ({ 200: "OK", 429: "Rate limited", 500: "Server error", 503: "Unavailable" })[
    status
  ] ?? "Unknown";
export function requestPayload(row: ApiRequest) {
  const prompt = "How do I invite my team and set their workspace permissions?";
  if (row.source === "Responses")
    return { model: row.model, input: prompt, stream: true };
  if (row.source === "Agents")
    return {
      agent_id: "agent_support_demo",
      input: prompt,
      trace_id: `trace_${row.id.slice(4)}`,
      tools: ["knowledge_search"],
    };
  if (row.source === "SDK traces")
    return {
      trace_id: `trace_${row.id.slice(4)}`,
      workflow_name: "Support answer",
      spans: requestEvents(row),
    };
  if (row.source === "Realtime")
    return {
      model: row.model,
      modalities: ["text", "audio"],
      voice: "clear",
      turn_detection: { type: "server_vad" },
    };
  if (row.source === "Conversations")
    return {
      metadata: { project: row.project },
      items: [{ role: "user", content: prompt }],
    };
  if (row.source === "ChatKit")
    return {
      workflow: { id: "workflow_support_demo" },
      user: "demo_visitor",
      chatkit_configuration: { file_upload: { enabled: false } },
    };
  return {
    model: row.model,
    stream: true,
    temperature: 0.7,
    max_tokens: 2048,
    messages: [
      {
        role: "system",
        content:
          "You are a helpful product support assistant. Use the supplied knowledge base.",
      },
      {
        role: "user",
        content: "How do I invite my team and set their workspace permissions?",
      },
    ],
  };
}
export function responsePayload(row: ApiRequest) {
  return row.status === 200
    ? {
        id: row.id,
        object: `${row.source.toLowerCase().replaceAll(" ", "_")}.result`,
        model: row.model,
        finish_reason: "stop",
        message: {
          role: "assistant",
          content:
            "Open Settings → Members, select Invite members, and enter their email addresses. Choose Admin, Member, or Viewer to set their access.",
        },
        usage: {
          input_tokens: row.input,
          output_tokens: row.output,
          total_tokens: row.input + row.output,
        },
      }
    : {
        error: {
          type: row.status === 429 ? "rate_limit_exceeded" : "provider_error",
          message:
            row.status === 429
              ? "Too many requests. Retry after 2 seconds."
              : "The upstream provider could not complete this request.",
          status: row.status,
        },
        retry_after_ms: 2000,
      };
}
export async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
}

export function requestEvents(row: ApiRequest) {
  const prefix =
    new Map<string, string>([
      ["Responses", "response"],
      ["Agents", "agent.run"],
      ["SDK traces", "trace.span"],
      ["Realtime", "realtime.session"],
      ["Completions", "completion"],
      ["Conversations", "conversation"],
      ["ChatKit", "chatkit.session"],
    ]).get(row.source) ?? "request";
  return [
    {
      offset: 0,
      event: `${prefix}.created`,
      detail: "Request accepted by gateway",
    },
    {
      offset: Math.min(24, row.latency),
      event: `${prefix}.processing`,
      detail: `${row.provider} · ${row.model}`,
    },
    ...(row.source === "Agents" || row.source === "SDK traces"
      ? [
          {
            offset: Math.round(row.latency * 0.35),
            event: "tool.knowledge_search.completed",
            detail: "3 source documents returned",
          },
        ]
      : []),
    {
      offset: row.latency,
      event: `${prefix}.${row.status === 200 ? "completed" : "failed"}`,
      detail:
        row.status === 200
          ? `${row.output} output tokens`
          : statusLabel(row.status),
    },
  ];
}
