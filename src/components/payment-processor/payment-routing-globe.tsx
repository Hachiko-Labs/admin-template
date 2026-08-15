"use client";

import createGlobe, { type COBEOptions } from "cobe";
import { RadioTower } from "lucide-react";
import * as React from "react";

import { THEME_PRESET_CHANGE_EVENT } from "@/lib/theme-preset-apply";
import { cn } from "@/lib/utils";

const regionalRevenue = [
  { name: "Americas", value: "$742K", share: "40%" },
  { name: "Europe", value: "$512K", share: "28%" },
  { name: "Asia Pacific", value: "$438K", share: "24%" },
  { name: "Other regions", value: "$148K", share: "8%" },
];

const globeAnalytics = [
  {
    id: "americas",
    value: "$742K",
    trend: 8.4,
  },
  {
    id: "europe",
    value: "$512K",
    trend: 3.1,
  },
  {
    id: "apac",
    value: "$438K",
    trend: -1.8,
  },
] as const;

const markers: NonNullable<COBEOptions["markers"]> = [
  { id: "americas", location: [37.7749, -122.4194], size: 0.055 },
  { location: [40.7128, -74.006], size: 0.045 },
  { id: "europe", location: [51.5072, -0.1276], size: 0.05 },
  { id: "apac", location: [19.076, 72.8777], size: 0.06 },
  { location: [1.3521, 103.8198], size: 0.045 },
];

const arcs: NonNullable<COBEOptions["arcs"]> = [
  {
    from: [37.7749, -122.4194],
    to: [51.5072, -0.1276],
  },
  {
    from: [51.5072, -0.1276],
    to: [19.076, 72.8777],
  },
  {
    from: [19.076, 72.8777],
    to: [1.3521, 103.8198],
  },
  {
    from: [40.7128, -74.006],
    to: [37.7749, -122.4194],
  },
];

type GlobeVisualPreset = Pick<
  COBEOptions,
  | "baseColor"
  | "dark"
  | "diffuse"
  | "glowColor"
  | "mapBaseBrightness"
  | "mapBrightness"
>;

function resolveCssColor(value: string, fallback: [number, number, number]) {
  const swatch = document.createElement("span");
  swatch.style.color = value;
  swatch.style.display = "none";
  document.body.appendChild(swatch);
  const computedColor = getComputedStyle(swatch).color;
  swatch.remove();

  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = 1;
  colorCanvas.height = 1;
  const context = colorCanvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!context || !computedColor) return fallback;

  context.fillStyle = computedColor;
  context.fillRect(0, 0, 1, 1);
  const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;

  return [red / 255, green / 255, blue / 255] as [number, number, number];
}

function getGlobeVisualPreset(isDark: boolean): GlobeVisualPreset {
  if (isDark) {
    return {
      dark: 1,
      diffuse: 1.15,
      mapBrightness: 5.4,
      mapBaseBrightness: 0.13,
      baseColor: resolveCssColor(
        "color-mix(in oklch, var(--primary) 72%, var(--foreground))",
        [0.92, 0.94, 0.98],
      ),
      glowColor: resolveCssColor(
        "color-mix(in oklch, var(--primary) 40%, var(--background))",
        [0.16, 0.2, 0.22],
      ),
    };
  }

  return {
    dark: 0,
    diffuse: 1.1,
    mapBrightness: 5,
    mapBaseBrightness: 0.05,
    baseColor: resolveCssColor(
      "color-mix(in oklch, var(--primary) 16%, var(--background))",
      [0.9, 0.91, 0.93],
    ),
    glowColor: resolveCssColor(
      "color-mix(in oklch, var(--primary) 22%, var(--background))",
      [0.82, 0.84, 0.87],
    ),
  };
}

