"use client";

type Reply = { error?: string; code?: string } & Record<string, unknown>;

async function send(url: string, body: unknown, method: string) {
  const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = (await response.json().catch(() => ({}))) as Reply;
  return { response, data };
}

/**
 * Posts an admin action. If the server asks for a fresh authenticator code (destructive actions
 * need one from the last 15 minutes), it asks for the code, confirms it and retries once.
 * If MFA hasn't been completed in this session, it goes to the MFA page.
 */
export async function adminPost<T = Reply>(url: string, body: unknown, method = "POST"): Promise<T> {
  let { response, data } = await send(url, body, method);
  if (response.status === 401 && data.code === "mfa") {
    window.location.assign("/admin/mfa");
    throw new Error("Confirm your authenticator code first.");
  }
  if (response.status === 401 && data.code === "reauth") {
    const code = window.prompt("This action needs a fresh code. Enter the 6-digit code from your authenticator app (or a recovery code).");
    if (!code) throw new Error("Cancelled. Nothing was changed.");
    const check = await send("/api/admin/mfa", { action: "verify", code: code.trim() }, "POST");
    if (!check.response.ok) throw new Error(check.data.error ?? "That code isn't right.");
    ({ response, data } = await send(url, body, method));
  }
  if (!response.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
  return data as T;
}
