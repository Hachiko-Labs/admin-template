import { ActivityIcon, MailIcon, PencilIcon, Trash2Icon } from "lucide-react";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const customer = {
  name: "Northstar Supply Co.",
  email: "billing@northstarsupply.com",
  id: "cus_0Nc5kjuQhtcEhS2p6SOxz",
  created: "6 Apr 2026",
  avatar: "/avatars/avatar-1.png",
  initials: "NS",
};

const transactions = [
  {
    id: "txn_8YQ41",
    label: "Invoice payment",
    method: "Visa 4242",
    date: "Jun 19",
    amount: "$18,420.00",
    status: "Succeeded",
  },
  {
    id: "txn_8YP92",
    label: "Subscription renewal",
    method: "ACH 7781",
    date: "Jun 14",
    amount: "$2,400.00",
    status: "Succeeded",
  },
  {
    id: "txn_8XK18",
    label: "Payment retry",
    method: "Mastercard 1881",
    date: "Jun 08",
    amount: "$840.00",
    status: "Declined",
  },
];

const subscriptions = [
  {
    name: "Platform processing",
    cadence: "Monthly",
    renewal: "Renews Jul 06",
    amount: "$2,400.00",
  },
  {
    name: "Advanced risk monitoring",
    cadence: "Monthly",
    renewal: "Renews Jul 12",
    amount: "$480.00",
  },
];

const sidebarStats = [
  { label: "Open invoices", value: "11" },
  { label: "Payment methods", value: "3 items" },
  { label: "Saved mandates", value: "2 items" },
  { label: "Risk status", value: "Clear" },
  { label: "Customer ID", value: "cus_0Nc...SOxz" },
];

const sidebarDates = [
  { label: "Last payment", value: "3h ago", icon: ActivityIcon },
  { label: "Last edited", value: "Jun 18" },
  { label: "Created", value: "Apr 06" },
];

function TransactionStatusBadge({ status }: { status: string }) {
  const isDeclined = status === "Declined";

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-5 rounded-md border px-1.5 text-[11px] font-medium shadow-none",
        isDeclined
          ? "border-rose-600/20 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-900/30 dark:text-rose-400"
          : "border-emerald-600/20 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-900/30 dark:text-emerald-400",
      )}
    >
      {status}
    </Badge>
  );
}

function EditButton({ label }: { label: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      className="text-muted-foreground hover:text-foreground size-8"
    >
      <PencilIcon />
    </Button>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="bg-muted/30 rounded-lg border-0 shadow-none">
      <CardHeader className="p-6 pb-4">
        <div className="flex items-center justify-between gap-5">
          <CardTitle className="text-sm">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-6 pt-0 pb-5">{children}</CardContent>
    </Card>
  );
}

export function PaymentProcessorCustomerDetail3() {
  return (
    <main className="bg-background text-foreground flex min-h-0 flex-1 overflow-hidden">
      <div className="min-h-0 w-full flex-1 overflow-y-auto">
        <section className="px-6 py-10 lg:px-8 lg:py-12">
          <div className="mx-auto grid max-w-[1080px] gap-10 lg:grid-cols-[minmax(0,720px)_260px]">
            <div className="flex flex-col gap-4">
              <Card className="bg-muted/30 rounded-lg border-0 shadow-none">
                <CardHeader className="p-6">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex min-w-0 items-center gap-4">
                      <Avatar className="size-14">
                        <AvatarImage
                          src={customer.avatar}
                          alt={customer.name}
                        />
                        <AvatarFallback>{customer.initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <CardTitle className="truncate text-sm">
                          {customer.name}
                        </CardTitle>
                        <p className="text-muted-foreground mt-1 text-sm">
                          Business customer
                        </p>
                      </div>
                    </div>
                    <EditButton label="Edit customer profile" />
                  </div>
                </CardHeader>
                <CardContent className="px-6 pt-0 pb-6">
                  <div className="grid gap-6 text-sm sm:grid-cols-[minmax(0,1.25fr)_minmax(0,1.45fr)_0.7fr]">
                    <div className="min-w-0">
                      <p className="text-muted-foreground">Email</p>
                      <p className="mt-1.5 flex min-w-0 items-center gap-2 font-medium">
                        <MailIcon
                          className="size-4 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="truncate">{customer.email}</span>
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-muted-foreground">Customer ID</p>
                      <p className="mt-1.5 truncate font-medium">
                        {customer.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="mt-1.5 font-medium">{customer.created}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <SectionCard title="Transaction history">
                <div className="flex flex-col">
                  {transactions.map((transaction, index) => (
                    <div key={transaction.id}>
                      <div className="grid gap-3 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto]">
                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center gap-2">
                            <p className="truncate font-medium">
                              {transaction.label}
                            </p>
                            <TransactionStatusBadge
                              status={transaction.status}
                            />
                          </div>
                          <p className="text-muted-foreground mt-1">
                            {transaction.method} / {transaction.date}
                          </p>
                        </div>
                        <div className="font-medium tabular-nums sm:text-right">
                          {transaction.amount}
                        </div>
                      </div>
                      {index < transactions.length - 1 ? <Separator /> : null}
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Active subscriptions">
                <div className="flex flex-col">
                  {subscriptions.map((subscription, index) => (
                    <div key={subscription.name}>
                      <div className="grid gap-3 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto]">
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {subscription.name}
                          </p>
                          <p className="text-muted-foreground mt-1">
                            {subscription.cadence} / {subscription.renewal}
                          </p>
                        </div>
                        <div className="font-medium tabular-nums sm:text-right">
                          {subscription.amount}
                        </div>
                      </div>
                      {index < subscriptions.length - 1 ? <Separator /> : null}
                    </div>
                  ))}
                </div>
              </SectionCard>

              <Card className="bg-muted/30 rounded-lg border-0 shadow-none">
                <CardHeader className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="text-sm">Delete customer</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete customer"
                      className="text-destructive size-8"
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            </div>

            <aside className="flex flex-col gap-5 pt-0.5">
              <dl className="flex flex-col gap-4">
                {sidebarStats.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-5"
                  >
                    <dt className="text-sm font-medium">{item.label}</dt>
                    <dd className="text-muted-foreground text-sm tabular-nums">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <Separator />

              <dl className="flex flex-col gap-4">
                {sidebarDates.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-5"
                  >
                    <dt className="text-sm font-medium">{item.label}</dt>
                    <dd className="text-muted-foreground flex items-center gap-2 text-sm">
                      {item.icon ? (
                        <item.icon className="size-3.5" aria-hidden="true" />
                      ) : null}
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
