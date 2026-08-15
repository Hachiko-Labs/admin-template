"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  CreditCard,
  Download,
  Ellipsis,
  Filter,
  MoreHorizontal,
  Pause,
  Plus,
  Search,
  Users,
} from "lucide-react";
import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "paused"
  | "cancelled";

type Plan = {
  id: string;
  name: string;
  interval: string;
  price: string;
  status: "Active" | "Archived";
  subscribers: number;
  mrr: string;
  mrrValue: number;
  growth: string;
  churn: string;
  trialConversion: string;
  color: string;
  trend: number[];
};

type Subscriber = {
  id: string;
  name: string;
  initials: string;
  email: string;
  avatar: string;
  status: SubscriptionStatus;
  planId: string;
  amount: string;
  paymentMethod: string;
  joined: string;
  joinedDateTime: string;
  nextPayment: string;
  nextPaymentDateTime?: string;
};

const plans: Plan[] = [
  {
    id: "pro-monthly",
    name: "Pro Monthly",
    interval: "Monthly",
    price: "$29",
    status: "Active",
    subscribers: 842,
    mrr: "$24,418",
    mrrValue: 24418,
    growth: "+12.8%",
    churn: "2.4%",
    trialConversion: "68.2%",
    color: "bg-emerald-500",
    trend: [16840, 17410, 18220, 19080, 20160, 21340, 22610, 24418],
  },
  {
    id: "team-yearly",
    name: "Team Yearly",
    interval: "Yearly",
    price: "$348",
    status: "Active",
    subscribers: 316,
    mrr: "$9,164",
    mrrValue: 9164,
    growth: "+8.6%",
    churn: "1.1%",
    trialConversion: "74.6%",
    color: "bg-sky-500",
    trend: [6230, 6610, 6940, 7280, 7690, 8120, 8680, 9164],
  },
  {
    id: "studio-monthly",
    name: "Studio Monthly",
    interval: "Monthly",
    price: "$79",
    status: "Active",
    subscribers: 184,
    mrr: "$14,536",
    mrrValue: 14536,
    growth: "+5.2%",
    churn: "3.7%",
    trialConversion: "61.8%",
    color: "bg-violet-500",
    trend: [11320, 11840, 12210, 12780, 13140, 13720, 14090, 14536],
  },
  {
    id: "starter-monthly",
    name: "Starter Monthly",
    interval: "Monthly",
    price: "$12",
    status: "Active",
    subscribers: 1264,
    mrr: "$15,168",
    mrrValue: 15168,
    growth: "+18.4%",
    churn: "4.8%",
    trialConversion: "79.4%",
    color: "bg-amber-500",
    trend: [8410, 9120, 10140, 10860, 11980, 12940, 14080, 15168],
  },
  {
    id: "agency-yearly",
    name: "Agency Yearly",
    interval: "Yearly",
    price: "$1,188",
    status: "Active",
    subscribers: 92,
    mrr: "$9,108",
    mrrValue: 9108,
    growth: "+3.1%",
    churn: "0.8%",
    trialConversion: "52.1%",
    color: "bg-rose-500",
    trend: [7580, 7710, 8020, 8260, 8420, 8690, 8870, 9108],
  },
  {
    id: "components-monthly",
    name: "Components Monthly",
    interval: "Monthly",
    price: "$19",
    status: "Archived",
    subscribers: 48,
    mrr: "$912",
    mrrValue: 912,
    growth: "-6.7%",
    churn: "8.9%",
    trialConversion: "41.3%",
    color: "bg-zinc-400",
    trend: [1420, 1370, 1290, 1240, 1180, 1090, 980, 912],
  },
  {
    id: "scale-monthly",
    name: "Scale Monthly",
    interval: "Monthly",
    price: "$149",
    status: "Active",
    subscribers: 138,
    mrr: "$20,562",
    mrrValue: 20562,
    growth: "+9.9%",
    churn: "1.9%",
    trialConversion: "71.6%",
    color: "bg-cyan-500",
    trend: [15180, 15860, 16640, 17480, 18320, 19210, 19840, 20562],
  },
  {
    id: "starter-yearly",
    name: "Starter Yearly",
    interval: "Yearly",
    price: "$120",
    status: "Active",
    subscribers: 428,
    mrr: "$4,280",
    mrrValue: 4280,
    growth: "+6.4%",
    churn: "2.2%",
    trialConversion: "64.8%",
    color: "bg-lime-500",
    trend: [3280, 3420, 3610, 3780, 3910, 4050, 4160, 4280],
  },
  {
    id: "pro-yearly",
    name: "Pro Yearly",
    interval: "Yearly",
    price: "$290",
    status: "Active",
    subscribers: 256,
    mrr: "$6,187",
    mrrValue: 6187,
    growth: "+10.3%",
    churn: "1.4%",
    trialConversion: "76.9%",
    color: "bg-indigo-500",
    trend: [4360, 4610, 4930, 5180, 5470, 5790, 6040, 6187],
  },
  {
    id: "enterprise-monthly",
    name: "Enterprise Monthly",
    interval: "Monthly",
    price: "$399",
    status: "Active",
    subscribers: 36,
    mrr: "$14,364",
    mrrValue: 14364,
    growth: "+4.7%",
    churn: "0.6%",
    trialConversion: "48.7%",
    color: "bg-fuchsia-500",
    trend: [11680, 11940, 12320, 12780, 13240, 13680, 14020, 14364],
  },
  {
    id: "education-yearly",
    name: "Education Yearly",
    interval: "Yearly",
    price: "$228",
    status: "Active",
    subscribers: 74,
    mrr: "$1,406",
    mrrValue: 1406,
    growth: "+2.8%",
    churn: "3.1%",
    trialConversion: "57.4%",
    color: "bg-orange-500",
    trend: [1210, 1230, 1270, 1300, 1320, 1360, 1380, 1406],
  },
  {
    id: "legacy-team",
    name: "Legacy Team",
    interval: "Monthly",
    price: "$49",
    status: "Archived",
    subscribers: 67,
    mrr: "$3,283",
    mrrValue: 3283,
    growth: "-2.1%",
    churn: "6.3%",
    trialConversion: "44.2%",
    color: "bg-slate-500",
    trend: [3810, 3740, 3660, 3590, 3510, 3440, 3370, 3283],
  },
  {
    id: "creator-monthly",
    name: "Creator Monthly",
    interval: "Monthly",
    price: "$39",
    status: "Active",
    subscribers: 312,
    mrr: "$12,168",
    mrrValue: 12168,
    growth: "+7.5%",
    churn: "3.5%",
    trialConversion: "69.1%",
    color: "bg-teal-500",
    trend: [9340, 9710, 10120, 10680, 11230, 11620, 11940, 12168],
  },
  {
    id: "creator-yearly",
    name: "Creator Yearly",
    interval: "Yearly",
    price: "$390",
    status: "Active",
    subscribers: 126,
    mrr: "$4,095",
    mrrValue: 4095,
    growth: "+5.8%",
    churn: "1.6%",
    trialConversion: "72.8%",
    color: "bg-blue-500",
    trend: [3210, 3340, 3490, 3610, 3740, 3890, 3990, 4095],
  },
  {
    id: "business-monthly",
    name: "Business Monthly",
    interval: "Monthly",
    price: "$99",
    status: "Active",
    subscribers: 221,
    mrr: "$21,879",
    mrrValue: 21879,
    growth: "+13.2%",
    churn: "2.1%",
    trialConversion: "66.7%",
    color: "bg-green-500",
    trend: [15680, 16420, 17360, 18120, 19140, 20160, 21120, 21879],
  },
  {
    id: "business-yearly",
    name: "Business Yearly",
    interval: "Yearly",
    price: "$990",
    status: "Active",
    subscribers: 98,
    mrr: "$8,085",
    mrrValue: 8085,
    growth: "+4.4%",
    churn: "0.9%",
    trialConversion: "59.3%",
    color: "bg-purple-500",
    trend: [6810, 6940, 7120, 7310, 7530, 7720, 7930, 8085],
  },
  {
    id: "nonprofit-monthly",
    name: "Nonprofit Monthly",
    interval: "Monthly",
    price: "$24",
    status: "Active",
    subscribers: 143,
    mrr: "$3,432",
    mrrValue: 3432,
    growth: "+1.9%",
    churn: "4.2%",
    trialConversion: "54.8%",
    color: "bg-yellow-500",
    trend: [3160, 3190, 3220, 3290, 3330, 3370, 3400, 3432],
  },
  {
    id: "nonprofit-yearly",
    name: "Nonprofit Yearly",
    interval: "Yearly",
    price: "$240",
    status: "Active",
    subscribers: 88,
    mrr: "$1,760",
    mrrValue: 1760,
    growth: "+3.6%",
    churn: "2.7%",
    trialConversion: "58.9%",
    color: "bg-pink-500",
    trend: [1420, 1480, 1510, 1560, 1620, 1670, 1710, 1760],
  },
  {
    id: "campus-monthly",
    name: "Campus Monthly",
    interval: "Monthly",
    price: "$59",
    status: "Active",
    subscribers: 116,
    mrr: "$6,844",
    mrrValue: 6844,
    growth: "+8.1%",
    churn: "2.9%",
    trialConversion: "63.5%",
    color: "bg-red-500",
    trend: [4980, 5210, 5480, 5710, 5980, 6310, 6620, 6844],
  },
  {
    id: "campus-yearly",
    name: "Campus Yearly",
    interval: "Yearly",
    price: "$590",
    status: "Active",
    subscribers: 54,
    mrr: "$2,655",
    mrrValue: 2655,
    growth: "+2.3%",
    churn: "1.8%",
    trialConversion: "51.6%",
    color: "bg-neutral-500",
    trend: [2320, 2360, 2410, 2470, 2520, 2570, 2610, 2655],
  },
  {
    id: "partner-monthly",
    name: "Partner Monthly",
    interval: "Monthly",
    price: "$199",
    status: "Active",
    subscribers: 44,
    mrr: "$8,756",
    mrrValue: 8756,
    growth: "+6.9%",
    churn: "1.2%",
    trialConversion: "46.2%",
    color: "bg-stone-500",
    trend: [6720, 6890, 7160, 7420, 7760, 8120, 8420, 8756],
  },
  {
    id: "partner-yearly",
    name: "Partner Yearly",
    interval: "Yearly",
    price: "$1,990",
    status: "Active",
    subscribers: 21,
    mrr: "$3,483",
    mrrValue: 3483,
    growth: "+3.9%",
    churn: "0.5%",
    trialConversion: "43.7%",
    color: "bg-emerald-700",
    trend: [2940, 3010, 3090, 3170, 3260, 3350, 3420, 3483],
  },
  {
    id: "legacy-pro",
    name: "Legacy Pro",
    interval: "Monthly",
    price: "$25",
    status: "Archived",
    subscribers: 71,
    mrr: "$1,775",
    mrrValue: 1775,
    growth: "-4.8%",
    churn: "7.8%",
    trialConversion: "39.4%",
    color: "bg-zinc-600",
    trend: [2480, 2390, 2280, 2190, 2070, 1960, 1850, 1775],
  },
  {
    id: "legacy-studio",
    name: "Legacy Studio",
    interval: "Yearly",
    price: "$708",
    status: "Archived",
    subscribers: 18,
    mrr: "$1,062",
    mrrValue: 1062,
    growth: "-1.6%",
    churn: "5.4%",
    trialConversion: "37.2%",
    color: "bg-gray-500",
    trend: [1260, 1240, 1210, 1190, 1160, 1130, 1090, 1062],
  },
];

