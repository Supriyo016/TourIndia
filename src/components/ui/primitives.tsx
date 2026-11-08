import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Compass } from "lucide-react";
import { getImage, type ImageKey } from "@/lib/images";
import { cn, serializeJsonLd } from "@/lib/utils";
import { site } from "@/config/site";

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  const all = [{ label: "Home", href: "/" }, ...items];
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.label,
            ...(item.href ? { item: `${site.url}${item.href}` } : {}),
          })),
        }}
      />
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
        {all.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="size-3.5" aria-hidden />}
            {item.href && index < all.length - 1 ? (
              <Link href={item.href} className="link-u hover:text-brand">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink-2">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  action,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  action?: React.ReactNode;
  as?: "h1" | "h2";
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
      <div className="min-w-0 max-w-3xl">
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <Tag>{title}</Tag>
        {lede && <p className="lede mt-2.5">{lede}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageIntro({
  crumbs,
  eyebrow,
  title,
  lede,
  children,
}: {
  crumbs: { label: string; href?: string }[];
  eyebrow?: string;
  title: string;
  lede?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-line bg-surface-2">
      <div className="container-x py-8 sm:py-12">
        <Breadcrumbs items={crumbs} />
        <div className="mt-4">
          {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
          <h1>{title}</h1>
          {lede && <p className="lede mt-3">{lede}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}

/** A licensed photo, or a quiet branded panel when none has been sourced. */
export function Photo({
  imageKey,
  sizes,
  className,
  priority,
  alt,
}: {
  imageKey: ImageKey;
  sizes: string;
  className?: string;
  priority?: boolean;
  alt?: string;
}) {
  const image = getImage(imageKey);
  if (!image) {
    return (
      <div className={cn("absolute inset-0 flex items-center justify-center bg-brand-soft text-brand", className)} aria-hidden>
        <Compass className="size-10 opacity-50" />
      </div>
    );
  }
  return (
    <Image
      src={image.src}
      alt={alt ?? image.alt}
      fill
      sizes={sizes}
      priority={priority}
      placeholder={image.blur ? "blur" : "empty"}
      blurDataURL={image.blur}
      className={cn("object-cover", className)}
    />
  );
}

export function PhotoCredit({ imageKey, className }: { imageKey: ImageKey; className?: string }) {
  const image = getImage(imageKey);
  if (!image) return null;
  return (
    <p className={cn("text-xs text-muted", className)}>
      Photo: {image.author},{" "}
      <a href={image.sourceUrl} className="underline" target="_blank" rel="noopener noreferrer">
        {image.license}
      </a>
    </p>
  );
}

export function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function Notice({
  title,
  children,
  tone = "info",
}: {
  title?: string;
  children: React.ReactNode;
  tone?: "info" | "warn";
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border-l-4 bg-surface-2 p-4 text-[0.97rem] text-ink-2",
        tone === "warn" ? "border-accent" : "border-brand",
      )}
    >
      {title && <p className="mb-0.5 font-semibold text-ink">{title}</p>}
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  children,
  art,
}: {
  title: string;
  children?: React.ReactNode;
  art?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 p-8 text-center">
      {art}
      <h3>{title}</h3>
      {children && <div className="max-w-md text-ink-2">{children}</div>}
    </div>
  );
}