export function PaymentRoutingGlobe({ className }: { className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const globeRef = React.useRef<ReturnType<typeof createGlobe> | null>(null);
  const pointerInteracting = React.useRef<number | null>(null);
  const pointerMovement = React.useRef(0);

  React.useEffect(() => {
    let paletteFrame = 0;

    const refreshPalette = () => {
      window.cancelAnimationFrame(paletteFrame);
      paletteFrame = window.requestAnimationFrame(() => {
        const globe = globeRef.current;
        if (!globe) return;

        const isDark = document.documentElement.classList.contains("dark");
        const signalColor = resolveCssColor(
          "var(--primary)",
          [0.42, 0.9, 0.72],
        );

        globe.update({
          ...getGlobeVisualPreset(isDark),
          markerColor: signalColor,
          arcColor: signalColor,
        });
      });
    };

    const themeObserver = new MutationObserver(refreshPalette);
    themeObserver.observe(document.documentElement, {
      attributeFilter: ["class", "style"],
      attributes: true,
    });
    window.addEventListener(THEME_PRESET_CHANGE_EVENT, refreshPalette);
    refreshPalette();

    return () => {
      window.cancelAnimationFrame(paletteFrame);
      themeObserver.disconnect();
      window.removeEventListener(THEME_PRESET_CHANGE_EVENT, refreshPalette);
    };
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let phi = 0.45;
    let width = 0;
    let animationFrame = 0;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isDark = document.documentElement.classList.contains("dark");
    const visualPreset = getGlobeVisualPreset(isDark);
    const signalColor = resolveCssColor("var(--primary)", [0.42, 0.9, 0.72]);
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    const resizeObserver = new ResizeObserver((entries) => {
      width = entries[0]?.contentRect.width ?? 0;
    });

    resizeObserver.observe(canvas);

    const globe = createGlobe(canvas, {
      devicePixelRatio: pixelRatio,
      width: 600,
      height: 600,
      phi,
      theta: 0.18,
      ...visualPreset,
      scale: 0.96,
      mapSamples: 16000,
      markerColor: signalColor,
      arcColor: signalColor,
      arcWidth: 0.38,
      arcHeight: 0.22,
      markerElevation: 0.015,
      markers,
      arcs,
    });
    globeRef.current = globe;

    const animate = () => {
      if (!pointerInteracting.current && !reduceMotion) {
        phi += 0.0025;
      }

      globe.update({
        phi: phi + pointerMovement.current,
        width: width * pixelRatio,
        height: width * pixelRatio,
      });
      animationFrame = window.requestAnimationFrame(animate);
    };

    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      globe.destroy();
      globeRef.current = null;
    };
  }, []);

  return (
    <section
      className={cn(
        "group/card border-border/70 bg-card/80 relative h-full overflow-hidden border p-4 backdrop-blur lg:col-span-4 lg:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground font-mono text-[10px] tracking-[0.22em] uppercase">
            Signal 02
          </p>
          <h2 className="text-foreground mt-2 text-base font-semibold">
            Payment volume by region
          </h2>
        </div>
        <span className="border-primary/20 text-primary inline-flex items-center gap-1 border px-2.5 py-1 font-mono text-[10px] tracking-[0.16em] uppercase">
          <RadioTower className="size-3" />
          Live
        </span>
      </div>

      <div className="relative mx-auto mt-2 aspect-square w-full max-w-[285px]">
        <div className="pointer-events-none absolute inset-[12%] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--primary)_12%,var(--muted))_0%,color-mix(in_oklch,var(--primary)_5%,transparent)_48%,transparent_72%)] blur-2xl dark:bg-[radial-gradient(circle,color-mix(in_oklch,var(--primary)_16%,var(--muted))_0%,color-mix(in_oklch,var(--primary)_7%,transparent)_48%,transparent_72%)]" />
        <canvas
          aria-label="Revenue activity across global customer regions"
          className="relative size-full cursor-grab touch-none active:cursor-grabbing"
          onPointerDown={(event) => {
            pointerInteracting.current = event.clientX;
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (pointerInteracting.current === null) return;
            const delta = event.clientX - pointerInteracting.current;
            pointerMovement.current += delta / 200;
            pointerInteracting.current = event.clientX;
          }}
          onPointerUp={(event) => {
            pointerInteracting.current = null;
            event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          ref={canvasRef}
          role="img"
        />
        <div className="from-card pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t to-transparent" />

        {globeAnalytics.map((metric) => (
          <div
            className="bg-popover/90 text-popover-foreground border-border/70 pointer-events-none absolute z-10 flex items-baseline gap-1.5 rounded-sm border px-2 py-1 whitespace-nowrap shadow-lg backdrop-blur-sm"
            key={metric.id}
            style={
              {
                positionAnchor: `--cobe-${metric.id}`,
                bottom: "anchor(top)",
                left: "anchor(center)",
                translate: "-50% 0",
                marginBottom: "6px",
                opacity: `var(--cobe-visible-${metric.id}, 0)`,
                filter: `blur(calc((1 - var(--cobe-visible-${metric.id}, 0)) * 8px))`,
                transition: "opacity 300ms, filter 300ms",
              } as React.CSSProperties
            }
          >
            <span className="font-mono text-xs font-semibold tracking-tight">
              {metric.value}
            </span>
            <span
              className={cn(
                "font-mono text-[9px]",
                metric.trend >= 0 ? "text-primary" : "text-destructive",
              )}
            >
              {metric.trend >= 0 ? "↑" : "↓"} {Math.abs(metric.trend)}%
            </span>
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-2 gap-2">
        {regionalRevenue.map((region) => (
          <div
            className="border-border/70 bg-muted/50 border p-2"
            key={region.name}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground truncate text-xs">
                {region.name}
              </p>
              <p className="text-primary font-mono text-[10px]">
                {region.share}
              </p>
            </div>
            <p className="text-foreground mt-1 font-mono text-sm font-semibold tabular-nums">
              {region.value}
            </p>
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0">
        <GlobeCorner className="top-0 left-0" />
        <GlobeCorner className="top-0 right-0 -scale-x-100" />
        <GlobeCorner className="bottom-0 left-0 -scale-y-100" />
        <GlobeCorner className="right-0 bottom-0 -scale-100" />
      </div>
    </section>
  );
}

function GlobeCorner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute size-3 opacity-45 transition-opacity duration-300 group-hover/card:animate-[cornerGlitch_0.6s_ease-in-out] group-hover/card:opacity-100",
        className,
      )}
    >
      <span className="bg-primary/70 absolute top-0 left-0.5 h-0.5 w-2.5" />
      <span className="bg-primary/70 absolute top-0 left-0 h-2.5 w-0.5" />
    </div>
  );
}
