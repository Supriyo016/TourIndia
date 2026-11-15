import type { Metadata } from "next";
import Link from "next/link";
import { CameraCharacter } from "@/components/characters/Characters";
import { GalleryBrowser, type GalleryItem } from "@/components/gallery/GalleryBrowser";
import { ExternalLink, PageIntro } from "@/components/ui/primitives";
import { destinations, getState, states } from "@/data";
import { festivals } from "@/data/festivals";
import videos from "@/data/generated/videos.json";
import { tourVideo } from "@/data/tour-video";
import { TourVideo } from "@/components/ui/TourVideo";
import { allImages } from "@/lib/images";
import type { CategoryId } from "@/types/content";

export const metadata: Metadata = {
  title: "Photo gallery",
  description: "Openly licensed photographs of India's landscapes, heritage, wildlife and festivals, filterable by state and subject.",
  alternates: { canonical: "/gallery" },
};

function subjectFor(categories: CategoryId[]): string {
  if (categories.some((id) => id === "wildlife" || id === "national-parks")) return "Wildlife";
  if (categories.some((id) => ["forts-palaces", "monuments", "temples-heritage"].includes(id))) return "Heritage";
  if (categories.some((id) => ["mountains", "beaches", "lakes", "waterfalls", "hill-stations"].includes(id))) return "Landscape";
  return "Culture";
}

function buildItems(): GalleryItem[] {
  return allImages().flatMap(({ key, ...image }): GalleryItem[] => {
    const [type, id = ""] = key.split(":");
    const base = {
      src: image.src,
      width: image.width,
      height: image.height,
      blur: image.blur,
      alt: image.alt,
      author: image.author,
      license: image.license,
      sourceUrl: image.sourceUrl,
    };
    if (type === "destination" || type === "gallery") {
      const destination = destinations.find((item) => item.slug === id.replace(/-2$/, ""));
      if (!destination) return [];
      return [{ ...base, state: getState(destination.stateSlug)?.name ?? "", stateSlug: destination.stateSlug, category: subjectFor(destination.categories), href: `/destinations/${destination.slug}` }];
    }
    if (type === "festival") {
      const festival = festivals.find((item) => item.slug === id);
      if (!festival) return [];
      return [{ ...base, state: "", stateSlug: festival.stateSlugs[0] ?? "", category: "Festivals", href: `/culture/festivals/${festival.slug}` }];
    }
    return [];
  });
}

export default function GalleryPage() {
  const items = buildItems();
  const used = new Set(items.map((item) => item.stateSlug));
  return (
    <>
      <PageIntro crumbs={[{ label: "Gallery" }]} eyebrow="Gallery" title="India in pictures" lede="Openly licensed photographs by photographers credited on each image. Select any picture to view it full-screen.">
        <CameraCharacter className="mt-4 h-16 w-auto" />
      </PageIntro>
      <div className="container-x py-8">
        <GalleryBrowser
          items={items}
          categories={["Landscape", "Heritage", "Wildlife", "Culture", "Festivals"]}
          stateOptions={states.filter((state) => used.has(state.slug)).sort((a, b) => a.name.localeCompare(b.name)).map(({ slug, name }) => ({ slug, name }))}
        />

        <section className="mt-14" aria-labelledby="videos">
          <h2 id="videos" className="mb-5">Travel videos</h2>
          <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <li className="card overflow-hidden">
              <TourVideo size="fill" />
              <div className="p-4">
                <h3 className="text-lg">{tourVideo.title}</h3>
                <p className="mt-1 text-xs text-muted">From Tour India</p>
              </div>
            </li>
            {videos.map((video) => (
              <li key={video.slug} className="card overflow-hidden">
                <video controls preload="none" poster={video.poster} className="aspect-video w-full bg-black object-cover">
                  <source src={video.src} type="video/webm" />
                  Your browser can&apos;t play this video.
                </video>
                <div className="p-4">
                  <h3 className="text-lg">
                    <Link href={video.href} className="link-text">{video.title}</Link>
                  </h3>
                  <p className="mt-1 text-xs text-muted">
                    {video.duration} seconds · {video.author},{" "}
                    <ExternalLink href={video.sourceUrl} className="underline">{video.license}</ExternalLink>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
