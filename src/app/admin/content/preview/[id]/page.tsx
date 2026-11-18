import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EncyclopediaArticle } from "@/components/community/EncyclopediaArticle";
import { requireAdminPage } from "@/features/admin/guard";
import { contentFor } from "@/features/community/content";
import { applyOverrides } from "@/features/community/targets";
import { getVersion, IMAGE_FIELD, pageState, parseTargetKey } from "@/features/content/cms";
import { STATUS_LABELS } from "@/features/content/workflow";
import { chosenImage } from "@/lib/images";

export const metadata: Metadata = { title: "Preview", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/**
 * How a version would look on the public encyclopedia page. Admins only (content.edit), never
 * cached, never indexed. The public page is unchanged until the version is published.
 */
export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage("content.edit");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const version = await getVersion(id);
  const target = version && parseTargetKey(version.target);
  const page = target && contentFor(target);
  if (!version || !target || !page) notFound();
  const { image } = await pageState(target);
  const source = applyOverrides(page.source, { ...(image ? { [IMAGE_FIELD]: image } : {}), ...version.fields }) as { tagline?: string; sources?: { label: string; url: string }[]; lastReviewed?: string; image?: unknown };
  const fallback = target.type === "place" ? (`destination:${target.id}` as const) : (`state:${target.id}` as const);

  return (
    <>
      <div className="border-b border-line bg-surface-2">
        <p className="container-x flex flex-wrap items-center justify-between gap-2 py-3 text-sm" role="note">
          <span>
            <strong>Preview:</strong> version {version.number} ({STATUS_LABELS[version.status]}) of {page.title}. Only admins can see this.
          </span>
          <Link prefetch={false} href={`/admin/content/${target.type}/${target.id}`} className="link-text">
            Back to the versions
          </Link>
        </p>
      </div>
      <EncyclopediaArticle
        preview
        target={target}
        title={page.title}
        summary={source.tagline ?? ""}
        source={source}
        path={page.path}
        imageKey={chosenImage(source.image, fallback)}
        referenceStem={target.type === "place" ? target.id : `state-${target.id}`}
        infobox={[["Version", `${version.number}, ${STATUS_LABELS[version.status].toLowerCase()}`]]}
        sources={source.sources ?? []}
        lastReviewed={source.lastReviewed ?? new Date().toISOString()}
      />
    </>
  );
}
