import Link from "next/link";
import { notFound } from "next/navigation";
import { MemoryBody, MemoryMeta } from "@/components/memories/MemoryBody";
import { MemoryControls } from "@/components/memories/MemoryControls";
import { memoryForOwner } from "@/features/memories/service";
import { currentSession } from "@/lib/auth/session";

export const metadata = { title: "Memory" };

/** One memory, for its owner. */
export default async function MemoryPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await currentSession().catch(() => null);
  if (!session) return null;
  const memory = await memoryForOwner(session.user._id, (await params).id);
  if (!memory) notFound();
  return (
    <article className="grid gap-6">
      <p className="no-print text-sm">
        <Link prefetch={false} href="/profile/memories" className="link-text">
          ← Memories
        </Link>
      </p>
      <header className="grid gap-1">
        <h1 className="break-words">{memory.title}</h1>
        <MemoryMeta date={memory.date} placeName={memory.placeName} />
      </header>
      <MemoryControls id={memory.id} shareId={memory.shareId} />
      <MemoryBody body={memory.body} tags={memory.tags} photos={memory.photos} />
    </article>
  );
}
