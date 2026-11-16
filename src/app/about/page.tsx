import type { Metadata } from "next";
import Link from "next/link";
import { ElephantCharacter } from "@/components/characters/Characters";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { ExternalLink, JsonLd, PageIntro } from "@/components/ui/primitives";
import { publishedSocials, site } from "@/config/site";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About Tour India",
  description: "Why Tour India exists, how it has developed, who owns it and what it commits to.",
  alternates: { canonical: "/about" },
};

const different = [
  ["It shows its working", "Costs and travel times are labelled as estimates, with the assumptions beside them."],
  ["It covers all of India", "All 28 states and 8 Union Territories are on the map, not only the well-known circuit."],
  ["It sells nothing", "There are no paid placements or booking commissions, so recommendations have no sales motive."],
  ["It respects your privacy", "Wishlists and trips stay in your browser. You don't need an account."],
];

const commitments = [
  ["Accuracy", "Destination and state guides carry the date they were last updated, and we link to sources. When something is wrong, tell us and we will fix it."],
  ["Responsible travel", "Guides include advice on low-impact travel and on respecting communities and sacred places."],
  ["Usability", "The site is built for phones, keyboards and screen readers as well as large displays."],
  ["Continuous improvement", "New guides and corrections are added over time."],
];

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: `About ${site.name}`,
          mainEntity: {
            "@type": "WebSite",
            name: site.name,
            url: site.url,
            founder: { "@type": "Person", name: site.owner.name, jobTitle: site.owner.designation, sameAs: publishedSocials.map((link) => link.url) },
          },
        }}
      />
      <PageIntro imageKey="hero:taj-mahal" crumbs={[{ label: "About Us" }]} eyebrow="About Us" title="A clearer way to find your way around India" />
      <div className="container-x py-10">
        <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
          <section aria-labelledby="story">
            <h2 id="story">Our story</h2>
            <div className="prose-guide mt-3">
              <p>
                Planning a trip raises a long list of questions: when to go, where to stay, how to get there and what you might otherwise miss. Tour India began with the aim of gathering those answers in one place.
              </p>
              <p>
                The first version, a small static website created as a collaborative project, was committed to GitHub in May 2022. It had a strong look but little depth. The current platform rebuilds that idea, keeping its identity and adding the substance it lacked.
              </p>
            </div>
          </section>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <section className="card p-5" aria-labelledby="vision">
              <h2 id="vision" className="text-xl">Our vision</h2>
              <p className="mt-1.5 text-ink-2">To make India&apos;s destinations, culture and heritage easier to discover.</p>
            </section>
            <section className="card p-5" aria-labelledby="mission">
              <h2 id="mission" className="text-xl">Our mission</h2>
              <p className="mt-1.5 text-ink-2">To help people explore places and plan meaningful journeys with information they can trust.</p>
            </section>
          </div>
        </div>

        <section className="mt-14" aria-labelledby="journey">
          <h2 id="journey" className="mb-6">Our journey</h2>
          <ol className="relative space-y-6 border-l-2 border-dashed border-accent pl-6">
            {site.milestones.map((milestone) => (
              <li key={milestone.date} className="relative">
                <span aria-hidden className="absolute top-1.5 -left-[1.95rem] size-3 rounded-full bg-accent ring-4 ring-bg" />
                <p className="text-sm font-semibold text-accent-ink">{formatDate(milestone.date)}</p>
                <h3 className="text-lg">{milestone.title}</h3>
                <p className="max-w-[65ch] text-ink-2">{milestone.detail}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-muted">
            These dates come from the project&apos;s{" "}
            <ExternalLink href={`${site.repositoryUrl}/commits/master`} className="underline">public commit history</ExternalLink>.
          </p>
        </section>

        <section className="mt-14" aria-labelledby="founder">
          <div className="card flex flex-wrap items-center gap-6 bg-brand-soft p-6 sm:p-8">
            <ElephantCharacter className="h-28 w-auto shrink-0" />
            <div className="min-w-0 flex-1 basis-72">
              <p className="eyebrow mb-1">{site.owner.designation}</p>
              <h2 id="founder">{site.owner.name}</h2>
              <p className="mt-2 max-w-[62ch] text-ink-2">
                {site.owner.name} owns and maintains Tour India. The source code is available on{" "}
                <ExternalLink href={site.repositoryUrl} className="link-text">GitHub</ExternalLink>.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-14 grid gap-12 lg:grid-cols-2">
          <section aria-labelledby="different">
            <h2 id="different" className="mb-4">What makes Tour India different</h2>
            <dl className="space-y-4">
              {different.map(([title, body]) => (
                <div key={title}>
                  <dt className="font-semibold">{title}</dt>
                  <dd className="text-ink-2">{body}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section aria-labelledby="commitment">
            <h2 id="commitment" className="mb-4">Our commitment</h2>
            <dl className="space-y-4">
              {commitments.map(([title, body]) => (
                <div key={title}>
                  <dt className="font-semibold">{title}</dt>
                  <dd className="text-ink-2">{body}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <section className="mt-14" aria-labelledby="connect">
          <h2 id="connect" className="mb-3">Contact and connect</h2>
          <p className="max-w-[62ch] text-ink-2">
            Spotted a mistake or have a suggestion? <Link prefetch={false} href="/contact" className="link-text">Send a message</Link>, or find us here:
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {publishedSocials.map((social) => (
              <li key={social.id}>
                <ExternalLink href={social.url} className="chip">
                  <BrandIcon id={social.id} className="size-4" /> {social.label}
                </ExternalLink>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
