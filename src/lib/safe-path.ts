/**
 * Returns a same-site path to send someone back to, or "/" for anything else.
 * Browsers strip tabs and newlines and treat "\" as "/", so "/\t/evil.example" or
 * "/\evil.example" would leave the site; those are refused before parsing, and the
 * parsed result must still be on our own origin. Used by the server and the browser.
 */
export function safePath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || /[\\\u0000-\u001F\u007F]/.test(value)) return "/";
  const base = "https://same-site.invalid";
  try {
    const url = new URL(value, base);
    if (url.origin !== base) return "/";
    return `${url.pathname}${url.search}${url.hash}`.slice(0, 200);
  } catch {
    return "/";
  }
}
