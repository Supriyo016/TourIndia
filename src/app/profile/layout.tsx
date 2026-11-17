import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ProfileNav } from "@/components/profile/ProfileNav";
import { SignInPrompt } from "@/components/profile/SignInPrompt";
import { currentSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: { default: "Your profile", template: "%s · Your profile" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** The personal profile. Every page here is the signed-in person's own and never cached. */
export default async function ProfileLayout({ children }: { children: ReactNode }) {
  const session = await currentSession().catch(() => null);
  if (!session) {
    return (
      <div className="container-x max-w-3xl py-10">
        <h1>Your profile</h1>
        <SignInPrompt />
      </div>
    );
  }
  return (
    <div className="container-x py-8 lg:grid lg:grid-cols-[13rem_1fr] lg:gap-8">
      <aside className="mb-6 lg:mb-0">
        <ProfileNav />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
