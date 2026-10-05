export type RunStatus =
  | "running"
  | "review"
  | "blocked"
  | "completed"
  | "failed"
  | "cancelled";
export type StepStatus = RunStatus | "waiting" | "skipped";

export interface ActivityStep {
  title: string;
  system: string;
  detail: string;
  status: StepStatus;
}

export interface AgentRun {
  id: string;
  title: string;
  agent: string;
  time: string;
  minutesAgo: number;
  status: RunStatus;
  duration: string;
  steps: ActivityStep[];
  rule?: {
    id: string;
    name: string;
    description: string;
    requested: string;
    allowed: string;
  };
  output?: { name: string; content: string };
  decision?: string;
}

const done = (title: string, system: string, detail: string): ActivityStep => ({
  title,
  system,
  detail,
  status: "completed",
});

export const initialAgentRuns: AgentRun[] = [
  {
    id: "run_91ac",
    title: "Process customer refund",
    agent: "Refund processor",
    time: "12:44",
    minutesAgo: 1,
    status: "running",
    duration: "8s",
    steps: [
      done("Find original payment", "Stripe", "Payment pi_84kc · $129.00"),
      {
        title: "Issue refund",
        system: "Stripe",
        detail: "Returning $129.00 to the original payment method",
        status: "running",
      },
      {
        title: "Update billing record",
        system: "NetSuite",
        detail: "Waiting for refund confirmation",
        status: "waiting",
      },
    ],
    output: {
      name: "refund-receipt.txt",
      content:
        "Refund receipt\nPayment: pi_84kc\nCustomer: Maya Chen\nAmount: $129.00\nStatus: refunded\n",
    },
  },
  {
    id: "run_84f2",
    title: "Prepare customer report",
    agent: "Customer reporting",
    time: "12:42",
    minutesAgo: 3,
    status: "review",
    duration: "2m",
    steps: [
      done(
        "Read customer data",
        "BigQuery",
        "3,120 active customer records · 1.8s",
      ),
      done(
        "Calculate metrics",
        "Internal tool",
        "Revenue, retention, and account health · 4.1s",
      ),
      {
        title: "Export 3,120 records",
        system: "Tableau",
        detail: "2,420 records over the review threshold",
        status: "review",
      },
      {
        title: "Notify dashboard owner",
        system: "Slack",
        detail: "Not started · waiting for the export decision",
        status: "waiting",
      },
    ],
    rule: {
      id: "data-export",
      name: "Customer data export",
      description:
        "Exports above 700 customer records require review before data leaves the reporting workspace.",
      requested: "3,120 records",
      allowed: "700 records without review",
    },
    output: {
      name: "customer-report-summary.csv",
      content:
        "metric,value\nactive_customers,3120\nmonthly_revenue,284560\nretention_rate,0.962\naccounts_needing_followup,38\n",
    },
  },
  {
    id: "run_78de",
    title: "Apply discount to Deal #9031",
    agent: "Deal desk",
    time: "12:39",
    minutesAgo: 6,
    status: "blocked",
    duration: "5m",
    steps: [
      done(
        "Read deal details",
        "Salesforce",
        "Harborline Apps · annual team plan",
      ),
      {
        title: "Apply 35% discount",
        system: "Salesforce",
        detail: "Requested 35% · maximum allowed 20%",
        status: "blocked",
      },
      {
        title: "Recalculate quote",
        system: "Internal tool",
        detail: "Waiting for a compliant discount",
        status: "waiting",
      },
      {
        title: "Notify account owner",
        system: "Slack",
        detail: "Waiting for the updated quote",
        status: "waiting",
      },
    ],
    rule: {
      id: "discount-limit",
      name: "Discount policy",
      description:
        "Deal desk can apply discounts up to 20%. A larger discount cannot proceed under this rule. Revise the request to continue.",
      requested: "35% discount",
      allowed: "20% maximum",
    },
  },
  {
    id: "run_c31f",
    title: "Reconcile Stripe payouts",
    agent: "Invoice reconciliation",
    time: "12:35",
    minutesAgo: 10,
    status: "completed",
    duration: "42s",
    steps: [
      done(
        "Read payout transactions",
        "Stripe",
        "24 transactions · $18,420.00",
      ),
      done("Match invoice records", "NetSuite", "24 of 24 invoices matched"),
      done("Save reconciliation", "NetSuite", "No discrepancies found"),
    ],
    output: {
      name: "payout-reconciliation.csv",
      content:
        "payout,invoices,amount,status\npo_91ad,24,18420.00,reconciled\n",
    },
  },
  {
    id: "run_b7a1",
    title: "Refresh renewal forecast",
    agent: "Customer reporting",
    time: "12:28",
    minutesAgo: 17,
    status: "completed",
    duration: "31s",
    steps: [
      done(
        "Load renewal pipeline",
        "Salesforce",
        "86 accounts renewing this quarter",
      ),
      done(
        "Calculate renewal risk",
        "Internal tool",
        "7 accounts need attention",
      ),
      done("Publish forecast", "Tableau", "Quarterly forecast updated"),
    ],
  },
  {
    id: "run_a19c",
    title: "Archive resolved tickets",
    agent: "Support triage",
    time: "12:16",
    minutesAgo: 29,
    status: "completed",
    duration: "18s",
    steps: [
      done(
        "Find resolved tickets",
        "Zendesk",
        "42 tickets resolved more than 30 days ago",
      ),
      done(
        "Check retention policy",
        "Internal tool",
        "All records eligible for archive",
      ),
      done("Archive tickets", "Zendesk", "42 tickets archived"),
    ],
  },
  {
    id: "run_f42b",
    title: "Sync purchase order records",
    agent: "Purchase order review",
    time: "11:58",
    minutesAgo: 47,
    status: "failed",
    duration: "12s",
    steps: [
      done(
        "Read approved purchase orders",
        "Coupa",
        "12 approved purchase orders",
      ),
      {
        title: "Sync vendor records",
        system: "NetSuite",
        detail: "Connection timed out after 10s · safe to retry",
        status: "failed",
      },
      {
        title: "Publish sync summary",
        system: "Slack",
        detail: "Not started · waiting for vendor records",
        status: "waiting",
      },
    ],
  },
  {
    id: "run_02cd",
    title: "Prepare weekly account digest",
    agent: "Customer reporting",
    time: "11:45",
    minutesAgo: 60,
    status: "completed",
    duration: "54s",
    steps: [
      done("Collect account updates", "Salesforce", "18 account updates"),
      done("Summarize activity", "Internal tool", "Weekly digest prepared"),
      done("Send account digest", "Slack", "Posted to #customer-success"),
    ],
  },
  {
    id: "run_d310",
    title: "Route incoming support requests",
    agent: "Support triage",
    time: "10:32",
    minutesAgo: 133,
    status: "completed",
    duration: "26s",
    steps: [
      done("Read new requests", "Zendesk", "16 new support requests"),
      done("Classify priority", "Internal tool", "2 urgent · 6 normal · 8 low"),
      done("Assign support owners", "Zendesk", "All 16 requests assigned"),
    ],
  },
  {
    id: "run_2e17",
    title: "Review vendor onboarding",
    agent: "Purchase order review",
    time: "09:14",
    minutesAgo: 211,
    status: "completed",
    duration: "1m 12s",
    steps: [
      done(
        "Read vendor submission",
        "Coupa",
        "Vela Design Co. · vendor profile",
      ),
      done(
        "Verify required fields",
        "Internal tool",
        "Tax details and contact information present",
      ),
      done("Create vendor record", "NetSuite", "Vendor V-2048 created"),
    ],
  },
  {
    id: "run_62ca",
    title: "Validate monthly billing export",
    agent: "Invoice reconciliation",
    time: "Yesterday, 16:20",
    minutesAgo: 1225,
    status: "completed",
    duration: "38s",
    steps: [
      done("Load billing export", "Stripe", "Monthly billing summary"),
      done("Validate totals", "NetSuite", "Matched general ledger"),
      done("Save report", "Internal tool", "Billing export validated"),
    ],
  },
  {
    id: "run_519f",
    title: "Refresh customer health scores",
    agent: "Customer reporting",
    time: "Sep 4, 14:10",
    minutesAgo: 2795,
    status: "completed",
    duration: "46s",
    steps: [
      done("Read account signals", "BigQuery", "Usage and support activity"),
      done("Calculate health scores", "Internal tool", "3,120 accounts scored"),
      done("Publish dashboard", "Tableau", "Customer health dashboard updated"),
    ],
  },
];

