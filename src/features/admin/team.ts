import "server-only";
import { randomUUID } from "node:crypto";
import { adminEmails, type UserDoc } from "@/lib/auth/session";
import { getStore, STORE_COLLECTIONS, type Store } from "@/lib/database/store";
import { audit } from "@/lib/security/audit";
import { ALL_PERMISSIONS, isPermission, SUPER_ADMIN, type Permission } from "./permissions";
import { allRoles, isBuiltInRole, type AdminAccess, type AdminMemberDoc, type CustomRoleDoc } from "./rbac";

/**
 * Admin team management: who holds which roles, and custom roles. Callers have already passed
 * requireAdminApi with `admins.manage` or `roles.manage` and a fresh MFA check; these functions
 * enforce the remaining rules (no self-changes, Super Admin only by Super Admins, the bootstrap
 * owner can't be demoted) and write every change to the audit log with before and after values.
 */

export class TeamError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

export interface TeamMember {
  userId?: string;
  email: string;
  roles: string[];
  bootstrap: boolean;
  mfa: boolean;
  lastLoginAt?: string;
}

interface Actor {
  user: Pick<UserDoc, "_id" | "email">;
  access: AdminAccess;
}

async function db(): Promise<Store> {
  const store = await getStore();
  if (!store) throw new TeamError("The database isn't connected.", 503);
  return store;
}

export async function listTeam(): Promise<TeamMember[]> {
  const store = await db();
  const members = await store.collection<AdminMemberDoc>(STORE_COLLECTIONS.adminMembers).find({}, { sort: { email: 1 }, limit: 200 }).toArray();
  const emails = new Set([...adminEmails(), ...members.map((m) => m.email)]);
  const users = await store.collection<UserDoc>(STORE_COLLECTIONS.users).find({ email: { $in: [...emails] } }, { limit: 200 }).toArray();
  const userByEmail = new Map(users.map((u) => [u.email, u]));
  return [...emails]
    .map((email) => {
      const member = members.find((m) => m.email === email);
      const bootstrap = adminEmails().has(email);
      const roles = [...new Set([...(bootstrap ? [SUPER_ADMIN] : []), ...(member?.roles ?? [])])];
      const user = userByEmail.get(email);
      return { userId: user?._id, email, roles, bootstrap, mfa: Boolean(member?.mfa?.enabledAt), lastLoginAt: user?.lastLoginAt?.toISOString() };
    })
    .filter((member) => member.roles.length > 0)
    .sort((a, b) => Number(b.bootstrap) - Number(a.bootstrap) || a.email.localeCompare(b.email));
}

async function checkRoles(roles: string[], actor: Actor) {
  const known = new Set((await allRoles()).map((role) => role.id));
  for (const role of roles) if (!known.has(role)) throw new TeamError(`There's no role called "${role}".`);
  if (roles.includes(SUPER_ADMIN) && !actor.access.superAdmin) throw new TeamError("Only a Super Admin can make someone a Super Admin.", 403);
}

/** Sets a person's roles by email. An empty list removes their admin access and ends their admin sessions. */
export async function setMemberRoles(actor: Actor, email: string, roles: string[]): Promise<TeamMember[]> {
  const address = email.trim().toLowerCase();
  const wanted = [...new Set(roles)];
  if (address === actor.user.email.toLowerCase()) throw new TeamError("You can't change your own roles. Ask another Super Admin.", 403);
  if (adminEmails().has(address)) throw new TeamError("This is an owner address set in ADMIN_EMAILS; it's always a Super Admin.", 403);
  await checkRoles(wanted, actor);

  const store = await db();
  const user = await store.collection<UserDoc>(STORE_COLLECTIONS.users).findOne({ email: address });
  if (!user) throw new TeamError("There's no account with that address yet. Ask them to sign in to Tour India once, then try again.", 404);
  if (user.status !== "active") throw new TeamError("That account is blocked.", 409);

  const members = store.collection<AdminMemberDoc>(STORE_COLLECTIONS.adminMembers);
  const before = await members.findOne({ _id: user._id });
  // Changing a Super Admin's roles needs a Super Admin too.
  if (before?.roles.includes(SUPER_ADMIN) && !actor.access.superAdmin) throw new TeamError("Only a Super Admin can change another Super Admin.", 403);

  await members.updateOne(
    { _id: user._id },
    { $set: { roles: wanted, email: address, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date(), createdBy: actor.user._id } },
    { upsert: true },
  );
  if (wanted.length === 0) await store.collection(STORE_COLLECTIONS.sessions).deleteMany({ userId: user._id, role: "admin" });

  await audit(
    { actorId: actor.user._id, actorEmail: actor.user.email, action: wanted.length ? "admin.roles" : "admin.remove", target: user._id, outcome: "ok", before: before?.roles ?? [], after: wanted, detail: address },
    store,
  );
  return listTeam();
}

