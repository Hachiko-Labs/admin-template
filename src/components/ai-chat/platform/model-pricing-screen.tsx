"use client";

import {
  ArrowUpRight,
  BrainCircuit,
  Check,
  ChevronDown,
  Eye,
  RefreshCw,
  Search,
  Wrench,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { PlatformPage } from "./platform-ui";

type Capability = "Reasoning" | "Fast" | "Vision" | "Tools";
const capabilityIcons = {
  Reasoning: BrainCircuit,
  Fast: Zap,
  Vision: Eye,
  Tools: Wrench,
};

type Filter = "All" | "Featured" | "Free" | "On sale" | "Reasoning" | "Fast";
type Sort = "recommended" | "input" | "output" | "name";

type CatalogModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  input: number;
  output: number;
  cached?: number;
  listInput?: number;
  listOutput?: number;
  sale?: number;
  free?: boolean;
  featured?: boolean;
  capabilities: Capability[];
  context: string;
  availability: string;
};

const filters: Filter[] = [
  "All",
  "Featured",
  "Free",
  "On sale",
  "Reasoning",
  "Fast",
];

const providerOrder = ["OpenAI", "Anthropic", "Google", "Mistral"];

const catalog: CatalogModel[] = [
  {
    id: "openai/gpt-4.1",
    name: "GPT-4.1",
    provider: "OpenAI",
    description:
      "Balanced model for complex instructions and tool-driven work.",
    input: 2,
    output: 8,
    cached: 0.5,
    featured: true,
    capabilities: ["Reasoning", "Vision", "Tools"],
    context: "1M tokens",
    availability: "Available to all projects",
  },
  {
    id: "openai/gpt-4.1-mini",
    name: "GPT-4.1 mini",
    provider: "OpenAI",
    description: "Fast, efficient model for high-volume product workloads.",
    input: 0.4,
    output: 1.6,
    cached: 0.1,
    sale: 20,
    listInput: 0.5,
    listOutput: 2,
    capabilities: ["Fast", "Vision", "Tools"],
    context: "1M tokens",
    availability: "Available to all projects",
  },
  {
    id: "openai/o3",
    name: "o3",
    provider: "OpenAI",
    description: "Deep reasoning for difficult analysis and agent planning.",
    input: 2,
    output: 8,
    cached: 0.5,
    featured: true,
    capabilities: ["Reasoning", "Vision", "Tools"],
    context: "200K tokens",
    availability: "Usage tier 2 and above",
  },
  {
    id: "openai/o4-mini",
    name: "o4-mini",
    provider: "OpenAI",
    description: "Compact reasoning model optimized for throughput.",
    input: 1.1,
    output: 4.4,
    cached: 0.28,
    capabilities: ["Reasoning", "Fast", "Vision", "Tools"],
    context: "200K tokens",
    availability: "Available to all projects",
  },
  {
    id: "anthropic/claude-sonnet-4",
    name: "Claude Sonnet 4",
    provider: "Anthropic",
    description: "Strong coding and long-running agent performance.",
    input: 3,
    output: 15,
    cached: 0.3,
    featured: true,
    capabilities: ["Reasoning", "Vision", "Tools"],
    context: "200K tokens",
    availability: "Available to all projects",
  },
  {
    id: "anthropic/claude-3.7-sonnet",
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    description: "Hybrid reasoning for engineering and knowledge work.",
    input: 2.4,
    output: 12,
    cached: 0.24,
    sale: 20,
    listInput: 3,
    listOutput: 15,
    capabilities: ["Reasoning", "Vision", "Tools"],
    context: "200K tokens",
    availability: "Available to all projects",
  },
  {
    id: "anthropic/claude-3.5-haiku",
    name: "Claude 3.5 Haiku",
    provider: "Anthropic",
    description: "Low-latency model for routing and short-form generation.",
    input: 0.8,
    output: 4,
    cached: 0.08,
    capabilities: ["Fast", "Vision", "Tools"],
    context: "200K tokens",
    availability: "Available to all projects",
  },
  {
    id: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    description: "Multimodal reasoning for research and large contexts.",
    input: 1.25,
    output: 10,
    cached: 0.31,
    featured: true,
    capabilities: ["Reasoning", "Vision", "Tools"],
    context: "1M tokens",
    availability: "Available to all projects",
  },
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    description: "Responsive multimodal model for real-time experiences.",
    input: 0.24,
    output: 2,
    cached: 0.06,
    sale: 20,
    listInput: 0.3,
    listOutput: 2.5,
    capabilities: ["Fast", "Vision", "Tools"],
    context: "1M tokens",
    availability: "Available to all projects",
  },
  {
    id: "mistral/mistral-large",
    name: "Mistral Large",
    provider: "Mistral",
    description: "General-purpose multilingual model with tool support.",
    input: 2,
    output: 6,
    cached: 0.5,
    capabilities: ["Reasoning", "Tools"],
    context: "128K tokens",
    availability: "Available to all projects",
  },
  {
    id: "mistral/codestral",
    name: "Codestral",
    provider: "Mistral",
    description: "Code generation and completion across modern languages.",
    input: 0,
    output: 0,
    free: true,
    capabilities: ["Fast", "Tools"],
    context: "256K tokens",
    availability: "Free during preview",
  },
  {
    id: "mistral/mistral-small",
    name: "Mistral Small",
    provider: "Mistral",
    description: "Efficient model for extraction, classification, and chat.",
    input: 0,
    output: 0,
    free: true,
    capabilities: ["Fast", "Tools"],
    context: "128K tokens",
    availability: "Free during preview",
  },
];

