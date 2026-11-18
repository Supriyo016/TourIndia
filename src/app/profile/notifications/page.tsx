import type { Metadata } from "next";
import Link from "next/link";
import { NotificationList } from "@/components/profile/NotificationList";
import { listNotifications } from "@/features/notifications/service";
import { currentSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

/** The signed-in person's notifications, newest first. The layout handles signed-out visitors. */
export default async function NotificationsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const session = await currentSession().catch(() => null);
  if (!session) return null;
  const { page: requested } = await searchParams;
  const result = await listNotifications(session.user._id, { page: Number(requested) || 1 }).catch(() => null);

  return (
    <>
      <h1>Notifications</h1>
      <p className="mt-1 max-w-prose text-ink-2">Updates about your account, support requests and contributions. They&apos;re only shown here, not emailed, and are cleared after six months.</p>
      {!result ? (
        <p className="mt-6 text-ink-2">Notifications aren&apos;t available right now. Please try again later.</p>
      ) : (
        <>
          <NotificationList key={result.page} initial={result.rows} />
          {result.pages > 1 && (
            <nav aria-label="Pages" className="mt-4 flex items-center gap-3 text-sm">
              {result.page > 1 && (
                <Link prefetch={false} href={`/profile/notifications?page=${result.page - 1}`} className="chip">
                  Newer
                </Link>
              )}
              <span>
                Page {result.page} of {result.pages}
              </span>
              {result.page < result.pages && (
                <Link prefetch={false} href={`/profile/notifications?page=${result.page + 1}`} className="chip">
                  Older
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </>
  );
}
