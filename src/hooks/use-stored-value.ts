"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { Expense, TripDay, TripInput } from "@/features/itinerary/generate";

const listeners = new Map<string, Set<() => void>>();

function notify(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function subscribeTo(key: string, listener: () => void) {
  const set = listeners.get(key) ?? new Set();
  set.add(listener);
  listeners.set(key, set);
  const onStorage = (event: StorageEvent) => {
    if (event.key === key) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    set.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Same broad shape as the fallback: stored data can be corrupted or from an older version. */
export function matchesShape(value: unknown, fallback: unknown): boolean {
  if (Array.isArray(fallback)) return Array.isArray(value);
  if (fallback !== null && typeof fallback === "object") {
    if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
    return Object.entries(fallback).every(([key, item]) => matchesShape((value as Record<string, unknown>)[key], item));
  }
  return typeof value === typeof fallback;
}

function parseStored<T>(raw: string | null | undefined, fallback: T, isValid: (value: unknown) => boolean): T {
  if (raw === null || raw === undefined) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    return matchesShape(parsed, fallback) && isValid(parsed) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

const alwaysValid = () => true;

/**
 * JSON value in localStorage, shared live between components and tabs. Invalid
 * stored data falls back safely. The setter reports whether the write succeeded.
 */
export function useStoredValue<T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => boolean = alwaysValid,
): [T, (update: T | ((current: T) => T)) => boolean, boolean] {
  const subscribe = useCallback((listener: () => void) => subscribeTo(key, listener), [key]);
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => undefined as unknown as string | null,
  );
  const ready = raw !== undefined;

  // The fallback and validator are expected to be constants for a given key.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo<T>(() => parseStored(raw, fallback, isValid), [raw]);

  const setValue = useCallback(
    (update: T | ((current: T) => T)) => {
      const current = parseStored(readRaw(key), fallback, isValid);
      const next = typeof update === "function" ? (update as (current: T) => T)(current) : update;
      let stored = true;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Storage can be unavailable in private windows; the caller decides what to tell the visitor.
        stored = false;
      }
      notify(key);
      return stored;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  return [value, setValue, ready];
}

export const STORAGE_KEYS = {
  favourites: "ti-favourites",
  recent: "ti-recent",
  stamps: "ti-passport",
  trips: "ti-trips",
  packing: "ti-packing",
  expenses: "ti-expenses",
} as const;

export interface SavedTrip {
  id: string;
  name: string;
  input: TripInput;
  days: TripDay[];
  savedAt: string;
}

export interface ExpenseState {
  people: string[];
  expenses: Expense[];
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

export const isStringList = (value: unknown) => Array.isArray(value) && value.every((item) => typeof item === "string");

export const isSavedTripList = (value: unknown) =>
  Array.isArray(value) &&
  value.every(
    (trip) =>
      isRecord(trip) &&
      typeof trip.id === "string" &&
      typeof trip.name === "string" &&
      typeof trip.savedAt === "string" &&
      isRecord(trip.input) &&
      Array.isArray(trip.days) &&
      trip.days.every((day) => isRecord(day) && Array.isArray(day.items)),
  );

export const isExpenseState = (value: unknown) =>
  isRecord(value) &&
  isStringList(value.people) &&
  Array.isArray(value.expenses) &&
  value.expenses.every(
    (expense) =>
      isRecord(expense) &&
      typeof expense.id === "string" &&
      typeof expense.label === "string" &&
      typeof expense.paidBy === "string" &&
      typeof expense.amount === "number" &&
      Number.isFinite(expense.amount),
  );

const EMPTY: string[] = [];

export function useFavourites() {
  const [favourites, setFavourites, ready] = useStoredValue<string[]>(STORAGE_KEYS.favourites, EMPTY, isStringList);
  const toggle = useCallback(
    (slug: string) =>
      setFavourites((current) => (current.includes(slug) ? current.filter((item) => item !== slug) : [slug, ...current])),
    [setFavourites],
  );
  return { favourites, toggle, ready };
}