function price(value: number, free?: boolean) {
  if (free) return "Free";
  return `$${value.toFixed(2)}`;
}

function ModelRow({
  model,
  open,
  isDefault,
  onOpenChange,
  onSetDefault,
}: {
  model: CatalogModel;
  open: boolean;
  isDefault: boolean;
  onOpenChange: (open: boolean) => void;
  onSetDefault: () => void;
}) {
  const detailsId = `model-details-${model.id.replaceAll("/", "-")}`;

  return (
    <>
      <tr
        className={cn(
          "border-b transition-colors",
          open ? "bg-muted/15" : "hover:bg-muted/20",
        )}
      >
        <td className="max-w-0 py-5 pr-6 pl-5 align-top sm:pl-6">
          <button
            type="button"
            aria-controls={detailsId}
            aria-expanded={open}
            onClick={() => onOpenChange(!open)}
            className="focus-visible:ring-ring block w-full min-w-0 rounded-sm text-left focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <span className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="truncate font-mono text-[13px] font-medium">
                {model.id}
              </span>
              {isDefault ? (
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <Check className="size-3" />
                  Default
                </Badge>
              ) : null}
              {model.featured ? (
                <Badge variant="outline" className="text-[10px]">
                  Featured
                </Badge>
              ) : null}
              {model.sale ? (
                <Badge className="border-0 bg-amber-500/12 text-[10px] text-amber-700 shadow-none dark:text-amber-300">
                  −{model.sale}%
                </Badge>
              ) : null}
              {model.free ? (
                <Badge className="border-0 bg-emerald-500/12 text-[10px] text-emerald-700 shadow-none dark:text-emerald-300">
                  Free
                </Badge>
              ) : null}
            </span>
            <span className="text-muted-foreground mt-1 block truncate text-xs">
              {model.description}
            </span>
            <span className="text-muted-foreground mt-3 grid max-w-64 grid-cols-2 gap-5 text-xs tabular-nums md:hidden">
              <span>
                Input{" "}
                <strong className="text-foreground font-medium">
                  {price(model.input, model.free)}
                </strong>
              </span>
              <span>
                Output{" "}
                <strong className="text-foreground font-medium">
                  {price(model.output, model.free)}
                </strong>
              </span>
            </span>
          </button>
        </td>

        <td className="text-foreground/80 hidden py-5 pr-0 pl-8 text-right align-top tabular-nums md:table-cell">
          <span className="flex flex-col items-end gap-0.5">
            <span>{price(model.input, model.free)}</span>
            {model.listInput ? (
              <span className="text-muted-foreground text-[10px] line-through">
                ${model.listInput.toFixed(2)}
              </span>
            ) : null}
          </span>
        </td>
        <td className="text-foreground/80 hidden py-5 pr-0 pl-8 text-right align-top tabular-nums md:table-cell">
          <span className="flex flex-col items-end gap-0.5">
            <span>{price(model.output, model.free)}</span>
            {model.listOutput ? (
              <span className="text-muted-foreground text-[10px] line-through">
                ${model.listOutput.toFixed(2)}
              </span>
            ) : null}
          </span>
        </td>
        <td className="py-4 pr-4 pl-5 text-right align-top sm:pr-5">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-controls={detailsId}
            aria-expanded={open}
            aria-label={`${open ? "Close" : "Open"} ${model.name} details`}
            onClick={() => onOpenChange(!open)}
          >
            <ChevronDown
              className={cn(
                "text-muted-foreground transition-transform",
                open && "rotate-180",
              )}
            />
          </Button>
        </td>
      </tr>

      {open ? (
        <tr id={detailsId} className="bg-muted/20 border-b">
          <td colSpan={4} className="p-0">
            <div className="grid gap-6 px-5 py-5 whitespace-normal sm:px-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
              <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-3 xl:grid-cols-[repeat(4,minmax(0,1fr))_minmax(140px,1.5fr)_auto]">
                <div>
                  <dt className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                    Input
                  </dt>
                  <dd className="mt-1 text-sm font-medium tabular-nums">
                    {price(model.input, model.free)} / 1M
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                    Output
                  </dt>
                  <dd className="mt-1 text-sm font-medium tabular-nums">
                    {price(model.output, model.free)} / 1M
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                    Cached read
                  </dt>
                  <dd className="mt-1 text-sm font-medium tabular-nums">
                    {model.cached === undefined
                      ? "Not available"
                      : `${price(model.cached, model.free)} / 1M`}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                    Context
                  </dt>
                  <dd className="mt-1 text-sm font-medium">{model.context}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                    Availability
                  </dt>
                  <dd className="mt-1 text-sm font-medium">
                    {model.availability}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                    Capabilities
                  </dt>
                  <dd className="mt-1 flex items-center gap-3">
                    {model.capabilities.map((capability) => {
                      const Icon = capabilityIcons[capability];
                      return (
                        <Tooltip key={capability}>
                          <TooltipTrigger asChild>
                            <span
                              tabIndex={0}
                              aria-label={capability}
                              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex rounded-sm py-1 focus-visible:ring-2 focus-visible:outline-none"
                            >
                              <Icon className="size-4" strokeWidth={1.5} />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{capability}</TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </dd>
                </div>
              </dl>

              <div className="flex items-center xl:border-l xl:pl-6">
                <Button
                  size="sm"
                  variant={isDefault ? "outline" : "default"}
                  disabled={isDefault}
                  onClick={onSetDefault}
                >
                  {isDefault ? "Current default" : "Set as default"}
                </Button>
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

export function ModelPricingScreen() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [provider, setProvider] = useState("all");
  const [sort, setSort] = useState<Sort>("recommended");
  const [openModel, setOpenModel] = useState<string | null>(catalog[0].id);
  const [defaultModel, setDefaultModel] = useState(catalog[0].id);
  const [refreshing, setRefreshing] = useState(false);

  const visibleModels = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = catalog.filter((model) => {
      const matchesQuery =
        !normalizedQuery ||
        model.id.toLowerCase().includes(normalizedQuery) ||
        model.name.toLowerCase().includes(normalizedQuery) ||
        model.provider.toLowerCase().includes(normalizedQuery);
      const matchesProvider = provider === "all" || model.provider === provider;
      const matchesFilter =
        filter === "All" ||
        (filter === "Featured" && model.featured) ||
        (filter === "Free" && model.free) ||
        (filter === "On sale" && model.sale) ||
        ((filter === "Reasoning" || filter === "Fast") &&
          model.capabilities.includes(filter));
      return matchesQuery && matchesProvider && matchesFilter;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "input") return a.input - b.input;
      if (sort === "output") return a.output - b.output;
      if (sort === "name") return a.name.localeCompare(b.name);
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    });
  }, [filter, provider, query, sort]);

  const groupedModels = providerOrder
    .map((name) => ({
      name,
      models: visibleModels.filter((model) => model.provider === name),
    }))
    .filter((group) => group.models.length > 0);

  const onRefresh = () => {
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
      toast.success("Model prices refreshed", {
        description: "Illustrative catalog updated just now.",
      });
    }, 650);
  };

  const reset = () => {
    setQuery("");
    setFilter("All");
    setProvider("all");
    setSort("recommended");
    setOpenModel(catalog[0].id);
    setDefaultModel(catalog[0].id);
    toast.success("Model pricing reset");
  };

  return (
    <PlatformPage
      title="Model pricing"
      description="Compare model capabilities and token pricing before choosing a workspace default."
      onReset={reset}
      actions={
        <>
          <Button variant="outline" asChild>
            <Link href="/ai-chat/billing">
              Manage billing
              <ArrowUpRight />
            </Link>
          </Button>
          <Button onClick={onRefresh} disabled={refreshing}>
            <RefreshCw className={cn(refreshing && "animate-spin")} />
            {refreshing ? "Refreshing" : "Refresh prices"}
          </Button>
        </>
      }
    >
      <section className="bg-muted/25 border-y px-5 py-5 sm:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Developer plan</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Credits shared by 3 active projects
              </p>
            </div>
            <p className="text-sm font-semibold tabular-nums">
              $156.86{" "}
              <span className="text-muted-foreground font-normal">
                available
              </span>
            </p>
          </div>
          <div className="bg-muted mt-4 h-1.5 overflow-hidden rounded-full">
            <div className="bg-primary h-full w-[72%] rounded-full" />
          </div>
          <div className="text-muted-foreground mt-2 flex justify-between text-[11px] tabular-nums">
            <span>$403.14 used this cycle</span>
            <span>$560.00 limit</span>
          </div>
        </div>
      </section>

      <section aria-label="Catalog controls" className="space-y-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search models or providers"
              aria-label="Search model pricing"
              className="pl-9"
            />
          </div>
          <div className="flex min-w-0 gap-2">
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger aria-label="Provider" className="min-w-36 flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All providers</SelectItem>
                {providerOrder.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={sort}
              onValueChange={(value) => setSort(value as Sort)}
            >
              <SelectTrigger
                aria-label="Sort models"
                className="min-w-36 flex-1"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="input">Lowest input</SelectItem>
                <SelectItem value="output">Lowest output</SelectItem>
                <SelectItem value="name">Model name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-muted/60 flex w-full gap-1 overflow-x-auto rounded-lg p-1 sm:w-fit">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
              className={cn(
                "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                filter === item
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section aria-label="Models">
        {groupedModels.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <colgroup>
                <col className="w-full" />
                <col className="w-36" />
                <col className="w-36" />
                <col className="w-14" />
              </colgroup>
              <thead className="text-foreground border-y">
                <tr>
                  <th
                    scope="col"
                    className="py-3 pr-6 pl-5 text-xs font-semibold sm:pl-6"
                  >
                    Model
                  </th>
                  <th
                    scope="col"
                    className="hidden py-3 pr-0 pl-8 text-right text-xs font-semibold md:table-cell"
                  >
                    Input / 1M
                  </th>
                  <th
                    scope="col"
                    className="hidden py-3 pr-0 pl-8 text-right text-xs font-semibold md:table-cell"
                  >
                    Output / 1M
                  </th>
                  <th scope="col" className="py-3 pr-5 pl-5 sm:pr-6">
                    <span className="sr-only">Details</span>
                  </th>
                </tr>
              </thead>
              {groupedModels.map((group, groupIndex) => (
                <tbody key={group.name}>
                  <tr
                    className={cn(
                      "bg-muted/20 border-b",
                      groupIndex > 0 && "border-t",
                    )}
                  >
                    <th
                      scope="rowgroup"
                      colSpan={4}
                      className="py-2.5 pr-5 pl-5 text-left sm:pl-6"
                    >
                      <span className="text-xs font-semibold tracking-wide uppercase">
                        {group.name}
                      </span>
                      <span className="text-muted-foreground ml-2 text-xs font-normal normal-case">
                        {group.models.length} models
                      </span>
                    </th>
                  </tr>
                  {group.models.map((model) => (
                    <ModelRow
                      key={model.id}
                      model={model}
                      open={openModel === model.id}
                      isDefault={defaultModel === model.id}
                      onOpenChange={(nextOpen) =>
                        setOpenModel(nextOpen ? model.id : null)
                      }
                      onSetDefault={() => {
                        setDefaultModel(model.id);
                        toast.success(`${model.name} is now the default`, {
                          description: "New conversations will use this model.",
                        });
                      }}
                    />
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        ) : (
          <div className="border-y px-6 py-16 text-center">
            <BrainCircuit className="text-muted-foreground mx-auto size-6" />
            <p className="mt-3 text-sm font-medium">No matching models</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Try another search, provider, or capability filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setQuery("");
                setFilter("All");
                setProvider("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </section>

      <p className="text-muted-foreground pb-2 text-center text-[11px]">
        Illustrative demo catalog. Prices and availability are not live provider
        data.
      </p>
    </PlatformPage>
  );
}
