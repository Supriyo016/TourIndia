import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The original two-tone wet-paint logotype, kept from the first Tour India site.
 * `live` adds a slow light sweep and a lift on hover, with the same colours.
 */
export function Wordmark({ className, onDark, live }: { className?: string; onDark?: boolean; live?: boolean }) {
  return (
    <Link href="/" aria-label="Tour India home" className={cn("font-wordmark inline-block leading-none whitespace-nowrap", live && "wordmark-live", className)}>
      <span style={{ color: onDark ? "#e6c61a" : "var(--gold)" }}>Tour</span>{" "}
      <span style={{ color: onDark ? "#ffffff" : "var(--brand)" }}>India</span>
    </Link>
  );
}
