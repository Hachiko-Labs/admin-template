import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingOrderList() {
  return (
    <main
      className="flex min-h-0 flex-1 flex-col gap-8 p-6 md:p-8"
      aria-label="Loading orders list"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48 max-w-full" />
          <Skeleton className="h-5 w-72 max-w-full" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="flex gap-6 border-b pb-3">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-10 w-64 max-w-full" />
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="rounded-lg border p-4">
        <Skeleton className="mb-4 h-6 w-full" />
        <div className="space-y-4">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </main>
  );
}
