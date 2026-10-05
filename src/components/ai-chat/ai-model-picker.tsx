"use client";

import { Check, ChevronDown, Star } from "lucide-react";
import * as React from "react";
import { SiAnthropic, SiOpenai } from "react-icons/si";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { InputGroupButton } from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type ModelProviderId = "anthropic" | "openai";

type ModelProvider = {
  id: ModelProviderId;
  label: string;
  icon: React.ElementType;
};

export type AiModelOption = {
  id: string;
  name: string;
  shortName: string;
  providerId: ModelProviderId;
  badge?: string;
};

const providers: ModelProvider[] = [
  { id: "anthropic", label: "Anthropic", icon: SiAnthropic },
  { id: "openai", label: "Codex", icon: SiOpenai },
];

export const aiModelOptions: AiModelOption[] = [
  {
    id: "claude-fable-5",
    name: "Claude Fable 5",
    shortName: "Fable 5",
    providerId: "anthropic",
    badge: "New",
  },
  {
    id: "claude-opus-5",
    name: "Claude Opus 5",
    shortName: "Opus 5",
    providerId: "anthropic",
  },
  {
    id: "gpt-5.6-sol",
    name: "GPT-5.6 Sol",
    shortName: "5.6 Sol",
    providerId: "openai",
    badge: "New",
  },
  {
    id: "gpt-5.6-terra",
    name: "GPT-5.6 Terra",
    shortName: "5.6 Terra",
    providerId: "openai",
  },
  {
    id: "gpt-5.6-luna",
    name: "GPT-5.6 Luna",
    shortName: "5.6 Luna",
    providerId: "openai",
  },
  {
    id: "gpt-daybreak-blue-latest",
    name: "GPT Daybreak Blue",
    shortName: "Daybreak Blue",
    providerId: "openai",
  },
  {
    id: "gpt-daybreak-red-latest",
    name: "GPT Daybreak Red",
    shortName: "Daybreak Red",
    providerId: "openai",
  },
];

export const defaultAiModelId = "gpt-5.6-sol";

const initialFavorites = new Set(["claude-fable-5", "gpt-5.6-sol"]);

type ProviderFilter = "favorites" | ModelProviderId;

interface AiModelPickerProps {
  value: string;
  onValueChange: (value: string) => void;
  options?: readonly AiModelOption[];
  className?: string;
  align?: "start" | "center" | "end";
  disabled?: boolean;
}

function providerFor(providerId: ModelProviderId) {
  return providers.find((provider) => provider.id === providerId)!;
}

