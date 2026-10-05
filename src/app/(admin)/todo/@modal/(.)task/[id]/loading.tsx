import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading task"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-black/80" />
      <div className="bg-background relative flex h-full w-full flex-col overflow-hidden sm:h-auto sm:max-w-xl sm:rounded-lg md:max-w-3xl">
        <div className="flex h-12 shrink-0 items-center border-b px-4">
          <Skeleton className="h-5 w-36" />
        </div>
        <div className="grid min-h-0 flex-1 gap-6 overflow-auto p-6 md:min-h-[600px] md:grid-cols-2">
          <div className="space-y-4">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
