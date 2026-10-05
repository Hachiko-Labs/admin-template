import { AiWorkspaceShell } from "@/components/ai-chat/ai-workspace-shell";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function UsageAnalyticsLoading({
  variant,
}: {
  variant: "insights" | "models";
}) {
  return (
    <AiWorkspaceShell
      headerTitle={variant === "insights" ? "Usage insights" : "Model usage"}
      hideNavigationSidebar
      headerActions={<Badge variant="outline">Demo workspace</Badge>}
    >
      <div
        className="min-h-0 flex-1 overflow-y-auto"
        aria-label="Loading usage analytics"
        role="status"
      >
        <div className="mx-auto max-w-[944px] space-y-8 px-4 py-8 sm:px-8 sm:py-12">
          <div className="space-y-2">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          {variant === "models" ? (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-2xl" />
                ))}
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[302px] rounded-2xl" />
                ))}
              </div>
            </>
          ) : (
            <>
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-52" />
                  <Skeleton className="h-28 w-full" />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </AiWorkspaceShell>
  );
}
