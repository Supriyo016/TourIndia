import Image from "next/image";
import Link from "next/link";
import { BookOpen, GalleryHorizontalEnd, Link2, ListOrdered, Plus, Search } from "lucide-react";
import { memoryDate } from "@/components/memories/MemoryBody";
import { photoDetails } from "@/features/memories/places";
import { MEMORY_LIMIT, type MemoryView } from "@/features/memories/schema";
import { listMemories, memoryFacets } from "@/features/memories/service";
import { currentSession } from "@/lib/auth/session";

export const metadata = { title: "Memories" };

type Query = { view?: string; tag?: string; place?: string; q?: string };

const one = (value: unknown) => (typeof value === "string" ? value.slice(0, 80) : undefined);

function href(current: Query, change: Partial<Query>) {
  const next = { ...current, ...change };
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(next)) if (value) params.set(key, value);
  const query = params.toString();
  return query ? `/profile/memories?${query}` : "/profile/memories";
}

function Timeline({ memories }: { memories: MemoryView[] }) {
  const groups = new Map<string, MemoryView[]>();
  for (const memory of memories) {
    const label = new Date(`${memory.date}T00:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    groups.set(label, [...(groups.get(label) ?? []), memory]);
  }
  return (
    <ol className="grid gap-8">
      {[...groups].map(([label, items]) => (
        <li key={label}>
          <h2 className="text-lg text-ink-2">{label}</h2>
          <ol className="mt-3 grid gap-4 border-l-2 border-line pl-4 sm:pl-6">
            {items.map((memory) => {
              const cover = photoDetails(memory.photos.slice(0, 1))[0];
              return (
                <li key={memory.id} className="card card-hover relative flex gap-4 p-4">
                  {cover && (
                    <div className="relative hidden size-24 shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-surface-2 sm:block">
                      <Image src={cover.src} alt="" fill sizes="96px" className="object-cover" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm text-muted">
                      <time dateTime={memory.date}>{memoryDate(memory.date, "short")}</time>
                      {memory.placeName ? ` · ${memory.placeName}` : ""}
                      {memory.shareId && (
                        <span className="ml-2 inline-flex items-center gap-1">
                          <Link2 className="size-3.5" aria-hidden /> Shared
                        </span>
                      )}
                    </p>
                    <h3 className="mt-0.5 text-lg break-words">
                      <Link prefetch={false} href={`/profile/memories/${memory.id}`} className="after:absolute after:inset-0">
                        {memory.title}
                      </Link>
                    </h3>
                    {memory.body && <p className="mt-1 line-clamp-2 break-words text-ink-2">{memory.body}</p>}
                    {memory.tags.length > 0 && (
                      <p className="mt-2 flex flex-wrap gap-1.5">
                        {memory.tags.map((tag) => (
                          <span key={tag} className="tag tag-editorial">
                            {tag}
                          </span>
                        ))}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </li>
      ))}
    </ol>
  );
}

function Gallery({ memories }: { memories: MemoryView[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {memories.map((memory) => {
        const cover = photoDetails(memory.photos.slice(0, 1))[0];
        return (
          <li key={memory.id} className="card card-hover relative overflow-hidden">
            <div className="relative aspect-square bg-surface-2">
              {cover ? (
                <Image src={cover.src} alt={cover.alt} fill sizes="(min-width: 1024px) 220px, 45vw" className="object-cover" />
              ) : (
                <div className="flex h-full items-center p-4">
                  <p className="line-clamp-6 text-sm break-words text-ink-2">{memory.body || memory.title}</p>
                </div>
              )}
              {memory.photos.length > 1 && <span className="absolute top-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white">+{memory.photos.length - 1}</span>}
            </div>
            <div className="p-3">
              <h3 className="text-base break-words">
                <Link prefetch={false} href={`/profile/memories/${memory.id}`} className="after:absolute after:inset-0">
                  {memory.title}
                </Link>
              </h3>
              <p className="text-xs text-muted">
                {memoryDate(memory.date, "short")}
                {memory.placeName ? ` · ${memory.placeName}` : ""}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** The signed-in person's memories as a timeline or a gallery, with search by tag, place and words. */
export default async function MemoriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await currentSession().catch(() => null);
  if (!session) return null;
  const raw = await searchParams;
  const current: Query = { view: one(raw.view) === "gallery" ? "gallery" : undefined, tag: one(raw.tag), place: one(raw.place), q: one(raw.q) };
  const [memories, facets] = await Promise.all([
    listMemories(session.user._id, current).catch(() => null),
    memoryFacets(session.user._id).catch(() => ({ tags: [], places: [] })),
  ]);
  const filtered = Boolean(current.tag || current.place || current.q);
  const total = facets.tags.length + facets.places.length;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1>Memories</h1>
          <p className="mt-1 text-ink-2">Moments from your travels, kept private unless you share one by link.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link prefetch={false} href={href(current, { view: undefined }).replace("/profile/memories", "/profile/memories/scrapbook")} className="btn btn-outline">
            <BookOpen className="size-4" aria-hidden /> Scrapbook
          </Link>
          <Link prefetch={false} href="/profile/memories/new" className="btn btn-accent">
            <Plus className="size-4" aria-hidden /> Add a memory
          </Link>
        </div>
      </div>

      {memories === null ? (
        <p className="text-ink-2">Memories aren&apos;t available right now. Please try again later.</p>
      ) : (
        <>
          <form action="/profile/memories" method="get" className="card grid gap-3 p-4 sm:grid-cols-[1fr_14rem_auto] sm:items-end" role="search">
            {current.view && <input type="hidden" name="view" value={current.view} />}
            {current.tag && <input type="hidden" name="tag" value={current.tag} />}
            <label className="field">
              <span className="field-label">Search</span>
              <input type="search" name="q" defaultValue={current.q} className="input" placeholder="Words, tags or places" />
            </label>
            <label className="field">
              <span className="field-label">Place</span>
              <select name="place" defaultValue={current.place ?? ""} className="input">
                <option value="">Anywhere</option>
                {facets.places.map((place) => (
                  <option key={place.value} value={place.value}>
                    {place.label} ({place.count})
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="btn btn-outline">
              <Search className="size-4" aria-hidden /> Search
            </button>
          </form>

          {facets.tags.length > 0 && (
            <nav aria-label="Tags" className="flex flex-wrap gap-2">
              {facets.tags.slice(0, 30).map(({ tag, count }) => (
                <Link key={tag} prefetch={false} href={href(current, { tag: current.tag === tag ? undefined : tag })} aria-current={current.tag === tag ? "true" : undefined} className="chip">
                  {tag} <span className="opacity-70">{count}</span>
                </Link>
              ))}
            </nav>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-2" role="status">
              {memories.length} {memories.length === 1 ? "memory" : "memories"}
              {filtered ? " found" : ` of up to ${MEMORY_LIMIT}`}
              {filtered && (
                <>
                  {" · "}
                  <Link prefetch={false} href={href({ view: current.view }, {})} className="link-text">
                    Clear the search
                  </Link>
                </>
              )}
            </p>
            <div className="flex gap-2" role="group" aria-label="View">
              <Link prefetch={false} href={href(current, { view: undefined })} aria-current={!current.view ? "true" : undefined} className="chip">
                <ListOrdered className="size-4" aria-hidden /> Timeline
              </Link>
              <Link prefetch={false} href={href(current, { view: "gallery" })} aria-current={current.view === "gallery" ? "true" : undefined} className="chip">
                <GalleryHorizontalEnd className="size-4" aria-hidden /> Gallery
              </Link>
            </div>
          </div>

          {memories.length === 0 ? (
            <p className="card p-6 text-ink-2">
              {filtered || total ? "Nothing matches that search." : "No memories yet. Add the first one: a meal, a view, a conversation on a train."}
            </p>
          ) : current.view === "gallery" ? (
            <Gallery memories={memories} />
          ) : (
            <Timeline memories={memories} />
          )}
        </>
      )}
    </div>
  );
}
