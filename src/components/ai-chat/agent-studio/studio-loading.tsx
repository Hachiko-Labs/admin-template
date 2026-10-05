import { Skeleton } from "@/components/ui/skeleton";

import { IntegrationsNavigation } from "./integrations-navigation";
import { StudioShell } from "./studio-shell";
export function StudioLoading({ active }: { active: string }) {
  return (
    <StudioShell
      active={active}
      sidebarContent={
        active === "integrations" ? <IntegrationsNavigation /> : undefined
      }
    >
      <div
        className="space-y-6 p-8"
        role="status"
        aria-label="Loading Agent Studio"
      >
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-36 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    </StudioShell>
  );
}
