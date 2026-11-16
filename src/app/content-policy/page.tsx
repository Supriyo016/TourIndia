import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/ui/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Content policy", description: `How ${site.name} writes, labels and updates its guides.`, alternates: { canonical: "/content-policy" } };

export default function ContentPolicyPage() {
  return (
    <LegalPage
      title="Content policy"
      intro="How guides are written, labelled and corrected."
      sections={[
        { heading: "How guides are written", body: <p>Guides are original editorial summaries prepared with AI writing assistance and drawn from public reference sources, which are listed on destination, state, festival and story pages. They are not accounts of personal visits, and we do not publish invented traveller experiences.</p> },
        { heading: "How to read our labels", body: (
          <ul className="list-disc space-y-1 pl-5 text-ink-2">
            <li><strong>Editorial guide:</strong> our own summary and suggestions.</li>
            <li><strong>Estimate:</strong> a calculated or approximate figure, with its assumptions stated. Never a quote.</li>
            <li><strong>Sourced:</strong> a specific fact, such as a festival date, shown with its source.</li>
          </ul>
        ) },
        { heading: "Dates and updates", body: <p>Destination and state guides show when they were last updated. An update date does not mean every detail has been re-confirmed that day, so always check timings, fees, permits and safety advice with an official source.</p> },
        { heading: "Reviews and statistics", body: <p>We do not publish visitor numbers, ratings, awards or testimonials unless they are genuine and can be supported.</p> },
        { heading: "Reader stories", body: <p>Reader stories are reviewed before publication and represent the views of their authors.</p> },
        { heading: "Corrections", body: <p>If you find a mistake, please <Link className="link-text" href="/contact">tell us</Link>. Corrections are made as soon as they can be confirmed.</p> },
      ]}
    />
  );
}
