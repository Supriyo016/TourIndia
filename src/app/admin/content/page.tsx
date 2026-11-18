import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { PublishDueButton } from "@/components/admin/content/ContentActions";
import { destinations, states } from "@/data";
import { requireAdminPage } from "@/features/admin/guard";
import { pageCounts, waiting } from "@/features/content/cms";
import { STATUS_LABELS } from "@/features/content/workflow";

export const metadata: Metadata = { title: "Content", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Search = { q?: string; type?: string; filter?: string };
const when = (value: Date) => value.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });

/** Every page the CMS can edit, with what's live, in progress or scheduled on each. */
export default async function AdminContentPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { session, access } = await requireAdminPage("content.edit");
  const params = await searchParams;
  const q = (params.q ?? "").trim().toLowerCase().slice(0, 60);
  const type = params.type === "place" || params.type === "state" ? params.type : "";
  const filter = params.filter === "edited" || params.filter === "open" ? params.filter : "";
  const [counts, { queue, due }] = await Promise.all([pageCounts(), waiting()]);

  const pages = [
    ...destinations.map((item) => ({ key: `place:${item.slug}`, type: "place" as const, slug: item.slug, title: item.name })),
    ...states.map((item) => ({ key: `state:${item.slug}`, type: "state" as const, slug: item.slug, title: item.name })),
  ]
    .filter((page) => (!type || page.type === type) && (!q || page.title.toLowerCase().includes(q)))
    .map((page) => ({ ...page, ...(counts.get(page.key) ?? { open: 0, scheduled: 0, publishedNumber: null }) }))
    .filter((page) => (filter === "edited" ? page.publishedNumber !== null : filter === "open" ? page.open > 0 : true))
    .sort((a, b) => b.open - a.open || a.title.localeCompare(b.title));
  const titles = new Map<string, string>([...destinations.map((item) => [`place:${item.slug}`, item.name] as const), ...states.map((item) => [`state:${item.slug}`, item.name] as const)]);

  return (
    <AdminShell permissions={access.permissions} current="/admin/content" email={session.user.email}>
      <h1>Content</h1>
      <p className="mt-1 max-w-prose text-ink-2">
        The guide&apos;s own text stays the baseline. Edits are drafted here, reviewed, approved and then published (now or at a set time), and every version is kept so you can restore it.
      </p>

      {queue.length > 0 && (
        <section aria-labelledby="waiting-title" className="card mt-6 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="waiting-title" className="text-xl">
              Waiting for review or publishing
            </h2>
            {due > 0 && access.permissions.has("content.publish") && <PublishDueButton count={due} />}
          </div>
          <ul className="mt-3 divide-y divide-line text-sm">
            {queue.map((version) => {
              const [kind, slug] = version.target.split(":");
              return (
                <li key={version._id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <Link prefetch={false} href={`/admin/content/${kind}/${slug}`} className="link-text font-semibold">
                    {titles.get(version.target) ?? version.target}, version {version.number}
                  </Link>
                  <span className="text-ink-2">
                    {STATUS_LABELS[version.status]}
                    {version.publishAt ? ` · goes live ${when(version.publishAt)}` : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <form className="mt-6 flex flex-wrap items-end gap-3" aria-label="Find a page">
        <div className="grid gap-1.5">
          <label htmlFor="content-q" className="text-sm font-semibold">
            Page name
          </label>
          <input id="content-q" name="q" defaultValue={params.q ?? ""} className="input" maxLength={60} />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="content-type" className="text-sm font-semibold">
            Kind
          </label>
          <select id="content-type" name="type" defaultValue={type} className="input">
            <option value="">Places and states</option>
            <option value="place">Places</option>
            <option value="state">States and territories</option>
          </select>
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="content-filter" className="text-sm font-semibold">
            Show
          </label>
          <select id="content-filter" name="filter" defaultValue={filter} className="input">
            <option value="">All pages</option>
            <option value="edited">With published edits</option>
            <option value="open">With versions in progress</option>
          </select>
        </div>
        <button className="btn btn-primary">Show</button>
      </form>

      <p className="mt-4 text-sm text-ink-2" role="status">
        {pages.length} {pages.length === 1 ? "page" : "pages"}.
      </p>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {pages.slice(0, 120).map((page) => (
          <li key={page.key}>
            <Link prefetch={false} href={`/admin/content/${page.type}/${page.slug}`} className="card flex min-h-11 flex-col gap-0.5 p-3 hover:bg-surface-2">
              <span className="font-semibold">{page.title}</span>
              <span className="text-xs text-ink-2">
                {page.type === "place" ? "Place" : "State or territory"} · {page.publishedNumber ? `version ${page.publishedNumber} live` : "guide text"}
                {page.open ? ` · ${page.open} in progress` : ""}
                {page.scheduled ? ` · ${page.scheduled} scheduled` : ""}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {pages.length > 120 && <p className="mt-3 text-sm text-ink-2">Showing the first 120. Search by name to find others.</p>}
    </AdminShell>
  );
}
