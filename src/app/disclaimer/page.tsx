import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/ui/LegalPage";
import { ESTIMATE_ASSUMPTIONS } from "@/features/itinerary/generate";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Disclaimer", description: `What ${site.name}'s information, estimates and links do and do not represent.`, alternates: { canonical: "/disclaimer" } };

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer"
      intro="Please read this before relying on anything you find here."
      sections={[
        { heading: "General information only", body: <p>Guides are general information and not professional, medical, legal or safety advice. Conditions such as weather, security, access, permits, opening days and transport can change without notice.</p> },
        { id: "estimates", heading: "Estimated costs and times", body: (
          <>
            <p>Every cost and travel time on this site is an estimate. They are not quotes, live prices or guarantees of availability. The trip planner uses these assumptions:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-2">
              {ESTIMATE_ASSUMPTIONS.map((line) => <li key={line}>{line}</li>)}
            </ul>
          </>
        ) },
        { id: "bookings", heading: "External bookings", body: <p>{site.name} does not take bookings or payments. Links to booking and government sites take you to independent services with their own terms. We receive no commission from them. See <Link className="link-text" href="/bookings">where to book</Link>.</p> },
        { heading: "Yatri, the AI assistant", body: <p>Yatri is an automated assistant. It works from this site&apos;s guides, but its replies can be incomplete or wrong. It can&apos;t make bookings. Check anything important, especially permits, safety and health, with an official source.</p> },
        { heading: "Holiday calendar", body: <p>The calendar lists fixed national holidays and days from Government of India lists. States add their own holidays, and dates that depend on the moon can change.</p> },
        { heading: "Maps", body: <p>Maps are for navigation only and are not an authoritative depiction of India&apos;s external boundaries.</p> },
        { heading: "Trade marks", body: <p>Names and marks of third parties belong to their owners. Mentioning them does not imply any affiliation. {site.name} is not affiliated with the Government of India or any state tourism department.</p> },
        { heading: "Safety", body: <p>Check current official advice before travelling, especially to border areas, high altitudes or regions with security advisories.</p> },
      ]}
    />
  );
}
