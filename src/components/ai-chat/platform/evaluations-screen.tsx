"use client";

import {
  ArrowDownToLine,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Settings2,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { downloadFile } from "./platform-data";
import {
  NoResults,
  PlatformPage,
  PlatformSelect,
  StatusBadge,
} from "./platform-ui";

type Example = { id: string; input: string; expected: string; output: string };
type Dataset = {
  id: string;
  name: string;
  description: string;
  version: number;
  rows: Example[];
};
const importedRowSchema = z.object({
  input: z.string().trim().min(1),
  expected: z.string().trim().min(1),
  output: z.string().trim().min(1),
});
type Result = Example & { passed: boolean };
type Run = {
  id: string;
  name: string;
  dataset: string;
  version: number;
  model: string;
  grader: string;
  status: "Completed" | "Running" | "Cancelled";
  results: Result[];
  created: string;
};
const datasetsSeed: Dataset[] = [
  {
    id: "ds_support",
    name: "Support answer quality",
    description:
      "Common support questions with expected phrases and candidate answers.",
    version: 3,
    rows: [
      {
        id: "row_1",
        input: "How long do refunds take?",
        expected: "5–10 business days",
        output: "Refunds arrive within 5–10 business days after approval.",
      },
      {
        id: "row_2",
        input: "Can I change my delivery address?",
        expected: "before dispatch",
        output:
          "You can update your address before dispatch in your order details.",
      },
      {
        id: "row_3",
        input: "My package is missing.",
        expected: "tracking",
        output: "Please share your tracking number so we can investigate.",
      },
      {
        id: "row_4",
        input: "How do I cancel my subscription?",
        expected: "billing settings",
        output: "Contact support to cancel your subscription.",
      },
      {
        id: "row_5",
        input: "Can I export my data?",
        expected: "settings",
        output: "Open Settings, then Data controls, and choose Export.",
      },
    ],
  },
  {
    id: "ds_intent",
    name: "Intent classification",
    description: "Exact-match labels for the customer request router.",
    version: 1,
    rows: [
      {
        id: "intent_1",
        input: "Where is my package?",
        expected: "delivery",
        output: "delivery",
      },
      {
        id: "intent_2",
        input: "Please return my payment.",
        expected: "refund",
        output: "refund",
      },
      {
        id: "intent_3",
        input: "I cannot log in.",
        expected: "account",
        output: "general",
      },
    ],
  },
];
function grade(rows: Example[], grader: string): Result[] {
  return rows.map((row) => ({
    ...row,
    passed:
      grader === "exact"
        ? row.output.trim().toLowerCase() === row.expected.trim().toLowerCase()
        : row.output.toLowerCase().includes(row.expected.trim().toLowerCase()),
  }));
}
const runsSeed: Run[] = [
  {
    id: "eval_092",
    name: "Support baseline",
    dataset: datasetsSeed[0].name,
    version: 3,
    model: "OpenAI / GPT-4.1",
    grader: "contains",
    status: "Completed",
    results: grade(datasetsSeed[0].rows, "contains"),
    created: "Sep 11, 10:42 AM",
  },
  {
    id: "eval_091",
    name: "Intent router",
    dataset: datasetsSeed[1].name,
    version: 1,
    model: "OpenAI / GPT-4.1 mini",
    grader: "exact",
    status: "Completed",
    results: grade(datasetsSeed[1].rows, "exact"),
    created: "Sep 10, 4:18 PM",
  },
];
const providerSeed = [
  {
    name: "OpenAI",
    enabled: true,
    endpoint: "https://api.openai.com/v1",
    model: "GPT-4.1",
  },
  {
    name: "Anthropic",
    enabled: false,
    endpoint: "https://api.anthropic.com",
    model: "Claude Sonnet",
  },
  {
    name: "Custom provider",
    enabled: false,
    endpoint: "https://models.example.com/v1",
    model: "custom-model",
  },
];
export function EvaluationsScreen() {
  const [tab, setTab] = useState("evaluations");
  const [datasets, setDatasets] = useState(datasetsSeed);
  const [runs, setRuns] = useState(runsSeed);
  const [providers, setProviders] = useState(providerSeed);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(runsSeed[0].id);
  const [dialog, setDialog] = useState<
    "dataset" | "row" | "run" | "import" | "delete" | "provider" | null
  >(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rowId, setRowId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [expected, setExpected] = useState("");
  const [output, setOutput] = useState("");
  const [runDataset, setRunDataset] = useState(datasetsSeed[0].id);
  const [provider, setProvider] = useState("OpenAI");
  const [grader, setGrader] = useState("contains");
  const [resultFilter, setResultFilter] = useState("all");
  const [error, setError] = useState("");
  const [jsonl, setJsonl] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [model, setModel] = useState("");
  const [connected, setConnected] = useState(false);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);
  const dataset = datasets.find((item) => item.id === datasetId);
  const run = runs.find((item) => item.id === runId);
  const filteredRuns = runs.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) &&
      (status === "all" || item.status === status),
  );
  const filteredDatasets = datasets.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()),
  );
  function open(kind: NonNullable<typeof dialog>) {
    setError("");
    setDialog(kind);
  }
  function editRow(row?: Example) {
    setRowId(row?.id ?? null);
    setInput(row?.input ?? "");
    setExpected(row?.expected ?? "");
    setOutput(row?.output ?? "");
    open("row");
  }
  function updateRows(rows: Example[]) {
    setDatasets((items) =>
      items.map((item) =>
        item.id === datasetId
          ? { ...item, rows, version: item.version + 1 }
          : item,
      ),
    );
  }
  function createDataset() {
    if (
      !name.trim() ||
      datasets.some(
        (item) => item.name.toLowerCase() === name.trim().toLowerCase(),
      )
    ) {
      setError("Enter a unique dataset name.");
      return;
    }
    const id = `ds_${globalThis.crypto?.randomUUID?.().slice(0, 8) ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}`;
    setDatasets((items) => [
      ...items,
      {
        id,
        name: name.trim(),
        description: description.trim(),
        version: 1,
        rows: [],
      },
    ]);
    setDatasetId(id);
    setDialog(null);
    setTab("datasets");
  }
  function importRows() {
    try {
      const parsed = jsonl
        .trim()
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line, i) => {
          const result = importedRowSchema.safeParse(JSON.parse(line));
          if (!result.success)
            throw new Error(
              `Line ${i + 1}: input, expected, and output must be nonempty strings.`,
            );
          const value = result.data;
          return {
            id:
              globalThis.crypto?.randomUUID?.() ??
              `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
            input: value.input,
            expected: value.expected,
            output: value.output,
          };
        });
      if (!parsed.length || parsed.length + (dataset?.rows.length ?? 0) > 100)
        throw new Error("A dataset can contain 1–100 examples.");
      updateRows([...(dataset?.rows ?? []), ...parsed]);
      setDialog(null);
      toast.success(`${parsed.length} examples imported`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSONL");
    }
  }
  function startRun() {
    const source = datasets.find((item) => item.id === runDataset);
    const selectedProvider = providers.find(
      (item) => item.name === provider && item.enabled,
    );
    if (!name.trim() || !source?.rows.length || !selectedProvider) {
      setError(
        "Enter a run name, select a nonempty dataset, and choose an enabled provider.",
      );
      return;
    }
    const id = `eval_${globalThis.crypto?.randomUUID?.().slice(0, 8) ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}`;
    const snapshot: Run = {
      id,
      name: name.trim(),
      dataset: source.name,
      version: source.version,
      model: `${provider} / ${selectedProvider.model}`,
      grader,
      status: "Running",
      results: grade(source.rows, grader),
      created: "Just now",
    };
    setRuns((items) => [snapshot, ...items]);
    setRunId(id);
    setResultFilter("all");
    setDialog(null);
    setTab("evaluations");
    timers.current.set(
      id,
      setTimeout(() => {
        setRuns((items) =>
          items.map((item) =>
            item.id === id ? { ...item, status: "Completed" } : item,
          ),
        );
        timers.current.delete(id);
      }, 1100),
    );
  }
  function cancelRun(id: string) {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setRuns((items) =>
      items.map((item) =>
        item.id === id ? { ...item, status: "Cancelled" } : item,
      ),
    );
  }
  const [configProvider, setConfigProvider] = useState("");
  function configureProvider(value: string) {
    const item = providers.find((entry) => entry.name === value)!;
    setConfigProvider(value);
    setEndpoint(item.endpoint);
    setModel(item.model);
    setConnected(item.enabled);
    open("provider");
  }
  function resetDemo() {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
    setDatasets(datasetsSeed);
    setRuns(runsSeed);
    setProviders(providerSeed);
    setTab("evaluations");
    setQuery("");
    setStatus("all");
    setDialog(null);
    setDatasetId(null);
    setRunId(runsSeed[0].id);
  }
  function openRunDialog() {
    setName("");
    setRunDataset(datasets.find((item) => item.rows.length)?.id ?? "");
    setProvider(providers.find((item) => item.enabled)?.name ?? "");
    setGrader("contains");
    open("run");
  }
  return (
    <PlatformPage
      title="Evaluations"
      description="Build datasets, grade candidate answers, and compare quality across runs."
      layout="table-detail"
      onReset={resetDemo}
      actions={
        <Button size="sm" onClick={openRunDialog}>
          <Plus data-icon="inline-start" />
          Create evaluation
        </Button>
      }
    >
      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value);
          setQuery("");
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="overflow-x-auto">
            <TabsList>
              <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
              <TabsTrigger value="datasets">Datasets</TabsTrigger>
              <TabsTrigger value="providers">Providers</TabsTrigger>
            </TabsList>
          </div>
          {tab !== "providers" ? (
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                <Input
                  aria-label="Search evaluations or datasets"
                  placeholder={
                    tab === "datasets"
                      ? "Search datasets…"
                      : "Search evaluations…"
                  }
                  className="w-full pl-9 sm:w-56"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              {tab === "evaluations" ? (
                <PlatformSelect
                  label="Evaluation status"
                  value={status}
                  onChange={setStatus}
                  options={[
                    { value: "all", label: "All statuses" },
                    "Completed",
                    "Running",
                    "Cancelled",
                  ]}
                />
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setName("");
                    setDescription("");
                    open("dataset");
                  }}
                >
                  <Plus data-icon="inline-start" />
                  New dataset
                </Button>
              )}
            </div>
          ) : null}
        </div>
        <TabsContent value="evaluations" className="mt-5">
          <div className="overflow-hidden rounded-lg border">
            {filteredRuns.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Evaluation</TableHead>
                    <TableHead>Dataset</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pass rate</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRuns.map((item) => (
                    <TableRow
                      key={item.id}
                      data-state={runId === item.id ? "selected" : undefined}
                    >
                      <TableCell className="pl-4">
                        <Button
                          variant="link"
                          className="text-foreground h-auto p-0"
                          onClick={() => {
                            setRunId(item.id);
                            setResultFilter("all");
                          }}
                        >
                          {item.name}
                        </Button>
                        <p className="text-muted-foreground mt-1 font-mono text-[10px]">
                          {item.id}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p>{item.dataset}</p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          Version {item.version} · {item.results.length}{" "}
                          examples
                        </p>
                      </TableCell>
                      <TableCell className="text-xs">{item.model}</TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {item.status === "Completed"
                          ? `${Math.round((item.results.filter((row) => row.passed).length / item.results.length) * 100)}%`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {item.created}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <NoResults
                onClear={() => {
                  setQuery("");
                  setStatus("all");
                }}
              />
            )}
          </div>
          <p className="text-muted-foreground mt-3 text-xs">
            Runs grade the candidate outputs stored in your dataset. No model
            request is made.
          </p>
        </TabsContent>
        <TabsContent value="datasets" className="mt-5">
          {filteredDatasets.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredDatasets.map((item) => (
                <Card key={item.id} className="shadow-none">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle>
                        <button
                          className="text-left hover:underline"
                          onClick={() => setDatasetId(item.id)}
                        >
                          {item.name}
                        </button>
                      </CardTitle>
                      <Badge variant="outline">v{item.version}</Badge>
                    </div>
                    <CardDescription className="min-h-10 leading-5">
                      {item.description || "A custom evaluation dataset."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">
                        {item.rows.length} examples
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDatasetId(item.id)}
                      >
                        Open dataset
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <NoResults title="No datasets found" onClear={() => setQuery("")} />
          )}
        </TabsContent>
        <TabsContent value="providers" className="mt-5">
          <div className="max-w-3xl space-y-4">
            <div>
              <h2 className="text-base font-medium">Model providers</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Choose the provider labels available when creating an
                evaluation.
              </p>
            </div>
            {providers.map((item) => (
              <div
                key={item.name}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-muted rounded-lg p-2.5">
                    <Settings2 className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {item.model}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={item.enabled ? "Ready" : "Disabled"} />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => configureProvider(item.name)}
                  >
                    Configure
                  </Button>
                </div>
              </div>
            ))}
            <p className="text-muted-foreground text-xs">
              Demo configurations use no credentials and never contact provider
              endpoints.
            </p>
          </div>
        </TabsContent>
      </Tabs>
      <Sheet
        open={!!datasetId}
        onOpenChange={(value) => {
          if (!value) setDatasetId(null);
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
          <SheetHeader>
            <SheetTitle>{dataset?.name}</SheetTitle>
            <SheetDescription>
              {dataset?.description ||
                "Manage input, expected phrase, and candidate output examples."}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge variant="outline">
                Version {dataset?.version} · {dataset?.rows.length} examples
              </Badge>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setJsonl("");
                    open("import");
                  }}
                >
                  <Upload data-icon="inline-start" />
                  Import JSONL
                </Button>
                <Button
                  size="sm"
                  onClick={() => editRow()}
                  disabled={(dataset?.rows.length ?? 0) >= 100}
                >
                  <Plus data-icon="inline-start" />
                  Add example
                </Button>
              </div>
            </div>
            {dataset?.rows.length ? (
              <div className="divide-y rounded-lg border">
                {dataset.rows.map((row, index) => (
                  <div key={row.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-muted-foreground mb-1 text-[10px]">
                          EXAMPLE {index + 1}
                        </p>
                        <p className="text-sm font-medium">{row.input}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit example ${index + 1}`}
                          onClick={() => editRow(row)}
                        >
                          <MoreHorizontal />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete example ${index + 1}`}
                          onClick={() =>
                            updateRows(
                              dataset.rows.filter((item) => item.id !== row.id),
                            )
                          }
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-muted-foreground text-[11px]">
                          Expected
                        </p>
                        <p className="mt-1 text-xs leading-5">{row.expected}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[11px]">
                          Candidate output
                        </p>
                        <p className="mt-1 text-xs leading-5">{row.output}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <NoResults
                title="Add your first example"
                description="Create an example or import JSONL to start evaluating."
              />
            )}
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={!dataset?.rows.length}
                onClick={() =>
                  downloadFile(
                    `${dataset?.id}.jsonl`,
                    dataset!.rows
                      .map(({ input, expected, output }) =>
                        JSON.stringify({ input, expected, output }),
                      )
                      .join("\n"),
                    "application/x-ndjson",
                  )
                }
              >
                <ArrowDownToLine data-icon="inline-start" />
                Export dataset
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => open("delete")}
              >
                Delete dataset
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Edits create a new dataset version. Existing evaluation results
              keep their original snapshot.
            </p>
          </div>
        </SheetContent>
      </Sheet>
      {tab === "evaluations" ? (
        <section
          aria-label="Selected evaluation results"
          className="overflow-hidden rounded-lg border"
        >
          <div className="bg-muted/20 flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
            <div>
              <p className="text-sm font-medium">
                {run?.name ?? "Select an evaluation"}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {run
                  ? `${run.dataset} · v${run.version} · ${run.model}`
                  : "Choose a row in the table to inspect its stored results."}
              </p>
            </div>
            {run ? <StatusBadge status={run.status} /> : null}
          </div>
          {run ? (
            <div className="space-y-5 p-5">
              <div className="flex flex-wrap items-center justify-end gap-3">
                <span className="text-muted-foreground text-xs">
                  {run.grader === "exact"
                    ? "Exact match"
                    : "Contains expected phrase"}{" "}
                  · case insensitive
                </span>
              </div>
              {run.status === "Running" ? (
                <div className="space-y-4 rounded-lg border p-6">
                  <p className="text-sm">
                    Grading {run.results.length} stored candidate outputs…
                  </p>
                  <Progress value={45} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => cancelRun(run.id)}
                  >
                    Cancel evaluation
                  </Button>
                </div>
              ) : run.status === "Cancelled" ? (
                <NoResults
                  title="Evaluation cancelled"
                  description="Create another evaluation to grade this dataset."
                />
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3 rounded-lg border p-5">
                    <div>
                      <p className="text-muted-foreground text-xs">Pass rate</p>
                      <p className="mt-2 text-2xl font-semibold tabular-nums">
                        {Math.round(
                          (run.results.filter((row) => row.passed).length /
                            run.results.length) *
                            100,
                        )}
                        %
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Passed</p>
                      <p className="mt-2 text-2xl font-semibold tabular-nums">
                        {run.results.filter((row) => row.passed).length}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Failed</p>
                      <p className="mt-2 text-2xl font-semibold tabular-nums">
                        {run.results.filter((row) => !row.passed).length}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2">
                    <PlatformSelect
                      label="Evaluation result filter"
                      value={resultFilter}
                      onChange={setResultFilter}
                      options={[
                        { value: "all", label: "All examples" },
                        { value: "passed", label: "Passed only" },
                        { value: "failed", label: "Failed only" },
                      ]}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        downloadFile(
                          `${run.id}.json`,
                          JSON.stringify(run, null, 2),
                        )
                      }
                    >
                      Export results
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {run.results
                      .filter(
                        (row) =>
                          resultFilter === "all" ||
                          row.passed === (resultFilter === "passed"),
                      )
                      .map((row) => (
                        <div key={row.id} className="rounded-lg border p-4">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-medium">{row.input}</p>
                            <Badge
                              variant="outline"
                              className={
                                row.passed ? "text-success" : "text-destructive"
                              }
                            >
                              {row.passed ? "Passed" : "Failed"}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mt-3 text-[11px]">
                            Expected{" "}
                            {run.grader === "exact" ? "answer" : "phrase"}
                          </p>
                          <p className="mt-1 text-xs leading-5">
                            {row.expected}
                          </p>
                          <p className="text-muted-foreground mt-3 text-[11px]">
                            Candidate output
                          </p>
                          <p className="mt-1 text-sm leading-6">{row.output}</p>
                        </div>
                      ))}
                    {!run.results.some(
                      (row) =>
                        resultFilter === "all" ||
                        row.passed === (resultFilter === "passed"),
                    ) ? (
                      <NoResults
                        title="No examples in this result group"
                        onClear={() => setResultFilter("all")}
                      />
                    ) : null}
                  </div>
                </>
              )}
            </div>
          ) : null}
        </section>
      ) : null}
      <Dialog
        open={!!dialog}
        onOpenChange={(value) => {
          if (!value) setDialog(null);
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialog === "dataset"
                ? "Create dataset"
                : dialog === "row"
                  ? rowId
                    ? "Edit example"
                    : "Add example"
                  : dialog === "import"
                    ? "Import examples"
                    : dialog === "run"
                      ? "Create evaluation"
                      : dialog === "provider"
                        ? `Configure ${configProvider}`
                        : "Delete dataset?"}
            </DialogTitle>
            <DialogDescription>
              {dialog === "import"
                ? "Paste one JSON object per line with input, expected, and output strings. Up to 100 examples per dataset."
                : dialog === "run"
                  ? "Run a local grader against stored candidate outputs. Provider selection labels the run."
                  : dialog === "delete"
                    ? "This removes the dataset from the demo. Completed runs retain their results."
                    : dialog === "provider"
                      ? "Configure a demo provider. No credentials or external connection are required."
                      : "Changes are kept for this demo session."}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            {dialog === "dataset" || dialog === "run" ? (
              <Field>
                <FieldLabel htmlFor="evaluation-name">Name</FieldLabel>
                <Input
                  id="evaluation-name"
                  value={name}
                  maxLength={80}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    dialog === "dataset"
                      ? "Customer support examples"
                      : "Support quality check"
                  }
                />
              </Field>
            ) : null}
            {dialog === "dataset" ? (
              <Field>
                <FieldLabel htmlFor="dataset-description">
                  Description
                </FieldLabel>
                <Textarea
                  id="dataset-description"
                  value={description}
                  maxLength={300}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>
            ) : null}
            {dialog === "row" ? (
              <>
                <Field>
                  <FieldLabel htmlFor="example-input">Input</FieldLabel>
                  <Textarea
                    id="example-input"
                    value={input}
                    maxLength={2000}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="example-expected">
                    Expected phrase or label
                  </FieldLabel>
                  <Input
                    id="example-expected"
                    value={expected}
                    maxLength={1000}
                    onChange={(e) => setExpected(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="example-output">
                    Candidate output
                  </FieldLabel>
                  <Textarea
                    id="example-output"
                    value={output}
                    maxLength={4000}
                    onChange={(e) => setOutput(e.target.value)}
                  />
                </Field>
              </>
            ) : null}
            {dialog === "import" ? (
              <Field>
                <FieldLabel htmlFor="dataset-jsonl">JSONL content</FieldLabel>
                <Textarea
                  id="dataset-jsonl"
                  value={jsonl}
                  maxLength={100000}
                  onChange={(e) => setJsonl(e.target.value)}
                  className="min-h-48 font-mono text-xs"
                  placeholder={
                    '{"input":"Where is my order?","expected":"tracking","output":"Check your tracking link."}'
                  }
                />
              </Field>
            ) : null}
            {dialog === "run" ? (
              <>
                <Field>
                  <FieldLabel>Dataset</FieldLabel>
                  <PlatformSelect
                    label="Evaluation dataset"
                    value={runDataset}
                    onChange={setRunDataset}
                    options={datasets
                      .filter((item) => item.rows.length)
                      .map((item) => ({
                        value: item.id,
                        label: `${item.name} · ${item.rows.length} examples`,
                      }))}
                  />
                  {!datasets.some((item) => item.rows.length) ? (
                    <FieldDescription>
                      Add examples to a dataset first.
                    </FieldDescription>
                  ) : null}
                </Field>
                <Field>
                  <FieldLabel>Provider</FieldLabel>
                  <PlatformSelect
                    label="Evaluation provider"
                    value={provider}
                    onChange={setProvider}
                    options={providers
                      .filter((item) => item.enabled)
                      .map((item) => item.name)}
                  />
                  {!providers.some((item) => item.enabled) ? (
                    <FieldDescription>
                      Enable a provider in the Providers tab.
                    </FieldDescription>
                  ) : null}
                </Field>
                <Field>
                  <FieldLabel>Grader</FieldLabel>
                  <PlatformSelect
                    label="Evaluation grader"
                    value={grader}
                    onChange={setGrader}
                    options={[
                      {
                        value: "contains",
                        label: "Contains expected phrase",
                      },
                      { value: "exact", label: "Exact match" },
                    ]}
                  />
                  <FieldDescription>
                    Both graders ignore letter case. Exact match also trims
                    surrounding spaces.
                  </FieldDescription>
                </Field>
              </>
            ) : null}
            {dialog === "provider" ? (
              <>
                <Field>
                  <FieldLabel htmlFor="provider-endpoint">
                    Endpoint URL
                  </FieldLabel>
                  <Input
                    id="provider-endpoint"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="provider-model">Model label</FieldLabel>
                  <Input
                    id="provider-model"
                    value={model}
                    maxLength={60}
                    onChange={(e) => setModel(e.target.value)}
                  />
                </Field>
                <Field orientation="horizontal">
                  <FieldLabel htmlFor="provider-enabled" className="flex-1">
                    Available for evaluations
                  </FieldLabel>
                  <Switch
                    id="provider-enabled"
                    checked={connected}
                    onCheckedChange={setConnected}
                  />
                </Field>
              </>
            ) : null}
          </FieldGroup>
          {error ? (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button
              variant={dialog === "delete" ? "destructive" : "default"}
              onClick={() => {
                if (dialog === "dataset") createDataset();
                else if (dialog === "run") startRun();
                else if (dialog === "import") importRows();
                else if (dialog === "row") {
                  if (!input.trim() || !expected.trim() || !output.trim()) {
                    setError("All three fields are required.");
                    return;
                  }
                  const row = {
                    id:
                      rowId ??
                      globalThis.crypto?.randomUUID?.() ??
                      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
                    input: input.trim(),
                    expected: expected.trim(),
                    output: output.trim(),
                  };
                  updateRows(
                    rowId
                      ? dataset!.rows.map((item) =>
                          item.id === rowId ? row : item,
                        )
                      : [...dataset!.rows, row],
                  );
                  setDialog(null);
                } else if (dialog === "delete") {
                  setDatasets((items) =>
                    items.filter((item) => item.id !== datasetId),
                  );
                  setDatasetId(null);
                  setDialog(null);
                } else if (dialog === "provider") {
                  try {
                    if (
                      new URL(endpoint).protocol !== "https:" ||
                      !model.trim()
                    )
                      throw new Error();
                  } catch {
                    setError("Enter a valid HTTPS endpoint and a model label.");
                    return;
                  }
                  setProviders((items) =>
                    items.map((item) =>
                      item.name === configProvider
                        ? {
                            ...item,
                            endpoint: endpoint.trim(),
                            model: model.trim(),
                            enabled: connected,
                          }
                        : item,
                    ),
                  );
                  setDialog(null);
                  toast.success("Demo provider saved");
                }
              }}
            >
              {dialog === "run" ? <Play data-icon="inline-start" /> : null}
              {dialog === "dataset"
                ? "Create dataset"
                : dialog === "run"
                  ? "Run evaluation"
                  : dialog === "import"
                    ? "Import examples"
                    : dialog === "delete"
                      ? "Delete dataset"
                      : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PlatformPage>
  );
}
