import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { DraftEditor, StartDraft, VersionActions, type FieldDef, type VersionRow } from "@/components/admin/content/ContentActions";
import { Breadcrumbs } from "@/components/ui/primitives";
import { requireAdminPage } from "@/features/admin/guard";
import { contentFor } from "@/features/community/content";
import type { Target } from "@/features/community/targets";
import { CMS_TYPES, editorText, pageState, textFieldsFor, versionsFor } from "@/features/content/cms";
import { STATUS_LABELS } from "@/features/content/workflow";

export const metadata: Metadata = { title: "Edit page", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const when = (value: Date) => value.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });

/** One page in the CMS: what's live, the draft being edited, and every version with its workflow steps. */
export default async function ContentPage({ params, searchParams }: { params: Promise<{ type: string; slug: string }>; searchParams: Promise<{ edit?: string }> }) {
  const { session, access } = await requireAdminPage("content.edit");
  const { type, slug } = await params;
  const { edit } = await searchParams;
  if (!CMS_TYPES.includes(type as Target["type"])) notFound();
  const target = { type, id: slug } as Target;
  const page = contentFor(target);
  if (!page) notFound();

  const [versions, state] = await Promise.all([versionsFor(target), pageState(target)]);
  const defs: FieldDef[] = Object.entries(textFieldsFor(target.type)).map(([field, def]) => ({ field, label: def.label, kind: def.kind }));
  const permissions = [...access.permissions];
  const base = `/admin/content/${type}/${slug}`;
  const editing = versions.find((version) => version._id === edit && version.status === "draft");
  const liveNumber = state.item?.publishedNumber ?? null;
  const rows: VersionRow[] = versions.map((version) => ({
    id: version._id,
    number: version.number,
    status: version.status,
    note: version.note,
    source: version.source,
    author: version.createdByEmail,
    updatedAt: version.updatedAt.toISOString(),
    publishAt: version.publishAt?.toISOString(),
    publishedAt: version.publishedAt?.toISOString(),
    changed: Object.keys(version.fields),
    reviewNote: version.reviewNote,
    basedOn: version.basedOn,
  }));
  const labelOf = (field: string) => defs.find((def) => def.field === field)?.label ?? field;

  return (
    <AdminShell permissions={access.permissions} current="/admin/content" email={session.user.email}>
      <Breadcrumbs items={[{ label: "Content", href: "/admin/content" }, { label: page.title }]} />
      <h1 className="mt-3">{page.title}</h1>
      <p className="mt-1 text-ink-2">
        {liveNumber ? `Version ${liveNumber} is live.` : "Showing the guide's own text; no edits are published."}{" "}
        <Link prefetch={false} href={page.path} className="link-text">
          Open the public page
        </Link>
        {state.live && Object.keys(state.live).length > 0 && ` · Changed from the guide: ${Object.keys(state.live).map(labelOf).join(", ")}.`}
      </p>

      {editing ? (
        <>
          {editing.basedOn !== liveNumber && (
            <p className="mt-4 rounded-[var(--radius-md)] border border-line bg-surface-2 p-3 text-sm" role="note">
              This draft was started from {editing.basedOn ? `version ${editing.basedOn}` : "the guide's own text"}, but {liveNumber ? `version ${liveNumber}` : "the guide's own text"} is live now. Check you aren&apos;t undoing a newer change.
            </p>
          )}
          {editing.reviewNote && (
            <p className="mt-4 text-sm" role="note">
              <strong>Reviewer&apos;s note:</strong> {editing.reviewNote}
            </p>
          )}
          <DraftEditor key={editing._id} id={editing._id} number={editing.number} defs={defs} initial={editorText(target, editing.fields)} note={editing.note} permissions={permissions} preview={`/admin/content/preview/${editing._id}`} />
        </>
      ) : (
        <div className="mt-6">
          <StartDraft type={type} slug={slug} base={base} />
        </div>
      )}

      <section aria-labelledby="history-title" className="mt-8">
        <h2 id="history-title" className="text-xl">
          Versions
        </h2>
        {rows.length === 0 ? (
          <p className="mt-2 text-ink-2">No versions yet. Approved community suggestions also appear here.</p>
        ) : (
          <ol className="mt-3 grid gap-3">
            {rows.map((row) => (
              <li key={row.id} className="card grid gap-2 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold">
                    Version {row.number} · <span className={row.status === "published" ? "text-accent-ink" : ""}>{STATUS_LABELS[row.status]}</span>
                    {row.publishAt && <span className="font-normal text-ink-2"> · goes live {when(new Date(row.publishAt))}</span>}
                  </p>
                  <p className="text-xs text-ink-2">
                    {row.source === "community" ? "Community suggestion" : row.source === "restore" ? "Restored" : "Editor"} · {row.author} · updated {when(new Date(row.updatedAt))}
                  </p>
                </div>
                {row.note && <p className="text-sm">{row.note}</p>}
                <p className="text-xs text-ink-2">{row.changed.length ? `Changes: ${row.changed.map(labelOf).join(", ")}` : "No changes from the guide's own text."}</p>
                <VersionActions row={row} permissions={permissions} base={base} />
              </li>
            ))}
          </ol>
        )}
      </section>
    </AdminShell>
  );
}