const slug = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 30);

export async function saveRole(actor: Actor, input: { id?: string; name: string; description: string; permissions: string[] }) {
  const permissions = [...new Set(input.permissions)].filter(isPermission) as Permission[];
  if (permissions.length === 0) throw new TeamError("Pick at least one permission.");
  // A custom role can't carry the powers that would let it escalate itself.
  const reserved = permissions.filter((p) => ["admins.manage", "roles.manage", "backup.restore"].includes(p));
  if (reserved.length && !actor.access.superAdmin) throw new TeamError("Only a Super Admin can give a role team, role or restore permissions.", 403);

  const store = await db();
  const roles = store.collection<CustomRoleDoc>(STORE_COLLECTIONS.adminRoles);
  const id = input.id ?? `custom_${slug(input.name) || randomUUID().slice(0, 8)}`;
  if (isBuiltInRole(id)) throw new TeamError("Built-in roles can't be changed.", 403);
  const before = await roles.findOne({ _id: id });
  if (!input.id && before) throw new TeamError("A role with that name already exists.", 409);
  if (input.id && !before) throw new TeamError("That role no longer exists.", 404);

  await roles.updateOne(
    { _id: id },
    { $set: { name: input.name.trim(), description: input.description.trim(), permissions }, $setOnInsert: { createdAt: new Date(), createdBy: actor.user._id } },
    { upsert: true },
  );
  await audit({ actorId: actor.user._id, actorEmail: actor.user.email, action: before ? "role.update" : "role.create", target: id, outcome: "ok", before: before?.permissions ?? null, after: permissions }, store);
  return allRoles();
}

export async function deleteRole(actor: Actor, id: string) {
  if (isBuiltInRole(id)) throw new TeamError("Built-in roles can't be deleted.", 403);
  const store = await db();
  const inUse = await store.collection<AdminMemberDoc>(STORE_COLLECTIONS.adminMembers).countDocuments({ roles: id });
  if (inUse > 0) throw new TeamError(`${inUse} ${inUse === 1 ? "person has" : "people have"} this role. Change their roles first.`, 409);
  const result = await store.collection(STORE_COLLECTIONS.adminRoles).deleteOne({ _id: id });
  if (result.deletedCount === 0) throw new TeamError("That role no longer exists.", 404);
  await audit({ actorId: actor.user._id, actorEmail: actor.user.email, action: "role.delete", target: id, outcome: "ok" }, store);
  return allRoles();
}

/** An admin signing a user out everywhere (lost phone, compromised account). */
export async function endUserSessions(actor: Actor, userId: string): Promise<number> {
  const store = await db();
  const user = await store.collection<UserDoc>(STORE_COLLECTIONS.users).findOne({ _id: userId });
  if (!user) throw new TeamError("That account doesn't exist.", 404);
  if (adminEmails().has(user.email) && !actor.access.superAdmin) throw new TeamError("Only a Super Admin can sign out an owner account.", 403);
  const result = await store.collection(STORE_COLLECTIONS.sessions).deleteMany({ userId });
  await audit({ actorId: actor.user._id, actorEmail: actor.user.email, action: "user.sessions-ended", target: userId, outcome: "ok", detail: `${result.deletedCount} sessions` }, store);
  return result.deletedCount;
}

export { ALL_PERMISSIONS };
