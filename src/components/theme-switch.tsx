"use client";

import {
  IconCheck,
  IconDeviceDesktop,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const subscribeToMount = () => () => {};

interface ThemeSwitchProps {
  align?: "start" | "center" | "end";
  contentClassName?: string;
  triggerClassName?: string;
  triggerId?: string;
  triggerSize?: ButtonProps["size"];
  triggerVariant?: ButtonProps["variant"];
}

export function ThemeSwitch({
  align = "end",
  contentClassName,
  triggerClassName,
  triggerId,
  triggerSize = "icon",
  triggerVariant = "ghost",
}: ThemeSwitchProps = {}) {
  const { theme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    subscribeToMount,
    () => true,
    () => false,
  );
  const ModeIcon =
    theme === "system"
      ? IconDeviceDesktop
      : theme === "dark"
        ? IconMoon
        : IconSun;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          {...(triggerId ? { id: triggerId } : {})}
          variant={triggerVariant}
          size={triggerSize}
          className={cn("scale-95 rounded-full", triggerClassName)}
          aria-label="Toggle theme"
        >
          {mounted ? (
            <ModeIcon className="size-[1.2rem]" aria-hidden="true" />
          ) : (
            <span className="size-4" aria-hidden="true" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={contentClassName}>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <IconSun className="size-4" aria-hidden="true" />
          Light
          <IconCheck
            size={14}
            aria-hidden="true"
            className={cn(
              "ml-auto",
              (!mounted || theme !== "light") && "hidden",
            )}
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <IconMoon className="size-4" aria-hidden="true" />
          Dark
          <IconCheck
            size={14}
            aria-hidden="true"
            className={cn(
              "ml-auto",
              (!mounted || theme !== "dark") && "hidden",
            )}
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <IconDeviceDesktop className="size-4" aria-hidden="true" />
          System
          <IconCheck
            size={14}
            aria-hidden="true"
            className={cn(
              "ml-auto",
              (!mounted || theme !== "system") && "hidden",
            )}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