const subscribers: Subscriber[] = [
  {
    id: "sub_SB8qL2nV5xR0pHcK7dMzA",
    name: "Avery Stone",
    initials: "AS",
    email: "avery.stone@northledger.io",
    avatar: "/avatars/avatar-1.png",
    status: "active",
    planId: "pro-monthly",
    amount: "$29.00",
    paymentMethod: "Visa •••• 4928",
    joined: "Today, 9:24 am",
    joinedDateTime: "2026-06-11T09:24:00+05:30",
    nextPayment: "30 Jun, 9:24 am",
    nextPaymentDateTime: "2026-06-30T09:24:00+05:30",
  },
  {
    id: "sub_SB3vC9aT1mQ6rYpE4wJnL",
    name: "Juniper Labs",
    initials: "JL",
    email: "billing@juniperlabs.dev",
    avatar: "/avatars/avatar-2.png",
    status: "active",
    planId: "team-yearly",
    amount: "$348.00",
    paymentMethod: "ACH debit",
    joined: "Today, 8:11 am",
    joinedDateTime: "2026-06-11T08:11:00+05:30",
    nextPayment: "18 May 2027",
    nextPaymentDateTime: "2027-05-18T14:11:00+05:30",
  },
  {
    id: "sub_SB9dN4kX7pB2tUaR5cFqV",
    name: "Maya Chen",
    initials: "MC",
    email: "maya.chen@solstice.co",
    avatar: "/avatars/avatar-3.png",
    status: "past_due",
    planId: "studio-monthly",
    amount: "$79.00",
    paymentMethod: "Mastercard •••• 1882",
    joined: "Yesterday, 6:48 pm",
    joinedDateTime: "2026-06-10T18:48:00+05:30",
    nextPayment: "Retrying today",
  },
  {
    id: "sub_SB1pG8wL0zK5nVdC2eHsM",
    name: "Drift Supply",
    initials: "DS",
    email: "accounts@driftsupply.com",
    avatar: "/avatars/avatar-4.png",
    status: "trialing",
    planId: "starter-monthly",
    amount: "$12.00",
    paymentMethod: "Amex •••• 3007",
    joined: "Yesterday, 8:05 am",
    joinedDateTime: "2026-06-10T08:05:00+05:30",
    nextPayment: "Today, 8:05 am",
    nextPaymentDateTime: "2026-06-11T08:05:00+05:30",
  },
  {
    id: "sub_SB6hW2sA9qT4mNfP7yDxK",
    name: "Theo Ramirez",
    initials: "TR",
    email: "theo.ramirez@fieldnote.app",
    avatar: "/avatars/avatar-5.png",
    status: "active",
    planId: "agency-yearly",
    amount: "$1,188.00",
    paymentMethod: "Bank transfer",
    joined: "9 Jun, 11:36 am",
    joinedDateTime: "2026-06-09T11:36:00+05:30",
    nextPayment: "4 Apr 2027",
    nextPaymentDateTime: "2027-04-04T11:36:00+05:30",
  },
  {
    id: "sub_SB5kR0pD8vL3xQnC6aMzY",
    name: "Orbit Kitchen",
    initials: "OK",
    email: "finance@orbitkitchen.co",
    avatar: "/avatars/avatar-6.png",
    status: "paused",
    planId: "components-monthly",
    amount: "$19.00",
    paymentMethod: "Visa •••• 7712",
    joined: "8 Jun, 4:52 pm",
    joinedDateTime: "2026-06-08T16:52:00+05:30",
    nextPayment: "Paused",
  },
  {
    id: "sub_SB2mJ6cV9nW1qLpT8eAhF",
    name: "Priya Nair",
    initials: "PN",
    email: "priya.nair@evermint.in",
    avatar: "/avatars/avatar-bw-1.png",
    status: "active",
    planId: "pro-monthly",
    amount: "$29.00",
    paymentMethod: "UPI mandate",
    joined: "8 Jun, 7:17 pm",
    joinedDateTime: "2026-06-08T19:17:00+05:30",
    nextPayment: "22 Jun, 7:17 pm",
    nextPaymentDateTime: "2026-06-22T19:17:00+05:30",
  },
  {
    id: "sub_SB7tE1qK4xY9rCpN0dLsB",
    name: "Harbor Nine",
    initials: "HN",
    email: "receipts@harbornine.com",
    avatar: "/avatars/avatar-bw-2.png",
    status: "active",
    planId: "pro-monthly",
    amount: "$29.00",
    paymentMethod: "Apple Pay",
    joined: "7 Jun, 12:40 pm",
    joinedDateTime: "2026-06-07T12:40:00+05:30",
    nextPayment: "14 Jun, 12:40 pm",
    nextPaymentDateTime: "2026-06-14T12:40:00+05:30",
  },
];

