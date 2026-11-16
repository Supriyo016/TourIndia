import Link from "next/link";
import { CalendarDays, Clock } from "lucide-react";
import { getState } from "@/data";
import { formatMonthRange } from "@/data/taxonomy";
import { Photo } from "@/components/ui/primitives";
import type { Destination } from "@/types/content";
import { SaveButton } from "./SaveButton";

export function DestinationCard({ destination, priority }: { destination: Destination; priority?: boolean }) {
  const state = getState(destination.stateSlug);
  return (
    <article data-tilt className="card card-hover flex h-full flex-col overflow-hidden">
      <div className="zoom-media relative aspect-[4/3] rounded-t-[13px]">
        <Photo
          imageKey={`destination:${destination.slug}`}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 92vw"
          priority={priority}
        />
      </div>
      <div className="absolute top-2.5 right-2.5 z-10">
        <SaveButton slug={destination.slug} name={destination.name} />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-sm font-medium text-muted">{state?.name}</p>
        <h3 className="mt-0.5">
          <Link prefetch={false} href={`/destinations/${destination.slug}`} className="after:absolute after:inset-0">
            {destination.name}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-[0.97rem] leading-snug text-ink-2">{destination.tagline}</p>
        <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          <div className="flex items-center gap-1.5">
            <dt>
              <CalendarDays className="size-4" aria-label="Best months" />
            </dt>
            <dd>{formatMonthRange(destination.bestMonths)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt>
              <Clock className="size-4" aria-label="Suggested length" />
            </dt>
            <dd>
              {destination.recommendedDays.min}–{destination.recommendedDays.max} days
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
