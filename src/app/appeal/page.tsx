import type { Metadata } from "next";
import { AppealForm } from "@/components/auth/AppealForm";

export const metadata: Metadata = {
  title: "Appeal an account restriction",
  description: "Ask for a review if your Tour India account has been suspended or banned.",
  robots: { index: false, follow: true },
};

export default function AppealPage() {
  return (
    <div className="container-x max-w-2xl py-14">
      <h1>Appeal a suspension or ban</h1>
      <p className="mt-3 text-ink-2">
        If your account can&apos;t sign in because it was suspended or banned and you think that&apos;s a mistake, tell us why. An admin who didn&apos;t make the original
        decision will review it. You can appeal each restriction once.
      </p>
      <AppealForm />
    </div>
  );
}
