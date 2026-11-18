/**
 * Browser side of account syncing. SavedSync sets the signed-in account here once the lists on
 * this device mirror it; after that every heart, passport change and note is also sent to the server.
 */

export type SavedKind = "places" | "stamps";

let account: string | null = null;

export function setSyncAccount(id: string | null) {
  account = id;
}

export const syncAccount = () => account;

/** Sends one change. If the server refuses or can't be reached, `undo` puts this device back. */
export function pushChange(kind: SavedKind, slug: string, on: boolean, undo: () => void) {
  if (!account) return;
  fetch("/api/saved", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "set", kind, slug, on }) })
    .then((response) => {
      if (!response.ok) undo();
    })
    .catch(undo);
}

/** Sends one passport change (null status removes the state). If it's refused, `undo` puts this device back. */
export function pushPassport(state: string, status: string | null, month: string | null, undo: () => void) {
  if (!account) return;
  fetch("/api/saved", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "passport-set", state, status, month }) })
    .then((response) => {
      if (!response.ok) undo();
    })
    .catch(undo);
}
