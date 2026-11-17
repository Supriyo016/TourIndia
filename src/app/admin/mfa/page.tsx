import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminMfa } from "@/components/admin/AdminMfa";
import { accessFor } from "@/features/admin/rbac";
import { currentSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Admin security check", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** The second step of admin sign-in: set up or enter an authenticator code. */
export default async function AdminMfaPage() {
  const session = await currentSession().catch(() => null);
  if (!session || session.role !== "admin" || !(await accessFor(session.user))) redirect("/admin/login");
  return (
    <div className="container-x max-w-xl py-14">
      <h1 className="text-3xl">Authenticator check</h1>
      <p className="mt-2 text-ink-2">
        Every admin account uses an authenticator app (Google Authenticator, Microsoft Authenticator, 1Password and similar) as well as the emailed code. Signed in as {session.user.email}.
      </p>
      <AdminMfa />
    </div>
  );
}
