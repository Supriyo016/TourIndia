import type { Metadata } from "next";
import Link from "next/link";
import { Accessibility, Ambulance, BedDouble, Bus, CloudSun, FileCheck2, Hospital, Phone, Plane, Route, ShieldAlert, TrainFront, UserRound, UtensilsCrossed } from "lucide-react";
import { GuideCharacter } from "@/components/characters/Characters";
import { ExternalLink, Notice, PageIntro } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Travel services and assistance",
  description: "Practical help for travelling in India: transport, stays, permits, weather, safety, emergency numbers and accessibility.",
  alternates: { canonical: "/services" },
};

const services = [
  { Icon: BedDouble, title: "Accommodation", body: "Every destination guide has a section on where to stay and what each area suits.", href: "/discover", cta: "Open a guide" },
  { Icon: TrainFront, title: "Trains", body: "How classes, quotas and waitlists work, and how to read a ticket.", href: "/stories/how-to-book-and-read-indian-train-tickets", cta: "Read the guide" },
  { Icon: Plane, title: "Flights", body: "Each guide names its nearest airports. Book directly with airlines or a booking site you trust.", href: "/bookings", cta: "Where to book" },
  { Icon: Bus, title: "Buses", body: "State transport corporations and private operators cover most routes. Local details are in each guide's Getting There section.", href: "/discover", cta: "Open a guide" },
  { Icon: Route, title: "Road trips", body: "The planner estimates road time between stops and shows the route on the map.", href: "/planner", cta: "Open the planner" },
  { Icon: UtensilsCrossed, title: "Eating out", body: "Regional dishes, and where to try them, in the food explorer and in each guide.", href: "/culture/food", cta: "Food explorer" },
  { Icon: UserRound, title: "Local guides", body: "Tourism departments and the Ministry of Tourism approve guides at many major sites. Ask to see an official licence before hiring one.", href: "/bookings", cta: "Official sources" },
  { Icon: CloudSun, title: "Weather", body: "Every guide shows seasonal advice and a live five-day forecast.", href: "/discover", cta: "Open a guide" },
  { Icon: FileCheck2, title: "Permits", body: "Parts of the Northeast, Ladakh, the Andamans and Lakshadweep need permits. Requirements differ for Indian and foreign visitors.", href: "/stories/permits-for-restricted-areas", cta: "Permits explained" },
  { Icon: Accessibility, title: "Accessibility", body: "Each guide says plainly where steps, terrain or altitude make access difficult. Call ahead to confirm specifics.", href: "/discover", cta: "Open a guide" },
];

export default function ServicesPage() {
  return (
    <>
      <PageIntro crumbs={[{ label: "Services" }]} eyebrow="Travel assistance" title="Help for the practical side" lede="Tour India is an information service. Here is where to find answers on getting around, staying safe and what to do when something goes wrong." />
      <div className="container-x py-10">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ Icon, title, body, href, cta }) => (
            <li key={title} className="card card-hover flex flex-col p-5">
              <Icon className="size-6 text-accent-ink" aria-hidden />
              <h2 className="mt-2 text-xl">{title}</h2>
              <p className="mt-1 flex-1 text-[0.97rem] text-ink-2">{body}</p>
              <Link href={href} className="link-text mt-3">{cta}</Link>
            </li>
          ))}
        </ul>

        <section id="safety" className="mt-14" aria-labelledby="safety-title">
          <div className="mb-5 flex items-center gap-5">
            <GuideCharacter className="hidden h-28 w-auto shrink-0 sm:block" />
            <div>
              <p className="eyebrow mb-1">If something goes wrong</p>
              <h2 id="safety-title">Safety and emergency help</h2>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <div className="card p-5">
              <h3 className="flex items-center gap-2"><ShieldAlert className="size-5 text-danger" aria-hidden /> Emergency</h3>
              <p className="mt-2 font-display text-4xl"><a href="tel:112" className="hover:text-brand">112</a></p>
              <p className="mt-1 text-[0.97rem] text-ink-2">India&apos;s single emergency number for police, fire and ambulance services.</p>
            </div>
            <div className="card p-5">
              <h3 className="flex items-center gap-2"><Phone className="size-5 text-accent-ink" aria-hidden /> Tourist helpline</h3>
              <p className="mt-2 font-display text-3xl"><a href="tel:18001111363" className="hover:text-brand">1800-11-1363</a></p>
              <p className="mt-1 text-[0.97rem] text-ink-2">The Ministry of Tourism&apos;s multilingual helpline (short code 1363).</p>
            </div>
            <div className="card p-5">
              <h3 className="flex items-center gap-2"><Hospital className="size-5 text-accent-ink" aria-hidden /> Medical care</h3>
              <p className="mt-2 text-[0.97rem] text-ink-2">
                Ask your hotel for the nearest hospital, or search a maps app for &ldquo;hospital&rdquo;. In remote areas and at altitude, know your nearest facility before you set out. Carry travel insurance that covers evacuation.
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-[0.97rem] font-medium"><Ambulance className="size-4" aria-hidden /> Call 112 for an ambulance.</p>
            </div>
          </div>
          <div className="mt-5">
            <Notice>
              Check these numbers again before you travel. Visitors from abroad should also check their government&apos;s travel advice and note their embassy&apos;s contact details. Official information is available from the{" "}
              <ExternalLink href="https://www.tourism.gov.in/" className="link-text">Ministry of Tourism</ExternalLink>.
            </Notice>
          </div>
        </section>
      </div>
    </>
  );
}
