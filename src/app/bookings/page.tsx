import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink as ExternalIcon, Hotel, Landmark, Plane, ShieldCheck, TrainFront } from "lucide-react";
import { BookingWizard, type BookingPlace } from "@/components/bookings/BookingWizard";
import { ExternalLink, Notice, PageIntro } from "@/components/ui/primitives";
import { destinations, getState } from "@/data";

export const metadata: Metadata = {
  title: "Where to book",
  description: "Official sites for booking trains, visas and monuments in India. Tour India does not take bookings.",
  alternates: { canonical: "/bookings" },
};

const groups = [
  {
    title: "Trains",
    Icon: TrainFront,
    links: [{ label: "IRCTC", href: "https://www.irctc.co.in/", note: "Indian Railways' official ticketing site." }],
    help: { label: "How to book and read train tickets", href: "/stories/how-to-book-and-read-indian-train-tickets" },
  },
  {
    title: "Monuments and museums",
    Icon: Landmark,
    links: [{ label: "Archaeological Survey of India", href: "https://asi.nic.in/", note: "Information on centrally protected monuments, including ticketing." }],
    help: { label: "Browse World Heritage Sites", href: "/culture/heritage" },
  },
  {
    title: "Entering India",
    Icon: ShieldCheck,
    links: [{ label: "Indian e-Visa portal", href: "https://indianvisaonline.gov.in/evisa/tvoa.html", note: "The Bureau of Immigration's official e-Visa site." }],
    help: { label: "Read about restricted-area permits", href: "/stories/permits-for-restricted-areas" },
  },
  {
    title: "Tourism information",
    Icon: Plane,
    links: [
      { label: "Ministry of Tourism", href: "https://www.tourism.gov.in/", note: "The Government of India's tourism ministry." },
      { label: "Incredible India", href: "https://www.incredibleindia.gov.in/", note: "The government's official tourism campaign site." },
    ],
    help: { label: "Find state tourism sites", href: "/explore" },
  },
];

const range = ([min, max]: [number, number]) => ({ min, max });
const places: BookingPlace[] = destinations
  .map(({ slug, name, stateSlug, budget }) => ({ slug, name, state: getState(stateSlug)?.name ?? "", budget: { budget: range(budget.budget), midRange: range(budget.midRange), comfort: range(budget.comfort) } }))
  .sort((a, b) => a.name.localeCompare(b.name));

export default function BookingsPage() {
  return (
    <>
      <PageIntro imageKey="unesco:chhatrapati-shivaji-terminus-formerly-victoria-terminus" crumbs={[{ label: "Bookings" }]} eyebrow="Bookings" title="Where to book" lede="We don't sell tickets, rooms or tours. This page points you to the official places to book for yourself." />
      <div className="container-x space-y-8 py-10">
        <Notice title="Tour India is not a travel agent" tone="warn">
          We are not a registered travel agent, tour operator, booking provider or payment processor. We never ask for card details, and we can&apos;t change or refund a booking made elsewhere. Links below leave this site, and we earn no commission from them.
        </Notice>

        <section aria-labelledby="request-title">
          <h2 id="request-title" className="mb-2">Ask us to help plan</h2>
          <p className="mb-5 max-w-prose text-ink-2">Tell us what you need and we&apos;ll reply by email with suggestions and the official places to book. It&apos;s free, and you can track requests from your account.</p>
          <BookingWizard places={places} />
        </section>

        <ul className="grid gap-5 md:grid-cols-2">
          {groups.map(({ title, Icon, links, help }) => (
            <li key={title} className="card p-5">
              <h2 className="flex items-center gap-2.5 text-xl"><Icon className="size-5 text-accent-ink" aria-hidden /> {title}</h2>
              <ul className="mt-3 space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <ExternalLink href={link.href} className="link-text inline-flex items-center gap-1.5">
                      {link.label} <ExternalIcon className="size-3.5" aria-hidden />
                    </ExternalLink>
                    <p className="text-[0.97rem] text-ink-2">{link.note}</p>
                  </li>
                ))}
              </ul>
              <Link prefetch={false} href={help.href} className="mt-3 inline-block text-[0.95rem] underline">{help.label}</Link>
            </li>
          ))}
        </ul>

        <section className="card flex flex-wrap items-center gap-5 p-6" aria-labelledby="stays">
          <Hotel className="size-8 text-accent-ink" aria-hidden />
          <div className="min-w-0 flex-1 basis-72">
            <h2 id="stays" className="text-xl">Hotels and stays</h2>
            <p className="mt-1 text-ink-2">
              Each guide suggests areas to stay. Compare on the booking site you already trust, and check the cancellation terms before you pay. State tourism corporations also run their own hotels in many places.
            </p>
          </div>
          <Link prefetch={false} href="/discover" className="btn btn-outline">Find a guide</Link>
        </section>
      </div>
    </>
  );
}
