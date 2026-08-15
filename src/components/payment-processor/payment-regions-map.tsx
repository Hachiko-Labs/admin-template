"use client";

import "leaflet/dist/leaflet.css";

import { scalePow } from "d3-scale";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type {
  GeoJSON as LeafletGeoJSON,
  LatLngBoundsExpression,
  Layer,
  LeafletMouseEvent,
  Map as LeafletMap,
  Path,
  PathOptions,
} from "leaflet";
import * as React from "react";

import { cn } from "@/lib/utils";

type CountryMetric = {
  code: string;
  name: string;
  payments: number;
};

type MapFeatureProperties = {
  ADMIN: string;
  ISO_A2: string;
};

const locationMetrics: CountryMetric[] = [
  { code: "US", name: "United States", payments: 1184 },
  { code: "IN", name: "India", payments: 936 },
  { code: "GB", name: "United Kingdom", payments: 812 },
  { code: "DE", name: "Germany", payments: 748 },
  { code: "BR", name: "Brazil", payments: 682 },
  { code: "JP", name: "Japan", payments: 594 },
  { code: "FR", name: "France", payments: 486 },
  { code: "AU", name: "Australia", payments: 392 },
  { code: "SG", name: "Singapore", payments: 274 },
  { code: "ZA", name: "South Africa", payments: 228 },
  { code: "MX", name: "Mexico", payments: 184 },
  { code: "AE", name: "United Arab Emirates", payments: 156 },
];

const flagBands: Record<string, string[]> = {
  AE: ["bg-red-600", "bg-white", "bg-emerald-600"],
  AU: ["bg-blue-800", "bg-white", "bg-red-500"],
  BR: ["bg-emerald-600", "bg-yellow-300", "bg-blue-700"],
  DE: ["bg-black", "bg-red-600", "bg-yellow-300"],
  EG: ["bg-red-600", "bg-white", "bg-black"],
  FR: ["bg-blue-700", "bg-white", "bg-red-600"],
  GB: ["bg-blue-800", "bg-white", "bg-red-600"],
  IN: ["bg-orange-500", "bg-white", "bg-emerald-600"],
  JP: ["bg-white", "bg-red-500", "bg-white"],
  MX: ["bg-emerald-600", "bg-white", "bg-red-600"],
  SG: ["bg-red-600", "bg-white", "bg-red-600"],
  SE: ["bg-blue-700", "bg-yellow-300", "bg-blue-700"],
  US: ["bg-blue-800", "bg-white", "bg-red-600"],
  ZA: ["bg-emerald-700", "bg-yellow-300", "bg-black"],
};

const mixBase = "var(--background)";
const mapBounds: LatLngBoundsExpression = [
  [-90, -220],
  [90, 220],
];

type LeafletStampedElement = HTMLDivElement & {
  _leaflet_id?: number;
};

type FeatureLayer = Layer & {
  feature?: Feature<Geometry, MapFeatureProperties>;
};

function CountryFlagMark({ code }: { code: string }) {
  const bands = flagBands[code] ?? ["bg-muted", "bg-background", "bg-muted"];

  return (
    <span className="grid h-[18px] w-7 shrink-0 overflow-hidden rounded-[3px] border shadow-[0_1px_2px_rgba(15,23,42,0.08)]">
      {bands.map((band, index) => (
        <span className={band} key={`${code}-${index}`} />
      ))}
    </span>
  );
}

