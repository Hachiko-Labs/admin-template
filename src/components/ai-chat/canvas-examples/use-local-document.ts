"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import type { z } from "zod";

/** Small versioned local document with transactional undo and bounded persistence. */
function createDocument<T extends object>(
  key: string,
  initial: T,
  schema: z.ZodType<T>,
) {
  const listeners = new Set<() => void>();
  const past: T[] = [],
    future: T[] = [];
  const server = {
    doc: initial,
    ready: false,
    saved: "Loading…",
    canUndo: false,
    canRedo: false,
  };
  let state = server;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const emit = () => listeners.forEach((fn) => fn());
  const flags = () => {
    state = { ...state, canUndo: past.length > 0, canRedo: future.length > 0 };
  };
  function persist() {
    clearTimeout(timer);
    if (!state.ready) return;
    try {
      localStorage.setItem(key, JSON.stringify(state.doc));
      state = { ...state, saved: "Saved on this device" };
    } catch {
      state = { ...state, saved: "Storage full · export to keep changes" };
    }
    emit();
  }
  function set(doc: T) {
    state = { ...state, doc, saved: "Saving…" };
    flags();
    emit();
    clearTimeout(timer);
    timer = setTimeout(persist, 500);
  }
  return {
    subscribe: (fn: () => void) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    getSnapshot: () => state,
    getServerSnapshot: () => server,
    hydrate() {
      if (state.ready) return;
      try {
        const raw = localStorage.getItem(key);
        const doc = raw ? schema.parse(JSON.parse(raw)) : initial;
        state = { ...state, doc, ready: true, saved: "Saved on this device" };
      } catch {
        state = {
          ...state,
          ready: true,
          saved: "Saved data could not load · example restored",
        };
      }
      emit();
    },
    checkpoint() {
      past.push(state.doc);
      if (past.length > 40) past.shift();
      future.length = 0;
      flags();
      emit();
    },
    change(fn: (doc: T) => T, record = true) {
      if (!state.ready) return;
      const next = fn(state.doc);
      if (next === state.doc) return;
      if (record) {
        past.push(state.doc);
        if (past.length > 40) past.shift();
        future.length = 0;
      }
      set(next);
    },
    replace(value: T) {
      const next = schema.parse(value);
      this.change(() => next);
    },
    undo() {
      const doc = past.pop();
      if (doc) {
        future.push(state.doc);
        set(doc);
      }
    },
    redo() {
      const doc = future.pop();
      if (doc) {
        past.push(state.doc);
        set(doc);
      }
    },
    flush: persist,
  };
}

export function useLocalDocument<T extends object>(
  key: string,
  initial: T,
  schema: z.ZodType<T>,
) {
  const store = useMemo(
    () => createDocument(key, initial, schema),
    [key, initial, schema],
  );
  const state = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  useEffect(() => {
    store.hydrate();
    window.addEventListener("pagehide", store.flush);
    return () => {
      window.removeEventListener("pagehide", store.flush);
      store.flush();
    };
  }, [store]);
  return { ...state, store };
}
