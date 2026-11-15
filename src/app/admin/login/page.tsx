import type { Metadata } from "next";
import { AdminLogin } from "@/components/admin/AdminLogin";

export const metadata: Metadata = {
  title: "Admin sign-in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="container-x max-w-md py-14">
      <h1 className="text-3xl">Admin sign-in</h1>
      <p className="mt-2 text-ink-2">Admin access needs a fresh code sent to an approved address. Sessions last 8 hours.</p>
      <AdminLogin />
    </div>
  );
}
