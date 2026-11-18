import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { DecisionButtons } from "@/components/admin/improve/DecisionButtons";
import { requireAdminPage } from "@/features/admin/guard";
import { REC_KINDS, REC_STATES, refresh, type RecKind, type RecState } from "@/features/improve/engine";

export const metadata: Metadata = { title: "Improvements", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const STATE_LABELS: Record<RecState, string> = { new: "New", accepted: "Accepted", dismissed: "Dismissed", done: "Done" };
const when = (value: Date) => value.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });

/** Evidence-based recommendations from the site's own records, each with a review state and who decided. */
export default async function AdminImprovePage({ searchParams }: { searchParams: Promise<{ state?: string; kind?: string }> }) {
  const { session, access } = await requireAdminPage("content.edit");
  const params = await searchParams;
  const state = (REC_STATES as readonly string[]).includes(params.state ?? "") ? (params.state as RecState) : "new";
  const kind = params.kind && params.kind in REC_KINDS ? (params.kind as RecKind) : undefined;
  const all = await refresh();
  const rows = all.filter((row) => row.state === state && (!kind || row.kind === kind) && (row.active || state !== "new"));
  const counts = Object.fromEntries(REC_STATES.map((id) => [id, all.filter((row) => row.state === id && (row.active || id !== "new")).length]));
  const href = (next: { state?: string; kind?: string }) => `/admin/improve?${new URLSearchParams({ state: next.state ?? state, ...((next.kind ?? kind) ? { kind: next.kind ?? kind! } : {}) })}`;

  return (
    <AdminShell permissions={access.permissions} current="/admin/improve" email={session.user.email}>
      <h1>Improvements</h1>
      <p className="mt-1 max-w-prose text-ink-2">
        Suggestions built only from what the site has recorded: searches that found nothing (once analytics is collecting), questions Yatri answered poorly, comments reported as wrong, and gaps in images and alt text. Nothing here is estimated. Recomputed each time you open this page.
      </p>
      <nav aria-label="Review state" className="mt-5 flex flex-wrap gap-2">
        {REC_STATES.map((id) => (
          <Link key={id} prefetch={false} href={href({ state: id })} aria-current={state === id ? "true" : undefined} className="chip">
            {STATE_LABELS[id]} ({counts[id]})
          </Link>
        ))}
      </nav>
      <nav aria-label="Kind" className="mt-2 flex flex-wrap gap-2 text-sm">
        <Link prefetch={false} href={`/admin/improve?state=${state}`} aria-current={!kind ? "true" : undefined} className="chip">
          Everything
        </Link>
        {(Object.keys(REC_KINDS) as RecKind[]).map((id) => (
          <Link key={id} prefetch={false} href={href({ kind: id })} aria-current={kind === id ? "true" : undefined} className="chip">
            {REC_KINDS[id]}
          </Link>
        ))}
      </nav>
      {rows.length === 0 ? (
        <p className="mt-6 text-ink-2">Nothing here.</p>
      ) : (
        <ul className="mt-5 grid gap-3">
          {rows.slice(0, 200).map((row) => (
            <li key={row._id} className="card grid gap-1.5 p-4">
              <p className="font-semibold">
                {row.href ? (
                  <Link prefetch={false} href={row.href} className="link-text">
                    {row.title}
                  </Link>
                ) : (
                  row.title
                )}
              </p>
              <p className="text-sm">{row.evidence}</p>
              <p className="text-xs text-ink-2">
                {REC_KINDS[row.kind]} · first seen {when(row.firstSeen)}
                {!row.active && " · evidence no longer there"}
                {row.decidedByEmail && row.decidedAt ? ` · ${STATE_LABELS[row.state]} by ${row.decidedByEmail} on ${when(row.decidedAt)}` : ""}
              </p>
              <DecisionButtons id={row._id} state={row.state} />
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
