import "server-only";
import type { UserDoc } from "@/lib/auth/session";
import { getStore, STORE_COLLECTIONS, type Doc } from "@/lib/database/store";
import { moderate } from "@/features/community/moderation";
import { activeRestriction } from "@/features/admin/restrictions";
import { defaultAvatar, type AvatarId } from "./avatars";
import { DEFAULT_COVER, type CoverKey } from "./covers";
import { DEFAULT_PREFERENCES, DEFAULT_PRIVACY, usernameProblem, type IdentityInput, type Preferences, type Privacy, type Showable } from "./schema";

export interface ProfileFields {
  _id: string;
  username?: string;
  avatar: AvatarId;
  cover: CoverKey;
  tagline: string;
  bio: string;
  city: string;
  website: string;
  prefs: Preferences;
  privacy: Privacy;
  /** When the person last saved their privacy choices; unset means they're still the defaults. */
  privacySetAt?: Date;
}

export interface ProfileDoc extends Doc, ProfileFields {
  createdAt: Date;
  updatedAt: Date;
}

export type Profile = ProfileFields & { saved: boolean };

type Result<T = object> = ({ ok: true } & T) | { ok: false; status: number; error: string };

const collection = async () => (await getStore())?.collection<ProfileDoc>(STORE_COLLECTIONS.profiles) ?? null;

const blank = (userId: string): Profile => ({
  _id: userId,
  avatar: defaultAvatar(userId),
  cover: DEFAULT_COVER,
  tagline: "",
  bio: "",
  city: "",
  website: "",
  prefs: { ...DEFAULT_PREFERENCES },
  privacy: { ...DEFAULT_PRIVACY, show: [...DEFAULT_PRIVACY.show] },
  saved: false,
});

/** The person's own profile, with defaults filled in when nothing has been saved yet. */
export async function getProfile(userId: string): Promise<Profile> {
  const doc = await (await collection())?.findOne({ _id: userId });
  if (!doc) return blank(userId);
  const { createdAt: _created, updatedAt: _updated, ...rest } = doc;
  void _created;
  void _updated;
  return { ...blank(userId), ...rest, prefs: { ...DEFAULT_PREFERENCES, ...doc.prefs }, privacy: { ...DEFAULT_PRIVACY, ...doc.privacy }, saved: true };
}

/** Runs profile text through the comment filter. Links and contact details belong elsewhere. */
function checkText(label: string, value: string): Result<{ text: string }> {
  if (!value) return { ok: true, text: "" };
  const result = moderate(value);
  if (result.action === "reject") return { ok: false, status: 422, error: `${label}: ${result.reason.replace("Comments", "Profiles").replace("in comments", "here")}` };
  if (result.action === "review") return { ok: false, status: 422, error: `${label}: please reword this. Profiles can't be checked by a person before they show.` };
  return { ok: true, text: result.text };
}

export async function usernameAvailable(username: string, selfId?: string): Promise<boolean> {
  const found = await (await collection())?.findOne({ username });
  return !found || found._id === selfId;
}

async function upsert(userId: string, set: Partial<ProfileDoc>) {
  const profiles = await collection();
  if (!profiles) return false;
  const current = await getProfile(userId);
  const { saved: _saved, _id: _ignored, ...base } = current;
  void _saved;
  void _ignored;
  const now = new Date();
  await profiles.updateOne({ _id: userId }, { $set: { ...base, ...set, updatedAt: now }, $setOnInsert: { createdAt: now } }, { upsert: true });
  return true;
}

export async function saveIdentity(userId: string, input: IdentityInput): Promise<Result> {
  const problem = usernameProblem(input.username);
  if (problem) return { ok: false, status: 422, error: problem };
  const checked: Record<"tagline" | "bio" | "city", string> = { tagline: "", bio: "", city: "" };
  for (const [field, label] of [["tagline", "Tagline"], ["bio", "About you"], ["city", "City"]] as const) {
    const result = checkText(label, input[field]);
    if (!result.ok) return result;
    checked[field] = result.text;
  }
  if (!(await usernameAvailable(input.username, userId))) return { ok: false, status: 409, error: "That username is taken. Try another." };
  try {
    const saved = await upsert(userId, { username: input.username, avatar: input.avatar, cover: input.cover, website: input.website, ...checked });
    return saved ? { ok: true } : { ok: false, status: 503, error: "Profiles aren't available right now." };
  } catch (error) {
    // Two people claiming the same name at once: the unique index decides.
    if ((error as { code?: number }).code === 11000) return { ok: false, status: 409, error: "That username is taken. Try another." };
    throw error;
  }
}