export type RunAction =
  | { type: "advance" }
  | { type: "approve"; note: string }
  | { type: "reject"; note: string }
  | { type: "revise-discount"; value: number }
  | { type: "retry" };

// Transitions preserve completed work and never advance past review/rule gates.
export function transitionRun(run: AgentRun, action: RunAction): AgentRun {
  const steps = run.steps.map((step) => ({ ...step }));
  if (
    action.type === "reject" &&
    run.status === "review" &&
    action.note.trim()
  ) {
    return {
      ...run,
      status: "cancelled",
      decision: `Rejected · ${action.note.trim()}`,
      steps: steps.map((step) =>
        step.status === "completed" ? step : { ...step, status: "skipped" },
      ),
    };
  }
  if (action.type === "approve" && run.status === "review") {
    const index = steps.findIndex((step) => step.status === "review");
    if (index < 0) return run;
    steps[index].status = "running";
    steps[index].detail = "Approved for this run · exporting records";
    for (const step of steps.slice(index + 1)) {
      if (step.status === "waiting")
        step.detail = "Not started · waiting for the export to finish";
    }
    return {
      ...run,
      status: "running",
      decision: `Approved for this run${action.note.trim() ? ` · ${action.note.trim()}` : ""}`,
      steps,
    };
  }
  if (
    action.type === "revise-discount" &&
    run.status === "blocked" &&
    Number.isFinite(action.value) &&
    action.value >= 0 &&
    action.value <= 20
  ) {
    const index = steps.findIndex((step) => step.status === "blocked");
    if (index < 0) return run;
    steps[index] = {
      ...steps[index],
      title: `Apply ${action.value}% discount`,
      detail: "Revised request is within the 20% policy limit",
      status: "running",
    };
    return {
      ...run,
      status: "running",
      steps,
      decision: `Request revised from 35% to ${action.value}%`,
      rule: run.rule
        ? { ...run.rule, requested: `${action.value}% discount` }
        : undefined,
    };
  }
  if (action.type === "retry" && run.status === "failed") {
    const index = steps.findIndex((step) => step.status === "failed");
    if (index < 0) return run;
    steps[index] = {
      ...steps[index],
      status: "running",
      detail: "Retrying connection · completed work preserved",
    };
    return {
      ...run,
      status: "running",
      steps,
      decision: "Retry started from the failed step",
    };
  }
  if (action.type === "advance" && run.status === "running") {
    const index = steps.findIndex((step) => step.status === "running");
    if (index < 0) return run;
    steps[index].status = "completed";
    steps[index].detail = "Completed successfully";
    const next = steps.find(
      (step) => step.status !== "completed" && step.status !== "skipped",
    );
    if (next?.status === "waiting") {
      next.status = "running";
      next.detail = "Executing this step";
    }
    const status: RunStatus = !next
      ? "completed"
      : next.status === "review" ||
          next.status === "blocked" ||
          next.status === "failed" ||
          next.status === "cancelled"
        ? next.status
        : "running";
    return { ...run, status, steps };
  }
  return run;
}

export interface ActivityFilters {
  query: string;
  period: string;
  status: string;
  sort: string;
}
export const defaultActivityFilters: ActivityFilters = {
  query: "",
  period: "24h",
  status: "all",
  sort: "newest",
};
export function filterAgentRuns(runs: AgentRun[], filters: ActivityFilters) {
  const query = filters.query.trim().toLowerCase();
  const limit =
    filters.period === "1h" ? 60 : filters.period === "24h" ? 1440 : 10080;
  return runs
    .filter(
      (run) =>
        run.minutesAgo <= limit &&
        (!query ||
          [
            run.id,
            run.title,
            run.agent,
            ...run.steps.map((step) => step.title),
          ].some((text) => text.toLowerCase().includes(query))) &&
        (filters.status === "all" ||
          (filters.status === "attention"
            ? ["review", "blocked", "failed"].includes(run.status)
            : run.status === filters.status)),
    )
    .sort((a, b) =>
      filters.sort === "oldest"
        ? b.minutesAgo - a.minutesAgo
        : a.minutesAgo - b.minutesAgo,
    );
}
