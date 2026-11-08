import Link from "next/link";
import { cn } from "@/lib/utils";

/** The original two-tone wet-paint logotype, kept from the first Tour India site. */
export function Wordmark({ className, onDark }: { className?: string; onDark?: boolean }) {
  return (
    <Link href="/" aria-label="Tour India home" className={cn("font-wordmark inline-block leading-none whitespace-nowrap", className)}>
      <span style={{ color: onDark ? "#e6c61a" : "var(--gold)" }}>Tour</span>{" "}
      <span style={{ color: onDark ? "#ffffff" : "var(--brand)" }}>India</span>
    </Link>
  );
}
