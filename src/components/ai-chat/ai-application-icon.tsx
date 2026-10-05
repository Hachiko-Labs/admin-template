import { Film, ScanEye, ShoppingBag, Smartphone, Youtube } from "lucide-react";

const applicationIcons = {
  inspection: ScanEye,
  commerce: ShoppingBag,
  mobile: Smartphone,
  variations: Film,
  youtube: Youtube,
};

export function AiApplicationIcon({
  app,
}: {
  app: keyof typeof applicationIcons;
}) {
  const Icon = applicationIcons[app];
  return (
    <span
      data-ai-application-icon={app}
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center"
    >
      <Icon className="size-4" />
    </span>
  );
}
