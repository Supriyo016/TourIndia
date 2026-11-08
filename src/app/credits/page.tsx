import type { Metadata } from "next";
import { ExternalLink, PageIntro } from "@/components/ui/primitives";
import videos from "@/data/generated/videos.json";
import { allImages } from "@/lib/images";

export const metadata: Metadata = {
  title: "Photo and data credits",
  description: "Attribution for the photographs, map data and open-source software used on Tour India.",
  alternates: { canonical: "/credits" },
};

const software = ["Next.js", "React", "Tailwind CSS", "Leaflet", "dnd kit", "Lucide icons", "Zod", "React Hook Form", "MongoDB Node.js driver"];

export default function CreditsPage() {
  const images = allImages().sort((a, b) => a.key.localeCompare(b.key));
  return (
    <>
      <PageIntro crumbs={[{ label: "Credits" }]} title="Photo and data credits" lede="Tour India depends on the generosity of photographers and open-data communities." />
      <div className="container-x space-y-12 py-10">
        <section id="map-data" aria-labelledby="map-title">
          <h2 id="map-title" className="mb-3">Maps and data</h2>
          <ul className="list-disc space-y-2 pl-5 text-ink-2">
            <li>
              State boundaries: <ExternalLink href="https://github.com/udit-001/india-maps-data" className="link-text">India Maps Data</ExternalLink>, a community collection curated from public sources, simplified for display. Boundaries are shown for navigation only and are not an authoritative depiction of India&apos;s external boundaries.
            </li>
            <li>
              Destination maps: <ExternalLink href="https://www.openstreetmap.org/copyright" className="link-text">© OpenStreetMap contributors</ExternalLink>, available under the Open Database Licence.
            </li>
            <li>
              Weather forecasts: <ExternalLink href="https://open-meteo.com/" className="link-text">Open-Meteo</ExternalLink>, CC BY 4.0.
            </li>
          </ul>
        </section>

        <section aria-labelledby="software">
          <h2 id="software" className="mb-3">Open-source software</h2>
          <p className="text-ink-2">Built with {software.join(", ")}. Each remains under its own licence.</p>
          <p className="mt-2 text-ink-2">The Fraunces, Figtree and Rubik Wet Paint typefaces are used under the SIL Open Font License.</p>
        </section>

        <section aria-labelledby="film">
          <h2 id="film" className="mb-3">Videos</h2>
          <ul className="list-disc space-y-1 pl-5 text-ink-2">
            {videos.map((video) => (
              <li key={video.slug}>
                {video.title}: {video.author},{" "}
                <ExternalLink href={video.sourceUrl} className="underline">{video.license}</ExternalLink>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="photos">
          <h2 id="photos" className="mb-1">Photographs</h2>
          <p className="mb-4 text-ink-2">{images.length} images, resized for the web, from Wikimedia Commons. Follow a licence link for full terms.</p>
          {images.length > 0 && (
            <div className="relative overflow-x-auto rounded-[var(--radius-lg)] border border-line">
              <table className="w-full min-w-[38rem] border-collapse bg-surface text-left text-sm">
                <thead className="bg-surface-2">
                  <tr>
                    <th scope="col" className="p-3">Subject</th>
                    <th scope="col" className="p-3">Author</th>
                    <th scope="col" className="p-3">Licence and source</th>
                  </tr>
                </thead>
                <tbody>
                  {images.map((image) => (
                    <tr key={image.key} className="border-t border-line align-top">
                      <td className="p-3">{image.alt}</td>
                      <td className="p-3 text-ink-2">{image.author}</td>
                      <td className="p-3">
                        <ExternalLink href={image.sourceUrl} className="underline">{image.license}</ExternalLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
