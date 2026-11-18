import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { destinations, states } from "@/data";
import { requireAdminPage } from "@/features/admin/guard";
import { gaps, KIND_LABELS, library, MEDIA_KINDS, type MediaKind } from "@/features/media/library";

export const metadata: Metadata = { title: "Media", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Search = { kind?: string; q?: string; page?: string; view?: string };

/** The site's licensed images with credits, licences and uses; gaps; and page image choices. */
export default async function AdminMediaPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { session, access } = await requireAdminPage("media.manage");
  const params = await searchParams;
  const view = params.view === "gaps" || params.view === "pages" ? params.view : "library";
  const kind = (MEDIA_KINDS as readonly string[]).includes(params.kind ?? "") ? (params.kind as MediaKind) : undefined;
  const q = (params.q ?? "").slice(0, 60);
  const result = view === "library" ? await library({ kind, q, page: Number(params.page) || 1 }) : null;
  const found = view === "gaps" ? gaps() : [];
  const link = (to: number) => `/admin/media?${new URLSearchParams({ ...(kind ? { kind } : {}), ...(q ? { q } : {}), page: String(to) })}`;
  const tabs = [
    ["library", "Library"],
    ["gaps", "Missing images and alt text"],
    ["pages", "Page images"],
  ] as const;

  return (
    <AdminShell permissions={access.permissions} current="/admin/media" email={session.user.email}>
      <h1>Media</h1>
      <p className="mt-1 max-w-prose text-ink-2">Every image on the site is a licensed photo with a recorded credit. There are no uploads; you can choose which of these a place or state page uses.</p>
      <nav aria-label="Media views" className="mt-5 flex flex-wrap gap-2">
        {tabs.map(([id, label]) => (
          <Link key={id} prefetch={false} href={id === "library" ? "/admin/media" : `/admin/media?view=${id}`} aria-current={view === id ? "true" : undefined} className="chip">
            {label}
          </Link>
        ))}
      </nav>

      {result && (
        <>
          <form className="mt-5 flex flex-wrap items-end gap-3" aria-label="Find images">
            <div className="grid gap-1.5">
              <label htmlFor="media-q" className="text-sm font-semibold">
                Key, description or author
              </label>
              <input id="media-q" name="q" defaultValue={q} className="input" maxLength={60} />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="media-kind" className="text-sm font-semibold">
                Used for
              </label>
              <select id="media-kind" name="kind" defaultValue={kind ?? ""} className="input">
                <option value="">Everything</option>
                {MEDIA_KINDS.map((id) => (
                  <option key={id} value={id}>
                    {KIND_LABELS[id]}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary">Show</button>
          </form>
          <p className="mt-4 text-sm text-ink-2" role="status">
            {result.total} {result.total === 1 ? "image" : "images"}.
          </p>
          <ul className="mt-2 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {result.rows.map((image) => (
              <li key={image.key} className="card grid grid-cols-[6rem_1fr] gap-3 overflow-hidden p-2.5 text-xs">
                <div className="relative aspect-square overflow-hidden rounded-[var(--radius-md)] bg-surface-2">
                  <Image src={image.src} alt={image.alt} fill sizes="6rem" className="object-cover" />
                </div>
                <div className="grid min-w-0 content-start gap-1">
                  <p className="font-semibold break-all">{image.key}</p>
                  <p className="text-ink-2">{image.alt || "No alt text"}</p>
                  <p>
                    {image.author ?? "Unknown author"} · {image.license ?? "No licence recorded"}
                    {image.sourceUrl && (
                      <>
                        {" · "}
                        <a href={image.sourceUrl} className="link-text" rel="noopener noreferrer" target="_blank">
                          source
                        </a>
                      </>
                    )}
                  </p>
                  <details>
                    <summary className="cursor-pointer">Used on {image.usage.length}</summary>
                    <ul className="mt-1 grid gap-0.5">
                      {image.usage.map((use) => (
                        <li key={use.label}>
                          <Link prefetch={false} href={use.href} className="link-text">
                            {use.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              </li>
            ))}
          </ul>
          {result.pages > 1 && (
            <nav aria-label="Pages" className="mt-4 flex items-center gap-3 text-sm">
              {result.page > 1 && (
                <Link prefetch={false} href={link(result.page - 1)} className="chip">
                  Previous
                </Link>
              )}
              <span>
                Page {result.page} of {result.pages}
              </span>
              {result.page < result.pages && (
                <Link prefetch={false} href={link(result.page + 1)} className="chip">
                  Next
                </Link>
              )}
            </nav>
          )}
        </>
      )}

      {view === "gaps" &&
        (
          [
            ["missing-image", "Pages without their own image"],
            ["missing-alt", "Images without alt text"],
            ["missing-credit", "Images without a credit"],
          ] as const
        ).map(([id, label]) => {
          const rows = found.filter((gap) => gap.kind === id);
          return (
            <section key={id} aria-labelledby={`gap-${id}`} className="mt-6">
              <h2 id={`gap-${id}`} className="text-xl">
                {label} ({rows.length})
              </h2>
              {rows.length === 0 ? (
                <p className="mt-1 text-ink-2">None.</p>
              ) : (
                <ul className="mt-2 divide-y divide-line text-sm">
                  {rows.map((gap) => (
                    <li key={`${gap.label}-${gap.href}`} className="flex flex-wrap justify-between gap-2 py-2">
                      <Link prefetch={false} href={gap.href} className="link-text font-semibold">
                        {gap.label}
                      </Link>
                      <span className="text-ink-2">{gap.detail}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}

      {view === "pages" &&
        (
          [
            ["Places", destinations.map((item) => ({ href: `/admin/media/place/${item.slug}`, name: item.name }))],
            ["States and territories", states.map((item) => ({ href: `/admin/media/state/${item.slug}`, name: item.name }))],
          ] as const
        ).map(([label, pages]) => (
          <section key={label} className="mt-6">
            <h2 className="text-xl">{label}</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {pages.map((page) => (
                <li key={page.href}>
                  <Link prefetch={false} href={page.href} className="chip">
                    {page.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
    </AdminShell>
  );
}
