import Link from "next/link";
import type { Permission } from "@/features/admin/permissions";

const LINKS: { href: string; label: string; needs?: Permission }[] = [
  { href: "/admin", label: "Moderation", needs: "moderation.manage" },
  { href: "/admin/dashboard", label: "Dashboard", needs: "analytics.view" },
  { href: "/admin/team", label: "Team and roles", needs: "admins.manage" },
  { href: "/admin/mfa", label: "Authenticator" },
];

/** Admin section links, showing only the areas the signed-in admin's roles allow. */
export function AdminNav({ permissions, current }: { permissions: Set<Permission>; current: string }) {
  return (
    <nav aria-label="Admin" className="mb-6 flex flex-wrap gap-2 border-b border-line pb-3">
      {LINKS.filter((link) => !link.needs || permissions.has(link.needs)).map((link) => (
        <Link
          key={link.href}
          prefetch={false}
          href={link.href}
          aria-current={link.href === current ? "page" : undefined}
          className={link.href === current ? "chip !border-accent font-semibold" : "chip"}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
