"use client";

import * as React from "react";
import { createPortal } from "react-dom";

interface PortalContextValue {
  targets: ReadonlyMap<string, HTMLElement>;
  register: (name: string, target: HTMLElement) => () => void;
}

const PortalContext = React.createContext<PortalContextValue | null>(null);

/** Scope named portal slots to a layout. Each slot name must be unique within its provider. */
export function PortalProvider({ children }: { children: React.ReactNode }) {
  const [targets, setTargets] = React.useState<
    ReadonlyMap<string, HTMLElement>
  >(() => new Map());
  const register = React.useCallback((name: string, target: HTMLElement) => {
    setTargets((current) => {
      if (current.get(name) === target) return current;
      return new Map(current).set(name, target);
    });
    return () => {
      setTargets((current) => {
        // A replaced slot may register before the previous slot unmounts.
        if (current.get(name) !== target) return current;
        const next = new Map(current);
        next.delete(name);
        return next;
      });
    };
  }, []);
  const value = React.useMemo(
    () => ({ targets, register }),
    [targets, register],
  );

  return (
    <PortalContext.Provider value={value}>{children}</PortalContext.Provider>
  );
}

function usePortalContext() {
  const context = React.useContext(PortalContext);
  if (!context)
    throw new Error("Portal and PortalSlot must be inside a PortalProvider.");
  return context;
}

/** Place the destination anywhere in the provider's layout. */
export function PortalSlot({
  name,
  ...props
}: Omit<React.ComponentPropsWithoutRef<"div">, "children"> & { name: string }) {
  const { register } = usePortalContext();
  const ref = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (node) return register(name, node);
    },
    [name, register],
  );

  return <div {...props} ref={ref} data-portal-slot={name} />;
}

/** Render arbitrary React content into a named slot, retaining the source's context and handlers. */
export function Portal({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  const { targets } = usePortalContext();
  const target = targets.get(to);
  return target ? createPortal(children, target) : null;
}
