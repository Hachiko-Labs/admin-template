import Image from "next/image";

import { site } from "@/data/site";
import { cn } from "@/lib/utils";

export function Logo({
  className = "",
  width = 18,
  height = 18,
  src,
  alt,
}: {
  className?: string;
  width?: number;
  height?: number;
  /** Single asset override (same in light and dark). Prefer `logoLightSrc` / `logoDarkSrc` on `site`. */
  src?: string;
  alt?: string;
}) {
  const label = alt ?? site.logoAlt;

  if (src) {
    return (
      <Image
        src={src}
        width={width}
        height={height}
        className={className}
        alt={label}
      />
    );
  }

  return (
    <>
      <Image
        src={site.logoLightSrc}
        width={width}
        height={height}
        className={cn(className, "dark:hidden")}
        alt={label}
      />
      <Image
        src={site.logoDarkSrc}
        width={width}
        height={height}
        className={cn(className, "hidden dark:block")}
        alt=""
        aria-hidden
      />
    </>
  );
}

const brandMarkSizes = {
  xs: { width: 12, height: 14 },
  sm: { width: 14, height: 16 },
  md: { width: 17, height: 20 },
  lg: { width: 21, height: 24 },
  xl: { width: 24, height: 28 },
} as const;

export function BrandMark({
  className,
  decorative = false,
  size = "md",
}: {
  className?: string;
  decorative?: boolean;
  size?: keyof typeof brandMarkSizes;
}) {
  const dimensions = brandMarkSizes[size];

  return (
    <Logo
      className={cn("shrink-0 object-contain", className)}
      width={dimensions.width}
      height={dimensions.height}
      alt={decorative ? "" : undefined}
    />
  );
}
