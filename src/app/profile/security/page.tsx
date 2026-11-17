import { AccountSessions } from "@/components/auth/AccountSessions";
import { AccountControls } from "@/components/profile/AccountControls";
import { currentSession } from "@/lib/auth/session";

export const metadata = { title: "Security" };

export default async function ProfileSecurityPage() {
  const session = await currentSession().catch(() => null);
  if (!session) return null;
  return (
    <div className="grid gap-8">
      <div>
        <h1>Security</h1>
        <p className="mt-1 text-ink-2">
          You sign in with a one-time code sent to your email{session.user.googleSub ? " or with Google" : ""}, so there&apos;s no password to steal or forget.
        </p>
      </div>
      <AccountSessions />
      <AccountControls />
    </div>
  );
}
