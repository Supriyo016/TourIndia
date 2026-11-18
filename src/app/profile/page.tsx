import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { DeviceCounts } from "@/components/profile/DeviceCounts";
import { MyRequests } from "@/components/profile/MyRequests";
import { PassportSummary } from "@/components/profile/PassportSummary";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { noteCount } from "@/features/notes/service";
import { getProfile } from "@/features/profile/service";
import { savedCounts } from "@/features/saved/service";
import { currentSession } from "@/lib/auth/session";

export const metadata = { title: "Overview" };

const VISIBILITY = {
  private: "Your page is private. Only you can see it.",
  members: "Your page is visible to people who are signed in.",
  public: "Your page is public.",
} as const;

/** The signed-in person's travel dashboard. */
export default async function ProfileOverviewPage() {
  const session = await currentSession().catch(() => null);
  if (!session) return null;
  const { user } = session;
  const [profile, counts, notes] = await Promise.all([getProfile(user._id), savedCounts(user._id).catch(() => null), noteCount(user._id).catch(() => null)]);
  const visible = profile.privacy.visibility !== "private" && profile.username;

  const steps = [
    { done: Boolean(profile.username), label: "Choose a username and avatar", href: "/profile/details" },
    { done: Boolean(profile.tagline || profile.bio), label: "Say a little about how you travel", href: "/profile/details" },
    { done: profile.prefs.regions.length + profile.prefs.seasons.length > 0 || Boolean(profile.prefs.tripLength), label: "Set your travel preferences", href: "/profile/preferences" },
    { done: Boolean(profile.privacySetAt), label: "Decide who can see your page", href: "/profile/privacy" },
  ];
  const left = steps.filter((step) => !step.done).length;

  return (
    <div className="grid gap-8">
      <h1 className="sr-only">Your profile</h1>
      <ProfileHeader cover={profile.cover} avatar={profile.avatar} name={user.name} username={profile.username}>
        <div className="flex flex-wrap gap-2">
          <Link prefetch={false} href="/profile/details" className="btn btn-outline">
            Edit details
          </Link>
          {visible && (
            <Link prefetch={false} href={`/u/${profile.username}`} className="btn btn-accent">
              View your page
            </Link>
          )}
        </div>
      </ProfileHeader>
      <p className="-mt-4 text-sm text-ink-2">
        {VISIBILITY[profile.privacy.visibility]}{" "}
        <Link prefetch={false} href="/profile/privacy" className="link-text">
          Change
        </Link>
      </p>

      {left > 0 && (
        <section aria-labelledby="setup-title" className="card p-6">
          <h2 id="setup-title" className="text-xl">
            Finish setting up
          </h2>
          <p className="mt-1 text-sm text-ink-2">All optional. {left === 1 ? "One step" : `${left} steps`} left.</p>
          <ul className="mt-4 grid gap-2">
            {steps.map((step) => (
              <li key={step.label} className="flex items-center gap-2.5">
                {step.done ? <CheckCircle2 className="size-5 text-forest" aria-hidden /> : <Circle className="size-5 text-muted" aria-hidden />}
                {step.done ? (
                  <span className="text-ink-2">
                    {step.label} <span className="sr-only">(done)</span>
                  </span>
                ) : (
                  <Link prefetch={false} href={step.href} className="link-text">
                    {step.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <DeviceCounts account={counts && { places: counts.places, stamps: counts.stamps, collections: counts.collections, trips: counts.trips, notes: notes ?? 0 }} />
      {counts && <PassportSummary entries={counts.passport} />}
      <MyRequests />
    </div>
  );
}
