import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountSessions } from "@/components/auth/AccountSessions";
import { AccountView } from "@/components/auth/AccountView";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <div className="container-x max-w-3xl py-10">
      <h1>Your account</h1>
      <Suspense fallback={<p className="mt-6 text-muted">Loading…</p>}>
        <AccountView />
      </Suspense>
      <AccountSessions />
    </div>
  );
}
