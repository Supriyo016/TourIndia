"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import type { Expense, TripDay, TripInput } from "@/features/itinerary/generate";
import { applyPassport, fromStamps, isPassportList, visitedStates, type PassportEntry, type PassportStatus } from "@/features/saved/passport";
import { pushChange, pushPassport, type SavedKind } from "@/features/saved/sync";

const listeners = new Map<string, Set<() => void>>();

export function notify(key: string) {
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
  /** The passport before statuses: a list of visited states. Moved into `passport` on first use. */
  stamps: "ti-passport",
  /** Passport entries: a status (and optional visit month) per state. */
  passport: "ti-passport-v2",
  trips: "ti-trips",
  packing: "ti-packing",
  expenses: "ti-expenses",
  notes: "ti-notes",
  yatri: "ti-yatri",
  /** The account the saved places and stamps on this device belong to; absent for a guest's own lists. */
  savedOwner: "ti-saved-owner",
} as const;

/** Reads a stored JSON value outside React, falling back when it's missing or malformed. */
export function readStored<T>(key: string, fallback: T, isValid: (value: unknown) => boolean = alwaysValid): T {
  return parseStored(readRaw(key), fallback, isValid);
}

/** Writes (or with undefined, removes) a stored value outside React and tells components using it. */
export function writeStored(key: string, value: unknown) {
  try {
    if (value === undefined) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable: nothing to keep in step.
  }
  notify(key);
}

export interface PlanNote {
  id: string;
  title: string;
  body: string;
  /** Optional calendar day this note belongs to. */
  date: string | null;
  updatedAt: string;
}

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

export const isNoteList = (value: unknown) =>
  Array.isArray(value) &&
  value.every(
    (note) =>
      isRecord(note) &&
      typeof note.id === "string" &&
      typeof note.title === "string" &&
      typeof note.body === "string" &&
      (note.date === null || typeof note.date === "string") &&
      typeof note.updatedAt === "string",
  );

export const isChatHistory = (value: unknown) =>
  Array.isArray(value) &&
  value.every((message) => isRecord(message) && (message.role === "user" || message.role === "assistant") && typeof message.content === "string");

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

/**
 * A list on this device that, once someone signs in, mirrors their account: each change is
 * also sent to the server, and undone here if the server refuses it.
 */
function useSyncedList(kind: SavedKind, key: string, newestFirst: boolean) {
  const [items, setItems, ready] = useStoredValue<string[]>(key, EMPTY, isStringList);
  const toggle = useCallback(
    (slug: string) => {
      let on = false;
      const add = (current: string[]) => (newestFirst ? [slug, ...current] : [...current, slug]);
      setItems((current) => {
        on = !current.includes(slug);
        return on ? add(current) : current.filter((item) => item !== slug);
      });
      pushChange(kind, slug, on, () => setItems((current) => (on ? current.filter((item) => item !== slug) : current.includes(slug) ? current : add(current))));
    },
    [kind, newestFirst, setItems],
  );
  return { items, toggle, ready };
}

export function useFavourites() {
  const { items, toggle, ready } = useSyncedList("places", STORAGE_KEYS.favourites, true);
  return { favourites: items, toggle, ready };
}

const NO_ENTRIES: PassportEntry[] = [];

/** Moves stamps from before the passport had statuses: each one was a visit. */
export function migrateStamps() {
  const old = readStored<string[] | null>(STORAGE_KEYS.stamps, null, isStringList);
  if (old === null) return;
  const current = readStored<PassportEntry[]>(STORAGE_KEYS.passport, NO_ENTRIES, isPassportList);
  const have = new Set(current.map((entry) => entry.state));
  writeStored(STORAGE_KEYS.passport, [...current, ...fromStamps(old).filter((entry) => !have.has(entry.state))]);
  writeStored(STORAGE_KEYS.stamps, undefined);
}

export const readPassport = () => {
  migrateStamps();
  return readStored<PassportEntry[]>(STORAGE_KEYS.passport, NO_ENTRIES, isPassportList);
};

/**
 * The travel passport on this device; once someone signs in it mirrors their account, and each
 * change is also sent to the server (and undone here if refused).
 */
export function usePassport() {
  useEffect(migrateStamps, []);
  const [entries, setEntries, ready] = useStoredValue<PassportEntry[]>(STORAGE_KEYS.passport, NO_ENTRIES, isPassportList);
  const stamps = useMemo(() => visitedStates(entries), [entries]);
  const set = useCallback(
    (state: string, status: PassportStatus | null, month: string | null = null) => {
      const before = readStored<PassportEntry[]>(STORAGE_KEYS.passport, NO_ENTRIES, isPassportList);
      setEntries((current) => applyPassport(current, state, status, month));
      const previous = before.find((entry) => entry.state === state);
      pushPassport(state, status, month, () =>
        setEntries((current) => (previous ? applyPassport(current, state, previous.status, previous.month ?? null) : applyPassport(current, state, null, null))),
      );
    },
    [setEntries],
  );
  return { entries, stamps, set, ready };
}
