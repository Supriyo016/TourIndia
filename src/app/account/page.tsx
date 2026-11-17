import { redirect } from "next/navigation";

/** The old account page. Its parts now live under /profile; first-sign-in links still land here. */
export default async function AccountPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const key of ["welcome", "next"]) {
    const value = params[key];
    if (typeof value === "string") query.set(key, value);
  }
  redirect(query.size ? `/profile/details?${query}` : "/profile");
}
