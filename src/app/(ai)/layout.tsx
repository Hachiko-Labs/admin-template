import { cookies } from "next/headers";
import { Suspense } from "react";

import { AiShowcaseSidebar } from "@/components/ai-chat/ai-showcase-sidebar";
import { PortalProvider } from "@/components/ui/portal-slot";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { SIDEBAR_COOKIE_NAME, SIDEBAR_WIDTH } from "@/lib/sidebar-constants";

interface Props {
  children: React.ReactNode;
}

export default function AiLayout({ children }: Props) {
  return (
    <Suspense fallback={<AiLayoutSkeleton />}>
      <CookieAwareAiLayout>{children}</CookieAwareAiLayout>
    </Suspense>
  );
}

async function CookieAwareAiLayout({ children }: Props) {
  const cookieStore = await cookies();
  const sidebarDefaultOpen =
    cookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== "false";

  return (
    <SidebarProvider
      defaultOpen={sidebarDefaultOpen}
      className="[--ai-workspace-header-height:3.5rem]"
    >
      <PortalProvider>
        <AiShowcaseSidebar />
        <div className="flex h-svh min-w-0 flex-1 overflow-hidden">
          {children}
        </div>
      </PortalProvider>
    </SidebarProvider>
  );
}

function AiLayoutSkeleton() {
  return (
    <div className="flex h-svh w-full" aria-label="Loading AI workspace">
      <aside
        style={{
          width: `var(--admin-loading-sidebar-width, ${SIDEBAR_WIDTH})`,
        }}
        className="hidden shrink-0 space-y-4 border-r p-4 md:block"
      >
        <Skeleton className="h-8 w-36 max-w-full" />
        {Array.from({ length: 7 }, (_, index) => (
          <Skeleton key={index} className="h-8 w-full" />
        ))}
      </aside>
      <main className="bg-background min-w-0 flex-1" />
    </div>
  );
}
