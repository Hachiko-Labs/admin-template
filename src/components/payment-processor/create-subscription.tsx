"use client";

import {
  CalendarClock,
  Check,
  CreditCard,
  FileText,
  ImagePlus,
  KeyRound,
  Mail,
  PackageCheck,
  Plus,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field as UiField,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type BillingInterval = "monthly" | "quarterly" | "yearly";
type SubscriptionStatus = "draft" | "active";

type SubscriptionDraft = {
  productName: string;
  brandName: string;
  taxCategory: string;
  description: string;
  price: string;
  currency: string;
  interval: BillingInterval;
  trialDays: string;
  discountPercent: string;
  taxRate: string;
  seats: string;
  setupFee: string;
  collectPaymentMethod: boolean;
  allowCoupons: boolean;
  prorateChanges: boolean;
  entitlements: string[];
  metadataEnabled: boolean;
  successUrl: string;
  customerEmail: string;
  status: SubscriptionStatus;
};

type UploadPreview = {
  name: string;
  src: string;
};

const defaultSubscription: SubscriptionDraft = {
  productName: "Shadcnblocks Pro",
  brandName: "shadcnblocks",
  taxCategory: "Saas subscription",
  description:
    "Production-ready admin blocks, payment views, and product updates for growing teams.",
  price: "29",
  currency: "USD",
  interval: "monthly",
  trialDays: "14",
  discountPercent: "10",
  taxRate: "10",
  seats: "3",
  setupFee: "49",
  collectPaymentMethod: true,
  allowCoupons: true,
  prorateChanges: true,
  entitlements: ["Discord Access", "Github Access", "Digital Files"],
  metadataEnabled: false,
  successUrl: "https://shadcnblocks.com/welcome",
  customerEmail: "finance@northstar.studio",
  status: "draft",
};

const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  SGD: "$",
};

const intervalLabels: Record<BillingInterval, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

const intervalMeta: Record<BillingInterval, string> = {
  monthly: "Every month",
  quarterly: "Every 3 months",
  yearly: "Every year",
};

const entitlementOptions = [
  { label: "Discord Access", icon: ShieldCheck },
  { label: "Github Access", icon: KeyRound },
  { label: "Telegram Access", icon: Mail },
  { label: "License key", icon: KeyRound },
  { label: "Digital Files", icon: Upload },
  { label: "Notion Template", icon: FileText },
  { label: "Framer Template", icon: Sparkles },
];

const compactControlClass = "h-9 px-3 text-sm md:text-sm";
const compactTextareaClass = "min-h-24 px-3 py-2 text-sm md:text-sm";

const toNumber = (value: string) => {
  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : 0;
};

