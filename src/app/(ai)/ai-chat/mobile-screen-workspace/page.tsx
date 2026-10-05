import { readFile } from "node:fs/promises";
import path from "node:path";

import { AiMobileScreenWorkspace } from "@/components/ai-chat/ai-mobile-screen-workspace";

export const metadata = { title: "Mobile screen workspace" };
export default async function Page() {
  const source = await readFile(
    path.join(
      process.cwd(),
      "src/components/ai-chat/ai-mobile-preview-screen.tsx",
    ),
    "utf8",
  );

  return <AiMobileScreenWorkspace source={source} />;
}
