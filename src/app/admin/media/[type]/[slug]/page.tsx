import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ImagePicker } from "@/components/admin/media/ImagePicker";
import { Breadcrumbs } from "@/components/ui/primitives";
import { getDestination, getState } from "@/data";
import { requireAdminPage } from "@/features/admin/guard";
import { pageImage } from "@/features/content/cms";
import { candidatesFor, defaultImage } from "@/features/media/library";
import { getImage } from "@/lib/images";

export const metadata: Metadata = { title: "Page image", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Which licensed photo a place or state page uses. */
export default async function PageImagePage({ params }: { params: Promise<{ type: string; slug: string }> }) {
  const { session, access } = await requireAdminPage("media.manage");
  const { type, slug } = await params;
  const name = type === "place" ? getDestination(slug)?.name : type === "state" ? getState(slug)?.name : undefined;
  if (!name) notFound();
  const target = { type: type as "place" | "state", id: slug };
  const fallback = defaultImage(target);
  const current = await pageImage(target, fallback);
  const options = [...new Set([current, ...candidatesFor(target)])].flatMap((key) => {
    const image = getImage(key);
    return image ? [{ key, src: image.src, alt: image.alt, credit: `${image.author ?? "Unknown"} · ${image.license ?? "licence not recorded"}` }] : [];
  });
  const publicPath = type === "place" ? `/destinations/${slug}` : `/encyclopedia/states/${slug}`;

  return (
    <AdminShell permissions={access.permissions} current="/admin/media" email={session.user.email}>
      <Breadcrumbs items={[{ label: "Media", href: "/admin/media?view=pages" }, { label: name }]} />
      <h1 className="mt-3">Image for {name}</h1>
      <p className="mt-1 max-w-prose text-ink-2">
        {getImage(fallback) ? `The page's own image is ${fallback}.` : "This page has no image of its own, so it shows a fallback."} The choice is used on the {type === "place" ? "guide and encyclopedia entry" : "encyclopedia entry"} and recorded in the audit log.{" "}
        <Link prefetch={false} href={publicPath} className="link-text">
          Open the page
        </Link>
      </p>
      <ImagePicker target={target} current={current} fallback={fallback} options={options} />
    </AdminShell>
  );
}
