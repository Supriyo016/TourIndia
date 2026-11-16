/**
 * Checks text people post: comments, viewpoints, tips and suggested edits.
 *
 * - Common profanity is masked, so the comment still posts.
 * - Slurs, threats, and insults aimed at a religion, caste or community are refused,
 *   with a message asking for respectful wording.
 * - Text that mentions a faith alongside hostile words is held for an admin instead of guessing.
 * - Personal details (phone numbers, email addresses) and links to other sites are blocked,
 *   which protects posters and stops spam.
 *
 * Matching runs on a normalised copy (lower case, look-alike digits and symbols mapped
 * to letters, repeated letters collapsed, separators removed inside words), so simple
 * disguises like "i.d.i.o.t" or "a55" are caught. The lists are deliberately short and
 * plain so the owner can extend them in one place.
 */

export type ModerationResult =
  | { action: "allow"; text: string }
  | { action: "mask"; text: string }
  | { action: "review"; text: string; reason: string }
  | { action: "reject"; reason: string };

// Masked: everyday swearing in English and romanised Hindi or Urdu.
const PROFANITY = ["fuck", "fucking", "shit", "bullshit", "bitch", "bastard", "asshole", "dick", "crap", "wtf", "bsdk", "chutiya", "chutiye", "madarchod", "behenchod", "bhenchod", "gandu", "harami", "kamina", "kutta", "kutte", "saala", "saale", "bhosdi", "lavde", "lauda", "randi"];

// Refused: slurs against communities, castes or religions, and dehumanising terms.
const SLURS = ["nigger", "nigga", "faggot", "chamar", "bhangi", "katua", "katwa", "jihadi", "chinki", "pajeet", "sickular", "libtard", "andhbhakt", "presstitute", "paki", "raghead", "cowpiss", "gaumutra", "rice bag", "ricebag"];

const THREATS = ["kill you", "kill them", "kill all", "should die", "burn them", "rape", "lynch", "go back to pakistan", "wipe them out", "slaughter them"];

// Words for faiths and communities, not places of worship: "the temple was crowded" is ordinary travel talk.
const FAITHS = ["hindu", "hindus", "hinduism", "muslim", "muslims", "islam", "christian", "christians", "christianity", "sikh", "sikhs", "sikhism", "jain", "jains", "jainism", "buddhist", "buddhists", "buddhism", "parsi", "parsis", "zoroastrian", "jew", "jews", "jewish", "bahai", "tribal", "tribals", "dalit", "dalits", "brahmin", "brahmins", "kafir", "sanghi", "religion", "religions"];

// Ambiguous on their own, so they only matter next to a faith or community word.
const HOSTILE = ["fake", "stupid", "evil", "dirty", "disgusting", "backward", "primitive", "inferior", "barbaric", "should be banned", "destroy", "hate", "worst", "filthy", "cult", "liars", "terror"];

const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "@": "a", $: "s", "!": "i", "|": "i", "+": "t" };

export function normalise(text: string): string {
  return (
    text
      .normalize("NFKD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .replace(/[0-9@$!|+]/g, (character) => LEET[character] ?? character)
      // Joins letters split by single separators: "i.d.i.o.t" or "f u c k".
      .replace(/\b(?:[a-z][\s.\-_*]){2,}[a-z]\b/g, (match) => match.replace(/[\s.\-_*]/g, ""))
      .replace(/[^a-z\s]/g, " ")
      .replace(/(.)\1{2,}/g, "$1$1")
      .replace(/\s+/g, " ")
      .trim()
  );
}

const wordPattern = (words: readonly string[]) => new RegExp(`\\b(?:${words.map((word) => word.replace(/\s+/g, "\\s?")).join("|")})\\b`, "i");

const PROFANITY_RE = wordPattern(PROFANITY);
const SLUR_RE = wordPattern(SLURS);
const THREAT_RE = wordPattern(THREATS);
const FAITH_RE = wordPattern(FAITHS);
const HOSTILE_RE = wordPattern(HOSTILE);
// Doubled letters collapse to one as a second pass ("fuuuck" becomes "fuck").
const squash = (text: string) => text.replace(/(.)\1+/g, "$1");

const PHONE_RE = /(?:\+?91[\s-]?)?\b[6-9]\d{4}[\s-]?\d{5}\b/;
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.]+/;
const LINK_RE = /\b(?:https?:\/\/|www\.)\S+/gi;

const RESPECT = "Please keep it respectful. Comments that insult a religion, caste, community or person aren't published here.";

export function moderate(raw: string, { allowedHosts = [] as string[] } = {}): ModerationResult {
  const text = raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩]/g, "").trim();
  if (!text) return { action: "reject", reason: "Write something first." };

  const plain = normalise(text);
  const squashed = squash(plain);

  if (SLUR_RE.test(plain) || SLUR_RE.test(squashed) || THREAT_RE.test(plain)) return { action: "reject", reason: RESPECT };
  if (PHONE_RE.test(text) || EMAIL_RE.test(text)) {
    return { action: "reject", reason: "For your safety, please don't post phone numbers or email addresses." };
  }
  for (const link of text.match(LINK_RE) ?? []) {
    let host = "";
    try {
      host = new URL(link.startsWith("www.") ? `https://${link}` : link).hostname.replace(/^www\./, "");
    } catch {
      return { action: "reject", reason: "That link couldn't be read." };
    }
    if (!allowedHosts.includes(host)) return { action: "reject", reason: "Links to other sites aren't allowed in comments. Describe the place instead." };
  }

  const masked = text.replace(/[\p{L}\p{N}@$!|+*.\-_]+/gu, (word) => {
    const check = normalise(word);
    return PROFANITY_RE.test(check) || PROFANITY_RE.test(squash(check)) ? "*".repeat(Math.min(word.length, 8)) : word;
  });

  if (FAITH_RE.test(plain) && HOSTILE_RE.test(plain)) {
    return { action: "review", text: masked, reason: "Mentions a faith or community alongside strong words, so an admin will check it first." };
  }
  if (masked !== text) return { action: "mask", text: masked };
  return { action: "allow", text };
}
