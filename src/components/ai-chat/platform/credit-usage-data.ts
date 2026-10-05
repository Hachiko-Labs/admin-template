export type CreditUsageRow = {
  name: string;
  category: string;
  runs: number;
  hours: number;
  credits: number;
};
export type CreditPeriod = "daily" | "weekly";
export type CreditAudience = "agents" | "users";

const agents: CreditUsageRow[] = [
  {
    name: "Inbox triage",
    category: "Customer support",
    runs: 842,
    hours: 164,
    credits: 12740,
  },
  {
    name: "Release notes writer",
    category: "Content",
    runs: 367,
    hours: 73,
    credits: 6380,
  },
  {
    name: "Account research",
    category: "Research",
    runs: 596,
    hours: 208,
    credits: 9120,
  },
  {
    name: "Meeting follow-ups",
    category: "Operations",
    runs: 224,
    hours: 56,
    credits: 4280,
  },
  {
    name: "Product feedback digest",
    category: "Research",
    runs: 413,
    hours: 119,
    credits: 7960,
  },
  {
    name: "Help center editor",
    category: "Content",
    runs: 178,
    hours: 42,
    credits: 3510,
  },
  {
    name: "Pipeline health check",
    category: "Operations",
    runs: 309,
    hours: 87,
    credits: 5820,
  },
  {
    name: "Onboarding guide",
    category: "Customer support",
    runs: 127,
    hours: 31,
    credits: 2140,
  },
];
const members = [
  ["Maya Chen", "Customer experience"],
  ["Arjun Patel", "Engineering"],
  ["Sofia Martins", "Growth"],
  ["Ethan Brooks", "Operations"],
  ["Zara Ahmed", "Product"],
  ["Leo Fischer", "Content"],
  ["Nina Park", "Operations"],
  ["Sam Rivera", "Customer experience"],
];
const organizationCredits = [
  42560, 31480, 28610, 22750, 19340, 15680, 12740, 8940,
];
// A stable daily snapshot: different agents have different usage patterns.
const dailyShares = [0.18, 0.11, 0.16, 0.21, 0.13, 0.09, 0.17, 0.14];

export function creditUsageData(period: CreditPeriod) {
  const agentRows = agents.map((row, index) => ({
    ...row,
    runs: Math.round(row.runs * (period === "daily" ? dailyShares[index] : 1)),
    hours: Math.round(
      row.hours * (period === "daily" ? dailyShares[index] : 1),
    ),
    credits: Math.round(
      row.credits * (period === "daily" ? dailyShares[index] : 1),
    ),
  }));
  const organization = organizationCredits.map((credits, index) =>
    Math.round(credits * (period === "daily" ? dailyShares[index] : 1)),
  );
  const userRows = agentRows.map((row, index) => ({
    ...row,
    name: members[index][0],
    category: members[index][1],
    credits: organization[index] + row.credits,
  }));
  const agentCredits = agentRows.reduce((sum, row) => sum + row.credits, 0);
  return {
    agents: agentRows,
    users: userRows,
    agentCredits,
    organizationCredits: organization.reduce((sum, value) => sum + value, 0),
    runs: agentRows.reduce((sum, row) => sum + row.runs, 0),
    hours: agentRows.reduce((sum, row) => sum + row.hours, 0),
    periodLabel: period === "daily" ? "16 Sep 2026" : "10–16 Sep 2026",
  };
}
