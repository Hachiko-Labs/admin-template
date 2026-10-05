"use client";

import {
  ArrowRight,
  Blend,
  ChartNoAxesColumn,
  CircleDot,
  Diamond,
  Github,
  Menu,
  Monitor,
  RefreshCw,
  Smartphone,
  Tablet,
} from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PreviewViewport = "desktop" | "tablet" | "mobile";

const productFeatures = [
  {
    title: "Tailored workflows",
    description: "Track progress across custom issue flows for your team.",
    icon: CircleDot,
  },
  {
    title: "Cross-team projects",
    description: "Collaborate across teams and departments.",
    icon: Blend,
  },
  {
    title: "Milestones",
    description: "Break projects down into concrete phases.",
    icon: Diamond,
  },
  {
    title: "Progress insights",
    description: "Track scope, velocity, and progress over time.",
    icon: ChartNoAxesColumn,
  },
];

const featureCards = [
  {
    title: "Purpose-built for product development",
    image: "/ai-chat/mainline/features/triage-card.svg",
  },
  {
    title: "Manage projects end-to-end",
    image: "/ai-chat/mainline/features/cycle-card.svg",
  },
  {
    title: "Build momentum and healthy habits",
    image: "/ai-chat/mainline/features/overview-card.svg",
  },
];

