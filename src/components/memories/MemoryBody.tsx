import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";
import { photoDetails } from "@/features/memories/places";

export const memoryDate = (value: string, month: "long" | "short" = "long") =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month, year: "numeric" });

/** When and where. */
export function MemoryMeta({ date, placeName }: { date: string; placeName: string | null }) {
  return (
    <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="size-4" aria-hidden />
        <time dateTime={date}>{memoryDate(date)}</time>
      </span>
      {placeName && (
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-4" aria-hidden />
          {placeName}
        </span>
      )}
    </p>
  );
}

/** The words, tags and photos of a memory, with each photo's credit. */
export function MemoryBody({ body, tags, photos }: { body: string; tags: string[]; photos: string[] }) {
  const details = photoDetails(photos);
  return (
    <div className="grid gap-5">
      {details.length > 0 && (
        <ul className={`grid gap-3 ${details.length > 1 ? "sm:grid-cols-2" : ""}`}>
          {details.map((photo) => (
            <li key={photo.key} className="print-break">
              <figure>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-md)] bg-surface-2">
                  <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 640px) 360px, 100vw" placeholder={photo.blur ? "blur" : "empty"} blurDataURL={photo.blur} className="object-cover" />
                </div>
                <figcaption className="mt-1 text-xs text-muted">
                  Photo: {photo.author},{" "}
                  <a href={photo.sourceUrl} className="underline" target="_blank" rel="noopener noreferrer">
                    {photo.license}
                  </a>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      )}
      {body && <p className="whitespace-pre-line break-words text-ink-2">{body}</p>}
      {tags.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Tags">
          {tags.map((tag) => (
            <li key={tag} className="tag tag-editorial">
              {tag}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
