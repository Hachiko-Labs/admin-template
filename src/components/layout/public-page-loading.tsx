import { Skeleton } from "@/components/ui/skeleton";

type PublicLoadingVariant =
  | "login"
  | "register"
  | "recovery"
  | "error"
  | "article";

export function PublicPageLoading({
  title,
  variant,
}: {
  title: string;
  variant: PublicLoadingVariant;
}) {
  const label = `Loading ${title.toLowerCase()}`;

  if (variant === "login" || variant === "register" || variant === "recovery") {
    const fields = variant === "register" ? 3 : variant === "recovery" ? 1 : 2;
    return (
      <div
        aria-label={label}
        data-loading-pattern={variant}
        className="rounded-xl border p-6"
      >
        <Skeleton className="h-7 w-44 max-w-full" />
        <Skeleton className="mt-3 h-4 w-64 max-w-full" />
        <Skeleton className="mt-2 h-4 w-48 max-w-full" />
        <div className="mt-7 space-y-5">
          {Array.from({ length: fields }, (_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        {variant !== "recovery" && (
          <div className="mt-6 flex items-center gap-3">
            <Skeleton className="h-10 flex-1 rounded-md" />
            <Skeleton className="h-10 flex-1 rounded-md" />
          </div>
        )}
        <Skeleton className="mx-auto mt-6 h-4 w-3/4" />
      </div>
    );
  }

  if (variant === "article") {
    return (
      <main
        aria-label={label}
        data-loading-pattern={variant}
        className="mx-auto max-w-prose space-y-4 p-8"
      >
        <Skeleton className="h-8 w-40 max-w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-24" />
      </main>
    );
  }

  return (
    <main
      aria-label={label}
      data-loading-pattern={variant}
      className="flex min-h-svh flex-col items-center justify-center gap-4 p-6"
    >
      <Skeleton className="h-32 w-44 max-w-full" />
      <Skeleton className="h-7 w-56 max-w-full" />
      <Skeleton className="h-4 w-72 max-w-full" />
      <Skeleton className="h-4 w-52 max-w-full" />
      <Skeleton className="mt-5 h-10 w-32 rounded-md" />
    </main>
  );
}
