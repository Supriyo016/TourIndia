import { Suspense } from "react";
import { BasicsSection } from "@/components/profile/BasicsSection";
import { IdentityForm } from "@/components/profile/IdentityForm";
import { COVERS } from "@/features/profile/covers";
import { getProfile } from "@/features/profile/service";
import { currentSession } from "@/lib/auth/session";
import { getImage } from "@/lib/images";

export const metadata = { title: "Details" };

export default async function ProfileDetailsPage() {
  const session = await currentSession().catch(() => null);
  if (!session) return null;
  const profile = await getProfile(session.user._id);
  const covers = Object.fromEntries(COVERS.map((cover) => [cover.key, getImage(cover.key)?.src ?? ""]));

  return (
    <div className="grid gap-8">
      <h1>Your details</h1>
      <Suspense fallback={null}>
        <BasicsSection />
      </Suspense>
      <section aria-labelledby="identity-title" className="card p-6">
        <h2 id="identity-title" className="text-xl">
          Your page
        </h2>
        <p className="mt-1 mb-5 text-sm text-muted">What people see if you make your page visible on the Privacy page. It starts private.</p>
        <IdentityForm
          initial={{ username: profile.username ?? "", avatar: profile.avatar, cover: profile.cover, tagline: profile.tagline, bio: profile.bio, city: profile.city, website: profile.website }}
          covers={covers}
        />
      </section>
    </div>
  );
}
