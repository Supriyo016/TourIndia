import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { DestinationCard } from "@/components/destinations/DestinationCard";
import { destinations } from "@/data";
import { sharedCollection } from "@/features/saved/service";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ shareId: string }> };
const lookup = cache((shareId: string) => sharedCollection(shareId));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await lookup((await params).shareId);
  // Shared lists are for the people given the link, not for search engines.
  return { title: found ? found.name : "Collection not found", robots: { index: false, follow: false } };
}

/** A collection someone shared with a read-only link. Turning the link off makes this a 404. */
export default async function SharedCollectionPage({ params }: Props) {
  const found = await lookup((await params).shareId);
  if (!found) notFound();
  const places = found.places.map((slug) => destinations.find((d) => d.slug === slug)).filter((d) => d !== undefined);

  return (
    <div className="container-x py-10">
      <p className="text-sm text-muted">A collection shared from Tour India</p>
      <h1 className="mt-1 break-words">{found.name}</h1>
      {found.note && <p className="mt-2 max-w-2xl whitespace-pre-line text-ink-2">{found.note}</p>}
      {places.length === 0 ? (
        <p className="mt-8 text-ink-2">There are no places in this collection yet.</p>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {places.map((destination) => (
            <li key={destination.slug}>
              <DestinationCard destination={destination} />
            </li>
          ))}
        </ul>
      )}
      <p className="mt-10 text-sm text-ink-2">
        Tap a heart to save a place for yourself, or{" "}
        <Link prefetch={false} href="/saved" className="link-text">
          start your own collection
        </Link>
        .
      </p>
    </div>
  );
}
