"use client";

import { ArrowUp, Square } from "lucide-react";
import * as React from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type AiChatComposerStatus =
  | "ready"
  | "submitted"
  | "streaming"
  | "error";

export type AiChatComposerDensity = "compact" | "default";
export type AiChatComposerPlacement = "home" | "thread";
export type AiChatComposerAppearance = "default" | "quiet";

const AiChatComposerContext = React.createContext<{
  appearance: AiChatComposerAppearance;
  density: AiChatComposerDensity;
  placement: AiChatComposerPlacement;
}>({
  appearance: "default",
  density: "default",
  placement: "thread",
});

interface AiChatComposerProps extends React.ComponentProps<"form"> {
  appearance?: AiChatComposerAppearance;
  density?: AiChatComposerDensity;
  error?: React.ReactNode;
  errorTitle?: string;
  placement?: AiChatComposerPlacement;
  rail?: React.ReactNode;
}

export function handleAiChatComposerKeyDown(
  event: React.KeyboardEvent<HTMLTextAreaElement>,
) {
  if (
    event.key === "Enter" &&
    !event.shiftKey &&
    !event.nativeEvent.isComposing
  ) {
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }
}

function AiChatComposer({
  appearance: appearanceProp,
  children,
  className,
  density = "default",
  error,
  errorTitle = "Request failed",
  placement = "thread",
  rail,
  ...props
}: AiChatComposerProps) {
  const appearance =
    appearanceProp ?? (placement === "home" ? "quiet" : "default");
  const contextValue = React.useMemo(
    () => ({ appearance, density, placement }),
    [appearance, density, placement],
  );

  return (
    <AiChatComposerContext.Provider value={contextValue}>
      <form
        data-appearance={appearance}
        data-density={density}
        data-placement={placement}
        className={cn(
          "relative mx-auto w-full",
          placement === "home" ? "max-w-[720px]" : "max-w-2xl",
          className,
        )}
        {...props}
      >
        {error ? (
          <Alert variant="destructive" className="mb-2">
            <AlertTitle>{errorTitle}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <TooltipProvider delayDuration={300}>
          <InputGroup
            className={cn(
              "h-auto flex-col items-stretch transition-[border-color,box-shadow] duration-200",
              appearance === "quiet"
                ? "border-[var(--ai-composer-line)] bg-[var(--ai-composer-surface)] shadow-[var(--ai-composer-shadow)] has-[[data-slot=input-group-control]:focus-visible]:border-[var(--ai-composer-line-strong)]"
                : "bg-background border-input",
              density === "compact"
                ? cn(
                    "gap-2.5 rounded-[22px] p-3.5 has-[[data-slot=input-group-control]:focus-visible]:ring-0",
                    appearance === "default" &&
                      "has-[[data-slot=input-group-control]:focus-visible]:border-ring shadow-sm",
                  )
                : "has-[[data-slot=input-group-control]:focus-visible]:ring-ring/30 gap-0 rounded-2xl shadow-sm has-[[data-slot=input-group-control]:focus-visible]:ring-3",
            )}
          >
            {children}
          </InputGroup>
        </TooltipProvider>
        {rail}
      </form>
    </AiChatComposerContext.Provider>
  );
}

interface AiChatComposerEditorProps extends React.ComponentProps<
  typeof InputGroupTextarea
> {
  submitOnEnter?: boolean;
}

const AiChatComposerEditor = React.forwardRef<
  HTMLTextAreaElement,
  AiChatComposerEditorProps
>(function AiChatComposerEditor(
  { className, onKeyDown, submitOnEnter = true, ...props },
  forwardedRef,
) {
  const { appearance, density } = React.useContext(AiChatComposerContext);

  return (
    <InputGroupTextarea
      ref={forwardedRef}
      aria-label="Message"
      autoComplete="off"
      name="message"
      rows={1}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented && submitOnEnter) {
          handleAiChatComposerKeyDown(event);
        }
      }}
      className={cn(
        "placeholder:text-muted-foreground/55 [field-sizing:content] max-h-60 overflow-y-auto",
        density === "compact"
          ? "min-h-[68px] px-2 py-2 text-sm leading-5"
          : "min-h-22 px-4 pt-4 pb-2.5 text-sm leading-6",
        appearance === "quiet" &&
          "text-[var(--ai-composer-ink)] placeholder:text-[var(--ai-composer-ink-tertiary)]",
        className,
      )}
      {...props}
    />
  );
});

