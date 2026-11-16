import { Clapperboard } from "lucide-react";
import type { ArtVideo as ArtVideoData } from "./art-media";

const minutes = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/**
 * A licensed clip with sound. It never autoplays (browsers block autoplay with sound,
 * and it would surprise readers): the native controls start it, by mouse, touch or keyboard.
 * preload="none" means nothing downloads until the viewer presses play.
 */
export function ArtVideo({ video, name, poster }: { video: ArtVideoData | undefined; name: string; poster?: string }) {
  if (!video) {
    return (
      <div className="card flex items-start gap-3 p-4 text-ink-2">
        <Clapperboard className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden />
        <p>
          No licensed video yet. We only show footage that is free to share, with its sound, and credit the person who filmed it.
          If you have filmed {name} and can release it under a free licence, upload it to Wikimedia Commons and tell us in the discussion below.
        </p>
      </div>
    );
  }
  return (
    <figure>
      <video
        controls
        preload="none"
        playsInline
        poster={poster}
        aria-label={`Video: ${video.title}`}
        className="aspect-video w-full rounded-[var(--radius-lg)] bg-black object-contain"
      >
        <source src={video.src} type="video/webm" />
        {video.captions.map((track, index) => (
          <track key={track.src} kind="captions" src={track.src} srcLang={track.lang} label={track.label} default={index === 0 && track.lang === "en"} />
        ))}
        Your browser cannot play this video. <a href={video.sourceUrl}>Open it on Wikimedia Commons</a>.
      </video>
      <figcaption className="mt-2 text-sm text-muted">
        {video.title} ({minutes(video.duration)}, {video.height}p, with sound{video.captions.length ? `, captions in ${video.captions.map((track) => track.label).join(", ")}` : ", no captions available"}).
        Video: {video.author},{" "}
        <a href={video.sourceUrl} className="underline" target="_blank" rel="noopener noreferrer">
          {video.license}<span className="sr-only"> (opens in a new tab)</span>
        </a>
        .
      </figcaption>
    </figure>
  );
}
