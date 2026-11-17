import Link from "next/link";
import { PreferencesForm } from "@/components/profile/PreferencesForm";
import { getProfile } from "@/features/profile/service";
import { currentSession } from "@/lib/auth/session";

export const metadata = { title: "Preferences" };

export default async function ProfilePreferencesPage() {
  const session = await currentSession().catch(() => null);
  if (!session) return null;
  const profile = await getProfile(session.user._id);
  return (
    <div className="grid gap-6">
      <div>
        <h1>Travel preferences</h1>
        <p className="mt-1 text-ink-2">
          All optional and never shown on your page. Interests, travel style and language are with{" "}
          <Link prefetch={false} href="/profile/details" className="link-text">
            the basics
          </Link>
          .
        </p>
      </div>
      <section aria-label="Preferences" className="card p-6">
        <PreferencesForm initial={profile.prefs} />
      </section>
    </div>
  );
}
