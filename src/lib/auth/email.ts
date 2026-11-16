import "server-only";
import { site } from "@/config/site";

/** Production needs RESEND_API_KEY and EMAIL_FROM. Development prints the code to the server log instead. */
export const isEmailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM) || process.env.NODE_ENV !== "production";

export async function sendCodeEmail(to: string, code: string, purpose: "login" | "admin"): Promise<boolean> {
  const subject = purpose === "admin" ? `${code} is your ${site.name} admin code` : `${code} is your ${site.name} sign-in code`;
  const text = `Your ${site.name} ${purpose === "admin" ? "admin " : ""}code is ${code}.\n\nIt expires in 10 minutes. If you didn't ask for it, you can ignore this email.`;

  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    if (process.env.NODE_ENV === "production") return false;
    console.info(`[auth] development only: ${purpose} code for ${to} is ${code}`);
    return true;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [to], subject, text }),
      signal: AbortSignal.timeout(10_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
