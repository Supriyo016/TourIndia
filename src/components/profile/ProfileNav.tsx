"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Compass, Eye, IdCard, LayoutDashboard, Route, ShieldCheck } from "lucide-react";

const LINKS = [
  { href: "/profile", label: "Overview", Icon: LayoutDashboard },
  { href: "/profile/trips", label: "My trips", Icon: Route },
  { href: "/profile/notifications", label: "Notifications", Icon: Bell },
  { href: "/profile/details", label: "Details", Icon: IdCard },
  { href: "/profile/preferences", label: "Preferences", Icon: Compass },
  { href: "/profile/privacy", label: "Privacy", Icon: Eye },
  { href: "/profile/security", label: "Security", Icon: ShieldCheck },
] as const;

/** Sections of the personal profile: a sidebar on wide screens, a scrolling row on phones. */
export function ProfileNav() {
  const path = usePathname();
  return (
    <nav aria-label="Your profile" className="lg:sticky lg:top-24">
      <ul className="scroll-thin flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
        {LINKS.map(({ href, label, Icon }) => {
          const active = href === "/profile" ? path === href : path.startsWith(href);
          return (
            <li key={href} className="shrink-0">
              <Link
                prefetch={false}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-2.5 rounded-[var(--radius-md)] px-3 text-[0.95rem] whitespace-nowrap ${active ? "bg-surface-2 font-semibold text-accent-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink"}`}
              >
                <Icon className="size-[1.1rem]" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
