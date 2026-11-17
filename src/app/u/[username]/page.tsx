import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { MapPin, MessageSquare, CalendarDays, Globe } from "lucide-react";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { publicProfile } from "@/features/profile/service";
import { currentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ username: string }> };

// Metadata and the page share one lookup per request.
const lookup = cache(async (username: string) => publicProfile(username.toLowerCase(), Boolean(await currentSession().catch(() => null))));
const load = async (params: Props["params"]) => lookup((await params).username);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await load(params);
  // Profiles are never listed by search engines, whatever their visibility.
  return { title: profile ? `${profile.name} (@${profile.username})` : "Profile not found", robots: { index: false, follow: false } };
}

/**
 * Someone's public page. Shows only what they chose to show; private pages, members-only pages
 * for signed-out visitors and restricted accounts all look exactly like a username that doesn't exist.
 */
export default async function PublicProfilePage({ params }: Props) {
  const profile = await load(params);
  if (!profile) notFound();
  const host = profile.website ? new URL(profile.website).hostname.replace(/^www\./, "") : "";

  return (
    <div className="container-x max-w-4xl py-10">
      <h1 className="sr-only">
        {profile.name} (@{profile.username})
      </h1>
      <ProfileHeader cover={profile.cover} avatar={profile.avatar} name={profile.name} username={profile.username} />
      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_16rem]">
        <section aria-label="About" className="card p-6">
          {profile.tagline && <p className="text-lg font-semibold text-ink">{profile.tagline}</p>}
          {profile.bio ? <p className="mt-2 whitespace-pre-line text-ink-2">{profile.bio}</p> : !profile.tagline && <p className="text-ink-2">{profile.name} hasn&apos;t written anything here yet.</p>}
          {profile.interests && (
            <div className="mt-5">
              <h2 className="text-base">Interests</h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <li key={interest} className="tag tag-editorial">
                    {interest}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
        <aside aria-label="Details" className="card grid content-start gap-3 p-5 text-sm">
          {(profile.city || profile.homeState) && (
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
              {[profile.city, profile.homeState].filter(Boolean).join(", ")}
            </p>
          )}
          {profile.website && (
            <p className="flex items-start gap-2">
              <Globe className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
              <a href={profile.website} rel="nofollow ugc noopener noreferrer" target="_blank" className="link-text break-all">
                {host}
              </a>
            </p>
          )}
          {profile.activity && (
            <p className="flex items-start gap-2">
              <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
              {profile.activity.comments} {profile.activity.comments === 1 ? "comment" : "comments"}
            </p>
          )}
          {profile.joined && (
            <p className="flex items-start gap-2">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
              Joined {profile.joined}
            </p>
          )}
          {profile.visibility === "members" && <p className="text-muted">Visible to signed-in members only.</p>}
        </aside>
      </div>
    </div>
  );
}
