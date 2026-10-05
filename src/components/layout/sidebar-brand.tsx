import { Logo } from "@/components/logo";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

export function SidebarBrand({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-12 w-full min-w-0 shrink-0 items-center gap-2 p-2 pr-11 transition-[padding,gap] duration-200 ease-linear group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0",
        className,
      )}
    >
      <div className="border-muted-foreground/25 flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg border bg-transparent">
        <Logo className="size-4" />
      </div>
      <div className="grid min-w-0 flex-1 overflow-hidden text-left text-xs leading-tight transition-opacity duration-200 ease-linear group-data-[collapsible=icon]:opacity-0">
        <span className="truncate font-semibold" title="Shadcnblocks Admin">
          Shadcnblocks Admin
        </span>
        <span className="truncate text-xs">{site.plan}</span>
      </div>
    </div>
  );
}
