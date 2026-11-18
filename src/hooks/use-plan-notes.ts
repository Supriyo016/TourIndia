"use client";

import { useCallback, useSyncExternalStore } from "react";
import { syncAccount } from "@/features/saved/sync";
import { isNoteList, readStored, STORAGE_KEYS, useStoredValue, writeStored, type PlanNote } from "./use-stored-value";

/**
 * Plan notes on this device. Signed out, they live only in this browser. Signed in, the browser
 * copy mirrors the account (SavedSync fills it on sign-in) and every change is sent to the server:
 * a new or edited note a moment after typing stops, a deletion at once. If the server refuses a
 * change, the browser goes back to what the account holds and says so.
 */

const NONE: PlanNote[] = [];
const WAIT_MS = 700;
const timers = new Map<string, ReturnType<typeof setTimeout>>();

let problem = "";
const problemListeners = new Set<() => void>();
function setProblem(message: string) {
  problem = message;
  problemListeners.forEach((listener) => listener());
}

/** Puts this device back to the account's notes after a refused change. */
async function reload(owner: string) {
  const response = await fetch("/api/notes", { cache: "no-store" }).catch(() => null);
  const data = response?.ok ? ((await response.json()) as { notes: PlanNote[] }) : null;
  if (data && syncAccount() === owner && isNoteList(data.notes)) writeStored(STORAGE_KEYS.notes, data.notes);
}

function send(owner: string, body: unknown, allowMissing = false) {
  fetch("/api/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    .then(async (response) => {
      if (response.ok || (allowMissing && response.status === 404)) return;
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setProblem(data.error ?? "That change couldn't be saved to your account.");
      void reload(owner);
    })
    .catch(() => {
      setProblem("You seem to be offline, so that change wasn't saved to your account.");
      void reload(owner);
    });
}

const same = (a: PlanNote, b: PlanNote) => a.title === b.title && a.body === b.body && a.date === b.date;

/** Works out what changed between two versions of the list and sends it. */
export function pushNotes(before: PlanNote[], after: PlanNote[]) {
  const owner = syncAccount();
  if (!owner) return;
  const old = new Map(before.map((note) => [note.id, note]));
  const now = new Map(after.map((note) => [note.id, note]));
  for (const [id] of old) {
    if (now.has(id)) continue;
    clearTimeout(timers.get(id));
    timers.delete(id);
    send(owner, { action: "delete", id }, true);
  }
  for (const [id, note] of now) {
    const previous = old.get(id);
    if (previous && same(previous, note)) continue;
    clearTimeout(timers.get(id));
    timers.set(
      id,
      setTimeout(() => {
        timers.delete(id);
        // Sends the latest version on this device, not the one from when typing began.
        const latest = readStored<PlanNote[]>(STORAGE_KEYS.notes, NONE, isNoteList).find((item) => item.id === id);
        if (latest && syncAccount() === owner) send(owner, { action: "save", note: { id, title: latest.title.slice(0, 120), body: latest.body.slice(0, 5000), date: latest.date } });
      }, WAIT_MS),
    );
  }
}

/** A note id that's unique enough to be made in the browser. */
export const newNoteId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}${Math.random().toString(36).slice(2, 8)}`);

export function usePlanNotes(): [PlanNote[], (update: PlanNote[] | ((current: PlanNote[]) => PlanNote[])) => boolean, boolean] {
  const [notes, setNotes, ready] = useStoredValue<PlanNote[]>(STORAGE_KEYS.notes, NONE, isNoteList);
  const update = useCallback(
    (change: PlanNote[] | ((current: PlanNote[]) => PlanNote[])) => {
      const before = readStored<PlanNote[]>(STORAGE_KEYS.notes, NONE, isNoteList);
      const stored = setNotes(change);
      if (stored) {
        setProblem("");
        pushNotes(before, readStored<PlanNote[]>(STORAGE_KEYS.notes, NONE, isNoteList));
      }
      return stored;
    },
    [setNotes],
  );
  return [notes, update, ready];
}

/** The last problem saving a note to the account, or "" when there isn't one. */
export function useNoteProblem() {
  return useSyncExternalStore(
    (listener) => {
      problemListeners.add(listener);
      return () => problemListeners.delete(listener);
    },
    () => problem,
    () => "",
  );
}
