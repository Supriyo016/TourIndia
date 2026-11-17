import Link from "next/link";
import { PrivacyForm } from "@/components/profile/PrivacyForm";
import { getProfile } from "@/features/profile/service";
import { currentSession } from "@/lib/auth/session";

export const metadata = { title: "Privacy" };

const KEPT = [
  ["Your email address", "To send sign-in codes. Never shown to anyone, and admins see it only when handling your account."],
  ["Your name and country", "Your name appears on your comments. Country tailors suggestions."],
  ["Anything optional you add", "Home state, interests, preferences and the details on your page. Clear any of it at any time."],
  ["Sign-in sessions", "The device type and country of each session, so you can spot one that isn't you. Sessions end after 30 days."],
  ["Sign-in history", "Recent sign-ins and failed attempts, for your security."],
  ["What you post", "Comments, ratings, loves and suggested edits."],
] as const;

export default async function ProfilePrivacyPage() {
  const session = await currentSession().catch(() => null);
  if (!session) return null;
  const profile = await getProfile(session.user._id);
  return (
    <div className="grid gap-8">
      <div>
        <h1>Privacy</h1>
        <p className="mt-1 text-ink-2">Your page starts private. Nothing about you is public unless you choose it here.</p>
      </div>
      <section aria-label="Privacy choices" className="card p-6">
        <PrivacyForm initial={profile.privacy} hasUsername={Boolean(profile.username)} />
      </section>
      <section aria-labelledby="kept-title" className="card p-6">
        <h2 id="kept-title" className="text-xl">
          What we keep about you
        </h2>
        <dl className="mt-4 grid gap-3">
          {KEPT.map(([what, why]) => (
            <div key={what}>
              <dt className="font-semibold">{what}</dt>
              <dd className="text-sm text-ink-2">{why}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-ink-2">
          No advertising or tracking cookies. We don&apos;t ask for your phone number, date of birth or gender, because nothing here needs them. Read the{" "}
          <Link prefetch={false} href="/privacy" className="link-text">
            privacy policy
          </Link>
          , or delete everything from{" "}
          <Link prefetch={false} href="/profile/security" className="link-text">
            Security
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