const chartMonths = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const statusMeta: Record<
  SubscriptionStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  active: {
    label: "Active",
    className:
      "border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    icon: Check,
  },
  trialing: {
    label: "Trialing",
    className: "border-sky-600/20 bg-sky-500/10 text-sky-700 dark:text-sky-400",
    icon: Clock3,
  },
  past_due: {
    label: "Past due",
    className:
      "border-amber-600/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    icon: CircleAlert,
  },
  paused: {
    label: "Paused",
    className: "border-border bg-muted text-muted-foreground",
    icon: Pause,
  },
  cancelled: {
    label: "Cancelled",
    className:
      "border-rose-600/20 bg-rose-500/10 text-rose-700 dark:text-rose-400",
    icon: CircleAlert,
  },
};

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const meta = statusMeta[status];
  const Icon = meta.icon;

  return (
    <Badge
      className={cn(
        "h-6 gap-1 rounded-md px-2 text-[11px] font-medium shadow-none",
        meta.className,
      )}
      variant="outline"
    >
      <Icon className="size-3" aria-hidden="true" />
      {meta.label}
    </Badge>
  );
}

function MiniTrend({ values }: { values: number[] }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 72;
      const y = 23 - ((value - min) / range) * 18;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      className="h-7 w-[72px]"
      viewBox="0 0 72 28"
      role="img"
      aria-label="Revenue trend"
    >
      <polyline
        fill="none"
        points={points}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function Metric({
  label,
  value,
  change,
  negative = false,
}: {
  label: string;
  value: string;
  change?: string;
  negative?: boolean;
}) {
  return (
    <div className="min-w-0 px-4 py-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <div className="mt-1.5 flex items-end gap-2">
        <span className="text-xl font-semibold tracking-tight tabular-nums">
          {value}
        </span>
        {change ? (
          <span
            className={cn(
              "mb-0.5 flex items-center text-[11px] font-medium",
              negative
                ? "text-rose-600 dark:text-rose-400"
                : "text-emerald-600 dark:text-emerald-400",
            )}
          >
            {negative ? (
              <ArrowDownRight className="size-3" />
            ) : (
              <ArrowUpRight className="size-3" />
            )}
            {change}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function HealthRow({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: number;
  detail: string;
  tone?: "default" | "warning";
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-4 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span
          className={cn(
            "font-medium tabular-nums",
            tone === "warning" && "text-amber-600 dark:text-amber-400",
          )}
        >
          {detail}
        </span>
      </div>
      <Progress
        className={cn(
          "bg-muted h-1.5 rounded-none",
          tone === "warning"
            ? "[&>div]:bg-amber-500"
            : "[&>div]:bg-emerald-500",
        )}
        value={value}
      />
    </div>
  );
}

export function PaymentProcessorSubscriptions2({
  className,
}: {
  className?: string;
}) {
  const [selectedPlanId, setSelectedPlanId] = React.useState(plans[0].id);
  const [plansPage, setPlansPage] = React.useState(1);
  const [activityView, setActivityView] = React.useState<
    "signups" | "upcoming"
  >("signups");
  const [query, setQuery] = React.useState("");
  const [visibleStatuses, setVisibleStatuses] = React.useState<
    SubscriptionStatus[]
  >(["active", "trialing", "past_due", "paused"]);
  const selectedPlan =
    plans.find((plan) => plan.id === selectedPlanId) ?? plans[0];
  const plansPageSize = 8;
  const plansPageCount = Math.ceil(plans.length / plansPageSize);
  const visiblePlans = plans.slice(
    (plansPage - 1) * plansPageSize,
    plansPage * plansPageSize,
  );
  const plansStart = (plansPage - 1) * plansPageSize + 1;
  const plansEnd = Math.min(plansPage * plansPageSize, plans.length);
  const chartData = selectedPlan.trend.map((revenue, index) => ({
    month: chartMonths[index],
    revenue,
    target: Math.round(revenue * (index < 4 ? 1.08 : 1.05)),
  }));

  const visibleSubscribers = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = subscribers.filter((subscriber) => {
      const matchesQuery =
        !normalizedQuery ||
        subscriber.name.toLowerCase().includes(normalizedQuery) ||
        subscriber.email.toLowerCase().includes(normalizedQuery);
      return matchesQuery && visibleStatuses.includes(subscriber.status);
    });

    if (activityView === "upcoming") {
      return filtered
        .filter((subscriber) => subscriber.nextPaymentDateTime)
        .toSorted((a, b) =>
          (a.nextPaymentDateTime ?? "").localeCompare(
            b.nextPaymentDateTime ?? "",
          ),
        );
    }

    return filtered;
  }, [activityView, query, visibleStatuses]);

  function toggleStatus(status: SubscriptionStatus) {
    setVisibleStatuses((current) =>
      current.includes(status)
        ? current.filter((item) => item !== status)
        : [...current, status],
    );
  }

  return (
    <main
      className={cn(
        "bg-background text-foreground flex min-h-0 flex-1 overflow-hidden",
        className,
      )}
    >
      <div className="vertical-scrollbar min-h-0 w-full overflow-y-auto">
        <header className="flex flex-col gap-4 border-b px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">
                Subscriptions
              </h1>
              <Badge
                className="h-5 rounded-md px-1.5 text-[10px] font-medium"
                variant="secondary"
              >
                {plans.length} plans
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              Monitor recurring revenue, renewals, and subscriber health.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button className="h-9 gap-2" size="sm" variant="outline">
              <Download className="size-4" aria-hidden="true" />
              Export
            </Button>
            <Button className="h-9 gap-2" size="sm">
              <Plus className="size-4" aria-hidden="true" />
              New subscription
            </Button>
          </div>
        </header>

        <section className="grid min-h-[490px] border-b xl:min-h-[680px] xl:grid-cols-[minmax(520px,1.35fr)_minmax(390px,0.65fr)] 2xl:min-h-[740px]">
          <div className="flex min-w-0 flex-col border-b xl:border-r xl:border-b-0">
            <div className="horizontal-scrollbar overflow-x-auto">
              <table className="w-full min-w-[700px] border-separate border-spacing-0">
                <thead>
                  <tr className="text-muted-foreground text-left text-[11px]">
                    <th className="bg-muted/30 h-9 border-b px-4 font-medium sm:px-6 lg:px-8">
                      Plan
                    </th>
                    <th className="bg-muted/30 h-9 border-b px-4 font-medium">
                      Subscribers
                    </th>
                    <th className="bg-muted/30 h-9 border-b px-4 font-medium">
                      MRR
                    </th>
                    <th className="bg-muted/30 h-9 border-b px-4 font-medium">
                      Growth
                    </th>
                    <th className="bg-muted/30 h-9 border-b px-4 font-medium">
                      Trend
                    </th>
                    <th className="bg-muted/30 h-9 w-10 border-b px-2">
                      <span className="sr-only">Open</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visiblePlans.map((plan) => {
                    const selected = plan.id === selectedPlan.id;
                    const isNegative = plan.growth.startsWith("-");

                    return (
                      <tr
                        key={plan.id}
                        aria-selected={selected}
                        className={cn(
                          "group cursor-pointer transition-colors outline-none",
                          selected
                            ? "bg-muted/70"
                            : "hover:bg-muted/40 focus-within:bg-muted/40",
                        )}
                        onClick={() => setSelectedPlanId(plan.id)}
                      >
                        <td className="h-[66px] border-b px-4 sm:px-6 lg:px-8">
                          <button
                            className="flex w-full items-center gap-3 text-left focus-visible:outline-none"
                            type="button"
                            onClick={() => setSelectedPlanId(plan.id)}
                          >
                            <span
                              className={cn(
                                "h-8 w-1 rounded-full",
                                plan.color,
                                !selected && "opacity-45",
                              )}
                            />
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium">
                                {plan.name}
                              </span>
                              <span className="text-muted-foreground mt-0.5 block text-xs">
                                {plan.price} / {plan.interval.toLowerCase()}
                                {plan.status === "Archived"
                                  ? " · Archived"
                                  : ""}
                              </span>
                            </span>
                          </button>
                        </td>
                        <td className="border-b px-4 text-sm font-medium tabular-nums">
                          {plan.subscribers.toLocaleString()}
                        </td>
                        <td className="border-b px-4 text-sm font-medium tabular-nums">
                          {plan.mrr}
                        </td>
                        <td
                          className={cn(
                            "border-b px-4 text-sm font-medium tabular-nums",
                            isNegative
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-emerald-600 dark:text-emerald-400",
                          )}
                        >
                          {plan.growth}
                        </td>
                        <td
                          className={cn(
                            "border-b px-4",
                            isNegative ? "text-rose-500" : "text-emerald-500",
                          )}
                        >
                          <MiniTrend values={plan.trend} />
                        </td>
                        <td className="border-b px-2">
                          <ChevronRight
                            className={cn(
                              "text-muted-foreground size-4 transition-transform",
                              selected && "text-foreground translate-x-0.5",
                            )}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-auto flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
              <p className="text-muted-foreground text-xs">
                Showing {plansStart}-{plansEnd} of {plans.length} subscription
                plans
              </p>
              <Pagination className="mx-0 w-auto justify-start sm:justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      aria-disabled={plansPage === 1}
                      className={cn(
                        "h-8 px-2.5",
                        plansPage === 1 && "pointer-events-none opacity-50",
                      )}
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        setPlansPage((page) => Math.max(1, page - 1));
                      }}
                    />
                  </PaginationItem>
                  {Array.from({ length: plansPageCount }, (_, index) => {
                    const page = index + 1;

                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          className="size-8"
                          href="#"
                          isActive={plansPage === page}
                          onClick={(event) => {
                            event.preventDefault();
                            setPlansPage(page);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      aria-disabled={plansPage === plansPageCount}
                      className={cn(
                        "h-8 px-2.5",
                        plansPage === plansPageCount &&
                          "pointer-events-none opacity-50",
                      )}
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        setPlansPage((page) =>
                          Math.min(plansPageCount, page + 1),
                        );
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>

          <aside className="flex min-w-0 flex-col">
            <div className="flex items-center justify-between gap-3 border-b px-5 py-3">
              <div className="flex items-center gap-3">
                <span
                  className={cn("h-8 w-1 rounded-full", selectedPlan.color)}
                />
                <div>
                  <h2 className="text-lg font-semibold">{selectedPlan.name}</h2>
                  <p className="text-muted-foreground mt-0.5 text-[11px]">
                    {selectedPlan.price} billed{" "}
                    {selectedPlan.interval.toLowerCase()}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    id="subscription-plan-actions-trigger"
                    className="size-7"
                    size="icon"
                    variant="outline"
                  >
                    <Ellipsis className="size-3.5" />
                    <span className="sr-only">Subscription plan actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit plan</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate plan</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Archive plan</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="grid grid-cols-2 border-b [&>*]:border-dotted [&>*:nth-child(-n+2)]:border-b [&>*:nth-child(odd)]:border-r">
              <Metric
                label="Monthly recurring revenue"
                value={selectedPlan.mrr}
                change={selectedPlan.growth}
                negative={selectedPlan.growth.startsWith("-")}
              />
              <Metric
                label="Active subscribers"
                value={selectedPlan.subscribers.toLocaleString()}
                change="+38"
              />
              <Metric label="Monthly churn" value={selectedPlan.churn} />
              <Metric
                label="Trial conversion"
                value={selectedPlan.trialConversion}
                change="+2.6%"
              />
            </div>

            <div className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Revenue performance</h3>
                  <p className="text-muted-foreground mt-0.5 text-[11px]">
                    Monthly recurring revenue, last 8 months
                  </p>
                </div>
                <span className="text-muted-foreground text-[11px]">
                  Target{" "}
                  <span className="text-foreground font-medium">
                    ${Math.round(selectedPlan.mrrValue * 1.05).toLocaleString()}
                  </span>
                </span>
              </div>

              <div className="mt-3 h-[195px] min-h-0 min-w-0">
                <ResponsiveContainer
                  height="100%"
                  minHeight={1}
                  minWidth={1}
                  width="100%"
                >
                  <AreaChart
                    data={chartData}
                    margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
                  >
                    <defs>
                      <linearGradient
                        id="subscriptionRevenue"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="var(--color-foreground)"
                          stopOpacity={0.14}
                        />
                        <stop
                          offset="100%"
                          stopColor="var(--color-foreground)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      stroke="var(--color-border)"
                      strokeDasharray="3 4"
                      vertical={false}
                    />
                    <XAxis
                      axisLine={false}
                      dataKey="month"
                      fontSize={10}
                      tickLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                      axisLine={false}
                      fontSize={10}
                      tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
                      tickLine={false}
                      width={48}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-popover)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        boxShadow: "0 12px 28px rgba(0,0,0,.12)",
                        fontSize: "12px",
                      }}
                      formatter={(value) => [
                        `$${Number(value).toLocaleString()}`,
                        "MRR",
                      ]}
                    />
                    <Line
                      dataKey="target"
                      dot={false}
                      stroke="var(--color-muted-foreground)"
                      strokeDasharray="4 5"
                      strokeWidth={1.2}
                    />
                    <Area
                      dataKey="revenue"
                      dot={{
                        r: 2.5,
                        fill: "var(--color-background)",
                        strokeWidth: 1.8,
                      }}
                      fill="url(#subscriptionRevenue)"
                      stroke="var(--color-foreground)"
                      strokeWidth={2}
                      type="monotone"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-auto border-t px-5 py-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Billing health</h3>
                  <p className="text-muted-foreground mt-0.5 text-[11px]">
                    Payment outcomes for the current billing cycle
                  </p>
                </div>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  96.8% healthy
                </span>
              </div>
              <div className="space-y-3.5">
                <HealthRow
                  detail="97.6%"
                  label="Successful renewals"
                  value={97.6}
                />
                <HealthRow detail="94.2%" label="Card coverage" value={94.2} />
                <HealthRow
                  detail="21 recovering"
                  label="Dunning recovery"
                  value={72}
                  tone="warning"
                />
              </div>
            </div>
          </aside>
        </section>

        <section className="min-w-0">
          <div className="flex flex-col gap-3 border-b px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-center gap-5">
              <button
                className={cn(
                  "relative py-2 text-sm font-medium transition-colors",
                  activityView === "signups"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setActivityView("signups")}
                type="button"
              >
                New subscribers
                {activityView === "signups" ? (
                  <span className="bg-foreground absolute right-0 -bottom-3 left-0 h-0.5" />
                ) : null}
              </button>
              <button
                className={cn(
                  "relative py-2 text-sm font-medium transition-colors",
                  activityView === "upcoming"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setActivityView("upcoming")}
                type="button"
              >
                Renewals due
                {activityView === "upcoming" ? (
                  <span className="bg-foreground absolute right-0 -bottom-3 left-0 h-0.5" />
                ) : null}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative min-w-0 flex-1 sm:w-64">
                <Search
                  className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
                  aria-hidden="true"
                />
                <Input
                  aria-label="Search subscribers"
                  className="h-8 pl-9 text-sm"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search subscribers..."
                  value={query}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    id="subscription-filter-trigger"
                    className="h-8 gap-2"
                    size="sm"
                    variant="outline"
                  >
                    <Filter className="size-3.5" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {(
                    [
                      "active",
                      "trialing",
                      "past_due",
                      "paused",
                    ] as SubscriptionStatus[]
                  ).map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={visibleStatuses.includes(status)}
                      onCheckedChange={() => toggleStatus(status)}
                    >
                      {statusMeta[status].label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="horizontal-scrollbar overflow-x-auto">
            <table className="w-full min-w-[1020px] border-separate border-spacing-0">
              <thead>
                <tr className="text-muted-foreground text-left text-[11px]">
                  <th className="bg-muted/30 h-9 border-b px-4 font-medium sm:px-6 lg:px-8">
                    Subscriber
                  </th>
                  <th className="bg-muted/30 h-9 border-b px-4 font-medium">
                    Plan
                  </th>
                  <th className="bg-muted/30 h-9 border-b px-4 font-medium">
                    Status
                  </th>
                  <th className="bg-muted/30 h-9 border-b px-4 font-medium">
                    Amount
                  </th>
                  <th className="bg-muted/30 h-9 border-b px-4 font-medium">
                    Payment method
                  </th>
                  <th className="bg-muted/30 h-9 border-b px-4 font-medium">
                    {activityView === "signups" ? "Signed up" : "Next payment"}
                  </th>
                  <th className="bg-muted/30 h-9 w-12 border-b px-2" />
                </tr>
              </thead>
              <tbody>
                {visibleSubscribers.map((subscriber) => {
                  const plan = plans.find(
                    (item) => item.id === subscriber.planId,
                  );
                  return (
                    <tr
                      key={subscriber.id}
                      className="group hover:bg-muted/40 transition-colors"
                    >
                      <td className="h-[62px] border-b px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8 rounded-md border">
                            <AvatarImage
                              alt={subscriber.name}
                              src={subscriber.avatar}
                            />
                            <AvatarFallback className="rounded-md text-xs">
                              {subscriber.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {subscriber.name}
                            </p>
                            <p className="text-muted-foreground mt-0.5 truncate text-xs">
                              {subscriber.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="border-b px-4">
                        <div className="flex items-center gap-2 text-sm">
                          <span
                            className={cn(
                              "size-1.5 rounded-full",
                              plan?.color ?? "bg-zinc-400",
                            )}
                          />
                          {plan?.name}
                        </div>
                      </td>
                      <td className="border-b px-4">
                        <StatusBadge status={subscriber.status} />
                      </td>
                      <td className="border-b px-4 text-sm font-medium tabular-nums">
                        {subscriber.amount}
                      </td>
                      <td className="text-muted-foreground border-b px-4 text-sm">
                        <span className="flex items-center gap-2">
                          <CreditCard className="size-3.5" />
                          {subscriber.paymentMethod}
                        </span>
                      </td>
                      <td className="border-b px-4">
                        <time
                          className="text-sm"
                          dateTime={
                            activityView === "signups"
                              ? subscriber.joinedDateTime
                              : subscriber.nextPaymentDateTime
                          }
                        >
                          {activityView === "signups"
                            ? subscriber.joined
                            : subscriber.nextPayment}
                        </time>
                      </td>
                      <td className="border-b px-2">
                        <Button
                          aria-label={`Actions for ${subscriber.name}`}
                          className="size-8 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {visibleSubscribers.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center border-b px-6 text-center">
              <Users className="text-muted-foreground size-6" />
              <p className="mt-3 text-sm font-medium">No subscribers found</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Try changing the search term or status filters.
              </p>
            </div>
          ) : null}

          <footer className="text-muted-foreground flex flex-col gap-2 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <span>
              Showing {visibleSubscribers.length} of {subscribers.length}{" "}
              subscription records
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarClock className="size-3.5" />
              All dates shown in your local timezone
            </span>
          </footer>
        </section>
      </div>
    </main>
  );
}
