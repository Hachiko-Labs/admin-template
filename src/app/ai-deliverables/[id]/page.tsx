import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  deliverableBytes,
  deliverableFiles,
  formatDeliverableBytes,
} from "@/components/ai-chat/ai-deliverable-data";
import { AiDeliverablePreview } from "@/components/ai-chat/ai-deliverable-preview";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: Props) {
  return (
    <Suspense fallback={<DeliverableLoading />}>
      <DeliverableDetail params={params} />
    </Suspense>
  );
}

async function DeliverableDetail({ params }: Props) {
  const { id } = await params;
  const file = deliverableFiles.find((item) => item.id === id);
  if (!file) notFound();
  return (
    <main className="bg-muted/30 min-h-svh">
      <header className="bg-background flex flex-wrap items-center justify-between gap-3 border-b px-6 py-3">
        <div>
          <p className="text-sm font-medium">{file.name}</p>
          <p className="text-muted-foreground mt-1 text-xs">
            {file.format.toUpperCase()} ·{" "}
            {formatDeliverableBytes(deliverableBytes(file))} · Demo deliverable
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/ai-chat/deliverable-file-cabinet">
            Open file cabinet
          </Link>
        </Button>
      </header>
      <article className="bg-background mx-auto my-8 max-w-4xl rounded-xl border p-6 sm:p-12">
        <AiDeliverablePreview file={file} />
      </article>
    </main>
  );
}

function DeliverableLoading() {
  return (
    <main className="bg-muted/30 min-h-svh" aria-label="Loading deliverable">
      <header className="bg-background flex items-center justify-between gap-3 border-b px-6 py-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-36" />
      </header>
      <div className="bg-background mx-auto my-8 max-w-4xl rounded-xl border p-6 sm:p-12">
        <Skeleton className="h-8 w-56 max-w-full" />
        <Skeleton className="mt-6 h-80 w-full" />
      </div>
    </main>
  );
}
