"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Check, ImagePlus, X } from "lucide-react";
import { postJson } from "@/components/auth/AuthProvider";
import { PHOTO_LIMIT, splitTags, TAG_LIMIT } from "@/features/memories/schema";

interface Option {
  value: string;
  label: string;
}
export interface PickerPhoto {
  key: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  place: string;
  state: string;
}

interface Initial {
  id?: string;
  title: string;
  body: string;
  date: string;
  place: string;
  tags: string[];
  photos: string[];
}

const today = () => new Date().toLocaleDateString("en-CA");

/** Adding or editing a memory. Photos come from the site's own gallery; nothing is uploaded. */
export function MemoryForm({ initial, places, states, photos }: { initial?: Initial; places: Option[]; states: Option[]; photos: PickerPhoto[] }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [date, setDate] = useState(initial?.date ?? today());
  const [place, setPlace] = useState(initial?.place ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [chosen, setChosen] = useState<string[]>(initial?.photos ?? []);
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const byKey = useMemo(() => new Map(photos.map((photo) => [photo.key, photo])), [photos]);
  const offered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matching = place ? photos.filter((photo) => photo.place === place || (place.startsWith("state:") && photo.state === place)) : [];
    const list = showAll || !matching.length ? photos : matching;
    return q ? list.filter((photo) => photo.alt.toLowerCase().includes(q)) : list;
  }, [photos, place, showAll, search]);
  const limited = offered.slice(0, 60);

  const toggle = (key: string) => {
    setChosen((current) => (current.includes(key) ? current.filter((item) => item !== key) : current.length >= PHOTO_LIMIT ? current : [...current, key]));
  };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const memory = { title, body, date, place, tags: splitTags(tags), photos: chosen };
    try {
      const result = await postJson<{ memory: { id: string } }>("/api/memories", initial?.id ? { action: "update", id: initial.id, memory } : { action: "create", memory });
      router.push(`/profile/memories/${result.memory.id}`);
      router.refresh();
    } catch (problem) {
      setError((problem as Error).message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5" noValidate>
      <label className="field">
        <span className="field-label">Title</span>
        <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={100} required className="input" placeholder="Sunrise at Tiger Hill" />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="field">
          <span className="field-label">When</span>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} min="1950-01-01" max={today()} required className="input" />
        </label>
        <label className="field">
          <span className="field-label">Where (optional)</span>
          <select value={place} onChange={(event) => setPlace(event.target.value)} className="input">
            <option value="">No particular place</option>
            <optgroup label="Places in the guide">
              {places.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="States and Union Territories">
              {states.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
      </div>
      <label className="field">
        <span className="field-label">What happened (optional)</span>
        <textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={4000} rows={7} className="input min-h-40" placeholder="Who you were with, what you ate, what you'd tell a friend…" />
        <span className="text-xs text-muted">{body.length.toLocaleString("en-IN")} of 4,000</span>
      </label>
      <label className="field">
        <span className="field-label">Tags (optional)</span>
        <input value={tags} onChange={(event) => setTags(event.target.value)} className="input" placeholder="food, monsoon, family" aria-describedby="tags-hint" />
        <span id="tags-hint" className="text-xs text-muted">
          Separate tags with commas. Up to {TAG_LIMIT}.
        </span>
      </label>

      <fieldset>
        <legend className="field-label">Photos (optional)</legend>
        <p className="text-sm text-muted">
          Pick up to {PHOTO_LIMIT} from Tour India&apos;s own photo gallery. Each one keeps its photographer&apos;s credit. You can&apos;t upload your own.
        </p>
        {chosen.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Chosen photos">
            {chosen.map((key) => {
              const photo = byKey.get(key);
              return (
                <li key={key} className="relative size-20 overflow-hidden rounded-[var(--radius-md)] bg-surface-2">
                  {photo && <Image src={photo.src} alt={photo.alt} fill sizes="80px" className="object-cover" />}
                  <button type="button" onClick={() => toggle(key)} className="absolute top-1 right-1 grid size-7 place-items-center rounded-full bg-black/70 text-white" aria-label={`Remove ${photo?.alt ?? "photo"}`}>
                    <X className="size-4" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="field min-w-0 flex-1">
            <span className="text-sm text-ink-2">Search the gallery</span>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} className="input" placeholder="temple, beach, tea…" />
          </label>
          {place && (
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input type="checkbox" checked={showAll} onChange={(event) => setShowAll(event.target.checked)} className="size-4 accent-[var(--brand)]" />
              Show photos of everywhere
            </label>
          )}
        </div>
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {limited.map((photo) => {
            const on = chosen.includes(photo.key);
            return (
              <li key={photo.key}>
                <button
                  type="button"
                  onClick={() => toggle(photo.key)}
                  aria-pressed={on}
                  disabled={!on && chosen.length >= PHOTO_LIMIT}
                  className={`relative block aspect-square w-full overflow-hidden rounded-[var(--radius-md)] bg-surface-2 outline-offset-2 disabled:opacity-40 ${on ? "ring-4 ring-[var(--brand)]" : ""}`}
                >
                  <Image src={photo.src} alt="" fill sizes="(min-width: 1024px) 120px, 30vw" className="object-cover" />
                  <span className="sr-only">{photo.alt}</span>
                  {on ? (
                    <span className="absolute right-1 bottom-1 grid size-7 place-items-center rounded-full bg-[var(--brand)] text-white" aria-hidden>
                      <Check className="size-4" />
                    </span>
                  ) : (
                    <span className="absolute right-1 bottom-1 grid size-7 place-items-center rounded-full bg-black/60 text-white" aria-hidden>
                      <ImagePlus className="size-4" />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        {offered.length > limited.length && <p className="mt-2 text-sm text-muted">Showing 60 of {offered.length}. Search to narrow it down.</p>}
        {offered.length === 0 && <p className="mt-2 text-sm text-muted">No photos match that search.</p>}
      </fieldset>

      <p role="alert" aria-live="polite" className="field-error min-h-5">
        {error}
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn btn-accent" disabled={saving}>
          {saving ? "Saving…" : initial?.id ? "Save changes" : "Save memory"}
        </button>
        <button type="button" className="btn btn-outline" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  );
}
