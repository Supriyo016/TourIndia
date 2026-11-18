import type { Metadata } from "next";
import Link from "next/link";
import { Wrench } from "lucide-react";
import { getSettings } from "@/features/settings/settings";

export const metadata: Metadata = { title: "Back shortly", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Shown to visitors while maintenance mode is on (the proxy rewrites every page here). */
export default async function MaintenancePage() {
  const { maintenance } = await getSettings();
  return (
    <section className="container-x grid min-h-[60vh] place-items-center py-16 text-center">
      <div className="max-w-prose">
        <Wrench className="mx-auto size-10 text-accent-ink" aria-hidden />
        <h1 className="mt-4">We&apos;ll be back shortly</h1>
        <p className="lede mt-3 text-ink-2">{maintenance.on ? maintenance.message : "Everything is running normally."}</p>
        {!maintenance.on && (
          <Link href="/" className="btn btn-primary mt-6">
            Go to the home page
          </Link>
        )}
      </div>
    </section>
  );
}
