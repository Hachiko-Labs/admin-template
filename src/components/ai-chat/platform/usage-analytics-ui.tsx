"use client";

import { FcGoogle } from "react-icons/fc";
import { SiAnthropic, SiOpenai } from "react-icons/si";

import { cn } from "@/lib/utils";

import type { UsageModel } from "./usage-analytics-data";

export function UsageModelMark({
  model,
  className,
}: {
  model: UsageModel;
  className?: string;
}) {
  const Icon =
    model.provider === "OpenAI"
      ? SiOpenai
      : model.provider === "Anthropic"
        ? SiAnthropic
        : model.provider === "Google"
          ? FcGoogle
          : null;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-5 shrink-0 items-center justify-center",
        model.provider === "Anthropic" &&
          "text-orange-600 dark:text-orange-400",
        model.provider === "Mistral" && "text-orange-500",
        className,
      )}
    >
      {Icon ? (
        <Icon className="size-4" />
      ) : (
        <span className="font-mono text-base font-black">M</span>
      )}
    </span>
  );
}