export async function savePreferences(userId: string, prefs: Preferences): Promise<Result> {
  return (await upsert(userId, { prefs })) ? { ok: true } : { ok: false, status: 503, error: "Profiles aren't available right now." };
}

export async function savePrivacy(userId: string, privacy: Privacy): Promise<Result> {
  if (privacy.visibility !== "private" && !(await getProfile(userId)).username) {
    return { ok: false, status: 422, error: "Choose a username on the Details page first, so your page has an address." };
  }
  return (await upsert(userId, { privacy: { ...privacy, show: [...new Set(privacy.show)] }, privacySetAt: new Date() })) ? { ok: true } : { ok: false, status: 503, error: "Profiles aren't available right now." };
}

/** Clears what a person wrote about themselves and makes the page private. For moderators. */
export async function resetProfile(userId: string): Promise<boolean> {
  const profiles = await collection();
  if (!profiles) return false;
  const result = await profiles.updateOne({ _id: userId }, { $set: { tagline: "", bio: "", city: "", website: "", privacy: { ...DEFAULT_PRIVACY, visibility: "private" }, updatedAt: new Date() } });
  return result.matchedCount > 0;
}

export async function deleteProfile(userId: string) {
  await (await collection())?.deleteOne({ _id: userId });
}

export interface PublicProfile {
  username: string;
  name: string;
  avatar: AvatarId;
  cover: CoverKey;
  visibility: Exclude<Privacy["visibility"], "private">;
  tagline?: string;
  bio?: string;
  city?: string;
  homeState?: string;
  website?: string;
  interests?: string[];
  joined?: string;
  activity?: { comments: number };
}

/**
 * What a visitor may see of someone's page, or null when there is nothing to show: no such
 * username, a private page, a members-only page and a signed-out visitor, or a restricted account.
 */
export async function publicProfile(username: string, viewerSignedIn: boolean): Promise<PublicProfile | null> {
  if (usernameProblem(username)) return null;
  const store = await getStore();
  if (!store) return null;
  const doc = await store.collection<ProfileDoc>(STORE_COLLECTIONS.profiles).findOne({ username });
  if (!doc || !doc.privacy || doc.privacy.visibility === "private") return null;
  if (doc.privacy.visibility === "members" && !viewerSignedIn) return null;
  const user = await store.collection<UserDoc>(STORE_COLLECTIONS.users).findOne({ _id: doc._id });
  if (!user || !user.name || user.status === "blocked" || (await activeRestriction(user._id))) return null;

  const show = new Set<Showable>(doc.privacy.show);
  const view: PublicProfile = { username, name: user.name, avatar: doc.avatar, cover: doc.cover, visibility: doc.privacy.visibility };
  if (show.has("tagline") && doc.tagline) view.tagline = doc.tagline;
  if (show.has("bio") && doc.bio) view.bio = doc.bio;
  if (show.has("city") && doc.city) view.city = doc.city;
  if (show.has("homeState") && user.homeState) view.homeState = user.homeState;
  if (show.has("website") && doc.website) view.website = doc.website;
  if (show.has("interests") && user.interests?.length) view.interests = user.interests;
  if (show.has("joined")) view.joined = user.createdAt.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  if (show.has("activity")) {
    const comments = await store.collection(STORE_COLLECTIONS.comments).find({ userId: user._id, status: "visible" }, { limit: 1000 }).toArray();
    view.activity = { comments: comments.length };
  }
  return view;
}

/** Usernames to link comments to, for authors who chose to link them and whose page is visible. */
export async function commentLinks(userIds: string[]): Promise<Map<string, { username: string; avatar: AvatarId }>> {
  const links = new Map<string, { username: string; avatar: AvatarId }>();
  const unique = [...new Set(userIds.filter(Boolean))];
  if (!unique.length) return links;
  const rows = (await (await collection())?.find({ _id: { $in: unique } }, { limit: unique.length }).toArray()) ?? [];
  for (const row of rows) {
    if (row.username && row.privacy?.linkComments && row.privacy.visibility === "public") links.set(row._id, { username: row.username, avatar: row.avatar });
  }
  return links;
}
