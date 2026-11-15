import { tourVideo } from "@/data/tour-video";

/** The file is large, so nothing is downloaded until the visitor presses play. */
export function TourVideo({ className }: { className?: string }) {
  return (
    <video controls preload="none" poster={tourVideo.poster} aria-label={tourVideo.title} className={className}>
      <source src={tourVideo.src} type="video/webm" />
      Your browser can&apos;t play this video.
    </video>
  );
}
