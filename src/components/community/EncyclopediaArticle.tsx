import Link from "next/link";
import { BookOpenText } from "lucide-react";
import { Breadcrumbs, ExternalLink, Photo, PhotoCredit } from "@/components/ui/primitives";
import { EDITABLE_FIELDS, fieldToText, readField, type Target } from "@/features/community/targets";
import { getImage, referenceImages, type ImageKey } from "@/lib/images";
import { ReferenceGallery } from "@/components/encyclopedia/ReferenceGallery";
import { CommunityPanel } from "./CommunityPanel";
import { SuggestEdit } from "./SuggestEdit";

interface Props {
  target: Target;
  title: string;
  summary: string;
  /** The content with approved edits already applied. */
  source: object;
  path: string;
  guide?: { href: string; label: string };
  imageKey?: ImageKey;
  /** Reference images live at `ref:<stem>-1` onwards. */
  referenceStem?: string;
  infobox: [string, React.ReactNode][];
  extra?: React.ReactNode;
  sources: { label: string; url: string }[];
  lastReviewed: string;
}

/** One encyclopedia entry: an infobox, editable sections, sources, and the community panel. */
export function EncyclopediaArticle({ target, title, summary, source, path, guide, imageKey, referenceStem, infobox, extra, sources, lastReviewed }: Props) {
  const fields = EDITABLE_FIELDS[target.type] ?? {};
  const lead = imageKey ? getImage(imageKey) : undefined;
  const references = referenceStem
    ? referenceImages(referenceStem).map((image) => ({
        src: image.src,
        width: image.width,
        height: image.height,
        blur: image.blur,
        caption: image.alt,
        author: image.author,
        license: image.license,
        sourceUrl: image.sourceUrl,
      }))
    : [];
  return (
    <article className="container-x py-8">
      <Breadcrumbs items={[{ label: "Encyclopedia", href: "/encyclopedia" }, { label: title }]} />
      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div>
          <h1 className="flex items-center gap-3">
            <BookOpenText className="size-8 shrink-0 text-brand" aria-hidden /> {title}
          </h1>
          <p className="mt-3 max-w-prose text-lg text-ink-2">{summary}</p>
          {guide && (
            <Link prefetch={false} href={guide.href} className="link-text mt-2 inline-block">
              {guide.label}
            </Link>
          )}

          {Object.entries(fields).map(([field, { label, kind }]) => {
            const value = readField(source, field);
            const empty = value === undefined || value === "" || (Array.isArray(value) && !value.length);
            return (
              <section key={field} id={field.replace(".", "-")} aria-labelledby={`${field.replace(".", "-")}-title`} className="mt-8 border-t border-line pt-6">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h2 id={`${field.replace(".", "-")}-title`} className="text-2xl">
                    {label}
                  </h2>
                  <SuggestEdit target={target} field={field} label={label} kind={kind} current={fieldToText(value, kind)} />
                </div>
                {empty ? (
                  <p className="text-muted">Nothing written here yet. If you know this well, suggest an edit.</p>
                ) : kind === "list" ? (
                  <ul className="list-disc space-y-1 pl-5 text-ink-2">
                    {(value as string[]).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : kind === "paragraphs" ? (
                  <div className="prose-like space-y-3 text-ink-2">
                    {(value as string[]).map((paragraph) => (
                      <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-ink-2">{String(value)}</p>
                )}
              </section>
            );
          })}

          {extra}

          <ReferenceGallery title={title} items={references} />

          <section aria-labelledby="sources-title" className="mt-8 border-t border-line pt-6">
            <h2 id="sources-title" className="text-2xl">Sources</h2>
            <ul className="mt-3 space-y-1 text-sm">
              {sources.map((item) => (
                <li key={item.url}>
                  <ExternalLink href={item.url} className="link-text">
                    {item.label}
                  </ExternalLink>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-muted">
              Last reviewed {new Date(lastReviewed).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}. Community corrections appear once an admin approves them.
            </p>
          </section>
        </div>

        <aside aria-label={`${title} at a glance`} className="lg:sticky lg:top-[calc(var(--header-h,6.5rem)+1rem)] lg:self-start">
          <div className="card overflow-hidden">
            {imageKey && (
              <figure>
                <div className="relative aspect-[4/3]">
                  <Photo imageKey={imageKey} sizes="(min-width: 1024px) 20rem, 92vw" />
                </div>
                {lead && <figcaption className="border-b border-line px-4 py-2 text-center text-sm text-ink-2">{lead.alt}</figcaption>}
              </figure>
            )}
            <dl className="divide-y divide-line text-sm">
              {infobox.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[7rem_1fr] gap-2 px-4 py-2.5">
                  <dt className="font-semibold text-muted">{label}</dt>
                  <dd className="text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          {imageKey && <PhotoCredit imageKey={imageKey} className="mt-2" />}
        </aside>
      </div>

      <CommunityPanel target={target} title={title} path={path} />
    </article>
  );
}
