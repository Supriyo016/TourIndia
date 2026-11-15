import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces, Rubik_Wet_Paint } from "next/font/google";
import { YatriLauncher } from "@/components/assistant/YatriLauncher";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { TopBar } from "@/components/layout/TopBar";
import { site } from "@/config/site";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" });
const wetPaint = Rubik_Wet_Paint({ subsets: ["latin"], weight: "400", variable: "--font-wet-paint", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name}: discover and plan travel across India`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.owner.name, url: site.owner.githubUrl }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    title: site.name,
    description: site.description,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: site.name, description: site.description },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1a20" },
  ],
};

// Runs before first paint so a saved dark theme never flashes light.
const themeScript = `(function(){var d=document.documentElement,t;try{t=localStorage.getItem('ti-theme')}catch(e){}d.dataset.theme=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning className={`${fraunces.variable} ${figtree.variable} ${wetPaint.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body id="top">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent">
          Skip to content
        </a>
        <TopBar />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <CookieConsent />
        <YatriLauncher />
      </body>
    </html>
  );
}
