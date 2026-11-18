import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { BadgeArt } from "@/components/achievements/BadgeArt";
import { DeviceCounts } from "@/components/profile/DeviceCounts";
import { MyRequests } from "@/components/profile/MyRequests";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { achievementsFor } from "@/features/achievements/service";
import { memoryCount } from "@/features/memories/service";
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
  const [profile, counts, achievements, memories] = await Promise.all([
    getProfile(user._id),
    savedCounts(user._id).catch(() => null),
    achievementsFor(user._id, { record: true }).catch(() => null),
    memoryCount(user._id).catch(() => null),
  ]);
  const earned = achievements?.filter((item) => item.earned) ?? [];
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

      {achievements && (
        <section aria-labelledby="achievements-title" className="card p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="achievements-title" className="text-xl">
              Achievements
            </h2>
            <Link prefetch={false} href="/profile/achievements" className="link-text text-sm">
              See all {achievements.length}
            </Link>
          </div>
          {earned.length ? (
            <>
              <p className="mt-1 text-sm text-ink-2">
                {earned.length} earned{profile.privacy.show.includes("achievements") && visible ? ", shown on your page" : ", only you can see them"}.
              </p>
              <ul className="mt-4 flex flex-wrap gap-3">
                {earned.slice(0, 10).map((item) => (
                  <li key={item.id} title={item.name}>
                    <BadgeArt art={item.art} group={item.group} size={52} />
                    <span className="sr-only">{item.name}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-1 text-sm text-ink-2">None yet. Mark a state as visited, save a trip, write a memory or take the quiz to earn your first.</p>
          )}
          <p className="mt-4 text-sm text-ink-2">
            {memories ? `${memories} ${memories === 1 ? "memory" : "memories"} kept. ` : ""}
            <Link prefetch={false} href={memories ? "/profile/memories" : "/profile/memories/new"} className="link-text">
              {memories ? "Open your memories" : "Write your first memory"}
            </Link>
          </p>
        </section>
      )}

      <DeviceCounts account={counts} />
      <MyRequests />
    </div>
  );
}
