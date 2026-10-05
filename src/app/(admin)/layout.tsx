import { cookies } from "next/headers";
import { Suspense } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { SIDEBAR_COOKIE_NAME, SIDEBAR_WIDTH } from "@/lib/sidebar-constants";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <Suspense fallback={<AdminLayoutSkeleton />}>
      <CookieAwareAdminLayout>{children}</CookieAwareAdminLayout>
    </Suspense>
  );
}

async function CookieAwareAdminLayout({ children }: Props) {
  const cookieStore = await cookies();
  /** Matches client `sidebar.tsx`: cookie is `"true"` / `"false"`; treat missing as open. */
  const sidebarDefaultOpen =
    cookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== "false";

  return (
    <div className="border-grid flex flex-1 flex-col">
      <SidebarProvider defaultOpen={sidebarDefaultOpen}>
        <AppSidebar />
        <div
          id="content"
          className={cn(
            "flex h-full w-full min-w-0 flex-col",
            "has-[div[data-layout=fixed]]:h-svh",
            "group-data-[scroll-locked=1]/body:h-full",
            "has-[data-layout=fixed]:group-data-[scroll-locked=1]/body:h-svh",
          )}
        >
          <Header />
          {children}
        </div>
      </SidebarProvider>
    </div>
  );
}

function AdminLayoutSkeleton() {
  return (
    <div
      className="border-grid flex min-h-svh flex-1"
      aria-label="Loading admin workspace"
    >
      <aside
        className="bg-sidebar @container hidden h-svh shrink-0 flex-col border-r md:flex"
        style={{
          width: `var(--admin-loading-sidebar-width, ${SIDEBAR_WIDTH})`,
        }}
      >
        <div className="flex h-14 shrink-0 items-center gap-2 px-2.5 @max-[4rem]:h-24 @max-[4rem]:items-start @max-[4rem]:px-2 @max-[4rem]:pt-4">
          <Skeleton className="size-8 shrink-0 rounded-lg" />
          <Skeleton className="h-7 w-36 min-w-0 @max-[4rem]:hidden" />
        </div>
        <div className="space-y-3 p-2">
          {Array.from({ length: 7 }, (_, index) => (
            <Skeleton key={index} className="h-8 w-full" />
          ))}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center justify-between px-3 shadow-[inset_0_-1px_0_var(--border)] md:h-14">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-32" />
        </header>
        <main className="bg-background min-h-0 flex-1" />
      </div>
    </div>
  );
}
