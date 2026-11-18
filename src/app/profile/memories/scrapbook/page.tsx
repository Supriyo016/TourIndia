import Link from "next/link";
import { MemoryBody, MemoryMeta, memoryDate } from "@/components/memories/MemoryBody";
import { PrintButton } from "@/components/memories/PrintButton";
import { listMemories } from "@/features/memories/service";
import { currentSession } from "@/lib/auth/session";

export const metadata = { title: "Scrapbook" };

const one = (value: unknown) => (typeof value === "string" ? value.slice(0, 80) : undefined);

/**
 * Every memory (or the ones matching the search) laid out to print: oldest first, one memory
 * never split across pages where it fits, photos with their credits. "Save as PDF" in the print
 * dialog makes the PDF, so nothing is generated on the server.
 */
export default async function ScrapbookPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await currentSession().catch(() => null);
  if (!session) return null;
  const raw = await searchParams;
  const memories = ((await listMemories(session.user._id, { tag: one(raw.tag), place: one(raw.place), q: one(raw.q) }).catch(() => null)) ?? []).reverse();
  const first = memories[0]?.date;
  const last = memories.at(-1)?.date;

  return (
    <div className="scrapbook grid gap-8">
      <p className="no-print text-sm">
        <Link prefetch={false} href="/profile/memories" className="link-text">
          ← Memories
        </Link>
      </p>
      <header className="scrapbook-cover grid gap-2 border-b border-line pb-6">
        <p className="eyebrow">Tour India</p>
        <h1>{session.user.name ? `${session.user.name}'s travel scrapbook` : "My travel scrapbook"}</h1>
        {first && last && (
          <p className="text-ink-2">
            {memories.length} {memories.length === 1 ? "memory" : "memories"}, {first === last ? memoryDate(first) : `${memoryDate(first)} to ${memoryDate(last)}`}
          </p>
        )}
        <div className="no-print mt-3 flex flex-wrap items-center gap-3">
          <PrintButton />
          <span className="text-sm text-muted">Choose “Save as PDF” in the print window to keep a copy.</span>
        </div>
      </header>
      {memories.length === 0 ? (
        <p className="card p-6 text-ink-2">
          Nothing to print yet.{" "}
          <Link prefetch={false} href="/profile/memories/new" className="link-text">
            Add a memory
          </Link>{" "}
          first.
        </p>
      ) : (
        <ol className="grid gap-10">
          {memories.map((memory) => (
            <li key={memory.id} className="scrapbook-page print-break grid gap-3">
              <h2 className="text-2xl break-words">{memory.title}</h2>
              <MemoryMeta date={memory.date} placeName={memory.placeName} />
              <MemoryBody body={memory.body} tags={memory.tags} photos={memory.photos} />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