export function AiModelPicker({
  value,
  onValueChange,
  options = aiModelOptions,
  className,
  align = "end",
  disabled,
}: AiModelPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [providerFilter, setProviderFilter] =
    React.useState<ProviderFilter>("anthropic");
  const [favorites, setFavorites] = React.useState(initialFavorites);

  const activeModel =
    options.find((model) => model.id === value) ??
    options[0] ??
    aiModelOptions[0]!;
  const activeProvider = providerFor(activeModel.providerId);
  const normalizedQuery = query.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  const visibleModels = options.filter((model) => {
    const provider = providerFor(model.providerId);
    const matchesQuery = `${model.name} ${model.shortName} ${provider.label}`
      .toLowerCase()
      .includes(normalizedQuery);
    if (!matchesQuery) return false;
    if (isSearching) return true;
    if (providerFilter === "favorites") return favorites.has(model.id);
    return model.providerId === providerFilter;
  });

  function toggleFavorite(modelId: string) {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(modelId)) next.delete(modelId);
      else next.add(modelId);
      return next;
    });
  }

  function selectModel(modelId: string) {
    onValueChange(modelId);
    setOpen(false);
    setQuery("");
  }

  const ActiveProviderIcon = activeProvider.icon;

  return (
    <TooltipProvider delayDuration={200}>
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          if (disabled) return;
          setOpen(nextOpen);
          if (nextOpen) setProviderFilter(activeProvider.id);
          else setQuery("");
        }}
      >
        <PopoverTrigger asChild>
          <InputGroupButton
            type="button"
            size="sm"
            disabled={disabled}
            aria-label={`Model: ${activeModel.name}`}
            className={cn(
              "h-8 max-w-48 gap-1.5 rounded-lg px-2 text-xs font-normal",
              className,
            )}
          >
            <ActiveProviderIcon className="size-3.5 shrink-0" />
            <span className="truncate">{activeModel.shortName}</span>
            <ChevronDown className="text-muted-foreground size-3.5 shrink-0" />
          </InputGroupButton>
        </PopoverTrigger>

        <PopoverContent
          align={align}
          sideOffset={6}
          collisionPadding={8}
          className="h-64 w-[19rem] max-w-[calc(100vw-1rem)] overflow-hidden rounded-lg p-0 shadow-lg sm:h-[20.5rem] sm:w-[23rem]"
        >
          <div className="flex h-full min-h-0" data-model-picker-content>
            <div className="bg-muted/30 flex w-12 shrink-0 flex-col border-r">
              <div
                className="flex h-[41px] shrink-0 items-center justify-center border-b"
                data-model-picker-rail-header
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Favorite models"
                      aria-pressed={
                        !isSearching && providerFilter === "favorites"
                      }
                      onClick={() => {
                        setQuery("");
                        setProviderFilter("favorites");
                      }}
                      className={cn(
                        "text-muted-foreground size-7",
                        !isSearching &&
                          providerFilter === "favorites" &&
                          "bg-accent text-accent-foreground",
                      )}
                    >
                      <Star
                        className={cn(
                          "size-3.5",
                          !isSearching &&
                            providerFilter === "favorites" &&
                            "fill-current",
                        )}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">Favorites</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex flex-col items-center gap-1 p-1.5">
                {providers.map((provider) => {
                  const Icon = provider.icon;
                  const selected =
                    !isSearching && providerFilter === provider.id;
                  return (
                    <Tooltip key={provider.id}>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={provider.label}
                          aria-pressed={selected}
                          onClick={() => {
                            setQuery("");
                            setProviderFilter(provider.id);
                          }}
                          className={cn(
                            "text-muted-foreground size-8",
                            selected && "bg-accent text-accent-foreground",
                          )}
                        >
                          <Icon className="size-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        {provider.label}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            <Command
              shouldFilter={false}
              className="min-w-0 flex-1 rounded-none"
            >
              <CommandInput
                autoFocus
                value={query}
                onValueChange={setQuery}
                placeholder="Search models..."
                className="h-10 text-sm"
              />
              <CommandList className="max-h-none flex-1 p-2">
                <CommandEmpty className="text-muted-foreground py-10 text-xs">
                  No models found.
                </CommandEmpty>
                {visibleModels.map((model) => {
                  const provider = providerFor(model.providerId);
                  const ProviderIcon = provider.icon;
                  const favorite = favorites.has(model.id);
                  const selected = model.id === activeModel.id;
                  return (
                    <CommandItem
                      key={model.id}
                      value={`${model.name} ${provider.label}`}
                      onSelect={() => selectModel(model.id)}
                      className={cn(
                        "group min-h-13 cursor-pointer gap-3 rounded-md px-2.5 py-2",
                        selected && "bg-accent/60",
                      )}
                    >
                      <div className="min-w-0 flex-1 text-left">
                        <div className="flex min-h-4 items-center gap-2">
                          <span className="truncate text-xs font-medium">
                            {model.name}
                          </span>
                          {model.badge ? (
                            <span className="border-border bg-muted text-muted-foreground rounded border px-1 py-0.5 text-[9px] leading-none font-semibold uppercase">
                              {model.badge}
                            </span>
                          ) : null}
                        </div>
                        <div className="text-muted-foreground mt-0.5 flex h-4 items-center gap-1.5 text-[11px]">
                          <ProviderIcon className="size-3" />
                          <span>{provider.label}</span>
                        </div>
                      </div>
                      <div className="flex w-12 shrink-0 items-center justify-end gap-0.5">
                        <span className="flex size-5 items-center justify-center">
                          {selected ? (
                            <Check className="size-3.5" aria-label="Selected" />
                          ) : null}
                        </span>
                        <button
                          type="button"
                          aria-label={
                            favorite
                              ? `Remove ${model.name} from favorites`
                              : `Add ${model.name} to favorites`
                          }
                          onMouseDown={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                          }}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            toggleFavorite(model.id);
                          }}
                          className={cn(
                            "text-muted-foreground hover:bg-accent hover:text-foreground flex size-7 items-center justify-center rounded-md opacity-50 transition-colors group-hover:opacity-100 focus-visible:opacity-100",
                            favorite && "text-foreground opacity-100",
                          )}
                        >
                          <Star
                            className={cn(
                              "size-3.5",
                              favorite && "fill-amber-400 text-amber-500",
                            )}
                          />
                        </button>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandList>
            </Command>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
