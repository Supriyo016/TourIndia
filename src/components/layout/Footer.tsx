import Link from "next/link";
import { ArrowUp, Phone } from "lucide-react";
import { footerLinks } from "@/config/navigation";
import { publishedSocials, site } from "@/config/site";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { ExternalLink } from "@/components/ui/primitives";
import { FooterScene } from "@/components/scenes/FooterScene";
import { KolkataSkyline } from "@/components/scenes/KolkataSkyline";
import { CookieSettingsLink } from "./CookieConsent";
import { Wordmark } from "./Wordmark";

export function Footer() {
  return (
    <footer className="no-print bg-[#0a161b] text-[#d8e6e6]">
      {/* The heavy part (scene, links, skyline) is laid out only when it comes near the screen. The back-to-top button stays outside so it always shows. */}
      <div className="footer-deferred">
        <FooterScene />

        <div className="container-x grid gap-10 pt-12 pb-4 lg:grid-cols-[1.5fr_3fr]">
          <div>
            <Wordmark className="text-[2.1rem]" onDark />
            <p className="mt-3 max-w-sm text-[0.97rem]">
              An independent travel guide. Tour India does not sell tours, take
              bookings or process payments.
            </p>
            <p className="mt-4 text-sm">
              {site.owner.designation}:{" "}
              <span className="font-semibold text-white">
                {site.owner.name}
              </span>
            </p>

            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Social media">
              {publishedSocials.map((social) => (
                <li key={social.id}>
                  <ExternalLink
                    href={social.url}
                    className="group relative flex size-11 items-center justify-center rounded-[var(--radius-md)] border border-white/25 text-white transition-all hover:-translate-y-0.5 hover:border-[#f2a33c] hover:text-[#f2a33c]"
                  >
                    <BrandIcon id={social.id} className="size-[1.15rem]" />
                    <span className="sr-only">{social.label}</span>
                  </ExternalLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerLinks.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className="font-sans text-sm font-bold tracking-wider text-white uppercase">
                  {group.title}
                </h2>
                <ul className="mt-3 space-y-0.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        prefetch={false}
                        href={link.href}
                        className="link-u inline-flex min-h-8 items-center text-[0.97rem] hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  {group.title === "Legal" && (
                    <li>
                      <CookieSettingsLink />
                    </li>
                  )}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="container-x">
          <KolkataSkyline />
        </div>
      </div>

      {/* The helpline and copyright rows are short, so they're always laid out (and always checkable). */}
      <div>
        <div className="border-t border-white/15">
          <div className="container-x flex flex-wrap items-center gap-x-6 gap-y-1 py-4 text-sm">
            <span className="inline-flex items-center gap-2 font-semibold text-white">
              <Phone className="size-4" aria-hidden /> In India
            </span>
            <span>
              Emergency:{" "}
              <a className="font-semibold text-white underline" href="tel:112">
                112
              </a>
            </span>
            <span>
              Ministry of Tourism helpline:{" "}
              <a
                className="font-semibold text-white underline"
                href="tel:18001111363"
              >
                1800-11-1363
              </a>
            </span>
            <Link
              prefetch={false}
              href="/services#safety"
              className="underline"
            >
              More safety information
            </Link>
          </div>
        </div>

        <div className="border-t border-white/15">
          <div className="container-x flex flex-wrap items-center justify-between gap-3 py-5 text-sm">
            <p>
              © {new Date().getFullYear()} {site.name}. Photographs remain the
              work of their{" "}
              <Link prefetch={false} href="/credits" className="underline">
                credited authors
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      <a
        href="#top"
        aria-label="Back to top"
        className="to-top fixed right-4 bottom-20 z-30 flex size-11 items-center justify-center rounded-full bg-accent text-on-accent shadow-lg transition-transform hover:-translate-y-0.5"
      >
        <ArrowUp className="size-5" aria-hidden />
      </a>
    </footer>
  );
}
