import type { ReactNode } from "react";

import { ThemeSwitch } from "@/components/theme-switch";
import { cn } from "@/lib/utils";

export function AiEditorHeaderContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <>
      <div
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2 overflow-x-auto overscroll-x-contain whitespace-nowrap [scrollbar-width:none] [&>*]:shrink-0",
          className,
        )}
      >
        {children}
      </div>
      <ThemeSwitch triggerClassName="size-8 shrink-0 scale-100 rounded-lg" />
    </>
  );
}