function AiChatComposerToolbar({
  className,
  ...props
}: React.ComponentProps<typeof InputGroupAddon>) {
  const { density } = React.useContext(AiChatComposerContext);

  return (
    <InputGroupAddon
      align="block-end"
      className={cn(
        "grid w-full cursor-default grid-cols-[minmax(0,1fr)_auto] items-center gap-2",
        density === "compact" ? "p-0" : "px-3 pt-0 pb-3",
        className,
      )}
      {...props}
    />
  );
}

function AiChatComposerToolbarGroup({
  className,
  side = "start",
  ...props
}: React.ComponentProps<"div"> & { side?: "end" | "start" }) {
  return (
    <div
      data-side={side}
      className={cn(
        "flex min-w-0 items-center gap-1",
        side === "end" && "justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

interface AiChatComposerActionProps extends React.ComponentProps<
  typeof InputGroupButton
> {
  label: string;
}

function AiChatComposerAction({
  children,
  className,
  label,
  "aria-label": ariaLabel,
  ...props
}: AiChatComposerActionProps) {
  const { appearance, density } = React.useContext(AiChatComposerContext);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <InputGroupButton
          size="icon-sm"
          aria-label={ariaLabel ?? label}
          className={cn(
            density === "compact" && "size-7 rounded-lg",
            appearance === "quiet" &&
              "text-[var(--ai-composer-ink-tertiary)] hover:bg-[var(--ai-composer-hover)] hover:text-[var(--ai-composer-ink)] active:scale-[0.94]",
            className,
          )}
          {...props}
        >
          {children}
          <span className="sr-only">{label}</span>
        </InputGroupButton>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

interface AiChatComposerSubmitProps extends Omit<
  React.ComponentProps<typeof InputGroupButton>,
  "children" | "type"
> {
  onStop?: () => void;
  status?: AiChatComposerStatus;
}

function AiChatComposerSubmit({
  className,
  disabled,
  onStop,
  status = "ready",
  ...props
}: AiChatComposerSubmitProps) {
  const { appearance, density } = React.useContext(AiChatComposerContext);
  const isBusy = status === "submitted" || status === "streaming";
  const radiusClassName = density === "compact" ? "rounded-lg" : "rounded-full";

  if (isBusy) {
    return (
      <AiChatComposerAction
        {...props}
        type="button"
        label="Stop generating"
        variant="outline"
        onClick={onStop}
        disabled={!onStop}
        className={cn(radiusClassName, className)}
      >
        <Square className="size-3 fill-current" aria-hidden="true" />
      </AiChatComposerAction>
    );
  }

  return (
    <AiChatComposerAction
      {...props}
      type="submit"
      label="Send message"
      variant="default"
      disabled={disabled}
      className={cn(
        radiusClassName,
        appearance === "quiet" &&
          "bg-[var(--ai-composer-ink)] text-[var(--ai-composer-surface)] enabled:hover:bg-[var(--ai-composer-ink)] disabled:bg-[var(--ai-composer-line-strong)] disabled:text-[var(--ai-composer-ink-secondary)] disabled:opacity-100",
        className,
      )}
    >
      <ArrowUp aria-hidden="true" />
    </AiChatComposerAction>
  );
}

function AiChatComposerRail({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { density } = React.useContext(AiChatComposerContext);

  return (
    <div
      className={cn(
        "bg-muted/45 text-muted-foreground flex items-center gap-4 text-xs",
        density === "compact"
          ? "mx-4 -mt-1 min-h-9 rounded-b-xl px-3 pt-1"
          : "mx-5 -mt-1 min-h-10 rounded-b-xl px-3 pt-1",
        className,
      )}
      {...props}
    />
  );
}

export {
  AiChatComposer,
  AiChatComposerAction,
  InputGroupButton as AiChatComposerButton,
  AiChatComposerEditor,
  AiChatComposerRail,
  AiChatComposerSubmit,
  AiChatComposerToolbar,
  AiChatComposerToolbarGroup,
};
