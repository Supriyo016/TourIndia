"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Link2, Link2Off, Pencil, Trash2 } from "lucide-react";
import { postJson, useAuth } from "@/components/auth/AuthProvider";
import type { CollectionView } from "@/features/saved/service";
import { useFavourites } from "@/hooks/use-stored-value";

/** One collection: shows its places, and opens an editor for the name, note and which saved places it holds. */
function CollectionCard({ collection, names, saved, onChange, onDelete }: { collection: CollectionView; names: Record<string, string>; saved: string[]; onChange: (next: CollectionView) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: collection.name, note: collection.note, places: collection.places });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const link = collection.shareId ? `${typeof window === "undefined" ? "" : window.location.origin}/c/${collection.shareId}` : "";
  const choices = [...new Set([...saved, ...collection.places])].filter((slug) => names[slug]);

  const run = async (body: Record<string, unknown>, after?: () => void) => {
    setBusy(true);
    setError("");
    try {
      const result = await postJson<{ collection?: CollectionView }>("/api/saved", { id: collection.id, ...body });
      if (result.collection) onChange(result.collection);
      after?.();
    } catch (problem) {
      setError((problem as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="card p-5">
      {editing ? (
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void run({ action: "collection-update", ...draft }, () => setEditing(false));
          }}
        >
          <label className="field">
            <span className="field-label">Name</span>
            <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} maxLength={60} required className="input" />
          </label>
          <label className="field">
            <span className="field-label">
              Note <span className="font-normal text-muted">(optional)</span>
            </span>
            <textarea value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} maxLength={300} rows={2} className="input" />
          </label>
          <fieldset>
            <legend className="field-label">Places</legend>
            {choices.length === 0 ? (
              <p className="text-sm text-ink-2">Save some places with the heart first, then add them here.</p>
            ) : (
              <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {choices.map((slug) => (
                  <li key={slug}>
                    <label className="flex min-h-10 items-center gap-2.5">
                      <input
                        type="checkbox"
                        className="size-4 accent-[var(--brand)]"
                        checked={draft.places.includes(slug)}
                        onChange={(event) => setDraft({ ...draft, places: event.target.checked ? [...draft.places, slug] : draft.places.filter((item) => item !== slug) })}
                      />
                      {names[slug]}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </fieldset>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn btn-accent" disabled={busy}>
              {busy ? "Saving…" : "Save collection"}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setDraft({ name: collection.name, note: collection.note, places: collection.places });
                setEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-xl break-words">{collection.name}</h3>
              <p className="text-sm text-muted">
                {collection.places.length} {collection.places.length === 1 ? "place" : "places"}
                {collection.shareId ? " · shared by link" : " · private"}
              </p>
            </div>
            <div className="flex gap-1">
              <button type="button" className="icon-btn" aria-label={`Edit ${collection.name}`} onClick={() => setEditing(true)}>
                <Pencil className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                className={confirmDelete ? "btn border border-danger !min-h-11 text-danger" : "icon-btn"}
                aria-label={confirmDelete ? `Confirm deleting ${collection.name}` : `Delete ${collection.name}`}
                disabled={busy}
                onClick={() => (confirmDelete ? void run({ action: "collection-delete" }, onDelete) : setConfirmDelete(true))}
                onBlur={() => setConfirmDelete(false)}
              >
                {confirmDelete ? "Delete?" : <Trash2 className="size-5" aria-hidden />}
              </button>
            </div>
          </div>
          {collection.note && <p className="mt-2 whitespace-pre-line text-ink-2">{collection.note}</p>}
          {collection.places.length > 0 && <p className="mt-2 text-sm">{collection.places.map((slug) => names[slug]).filter(Boolean).join(" · ")}</p>}

          <div className="mt-4 border-t border-line pt-4">
            {collection.shareId ? (
              <div className="grid gap-2">
                <label className="field">
                  <span className="field-label">Read-only link</span>
                  <span className="flex gap-2">
                    <input readOnly value={link} className="input min-w-0 flex-1 text-sm" onFocus={(event) => event.target.select()} />
                    <button
                      type="button"
                      className="btn btn-outline shrink-0"
                      onClick={() => {
                        void navigator.clipboard?.writeText(link).then(() => {
                          setCopied(true);
                          window.setTimeout(() => setCopied(false), 2000);
                        });
                      }}
                    >
                      {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </span>
                </label>
                <p className="text-sm text-muted">Anyone with the link can see the name, note and places, never who made it.</p>
                <button type="button" className="btn btn-outline justify-self-start" disabled={busy} onClick={() => void run({ action: "collection-share", on: false })}>
                  <Link2Off className="size-4" aria-hidden /> Turn off the link
                </button>
              </div>
            ) : (
              <button type="button" className="btn btn-outline" disabled={busy} onClick={() => void run({ action: "collection-share", on: true })}>
                <Link2 className="size-4" aria-hidden /> Make a read-only link
              </button>
            )}
          </div>
        </>
      )}
      <p role="alert" aria-live="polite" className="field-error mt-2 empty:hidden">
        {error}
      </p>
    </li>
  );
}

/** Named lists of saved places, kept in the account. Signed-out visitors are invited to sign in. */
export function Collections({ names }: { names: Record<string, string> }) {
  const { user, loading, openSignIn } = useAuth();
  const { favourites } = useFavourites();
  const [collections, setCollections] = useState<CollectionView[] | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetch("/api/saved", { cache: "no-store" })
      .then((response) => (response.ok ? (response.json() as Promise<{ collections: CollectionView[] }>) : { collections: [] }))
      .then((data) => {
        if (!cancelled) setCollections(data.collections);
      })
      .catch(() => {
        if (!cancelled) setCollections([]);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <section aria-labelledby="collections">
      <h2 id="collections" className="mb-2">
        Collections
      </h2>
      <p className="mb-5 text-ink-2">Group saved places into lists like &ldquo;Monsoon weekend&rdquo; or &ldquo;With my parents&rdquo;, and share one with a read-only link if you like.</p>
      {loading ? null : !user ? (
        <div className="card p-5">
          <p className="text-ink-2">Collections are kept in your account, so they follow you to any device.</p>
          <button type="button" className="btn btn-accent mt-3" onClick={() => openSignIn("Sign in to make collections")}>
            Sign in to make collections
          </button>
        </div>
      ) : (
        <>
          <form
            className="mb-5 flex flex-wrap items-end gap-3"
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              setError("");
              try {
                const { collection } = await postJson<{ collection: CollectionView }>("/api/saved", { action: "collection-create", name, note: "", places: [] });
                setCollections((current) => [collection, ...(current ?? [])]);
                setName("");
              } catch (problem) {
                setError((problem as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="field min-w-56 flex-1 sm:max-w-sm">
              <span className="field-label">New collection</span>
              <input value={name} onChange={(event) => setName(event.target.value)} maxLength={60} placeholder="Monsoon weekend" className="input" />
            </label>
            <button type="submit" className="btn btn-accent" disabled={busy || !name.trim()}>
              Create
            </button>
            <p role="alert" aria-live="polite" className="field-error w-full empty:hidden">
              {error}
            </p>
          </form>
          {collections === null ? (
            <p className="text-muted">Loading…</p>
          ) : collections.length === 0 ? (
            <p className="text-ink-2">No collections yet.</p>
          ) : (
            <ul className="grid gap-4 lg:grid-cols-2">
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  names={names}
                  saved={favourites}
                  onChange={(next) => setCollections((current) => (current ?? []).map((item) => (item.id === next.id ? next : item)))}
                  onDelete={() => setCollections((current) => (current ?? []).filter((item) => item.id !== collection.id))}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