const money = (amount: number, currency: string) => {
  const symbol = currencySymbols[currency] ?? currency;

  return `${symbol}${amount.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
};

const getSubscriptionTotals = (subscription: SubscriptionDraft) => {
  const seats = Math.max(1, Math.floor(toNumber(subscription.seats)));
  const unitPrice = toNumber(subscription.price);
  const recurringSubtotal = unitPrice * seats;
  const setupFee = toNumber(subscription.setupFee);
  const discount =
    recurringSubtotal * (toNumber(subscription.discountPercent) / 100);
  const taxableAmount = Math.max(0, recurringSubtotal - discount + setupFee);
  const tax = taxableAmount * (toNumber(subscription.taxRate) / 100);

  return {
    discount,
    recurringSubtotal,
    seats,
    setupFee,
    tax,
    totalDueToday: taxableAmount + tax,
    unitPrice,
  };
};

function updateDraft<K extends keyof SubscriptionDraft>(
  setSubscription: React.Dispatch<React.SetStateAction<SubscriptionDraft>>,
  key: K,
  value: SubscriptionDraft[K],
) {
  setSubscription((current) => ({ ...current, [key]: value }));
}

function Field({
  children,
  className,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <UiField className={cn("gap-2", className)}>
      <FieldLabel className="text-muted-foreground text-[11px] font-bold tracking-wide uppercase">
        {label}
      </FieldLabel>
      {children}
    </UiField>
  );
}

function SectionHeading({ meta, title }: { meta?: string; title: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <h2 className="text-foreground shrink-0 text-base font-semibold">
        {title}
      </h2>
      <span className="border-border min-w-0 flex-1 border-t border-dashed" />
      {meta ? (
        <span className="text-muted-foreground shrink-0 text-[11px] font-semibold tracking-[0.12em] uppercase">
          {meta}
        </span>
      ) : null}
    </div>
  );
}

function EditorSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="border-border/70 grid gap-6 pb-8">{children}</section>
  );
}

function BillingChoice({
  active,
  label,
  meta,
  value,
}: {
  active: boolean;
  label: string;
  meta: string;
  value: BillingInterval;
}) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        "border-border/70 bg-background hover:bg-muted/25 focus-visible:ring-ring flex min-h-16 w-full cursor-pointer items-center justify-between gap-3 rounded-md border px-4 py-3 text-left shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        active && "border-foreground/50 bg-muted/30 shadow-sm",
      )}
      value={value}
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="text-muted-foreground mt-0.5 block text-xs">
          {meta}
        </span>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "border-border bg-background grid size-5 shrink-0 place-items-center rounded-full border shadow-xs transition-colors",
          active && "border-primary bg-primary",
        )}
      >
        <span
          className={cn(
            "bg-primary-foreground size-2 rounded-full opacity-0 transition-opacity",
            active && "opacity-100",
          )}
        />
      </span>
    </RadioGroupPrimitive.Item>
  );
}

function RuleToggle({
  checked,
  id,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  id: string;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label
      className="flex cursor-pointer items-center gap-3 rounded-md py-1.5"
      htmlFor={id}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}

function EntitlementButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      className={cn(
        "justify-start gap-2 shadow-none",
        active && "border-foreground/60 bg-muted text-foreground",
      )}
      onClick={onClick}
      size="sm"
      type="button"
      variant="outline"
    >
      <Icon data-icon="inline-start" />
      <span>{label}</span>
    </Button>
  );
}

function ProductImageUpload({
  inputRef,
  onChange,
  onRemove,
  preview,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  preview: UploadPreview | null;
}) {
  return (
    <div className="grid gap-3">
      <input
        ref={inputRef}
        id="subscription-product-image"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={onChange}
      />
      {preview ? (
        <div className="border-border bg-muted/25 flex items-center gap-3 rounded-md border p-3">
          <div
            className="bg-muted size-16 shrink-0 rounded-md border bg-cover bg-center"
            style={{ backgroundImage: `url(${preview.src})` }}
            aria-label={preview.name}
            role="img"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{preview.name}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Product image selected for checkout preview.
            </p>
          </div>
          <Button
            className="size-8"
            size="icon"
            type="button"
            variant="ghost"
            onClick={onRemove}
          >
            <X />
          </Button>
        </div>
      ) : (
        <label
          className="border-border bg-muted/20 hover:bg-muted/35 flex min-h-32 cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed px-4 text-center transition-colors"
          htmlFor="subscription-product-image"
        >
          <span className="bg-background grid size-10 place-items-center rounded-full border">
            <ImagePlus className="text-muted-foreground size-5" />
          </span>
          <span className="grid gap-1">
            <span className="text-sm font-medium">Select product image</span>
            <span className="text-muted-foreground text-xs">
              PNG, JPG or WEBP up to 3MB
            </span>
          </span>
        </label>
      )}
    </div>
  );
}

function SubscriptionEditor({
  setSubscription,
  subscription,
}: {
  setSubscription: React.Dispatch<React.SetStateAction<SubscriptionDraft>>;
  subscription: SubscriptionDraft;
}) {
  const [productImage, setProductImage] = React.useState<UploadPreview | null>(
    null,
  );
  const imageInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    return () => {
      if (productImage?.src) URL.revokeObjectURL(productImage.src);
    };
  }, [productImage]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setProductImage((current) => {
      if (current?.src) URL.revokeObjectURL(current.src);

      return {
        name: file.name,
        src: URL.createObjectURL(file),
      };
    });
    event.target.value = "";
  };

  const handleRemoveImage = () => {
    setProductImage((current) => {
      if (current?.src) URL.revokeObjectURL(current.src);

      return null;
    });
  };

  const toggleEntitlement = (label: string) => {
    setSubscription((current) => ({
      ...current,
      entitlements: current.entitlements.includes(label)
        ? current.entitlements.filter((item) => item !== label)
        : [...current.entitlements, label],
    }));
  };

  return (
    <section>
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_25rem]">
        <div className="grid gap-7">
          <header>
            <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  New Subscription
                </h1>
                <p className="text-muted-foreground text-sm">
                  Create new subscription product
                </p>
              </div>
              <p className="text-muted-foreground text-[13px]">
                Saved few seconds ago
              </p>
            </div>
          </header>

          <EditorSection>
            <SectionHeading title="Basic Details" />
            <FieldGroup className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6">
              <Field className="sm:col-span-4" label="Product Name">
                <Input
                  className={compactControlClass}
                  placeholder="Eg: Growth workspace"
                  value={subscription.productName}
                  onChange={(event) =>
                    updateDraft(
                      setSubscription,
                      "productName",
                      event.target.value,
                    )
                  }
                />
              </Field>
              <Field className="sm:col-span-3" label="Brand">
                <Select
                  value={subscription.brandName}
                  onValueChange={(value) =>
                    updateDraft(setSubscription, "brandName", value)
                  }
                >
                  <SelectTrigger className={compactControlClass}>
                    <SelectValue placeholder="Select a brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="shadcnblocks">Shadcnblocks</SelectItem>
                      <SelectItem value="zerostatic">Zerostatic</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field className="sm:col-span-3" label="Tax Category">
                <Select
                  value={subscription.taxCategory}
                  onValueChange={(value) =>
                    updateDraft(setSubscription, "taxCategory", value)
                  }
                >
                  <SelectTrigger className={compactControlClass}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Digital products">
                        Digital products
                      </SelectItem>
                      <SelectItem value="Saas subscription">
                        Saas subscription
                      </SelectItem>
                      <SelectItem value="Professional services">
                        Professional services
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          </EditorSection>

          <EditorSection>
            <SectionHeading title="Media & Description" />
            <FieldGroup className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6">
              <Field className="col-span-full" label="Product Description">
                <Textarea
                  className={compactTextareaClass}
                  placeholder="Describe what subscribers receive."
                  value={subscription.description}
                  onChange={(event) =>
                    updateDraft(
                      setSubscription,
                      "description",
                      event.target.value,
                    )
                  }
                />
              </Field>
              <Field className="col-span-full" label="Product Image">
                <ProductImageUpload
                  inputRef={imageInputRef}
                  onChange={handleImageChange}
                  onRemove={handleRemoveImage}
                  preview={productImage}
                />
              </Field>
            </FieldGroup>
          </EditorSection>

          <EditorSection>
            <SectionHeading title="Pricing" />
            <FieldGroup className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6">
              <div className="col-span-full grid gap-x-6 gap-y-5 sm:grid-cols-6">
                <Field className="sm:col-span-3" label="Price">
                  <div className="grid grid-cols-[minmax(0,1fr)_6.75rem]">
                    <Input
                      className={cn(compactControlClass, "rounded-r-none")}
                      inputMode="decimal"
                      value={subscription.price}
                      onChange={(event) =>
                        updateDraft(
                          setSubscription,
                          "price",
                          event.target.value,
                        )
                      }
                    />
                    <Select
                      value={subscription.currency}
                      onValueChange={(value) =>
                        updateDraft(setSubscription, "currency", value)
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          compactControlClass,
                          "rounded-l-none border-l-0",
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.entries(currencySymbols).map(
                            ([code, symbol]) => (
                              <SelectItem key={code} value={code}>
                                {code} {symbol}
                              </SelectItem>
                            ),
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </Field>
                <Field className="sm:col-span-3" label="Seats / Quantity">
                  <Input
                    className={compactControlClass}
                    inputMode="numeric"
                    value={subscription.seats}
                    onChange={(event) =>
                      updateDraft(setSubscription, "seats", event.target.value)
                    }
                  />
                </Field>
              </div>

              <div className="col-span-full grid gap-x-6 gap-y-5 sm:grid-cols-4">
                <Field className="sm:col-span-2" label="Trial Days">
                  <Input
                    className={compactControlClass}
                    inputMode="numeric"
                    value={subscription.trialDays}
                    onChange={(event) =>
                      updateDraft(
                        setSubscription,
                        "trialDays",
                        event.target.value,
                      )
                    }
                  />
                </Field>
                <Field className="sm:col-span-2" label="Discount %">
                  <Input
                    className={compactControlClass}
                    inputMode="decimal"
                    value={subscription.discountPercent}
                    onChange={(event) =>
                      updateDraft(
                        setSubscription,
                        "discountPercent",
                        event.target.value,
                      )
                    }
                  />
                </Field>
                <Field className="sm:col-span-2" label="Tax %">
                  <Input
                    className={compactControlClass}
                    inputMode="decimal"
                    value={subscription.taxRate}
                    onChange={(event) =>
                      updateDraft(
                        setSubscription,
                        "taxRate",
                        event.target.value,
                      )
                    }
                  />
                </Field>
                <Field className="sm:col-span-2" label="Setup Fee">
                  <Input
                    className={compactControlClass}
                    inputMode="decimal"
                    value={subscription.setupFee}
                    onChange={(event) =>
                      updateDraft(
                        setSubscription,
                        "setupFee",
                        event.target.value,
                      )
                    }
                  />
                </Field>
              </div>
            </FieldGroup>
          </EditorSection>

          <EditorSection>
            <SectionHeading meta="recurring" title="Billing" />
            <FieldGroup className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6">
              <FieldSet className="col-span-full gap-3">
                <RadioGroup
                  className="grid gap-3 sm:grid-cols-3"
                  value={subscription.interval}
                  onValueChange={(value) =>
                    updateDraft(
                      setSubscription,
                      "interval",
                      value as BillingInterval,
                    )
                  }
                >
                  <BillingChoice
                    active={subscription.interval === "monthly"}
                    label="Monthly"
                    meta="Every month"
                    value="monthly"
                  />
                  <BillingChoice
                    active={subscription.interval === "quarterly"}
                    label="Quarterly"
                    meta="Every 3 months"
                    value="quarterly"
                  />
                  <BillingChoice
                    active={subscription.interval === "yearly"}
                    label="Yearly"
                    meta="Every year"
                    value="yearly"
                  />
                </RadioGroup>
              </FieldSet>
            </FieldGroup>
          </EditorSection>

          <EditorSection>
            <SectionHeading
              meta={`${subscription.entitlements.length} selected`}
              title="Entitlements"
            />
            <div className="border-border/70 bg-background grid gap-4 rounded-md border p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="border-border bg-muted/30 text-muted-foreground grid size-9 place-items-center rounded-md border">
                    <PackageCheck className="size-4" />
                  </span>
                  <p className="text-sm font-semibold">Access & Assets</p>
                </div>
                <Button
                  className="size-8"
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <Plus />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {entitlementOptions.map((option) => (
                  <EntitlementButton
                    key={option.label}
                    active={subscription.entitlements.includes(option.label)}
                    icon={option.icon}
                    label={option.label}
                    onClick={() => toggleEntitlement(option.label)}
                  />
                ))}
              </div>
            </div>
          </EditorSection>

          <EditorSection>
            <SectionHeading title="Checkout Rules" />
            <FieldGroup className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6">
              <FieldSet className="col-span-full gap-3 pt-1">
                <div className="grid gap-2 sm:grid-cols-2">
                  <RuleToggle
                    checked={subscription.collectPaymentMethod}
                    id="collect-payment-method"
                    label="Collect payment method"
                    onCheckedChange={(checked) =>
                      updateDraft(
                        setSubscription,
                        "collectPaymentMethod",
                        checked,
                      )
                    }
                  />
                  <RuleToggle
                    checked={subscription.allowCoupons}
                    id="allow-coupons"
                    label="Allow discount codes"
                    onCheckedChange={(checked) =>
                      updateDraft(setSubscription, "allowCoupons", checked)
                    }
                  />
                </div>
              </FieldSet>
            </FieldGroup>
          </EditorSection>
        </div>

        <SubscriptionPreview subscription={subscription} />
      </div>
    </section>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-right text-xs font-semibold tabular-nums">
        {value}
      </span>
    </div>
  );
}

function SubscriptionPreview({
  subscription,
}: {
  subscription: SubscriptionDraft;
}) {
  const totals = getSubscriptionTotals(subscription);
  const hasTrial = toNumber(subscription.trialDays) > 0;
  const productName = subscription.productName || "Product name";

  return (
    <aside className="min-w-0 lg:sticky lg:top-12 lg:self-start">
      <section className="border-border/80 rounded-lg border bg-[color-mix(in_oklch,var(--muted)_55%,var(--background))] p-2">
        <div className="bg-card text-card-foreground ring-border/80 relative overflow-hidden rounded-md shadow-[0_14px_42px_-30px_color-mix(in_oklch,var(--foreground)_30%,transparent)] ring-1">
          <div
            aria-hidden="true"
            className="bg-foreground/95 text-background ring-background/80 pointer-events-none absolute top-4 -right-9 z-10 w-28 rotate-45 py-0.5 text-center text-[9px] font-semibold tracking-[0.2em] uppercase shadow-[0_8px_18px_-14px_var(--foreground)] ring-1"
          >
            Preview
          </div>
          <div className="mt-3 grid gap-4 p-4">
            <div className="grid gap-1">
              <div className="flex items-center">
                <h3 className="min-w-0 text-base font-semibold tracking-tight">
                  {productName}
                </h3>
              </div>
              <p className="text-muted-foreground text-xs leading-5">
                {subscription.description || "Subscription description"}
              </p>
            </div>

            <div className="rounded-md bg-[color-mix(in_oklch,var(--muted)_52%,var(--background))] p-3 py-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-semibold tracking-tight tabular-nums">
                  {money(totals.unitPrice, subscription.currency)}
                </span>
                <span className="text-muted-foreground text-xs">
                  / {intervalLabels[subscription.interval].toLowerCase()}
                </span>
              </div>
              <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                <span>{totals.seats} seats</span>
                <span>{intervalMeta[subscription.interval]}</span>
                {hasTrial ? (
                  <span>{subscription.trialDays} day trial</span>
                ) : null}
              </div>
            </div>

            {subscription.allowCoupons ? (
              <div className="border-border -mx-4 border-y px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-muted-foreground text-xs font-medium">
                    Have a discount code?
                  </p>
                  <Button
                    className="h-8 rounded-md px-3 text-xs"
                    type="button"
                    variant="outline"
                  >
                    Apply discount code
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="grid gap-3">
              <PreviewRow
                label="Subtotal"
                value={money(totals.recurringSubtotal, subscription.currency)}
              />
              <PreviewRow
                label="Discount"
                value={`-${money(totals.discount, subscription.currency)}`}
              />
              <PreviewRow
                label="Setup fee"
                value={money(totals.setupFee, subscription.currency)}
              />
              <PreviewRow
                label={`Tax (${toNumber(subscription.taxRate)}%)`}
                value={money(totals.tax, subscription.currency)}
              />
              <Separator />
              <PreviewRow
                label={hasTrial ? "Due after trial" : "Due today"}
                value={money(totals.totalDueToday, subscription.currency)}
              />
            </div>
          </div>

          <Separator />

          <div className="grid gap-3 p-4 text-xs">
            <div className="flex items-start gap-2">
              <CalendarClock className="text-muted-foreground mt-0.5 size-3.5" />
              <p className="text-muted-foreground leading-5">
                {hasTrial
                  ? `Trial for ${subscription.trialDays} days, then renews ${intervalLabels[
                      subscription.interval
                    ].toLowerCase()}.`
                  : `Renews ${intervalLabels[
                      subscription.interval
                    ].toLowerCase()} until canceled.`}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CreditCard className="text-muted-foreground mt-0.5 size-3.5" />
              <p className="text-muted-foreground leading-5">
                {subscription.collectPaymentMethod
                  ? "Payment method required at checkout."
                  : "Payment method can be collected after trial."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </aside>
  );
}

export function PaymentProcessorCreateSubscription() {
  const [subscription, setSubscription] =
    React.useState<SubscriptionDraft>(defaultSubscription);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [footerVeilOpacity, setFooterVeilOpacity] = React.useState(0);

  const updateFooterVeil = React.useCallback(() => {
    const element = scrollRef.current;

    if (!element) return;

    const remainingScroll = Math.max(
      0,
      element.scrollHeight - element.clientHeight - element.scrollTop,
    );

    setFooterVeilOpacity(Math.min(1, remainingScroll / 60));
  }, []);

  React.useEffect(() => {
    updateFooterVeil();
    window.addEventListener("resize", updateFooterVeil);

    return () => {
      window.removeEventListener("resize", updateFooterVeil);
    };
  }, [updateFooterVeil]);

  React.useEffect(() => {
    updateFooterVeil();
  }, [subscription, updateFooterVeil]);

  return (
    <main className="bg-background relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        className="min-h-0 flex-1 overflow-y-auto pb-28"
        onScroll={updateFooterVeil}
        ref={scrollRef}
      >
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <SubscriptionEditor
            subscription={subscription}
            setSubscription={setSubscription}
          />
        </div>
      </div>
      <footer
        className="bg-background before:from-background after:border-border/70 absolute inset-x-0 bottom-0 z-10 shrink-0 before:pointer-events-none before:absolute before:inset-x-0 before:bottom-full before:h-8 before:bg-linear-to-t before:to-transparent before:opacity-[var(--footer-veil-opacity)] before:transition-opacity after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:border-t after:opacity-[var(--footer-veil-opacity)] after:transition-opacity"
        style={
          {
            "--footer-veil-opacity": footerVeilOpacity,
          } as React.CSSProperties
        }
      >
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-8 xl:grid-cols-[minmax(0,1fr)_25rem]">
          <div className="flex flex-wrap items-center gap-2 sm:justify-end lg:col-start-2">
            <Button
              className="h-9 rounded-md"
              type="button"
              variant="outline"
              onClick={() => updateDraft(setSubscription, "status", "draft")}
            >
              <Check className="size-4" />
              Save draft
            </Button>
            <Button
              className="h-9 rounded-md px-5"
              type="button"
              onClick={() => updateDraft(setSubscription, "status", "active")}
            >
              Create subscription
            </Button>
          </div>
        </div>
      </footer>
    </main>
  );
}
