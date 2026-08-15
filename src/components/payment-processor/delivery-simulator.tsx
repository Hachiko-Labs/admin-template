"use client";

import {
  ChevronUp,
  Info,
  Play,
  Plus,
  Timer,
  Trash2,
  Upload,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
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

type BackoffUnit = "seconds" | "minutes";

type EndpointRow = {
  id: string;
  host: string;
  failureRate: number;
};

const initialEndpoints: EndpointRow[] = [
  { failureRate: 4, host: "hooks.northwind.dev", id: "endpoint-1" },
  { failureRate: 12, host: "api.halden-robotics.no", id: "endpoint-2" },
  { failureRate: 31, host: "billing.lumen-freight.com", id: "endpoint-3" },
];

const gridAttempts = [2, 4, 6, 8];
const gridFailureRates = [5, 12, 25, 40];

function unitSeconds(unit: BackoffUnit) {
  return unit === "minutes" ? 60 : 1;
}

function formatDuration(seconds: number) {
  const rounded = Math.round(seconds);

  if (rounded < 60) {
    return `${rounded}s`;
  }

  if (rounded < 3600) {
    const minutes = Math.floor(rounded / 60);
    const remainder = rounded % 60;

    return remainder === 0 ? `${minutes}m` : `${minutes}m ${remainder}s`;
  }

  const hours = Math.floor(rounded / 3600);
  const minutes = Math.round((rounded % 3600) / 60);

  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

function lostFraction(failureRate: number, attempts: number) {
  return (failureRate / 100) ** attempts;
}

function formatDelivered(failureRate: number, attempts: number) {
  const lost = lostFraction(failureRate, attempts);

  if (lost < 0.0001) {
    return "> 99.99%";
  }

  return `${((1 - lost) * 100).toFixed(2)}%`;
}

function formatLostOdds(failureRate: number, attempts: number) {
  const lost = lostFraction(failureRate, attempts);

  if (lost <= 0) {
    return "none";
  }

  const odds = 1 / lost;

  if (odds >= 1_000_000_000) {
    return `1 in ${(odds / 1_000_000_000).toFixed(1)}B`;
  }

  if (odds >= 1_000_000) {
    return `1 in ${(odds / 1_000_000).toFixed(1)}M`;
  }

  if (odds >= 1000) {
    return `1 in ${Math.round(odds / 1000)}k`;
  }

  return `1 in ${Math.round(odds)}`;
}

function backoffWaits(attempts: number, base: number, multiplier: number) {
  return Array.from({ length: Math.max(0, attempts - 1) }, (_, index) =>
    Math.round(base * multiplier ** index),
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function LabelWithHint({ hint, label }: { hint: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            aria-label={`About ${label}`}
            className="text-muted-foreground/70 hover:text-foreground transition-colors"
            type="button"
          >
            <Info aria-hidden="true" className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-56">{hint}</TooltipContent>
      </Tooltip>
    </div>
  );
}

function SectionHeader({
  label,
  onToggle,
  open,
}: {
  label: string;
  onToggle: () => void;
  open: boolean;
}) {
  return (
    <CollapsibleTrigger asChild>
      <button
        className="flex w-full items-center justify-between py-1 text-left"
        onClick={onToggle}
        type="button"
      >
        <span className="text-base font-semibold tracking-tight">{label}</span>
        <ChevronUp
          aria-hidden="true"
          className={cn(
            "text-muted-foreground size-4 transition-transform",
            !open && "rotate-180",
          )}
        />
      </button>
    </CollapsibleTrigger>
  );
}

/** Marginal share of deliveries that land on each attempt, tallest first. */
function AttemptSparkline({
  attempts,
  failureRate,
}: {
  attempts: number;
  failureRate: number;
}) {
  const probability = failureRate / 100;
  const shares = Array.from(
    { length: attempts },
    (_, index) => probability ** index * (1 - probability),
  );
  return (
    <div
      aria-label={`${shares.length} attempts, most deliveries land on the first`}
      className="flex h-6 items-end gap-[3px]"
      role="img"
    >
      {shares.map((share, index) => (
        <span
          className="bg-primary/70 w-1.5 rounded-[2px]"
          key={index}
          style={{
            height: `${clamp(
              100 * (1 + Math.log10(Math.max(share, 1e-9)) / 6),
              8,
              100,
            ).toFixed(2)}%`,
          }}
        />
      ))}
    </div>
  );
}

export function PaymentProcessorDeliverySimulator() {
  const [policyOpen, setPolicyOpen] = React.useState(true);
  const [endpointsOpen, setEndpointsOpen] = React.useState(true);

  const [maxAttempts, setMaxAttempts] = React.useState(6);
  const [backoffBase, setBackoffBase] = React.useState(5);
  const [backoffUnit, setBackoffUnit] = React.useState<BackoffUnit>("seconds");
  const [multiplier, setMultiplier] = React.useState(3);
  const [jitter, setJitter] = React.useState(20);
  const [timeoutMs, setTimeoutMs] = React.useState(8000);
  const [endpoints, setEndpoints] =
    React.useState<EndpointRow[]>(initialEndpoints);

  const baseSeconds = backoffBase * unitSeconds(backoffUnit);
  const timeoutSeconds = timeoutMs / 1000;

  const waits = React.useMemo(
    () => backoffWaits(maxAttempts, baseSeconds, multiplier),
    [baseSeconds, maxAttempts, multiplier],
  );

  const schedule = React.useMemo(() => {
    let elapsed = 0;

    return Array.from({ length: maxAttempts }, (_, index) => {
      const wait = index === 0 ? 0 : waits[index - 1];
      elapsed += wait + timeoutSeconds;

      return { attempt: index + 1, elapsed, wait };
    });
  }, [maxAttempts, timeoutSeconds, waits]);

  const referenceRate = endpoints[0]?.failureRate ?? 0;
  const probability = referenceRate / 100;

  const nearestGridRate = gridFailureRates.reduce((closest, rate) =>
    Math.abs(rate - referenceRate) < Math.abs(closest - referenceRate)
      ? rate
      : closest,
  );
  const nearestGridAttempts = gridAttempts.reduce((closest, attempts) =>
    Math.abs(attempts - maxAttempts) < Math.abs(closest - maxAttempts)
      ? attempts
      : closest,
  );

  const typicalAttempt = clamp(
    probability <= 0 ? 1 : Math.ceil(Math.log(0.5) / Math.log(probability)),
    1,
    maxAttempts,
  );

  const worstCase =
    (schedule.at(-1)?.elapsed ?? timeoutSeconds) * (1 + jitter / 100);

  const scenarios = [
    {
      caption: "Endpoint answers 2xx straight away.",
      id: "first",
      label: "First attempt",
      value: formatDuration(timeoutSeconds),
    },
    {
      caption: `Half of deliveries land by attempt ${typicalAttempt}.`,
      id: "typical",
      label: "Typical",
      value: formatDuration(
        schedule[typicalAttempt - 1]?.elapsed ?? timeoutSeconds,
      ),
    },
    {
      caption: `Every attempt times out, plus ${jitter}% jitter.`,
      id: "worst",
      label: "Give up after",
      value: formatDuration(worstCase),
    },
  ];

  const updateEndpoint = (id: string, patch: Partial<EndpointRow>) => {
    setEndpoints((current) =>
      current.map((endpoint) =>
        endpoint.id === id ? { ...endpoint, ...patch } : endpoint,
      ),
    );
  };

  return (
    <main className="bg-background text-foreground vertical-scrollbar min-h-0 flex-1 overflow-y-auto">
      <div className="px-5 py-6 lg:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Run new delivery simulation
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Model how your retry policy behaves before you ship it to live
              endpoints.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button className="h-8 rounded-md px-3 text-xs" type="button">
              <Play aria-hidden="true" className="size-4" />
              Run simulation
            </Button>
            <Button
              className="h-8 rounded-md px-3 text-xs"
              type="button"
              variant="outline"
            >
              <Upload aria-hidden="true" className="size-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
          <div className="space-y-6">
            <Collapsible onOpenChange={setPolicyOpen} open={policyOpen}>
              <SectionHeader
                label="Retry policy"
                onToggle={() => setPolicyOpen((open) => !open)}
                open={policyOpen}
              />

              <CollapsibleContent>
                <div className="bg-muted/30 mt-3 space-y-4 rounded-xl border p-4">
                  <div className="space-y-2">
                    <LabelWithHint
                      hint="Total tries, including the first delivery. Attempts beyond this are dropped and the event is marked failed."
                      label="Max attempts"
                    />
                    <InputGroup>
                      <InputGroupInput
                        aria-label="Max attempts"
                        max={10}
                        min={1}
                        onChange={(event) =>
                          setMaxAttempts(
                            clamp(Number(event.target.value) || 1, 1, 10),
                          )
                        }
                        type="number"
                        value={maxAttempts}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupText>attempts</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                  </div>

                  <div className="space-y-2">
                    <LabelWithHint
                      hint="How long we wait before the second attempt. Every later wait multiplies this."
                      label="Backoff base"
                    />
                    <div className="flex items-center gap-2">
                      <InputGroup className="flex-1">
                        <InputGroupAddon>
                          <InputGroupText>
                            <Timer aria-hidden="true" className="size-3.5" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                          aria-label="Backoff base"
                          min={1}
                          onChange={(event) =>
                            setBackoffBase(
                              clamp(Number(event.target.value) || 1, 1, 600),
                            )
                          }
                          type="number"
                          value={backoffBase}
                        />
                      </InputGroup>
                      <Select
                        onValueChange={(value) =>
                          setBackoffUnit(value as BackoffUnit)
                        }
                        value={backoffUnit}
                      >
                        <SelectTrigger
                          aria-label="Backoff unit"
                          className="w-32 shrink-0"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="seconds">Seconds</SelectItem>
                          <SelectItem value="minutes">Minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <LabelWithHint
                      hint="Each wait is the previous one times this factor. 1 gives a flat interval."
                      label="Backoff multiplier"
                    />
                    <InputGroup>
                      <InputGroupAddon>
                        <InputGroupText>×</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        aria-label="Backoff multiplier"
                        min={1}
                        onChange={(event) =>
                          setMultiplier(
                            clamp(Number(event.target.value) || 1, 1, 10),
                          )
                        }
                        step={0.5}
                        type="number"
                        value={multiplier}
                      />
                    </InputGroup>
                  </div>

                  <div className="space-y-2">
                    <LabelWithHint
                      hint="Random spread added to every wait so retries from a spike do not land in lockstep."
                      label="Jitter"
                    />
                    <InputGroup>
                      <InputGroupInput
                        aria-label="Jitter"
                        max={100}
                        min={0}
                        onChange={(event) =>
                          setJitter(
                            clamp(Number(event.target.value) || 0, 0, 100),
                          )
                        }
                        type="number"
                        value={jitter}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupText>%</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-muted-foreground text-xs">
                      Waits between attempts
                    </p>
                    <p className="mt-1 text-sm tabular-nums">
                      {waits.length === 0
                        ? "No retries"
                        : waits.map((wait) => formatDuration(wait)).join(" · ")}
                    </p>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="border-t border-dashed" />

            <Collapsible onOpenChange={setEndpointsOpen} open={endpointsOpen}>
              <SectionHeader
                label="Endpoints"
                onToggle={() => setEndpointsOpen((open) => !open)}
                open={endpointsOpen}
              />

              <CollapsibleContent>
                <div className="bg-muted/30 mt-3 space-y-4 rounded-xl border p-4">
                  <div className="space-y-2">
                    <LabelWithHint
                      hint="An attempt that gets no response inside this window counts as a failure and triggers the next wait."
                      label="Request timeout"
                    />
                    <InputGroup>
                      <InputGroupInput
                        aria-label="Request timeout"
                        min={500}
                        onChange={(event) =>
                          setTimeoutMs(
                            clamp(
                              Number(event.target.value) || 500,
                              500,
                              60_000,
                            ),
                          )
                        }
                        step={500}
                        type="number"
                        value={timeoutMs}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupText>ms</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                  </div>

                  <div className="space-y-2">
                    <LabelWithHint
                      hint="Share of single attempts this host rejects or drops, measured over the last 30 days."
                      label="Failure rate per attempt"
                    />

                    {endpoints.map((endpoint) => (
                      <div
                        className="flex items-center gap-2"
                        key={endpoint.id}
                      >
                        <InputGroup className="min-w-0 flex-1">
                          <InputGroupInput
                            aria-label={`Host for ${endpoint.host || "new endpoint"}`}
                            onChange={(event) =>
                              updateEndpoint(endpoint.id, {
                                host: event.target.value,
                              })
                            }
                            placeholder="hooks.example.com"
                            value={endpoint.host}
                          />
                        </InputGroup>
                        <InputGroup className="w-24 shrink-0">
                          <InputGroupInput
                            aria-label={`Failure rate for ${endpoint.host || "new endpoint"}`}
                            max={99}
                            min={0}
                            onChange={(event) =>
                              updateEndpoint(endpoint.id, {
                                failureRate: clamp(
                                  Number(event.target.value) || 0,
                                  0,
                                  99,
                                ),
                              })
                            }
                            type="number"
                            value={endpoint.failureRate}
                          />
                          <InputGroupAddon align="inline-end">
                            <InputGroupText>%</InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>
                        <Button
                          aria-label={`Remove ${endpoint.host || "endpoint"}`}
                          className="text-muted-foreground hover:text-foreground size-9 shrink-0"
                          disabled={endpoints.length === 1}
                          onClick={() =>
                            setEndpoints((current) =>
                              current.filter((row) => row.id !== endpoint.id),
                            )
                          }
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      className="text-primary h-8 px-0 text-sm"
                      onClick={() =>
                        setEndpoints((current) => [
                          ...current,
                          {
                            failureRate: 10,
                            host: "",
                            id: `endpoint-${Date.now()}`,
                          },
                        ])
                      }
                      type="button"
                      variant="link"
                    >
                      <Plus aria-hidden="true" className="size-4" />
                      Add endpoint
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="min-w-0 space-y-10">
            <section>
              <LabelWithHint
                hint="Wall-clock time from the first delivery attempt to a settled outcome."
                label="Delivery window"
              />

              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-0">
                {scenarios.map((scenario, index) => (
                  <div
                    className={cn(
                      "min-w-0",
                      index > 0 && "sm:border-l sm:pl-6",
                    )}
                    key={scenario.id}
                  >
                    <p className="text-muted-foreground text-xs">
                      {scenario.label}
                    </p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
                      {scenario.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <div className="border-t border-dashed" />

            <section>
              <LabelWithHint
                hint="Share of events that reach each endpoint before attempts run out, under the policy on the left."
                label="Eventual delivery"
              />

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-150 border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-muted-foreground text-left">
                      <th className="rounded-l-md px-4 py-2.5 font-normal">
                        Endpoint
                      </th>
                      <th className="px-4 py-2.5 font-normal">Failure rate</th>
                      <th className="px-4 py-2.5 font-normal">Delivered</th>
                      <th className="px-4 py-2.5 font-normal">Events lost</th>
                      <th className="rounded-r-md px-4 py-2.5 font-normal">
                        Attempt spread
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoints.map((endpoint) => (
                      <tr
                        className="border-b last:border-b-0"
                        key={endpoint.id}
                      >
                        <td className="px-4 py-3">
                          <span className="truncate font-medium">
                            {endpoint.host || "Untitled endpoint"}
                          </span>
                        </td>
                        <td className="text-muted-foreground px-4 py-3 tabular-nums">
                          {endpoint.failureRate}%
                        </td>
                        <td className="px-4 py-3 tabular-nums">
                          {formatDelivered(endpoint.failureRate, maxAttempts)}
                        </td>
                        <td className="text-muted-foreground px-4 py-3 tabular-nums">
                          {formatLostOdds(endpoint.failureRate, maxAttempts)}
                        </td>
                        <td className="px-4 py-3">
                          <AttemptSparkline
                            attempts={maxAttempts}
                            failureRate={endpoint.failureRate}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="border-t border-dashed" />

            <section>
              <LabelWithHint
                hint="Events still lost after every retry, as you vary attempts against endpoint health. Darker is better. The outlined cell is your current policy."
                label="Sensitivity grid"
              />

              <p className="text-muted-foreground mt-1 text-xs">
                Events lost after all attempts. Darker is better.
              </p>

              <div className="mt-4 overflow-x-auto">
                <div className="min-w-125">
                  <div className="flex">
                    <div className="w-14 shrink-0" />
                    <div className="grid flex-1 grid-cols-4">
                      {gridAttempts.map((attempts) => (
                        <div className="px-1" key={attempts}>
                          <p className="text-muted-foreground pb-1 text-center text-xs">
                            {attempts} attempts
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {gridFailureRates.map((rate) => (
                    <div className="flex items-stretch" key={rate}>
                      <div className="text-muted-foreground flex w-14 shrink-0 items-center justify-end pr-3 text-xs tabular-nums">
                        {rate}%
                      </div>
                      <div className="grid flex-1 grid-cols-4">
                        {gridAttempts.map((attempts) => {
                          const lost = lostFraction(rate, attempts);
                          // Shaded by orders of magnitude of loss, not by the
                          // percentage: on a linear ramp every cell above two
                          // nines saturates to the same block of colour.
                          const intensity = clamp(
                            -Math.log10(Math.max(lost, 1e-12)) / 8,
                            0.05,
                            1,
                          );
                          const isCurrent =
                            attempts === nearestGridAttempts &&
                            rate === nearestGridRate;

                          return (
                            <div
                              className={cn(
                                "grid h-14 place-items-center text-xs font-medium tabular-nums",
                                intensity > 0.62
                                  ? "text-primary-foreground"
                                  : "text-foreground",
                              )}
                              key={attempts}
                              style={{
                                background: `color-mix(in oklch, var(--primary) ${Math.round(intensity * 100)}%, var(--background))`,
                              }}
                            >
                              {/* The current cell is marked with a chip rather
                                  than an outline, so the shaded surface stays
                                  continuous the way the rest of the grid is. */}
                              <span
                                className={cn(
                                  isCurrent &&
                                    "bg-background text-foreground rounded-full px-2 py-0.5 font-semibold shadow-sm",
                                )}
                              >
                                {formatLostOdds(rate, attempts)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
