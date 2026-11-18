import Link from "next/link";
import { notFound } from "next/navigation";
import { MemoryForm } from "@/components/memories/MemoryForm";
import { photoOptions, placeOptions } from "@/features/memories/places";
import { memoryForOwner } from "@/features/memories/service";
import { currentSession } from "@/lib/auth/session";

export const metadata = { title: "Edit memory" };

export default async function EditMemoryPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await currentSession().catch(() => null);
  if (!session) return null;
  const memory = await memoryForOwner(session.user._id, (await params).id);
  if (!memory) notFound();
  const { places, states } = placeOptions();
  return (
    <div className="grid gap-6">
      <p className="text-sm">
        <Link prefetch={false} href={`/profile/memories/${memory.id}`} className="link-text">
          ← Back to the memory
        </Link>
      </p>
      <h1 className="break-words">Edit “{memory.title}”</h1>
      {memory.shareId && <p className="-mt-3 text-sm text-ink-2">This memory is shared by link, so changes show to anyone with the link.</p>}
      <section aria-label="Memory" className="card p-5 sm:p-6">
        <MemoryForm initial={memory} places={places} states={states} photos={photoOptions()} />
      </section>
    </div>
  );
}
