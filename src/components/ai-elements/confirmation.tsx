"use client";

import * as React from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Adapted from Vercel AI Elements without coupling the UI to an AI SDK runtime.
// https://elements.ai-sdk.dev/components/confirmation
export type ConfirmationState =
  | "approval-requested"
  | "approval-responded"
  | "output-available"
  | "output-denied"
  | "output-error";

export interface ConfirmationApproval {
  approved?: boolean;
  id: string;
  reason?: string;
}

interface ConfirmationContextValue {
  approval: ConfirmationApproval;
  state: ConfirmationState;
}

const ConfirmationContext =
  React.createContext<ConfirmationContextValue | null>(null);

function useConfirmation() {
  const context = React.useContext(ConfirmationContext);

  if (!context) {
    throw new Error("Confirmation components must be used within Confirmation");
  }

  return context;
}

export interface ConfirmationProps extends React.ComponentProps<typeof Alert> {
  approval: ConfirmationApproval;
  state: ConfirmationState;
}

export function Confirmation({
  approval,
  className,
  state,
  ...props
}: ConfirmationProps) {
  const value = React.useMemo(() => ({ approval, state }), [approval, state]);

  return (
    <ConfirmationContext.Provider value={value}>
      <Alert
        className={cn("flex flex-col gap-3 rounded-xl p-3.5", className)}
        {...props}
      />
    </ConfirmationContext.Provider>
  );
}

export type ConfirmationTitleProps = React.ComponentProps<
  typeof AlertDescription
>;

export function ConfirmationTitle({
  className,
  ...props
}: ConfirmationTitleProps) {
  return (
    <AlertDescription
      className={cn("text-foreground font-medium", className)}
      {...props}
    />
  );
}

export interface ConfirmationStateContentProps {
  children?: React.ReactNode;
}

export function ConfirmationRequest({
  children,
}: ConfirmationStateContentProps) {
  const { state } = useConfirmation();
  return state === "approval-requested" ? children : null;
}

export function ConfirmationAccepted({
  children,
}: ConfirmationStateContentProps) {
  const { approval, state } = useConfirmation();
  const visible =
    approval.approved === true &&
    (state === "approval-responded" || state === "output-available");

  return visible ? children : null;
}

export function ConfirmationRejected({
  children,
}: ConfirmationStateContentProps) {
  const { approval, state } = useConfirmation();
  const visible =
    approval.approved === false &&
    (state === "approval-responded" || state === "output-denied");

  return visible ? children : null;
}

export type ConfirmationActionsProps = React.ComponentPropsWithoutRef<"div">;

export function ConfirmationActions({
  className,
  ...props
}: ConfirmationActionsProps) {
  const { state } = useConfirmation();
  if (state !== "approval-requested") return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-end gap-2 sm:self-end",
        className,
      )}
      {...props}
    />
  );
}

export type ConfirmationActionProps = React.ComponentProps<typeof Button>;

export function ConfirmationAction({
  className,
  ...props
}: ConfirmationActionProps) {
  return (
    <Button
      type="button"
      size="sm"
      className={cn("h-8 px-3 text-xs", className)}
      {...props}
    />
  );
}
