import { AmbientScene } from "@/components/scenes/AmbientScene";
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Figtree, Fraunces, Rubik_Wet_Paint } from "next/font/google";
import { YatriLauncher } from "@/components/assistant/YatriLauncher";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { RouteProgress } from "@/components/layout/RouteProgress";
import { TiltLayer } from "@/components/layout/TiltLayer";
import { site } from "@/config/site";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" });
// The wordmark font is 74 KB for two words, so it isn't preloaded: the logo shows in the fallback
// for a moment rather than holding back the page's main photo on slow connections.
const wetPaint = Rubik_Wet_Paint({ subsets: ["latin"], weight: "400", variable: "--font-wet-paint", display: "swap", preload: false });

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
  keywords: ["India travel", "India tourism", "travel guide India", "trip planner India", "Indian festivals", "Indian holidays calendar", "states of India", "places to visit in India"],
  category: "travel",
  // Search Console: set GOOGLE_SITE_VERIFICATION to the code from the "HTML tag" method.
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
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
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
        <AuthProvider>
          <AmbientScene />
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </AuthProvider>
        <CookieConsent />
        <YatriLauncher />
        <TiltLayer />
      </body>
    </html>
  );
}
