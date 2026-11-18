import Link from "next/link";
import { MemoryForm } from "@/components/memories/MemoryForm";
import { photoOptions, placeOptions } from "@/features/memories/places";

export const metadata = { title: "Add a memory" };

export default function NewMemoryPage() {
  const { places, states } = placeOptions();
  return (
    <div className="grid gap-6">
      <p className="text-sm">
        <Link prefetch={false} href="/profile/memories" className="link-text">
          ← Memories
        </Link>
      </p>
      <div>
        <h1>Add a memory</h1>
        <p className="mt-1 text-ink-2">Only you can see it unless you share it by link later.</p>
      </div>
      <section aria-label="Memory" className="card p-5 sm:p-6">
        <MemoryForm places={places} states={states} photos={photoOptions()} />
      </section>
    </div>
  );
}
