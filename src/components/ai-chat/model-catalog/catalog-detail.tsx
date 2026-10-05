"use client";

import { ArrowUpRight, Copy } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { type CatalogModel, developerName, priceParts } from "./catalog-data";

export async function copyModel(id: string) {
  try {
    await navigator.clipboard.writeText(id);
    toast.success("Model ID copied");
  } catch {
    toast.error("Could not copy model ID");
  }
}

export function CatalogDetail({
  model,
  onClose,
}: {
  model: CatalogModel | null;
  onClose: () => void;
}) {
  return (
    <Sheet
      open={!!model}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {model && (
          <>
            <SheetHeader className="pr-6 text-left">
              <p className="text-muted-foreground text-xs">
                {developerName(model.developer)} / {model.category}
              </p>
              <SheetTitle className="text-xl break-words">
                {model.id.split("/")[1]}
              </SheetTitle>
              <SheetDescription>
                Pricing and routing information from the catalog snapshot.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 flex items-center justify-between gap-2 rounded-md border px-3 py-2">
              <code className="min-w-0 text-xs break-all">{model.id}</code>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Copy model ID"
                onClick={() => void copyModel(model.id)}
              >
                <Copy />
              </Button>
            </div>
            <section className="mt-7">
              <h3 className="text-sm font-medium">Pricing</h3>
              <dl className="mt-3 divide-y rounded-md border px-4">
                {[
                  ["Input", model.input],
                  ["Output", model.output],
                  ["Latency", model.latency],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4 py-3 text-sm"
                  >
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="text-right tabular-nums">
                      {priceParts(value).price}
                      {priceParts(value).additional && (
                        <span className="text-muted-foreground ml-2 text-xs">
                          +{priceParts(value).additional}
                        </span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="text-muted-foreground mt-3 text-xs leading-5">
                /M = per million tokens unless marked as characters. /K = per
                thousand requests; /img = per image; /sec = per second; /hr =
                per hour. Additional rates may apply by modality or context
                size. Latency is a captured measurement, not a service
                guarantee.
              </p>
            </section>
            <section className="mt-7">
              <h3 className="text-sm font-medium">Available through</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {model.providers.map((p) => (
                  <Badge key={p} variant="outline">
                    {developerName(p)}
                  </Badge>
                ))}
                {model.extraProviders > 0 && (
                  <Badge variant="secondary">
                    +{model.extraProviders} more providers
                  </Badge>
                )}
              </div>
            </section>
            <section className="mt-7">
              <h3 className="text-sm font-medium">Capabilities</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {model.capabilities.map((c) => (
                  <Badge key={c} variant="secondary">
                    {c}
                  </Badge>
                ))}
                {!model.capabilities.length && (
                  <span className="text-muted-foreground text-sm">
                    Not specified in the table preview
                  </span>
                )}
                {model.extraCapabilities > 0 && (
                  <Badge variant="outline">
                    +{model.extraCapabilities} more at source
                  </Badge>
                )}
              </div>
            </section>
            <section className="mt-7">
              <h3 className="text-sm font-medium">Privacy & access</h3>
              <dl className="mt-3 space-y-4 text-sm">
                {(
                  [
                    ["Zero data retention", model.zdr],
                    ["No training on prompts", model.noTraining],
                    ["Free tier eligible", model.freeTier],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd>{value ? "Yes" : "No"}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-muted-foreground mt-3 text-xs leading-5">
                Privacy flags mean at least one provider qualifies. Check the
                selected provider’s policy before routing. Free tier refers to
                eligibility for AI Gateway’s monthly credit, not necessarily a
                free model.
              </p>
            </section>
            <div className="mt-7 flex justify-between border-t pt-4 text-xs">
              <span className="text-muted-foreground">Released</span>
              <span>{model.released || "Not listed"}</span>
            </div>
            {model.id === "anthropic/claude-fable-5.1" && (
              <Button className="mt-6 w-full" asChild>
                <Link href="/ai-chat/model-detail">
                  View model details <ArrowUpRight />
                </Link>
              </Button>
            )}
            <Button variant="outline" className="mt-6 w-full" asChild>
              <a
                href={`https://vercel.com${model.href}`}
                target="_blank"
                rel="noreferrer"
              >
                View full provider pricing
                <ArrowUpRight />
              </a>
            </Button>
            <p className="text-muted-foreground mt-3 text-center text-xs">
              Captured 19 September 2026 · Not live pricing
            </p>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
