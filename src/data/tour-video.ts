/**
 * The video from the original Tour India site, supplied by the owner. Re-encoded
 * from legacy/assets/video/video.mp4 (40 MB) to WebM at three sizes, largest first.
 */
export const tourVideo = {
  poster: "/videos/tour-india-poster.webp",
  title: "A video tour of India",
  renditions: [
    { height: 720, src: "/videos/tour-india.webm" },
    { height: 480, src: "/videos/tour-india-480.webm" },
    { height: 360, src: "/videos/tour-india-360.webm" },
  ],
} as const;

export type VideoHeight = (typeof tourVideo.renditions)[number]["height"];

/**
 * Picks a size from the network the browser reports, capped at what the player can show.
 * Falls back to 480p when the browser reports nothing (Safari, Firefox).
 */
export function pickRendition(network: { effectiveType?: string; downlink?: number; saveData?: boolean } | undefined, displayHeight: number): VideoHeight {
  const fits = (height: VideoHeight) => height <= Math.max(360, displayHeight * 1.25);
  if (!network) return fits(480) ? 480 : 360;
  if (network.saveData || network.effectiveType === "slow-2g" || network.effectiveType === "2g") return 360;
  const downlink = network.downlink ?? 0;
  if (network.effectiveType === "4g" && downlink >= 5 && fits(720)) return 720;
  if (downlink >= 1.5 && network.effectiveType !== "3g" && fits(480)) return 480;
  return 360;
}

/** One step smaller, for when playback keeps stalling. */
export function stepDown(height: VideoHeight): VideoHeight {
  return height === 720 ? 480 : 360;
}
