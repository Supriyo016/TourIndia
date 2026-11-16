import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/forms/Forms";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { ExternalLink, Notice, PageIntro } from "@/components/ui/primitives";
import { publishedSocials, site } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact Tour India",
  description: "Send corrections, suggestions and questions to Tour India.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const { email, phone, postalAddress } = site.contact;
  return (
    <>
      <PageIntro imageKey="destination:udaipur" crumbs={[{ label: "Contact" }]} eyebrow="Contact" title="Get in touch" lede="Corrections and suggestions are especially welcome." />
      <div className="container-x grid gap-10 py-10 lg:grid-cols-[3fr_2fr]">
        <section className="card p-6" aria-label="Contact form">
          <ContactForm />
          <p className="mt-4 text-sm text-muted">
            We use your details only to reply. See our <Link prefetch={false} href="/privacy" className="underline">privacy policy</Link>.
          </p>
        </section>
        <aside className="space-y-5">
          <Notice title="We can't help with bookings" tone="warn">
            Tour India doesn&apos;t sell travel, so we can&apos;t change or refund a booking. Please contact the company you booked with.
          </Notice>
          {(email || phone || postalAddress) && (
            <div className="card p-5">
              <h2 className="mb-2 text-xl">Other ways to reach us</h2>
              {email && <p><a className="link-text" href={`mailto:${email}`}>{email}</a></p>}
              {phone && <p><a className="link-text" href={`tel:${phone}`}>{phone}</a></p>}
              {postalAddress && <p className="text-ink-2">{postalAddress}</p>}
            </div>
          )}
          <div className="card p-5">
            <h2 className="mb-3 text-xl">Find us online</h2>
            <ul className="flex flex-wrap gap-2">
              {publishedSocials.map((social) => (
                <li key={social.id}>
                  <ExternalLink href={social.url} className="chip">
                    <BrandIcon id={social.id} className="size-4" /> {social.label}
                  </ExternalLink>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