function MarketingPage({ viewport }: { viewport: PreviewViewport }) {
  const mobile = viewport === "mobile";
  const compact = viewport !== "desktop";

  return (
    <div className="bg-background text-foreground min-h-full overflow-hidden">
      <header
        className={cn(
          "bg-background/85 sticky top-3 z-20 mx-auto flex h-11 items-center justify-between rounded-full border px-4 shadow-sm backdrop-blur",
          mobile ? "w-[calc(100%-1.5rem)]" : "w-[min(88%,700px)]",
        )}
      >
        <Image
          src="/ai-chat/mainline/logo.svg"
          alt="Mainline"
          width={94}
          height={18}
          className="dark:invert"
        />
        {!compact ? (
          <nav
            className="flex items-center gap-5 text-[10px] font-medium"
            aria-label="Marketing preview navigation"
          >
            <button type="button">Features</button>
            <button type="button">About</button>
            <button type="button">Pricing</button>
            <button type="button">FAQ</button>
          </nav>
        ) : null}
        <div className="flex items-center gap-2">
          {!mobile ? (
            <Button size="sm" className="h-7 rounded-full px-3 text-[9px]">
              Get started
            </Button>
          ) : null}
          <Github className="size-3.5" />
          {compact ? <Menu className="size-3.5" /> : null}
        </div>
      </header>

      <div className="-mt-11">
        <section
          className={cn(
            "px-5 pt-24 pb-12",
            mobile ? "pt-24" : "px-8 pt-32 pb-16",
          )}
        >
          <div
            className={cn(
              "mx-auto grid max-w-6xl gap-10",
              compact ? "grid-cols-1" : "grid-cols-[1.15fr_0.85fr]",
            )}
          >
            <div>
              <p className="text-muted-foreground mb-4 font-mono text-[9px] tracking-[0.18em] uppercase">
                Open-source product operations
              </p>
              <h1
                className={cn(
                  "max-w-2xl tracking-tight",
                  mobile ? "text-3xl" : "text-4xl xl:text-5xl",
                )}
              >
                Mainline Next.js template
              </h1>
              <p
                className={cn(
                  "text-muted-foreground mt-5 max-w-2xl leading-snug",
                  mobile ? "text-base" : "text-xl",
                )}
              >
                An open-source website template built with shadcn/ui, Tailwind
                CSS, and Next.js.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                <Button className="h-9 text-xs">Get template</Button>
                <Button variant="outline" className="h-9 gap-2 text-xs">
                  Built by shadcnblocks.com
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </div>

            <div
              className={cn(
                "relative grid gap-4",
                !compact && "border-l border-dashed pl-8",
              )}
            >
              {productFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="flex gap-3">
                    <Icon className="mt-0.5 size-4 shrink-0" />
                    <div>
                      <h2 className="text-xs font-semibold">{feature.title}</h2>
                      <p className="text-muted-foreground mt-0.5 text-[10px] leading-4">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative mx-auto mt-12 aspect-[1.72/1] max-w-6xl overflow-hidden rounded-xl border shadow-xl">
            <Image
              src="/ai-chat/mainline/hero.webp"
              alt="Mainline product interface"
              fill
              sizes="(max-width: 768px) 100vw, 1000px"
              className="object-cover object-left-top"
              priority
            />
          </div>
        </section>

        <section className="bg-muted/20 border-y px-5 py-8">
          <p className="text-muted-foreground text-center font-mono text-[9px] tracking-widest uppercase">
            Designed for teams shipping their best work
          </p>
          <div
            className={cn(
              "mx-auto mt-6 grid max-w-4xl gap-3",
              mobile ? "grid-cols-2" : "grid-cols-4",
            )}
          >
            {["Mercury", "Linear", "Arc", "Watershed"].map((name) => (
              <div
                key={name}
                className="text-muted-foreground bg-background rounded-lg border px-3 py-3 text-center text-[10px] font-medium"
              >
                {name}
              </div>
            ))}
          </div>
        </section>

        <section className={cn("px-5 py-14", !mobile && "px-8 py-20")}>
          <div
            className={cn(
              "mx-auto grid max-w-4xl gap-5",
              mobile ? "grid-cols-1" : "grid-cols-2 items-end",
            )}
          >
            <h2
              className={cn("tracking-tight", mobile ? "text-2xl" : "text-3xl")}
            >
              Made for modern product teams
            </h2>
            <p className="text-muted-foreground text-xs leading-5">
              Mainline is built on the habits that make excellent product teams
              successful: staying focused, moving quickly, and aiming for
              high-quality work.
            </p>
          </div>
          <div
            className={cn(
              "mx-auto mt-10 grid max-w-6xl overflow-hidden rounded-2xl border",
              mobile ? "grid-cols-1" : "grid-cols-3",
            )}
          >
            {featureCards.map((feature, index) => (
              <article
                key={feature.title}
                className={cn(
                  "min-w-0 p-4",
                  index > 0 && (mobile ? "border-t" : "border-l"),
                )}
              >
                <div className="bg-muted/30 relative aspect-[1.28/1] overflow-hidden rounded-lg">
                  <Image
                    src={feature.image}
                    alt=""
                    fill
                    sizes="320px"
                    className="object-cover object-left-top pt-2 pl-3"
                  />
                  <div className="from-background absolute inset-0 bg-linear-to-t via-transparent to-transparent" />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <h3 className="text-sm leading-tight font-semibold">
                    {feature.title}
                  </h3>
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border">
                    <ArrowRight className="size-3" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className="text-muted-foreground flex items-center justify-between border-t px-6 py-6 text-[9px]">
          <span>© Mainline</span>
          <span>Free template by shadcnblocks.com</span>
        </footer>
      </div>
    </div>
  );
}

export function AiAppPreview() {
  const [viewport, setViewport] = React.useState<PreviewViewport>("desktop");
  const [refreshing, setRefreshing] = React.useState(false);
  const [revision, setRevision] = React.useState(0);

  function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    window.setTimeout(() => {
      setRevision((value) => value + 1);
      setRefreshing(false);
    }, 500);
  }

  return (
    <div className="bg-muted/25 flex h-full min-h-0 flex-col">
      <div className="bg-background flex h-9 shrink-0 items-center gap-1.5 border-b px-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-7"
          aria-label="Refresh preview"
          onClick={refresh}
        >
          <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
        </Button>
        <div className="bg-muted/50 text-muted-foreground min-w-0 flex-1 truncate rounded-md border px-2.5 py-1 font-mono text-[10px]">
          /
        </div>
        <div
          className="flex gap-0.5"
          role="group"
          aria-label="Preview viewport"
        >
          {(
            [
              ["desktop", Monitor, "Desktop preview"],
              ["tablet", Tablet, "Tablet preview"],
              ["mobile", Smartphone, "Mobile preview"],
            ] as const
          ).map(([value, Icon, label]) => (
            <Button
              key={value}
              variant={viewport === value ? "secondary" : "ghost"}
              size="icon-sm"
              className="size-7"
              aria-label={label}
              aria-pressed={viewport === value}
              onClick={() => setViewport(value)}
            >
              <Icon className="size-3.5" />
            </Button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        <div
          key={revision}
          className={cn(
            "bg-background mx-auto min-h-full overflow-hidden border shadow-sm transition-[width]",
            viewport === "desktop" && "w-full",
            viewport === "tablet" && "w-full max-w-[768px]",
            viewport === "mobile" && "w-full max-w-[390px]",
          )}
        >
          <MarketingPage viewport={viewport} />
        </div>
      </div>
    </div>
  );
}
