import { Suspense } from "react";

import { ApiRequestsScreen } from "@/components/ai-chat/api-requests/api-requests-screen";

export default function ApiRequestsPage() {
  return (
    <Suspense>
      <ApiRequestsScreen key="irregular-traffic-v2" />
    </Suspense>
  );
}
