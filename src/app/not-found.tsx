import type { Metadata } from "next";
import Link from "next/link";
import { SearchBox } from "@/components/search/SearchBox";
import { ErrorScene } from "@/components/errors/ErrorScene";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

const popular = [
  { href: "/destinations", label: "Destinations" },
  { href: "/explore", label: "India map" },
  { href: "/culture", label: "Festivals" },
  { href: "/planner", label: "Trip planner" },
  { href: "/calendar", label: "Holiday calendar" },
];

export default function NotFound() {
  return (
    <ErrorScene kind="notFound">
      <div className="mt-6 w-full max-w-md text-left">
        <SearchBox placeholder="Search destinations, festivals, food…" />
      </div>
      <nav aria-label="Popular pages" className="mt-4 flex flex-wrap justify-center gap-2">
        {popular.map((link) => (
          <Link key={link.href} prefetch={false} href={link.href} className="chip">
            {link.label}
          </Link>
        ))}
      </nav>
    </ErrorScene>
  );
}
