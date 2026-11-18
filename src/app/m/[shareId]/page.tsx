import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { MemoryBody, MemoryMeta } from "@/components/memories/MemoryBody";
import { sharedMemory } from "@/features/memories/service";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ shareId: string }> };
const lookup = cache((shareId: string) => sharedMemory(shareId));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await lookup((await params).shareId);
  // Shared memories are for the people given the link, not for search engines.
  return { title: found ? found.title : "Memory not found", robots: { index: false, follow: false } };
}

/** A memory someone shared with a read-only link. Never shows who wrote it. */
export default async function SharedMemoryPage({ params }: Props) {
  const found = await lookup((await params).shareId);
  if (!found) notFound();
  return (
    <article className="container-x max-w-3xl py-10">
      <p className="text-sm text-muted">A travel memory shared from Tour India</p>
      <h1 className="mt-1 break-words">{found.title}</h1>
      <div className="mt-2">
        <MemoryMeta date={found.date} placeName={found.placeName} />
      </div>
      <div className="mt-6">
        <MemoryBody body={found.body} tags={found.tags} photos={found.photos} />
      </div>
      <p className="mt-8 text-sm text-ink-2">
        Keep your own?{" "}
        <Link prefetch={false} href="/profile/memories" className="link-text">
          Start a travel journal
        </Link>
        .
      </p>
    </article>
  );
}
