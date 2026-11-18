import Link from "next/link";
import type { ReactNode } from "react";
import { Activity, DatabaseBackup, Gauge, Inbox, KeyRound, LayoutDashboard, LifeBuoy, MessageSquareWarning, ScrollText, SearchCheck, Users, UsersRound } from "lucide-react";
import type { Permission } from "@/features/admin/permissions";

const SECTIONS: { href: string; label: string; needs?: Permission; Icon: typeof Gauge }[] = [
  { href: "/admin/dashboard", label: "Dashboard", needs: "analytics.view", Icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", needs: "users.view", Icon: Users },
  { href: "/admin/queue", label: "Moderation queue", needs: "moderation.manage", Icon: Inbox },
  { href: "/admin", label: "Comments and edits", needs: "moderation.manage", Icon: MessageSquareWarning },
  { href: "/admin/support", label: "Support tickets", needs: "support.manage", Icon: LifeBuoy },
  { href: "/admin/logs", label: "Logs", needs: "logs.view", Icon: ScrollText },
  { href: "/admin/health", label: "Health", needs: "logs.view", Icon: Activity },
  { href: "/admin/seo", label: "SEO", needs: "seo.manage", Icon: SearchCheck },
  { href: "/admin/backups", label: "Backups", needs: "backup.create", Icon: DatabaseBackup },
  { href: "/admin/team", label: "Team and roles", needs: "admins.manage", Icon: UsersRound },
  { href: "/admin/mfa", label: "Your authenticator", Icon: KeyRound },
];

/**
 * The admin frame: a sidebar on wide screens and a scrolling row of sections on phones. Only the
 * sections the admin's roles allow are shown; each page still checks its own permission.
 */
export function AdminShell({ permissions, current, email, children }: { permissions: Set<Permission>; current: string; email: string; children: ReactNode }) {
  const allowed = SECTIONS.filter((section) => !section.needs || permissions.has(section.needs));
  return (
    <div className="container-x py-8 lg:grid lg:grid-cols-[14rem_1fr] lg:gap-8">
      <aside className="mb-6 lg:mb-0">
        <nav aria-label="Admin" className="lg:sticky lg:top-24">
          <p className="mb-2 hidden text-xs font-semibold tracking-wide text-ink-2 uppercase lg:block">Admin</p>
          <ul className="scroll-thin flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
            {allowed.map(({ href, label, Icon }) => {
              const active = href === current;
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
          <p className="mt-4 hidden text-xs break-all text-ink-2 lg:block">Signed in as {email}</p>
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