export function PaymentRegionsMap() {
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<LeafletMap | null>(null);
  const geoJsonLayerRef = React.useRef<LeafletGeoJSON | null>(null);
  const [mapReady, setMapReady] = React.useState(false);
  const [hoveredCode, setHoveredCode] = React.useState<string | null>(null);
  const [countriesGeoJson, setCountriesGeoJson] =
    React.useState<FeatureCollection<Geometry, MapFeatureProperties> | null>(
      null,
    );
  const [tooltip, setTooltip] = React.useState<{
    code: string;
    count: number;
    name: string;
    percentage: number;
  } | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    fetch("/payment-processor/countries.geojson")
      .then((response) => response.json())
      .then((data: FeatureCollection<Geometry, MapFeatureProperties>) => {
        if (!cancelled) {
          setCountriesGeoJson(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCountriesGeoJson(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const totalPayments = React.useMemo(
    () => locationMetrics.reduce((sum, country) => sum + country.payments, 0),
    [],
  );

  const colorScale = React.useMemo(() => {
    const values = locationMetrics.map((country) => country.payments);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const scale = scalePow<number>()
      .exponent(0.5)
      .domain([min, max])
      .range([28, 74]);

    return (value: number) => {
      if (value <= 0) {
        return "color-mix(in oklch, var(--muted) 68%, var(--background))";
      }

      return `color-mix(in oklch, var(--primary) ${scale(value).toFixed(0)}%, ${mixBase})`;
    };
  }, []);

  const topCountries = React.useMemo(
    () =>
      [...locationMetrics].sort((a, b) => b.payments - a.payments).slice(0, 5),
    [],
  );

  const styleFeature = React.useCallback(
    (
      feature?: Feature<Geometry, MapFeatureProperties>,
      activeCode: string | null = null,
    ): PathOptions => {
      const code = feature?.properties?.ISO_A2;
      const country = locationMetrics.find((item) => item.code === code);
      const payments = country?.payments ?? 0;
      const hasData = payments > 0;
      const isHovered = activeCode === code;

      return {
        color:
          isHovered && hasData
            ? "var(--primary)"
            : "color-mix(in oklch, var(--border) 72%, var(--muted-foreground))",
        fill: true,
        fillColor: hasData
          ? colorScale(payments)
          : "color-mix(in oklch, var(--muted) 68%, var(--background))",
        fillOpacity: 1,
        opacity: 1,
        weight: isHovered && hasData ? 1.5 : 0.5,
      };
    },
    [colorScale],
  );

  const onEachFeature = React.useCallback(
    (feature: Feature<Geometry, MapFeatureProperties>, layer: Layer) => {
      layer.on({
        click: (event: LeafletMouseEvent) => {
          if (!mapRef.current) return;

          mapRef.current.setView(
            event.latlng,
            Math.min(mapRef.current.getZoom() + 1, 5),
          );
        },
        mouseout: () => {
          setHoveredCode(null);
          setTooltip(null);
        },
        mouseover: () => {
          const code = feature.properties?.ISO_A2 ?? "";
          const country = locationMetrics.find((item) => item.code === code);

          setHoveredCode(code);
          setTooltip({
            code,
            count: country?.payments ?? 0,
            name: feature.properties?.ADMIN ?? code,
            percentage: country ? (country.payments / totalPayments) * 100 : 0,
          });
        },
      });
    },
    [totalPayments],
  );

  React.useEffect(() => {
    const container = mapContainerRef.current as LeafletStampedElement | null;

    if (!container) return;

    let cancelled = false;
    delete container._leaflet_id;
    container.replaceChildren();

    import("leaflet").then((L) => {
      if (cancelled || !mapContainerRef.current) return;

      const map = L.map(container, {
        attributionControl: false,
        maxBounds: mapBounds,
        maxBoundsViscosity: 0.5,
        maxZoom: 5,
        minZoom: 1,
        wheelPxPerZoomLevel: 120,
        zoomControl: false,
        zoomDelta: 0.5,
        zoomSnap: 0.25,
      }).setView([22, 4], 1.45);

      mapRef.current = map;
      setMapReady(true);
    });

    return () => {
      cancelled = true;
      setMapReady(false);
      geoJsonLayerRef.current?.remove();
      geoJsonLayerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      container.replaceChildren();
      delete container._leaflet_id;
    };
  }, []);

  React.useEffect(() => {
    const map = mapRef.current;

    if (!mapReady || !map || !countriesGeoJson) return;

    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !mapRef.current) return;

      geoJsonLayerRef.current?.remove();
      geoJsonLayerRef.current = L.geoJSON(countriesGeoJson, {
        onEachFeature: (feature, layer) => {
          onEachFeature(
            feature as Feature<Geometry, MapFeatureProperties>,
            layer,
          );
        },
        style: (feature) =>
          styleFeature(feature as Feature<Geometry, MapFeatureProperties>),
      }).addTo(mapRef.current);
    });

    return () => {
      cancelled = true;
      geoJsonLayerRef.current?.remove();
      geoJsonLayerRef.current = null;
    };
  }, [countriesGeoJson, mapReady, onEachFeature, styleFeature]);

  React.useEffect(() => {
    geoJsonLayerRef.current?.eachLayer((layer: FeatureLayer) => {
      if (!("setStyle" in layer)) return;

      (layer as Path).setStyle(styleFeature(layer.feature, hoveredCode));
    });
  }, [hoveredCode, styleFeature]);

  return (
    <section
      className={cn(
        "border-border/70 bg-card overflow-hidden rounded-xl border shadow-[0_18px_50px_rgba(15,23,42,0.06)]",
      )}
    >
      <div className="bg-card px-5 py-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Payment Regions
        </h2>
      </div>

      <div className="relative h-[360px] overflow-hidden bg-[color-mix(in_oklch,var(--background)_90%,var(--muted))] dark:bg-[color-mix(in_oklch,var(--background)_86%,black)]">
        <div
          className="h-full w-full"
          ref={mapContainerRef}
          style={{
            backgroundColor:
              "color-mix(in oklch, var(--background) 90%, var(--muted))",
            cursor: "default",
            height: "100%",
            outline: "none",
            zIndex: 1,
          }}
        />

        {tooltip && (
          <div className="bg-card/95 pointer-events-none absolute top-3 left-3 z-20 rounded-md border px-3 py-2 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <CountryFlagMark code={tooltip.code} />
              <span className="text-sm font-semibold">{tooltip.name}</span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs tabular-nums">
              {tooltip.count.toLocaleString()} payments ·{" "}
              {tooltip.percentage.toFixed(1)}%
            </p>
          </div>
        )}

        <div className="bg-card/95 border-border/80 absolute right-3 bottom-3 z-10 w-56 overflow-hidden rounded-md border shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur-sm dark:shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
          <div className="bg-muted/60 border-border/80 border-b px-4 py-3">
            <span className="text-sm font-semibold">Top Countries</span>
          </div>
          <div>
            {topCountries.map((country) => {
              const percentage = (country.payments / totalPayments) * 100;

              return (
                <div
                  className="border-border/70 hover:bg-accent/60 flex items-center gap-3 border-b px-4 py-2.5 transition-colors last:border-b-0"
                  key={country.code}
                >
                  <CountryFlagMark code={country.code} />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {country.code}
                  </span>
                  <span className="shrink-0 text-sm font-medium tabular-nums">
                    {country.payments.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
