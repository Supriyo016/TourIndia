/**
 * Turns a Wikimedia Commons "Artist" field into a short credit: drops upload notes, dates,
 * links and "taken by" boilerplate, keeping the photographer's name.
 */
export function cleanAuthor(raw: unknown): string {
  let a = String(raw ?? "").replace(/\s+/g, " ").trim();
  // A bare profile link: keep the account name from it.
  const link = /^https?:\/\/\S+?([^/:]+)\/?$/.exec(a);
  if (link?.[1]) return link[1];
  a = a.replace(/^This Photo was taken by\s+(.+?)\s+\..*$/i, "$1");
  a = a.replace(/^\[\s*https?:\/\/\S+\s+([^\]]+)\]/, "$1");
  a = a.replace(/\(\s*https?:\/\/[^)]*\)/g, "").replace(/https?:\/\/\S+/g, "");
  a = a.replace(/\s+\d{4}-\d{2}-\d{2}(\s+\d{2}:\d{2}(:\d{2})?)?\b.*$/, "");
  a = a.replace(/^File:\S+\s*:\s*derivative work:\s*/i, "");
  a = a.replace(/\s*\|.*$/, "");
  a = a.replace(/\s+from\s+[A-Z][\w\s,]+$/, "");
  a = a.replace(/�/g, "é");
  a = a.replace(/[\s,;:.-]+$/, "").trim();
  if (a.length > 80) a = `${a.slice(0, 77).replace(/\s+\S*$/, "")}…`;
  return a || "Unknown author";
}
