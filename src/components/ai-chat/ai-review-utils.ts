"use client";

import * as React from "react";

/** Hydrate after mount so server markup and the first client render agree. */
export function useReviewState<T>(
  key: string,
  initial: T,
  validate: (value: unknown) => value is T,
) {
  const [value, setValue] = React.useState<T>(initial);
  const [ready, setReady] = React.useState(false);
  const [storageError, setStorageError] = React.useState("");
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (validate(parsed)) setValue(parsed);
        else
          setStorageError(
            "Saved data was invalid. The sample has been restored.",
          );
      }
    } catch {
      setStorageError(
        "Browser storage is unavailable. Changes will last only for this visit.",
      );
    }
    setReady(true);
  }, [key, validate]);
  React.useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      setStorageError(
        "Could not save locally. Export your work before leaving this page.",
      );
    }
  }, [key, value, ready]);
  return { value, setValue, ready, storageError };
}

export function downloadReviewJson<T extends object>(
  filename: string,
  value: T,
) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
