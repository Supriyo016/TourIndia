import "server-only";
import { getStore, STORE_COLLECTIONS, type Doc } from "@/lib/database/store";
import { adminEmails, type UserDoc } from "@/lib/auth/session";
import { BUILT_IN_ROLES, isPermission, SUPER_ADMIN, type Permission, type RoleDefinition } from "./permissions";

/**
 * Who is an admin and what they may do. Server-side only.
 *
 * - Addresses in ADMIN_EMAILS are always Super Admins (the bootstrap). They can't be demoted
 *   from the admin screens, so the owner can never be locked out by another admin.
 * - Everyone else gets admin roles through an `admin_members` record created by an admin with
 *   `admins.manage`.
 * - Custom roles live in `admin_roles` and can't reuse a built-in role's id.
 */

export interface MfaRecord {
  /** The authenticator secret, encrypted (see lib/auth/totp). */
  secret: string;
  enabledAt?: Date;
  /** The last 30-second step accepted, so a code can't be used twice. */
  lastStep: number;
  /** HMACs of unused recovery codes. */
  recovery: string[];
}

export interface AdminMemberDoc extends Doc {
  /** The user's id. */
  _id: string;
  email: string;
  roles: string[];
  mfa?: MfaRecord;
  createdAt: Date;
  createdBy?: string;
  updatedAt?: Date;
}

export interface CustomRoleDoc extends Doc {
  name: string;
  description: string;
  permissions: string[];
  createdAt: Date;
  createdBy: string;
}

const builtIn = new Map(BUILT_IN_ROLES.map((role) => [role.id, role]));

export async function allRoles(): Promise<RoleDefinition[]> {
  const store = await getStore();
  const custom = store ? await store.collection<CustomRoleDoc>(STORE_COLLECTIONS.adminRoles).find({}, { sort: { name: 1 } }).toArray() : [];
  return [
    ...BUILT_IN_ROLES,
    ...custom.map((doc) => ({ id: doc._id, name: doc.name, description: doc.description, permissions: doc.permissions.filter(isPermission), builtIn: false })),
  ];
}

export const isBootstrapAdmin = (email: string) => adminEmails().has(email.toLowerCase());

export async function memberFor(userId: string): Promise<AdminMemberDoc | null> {
  const store = await getStore();
  return store ? store.collection<AdminMemberDoc>(STORE_COLLECTIONS.adminMembers).findOne({ _id: userId }) : null;
}

/** Whether this address may ask for an admin sign-in code. */
export async function mayRequestAdminCode(email: string): Promise<boolean> {
  if (isBootstrapAdmin(email)) return true;
  const store = await getStore();
  if (!store) return false;
  const member = await store.collection<AdminMemberDoc>(STORE_COLLECTIONS.adminMembers).findOne({ email: email.toLowerCase() });
  return Boolean(member && member.roles.length > 0);
}

export interface AdminAccess {
  roles: string[];
  permissions: Set<Permission>;
  superAdmin: boolean;
  bootstrap: boolean;
}

/** The roles and permissions a user has right now, or null if they aren't an admin. */
export async function accessFor(user: Pick<UserDoc, "_id" | "email" | "status">): Promise<AdminAccess | null> {
  if (user.status !== "active") return null;
  const bootstrap = isBootstrapAdmin(user.email);
  const member = await memberFor(user._id);
  const roleIds = new Set(member?.roles ?? []);
  if (bootstrap) roleIds.add(SUPER_ADMIN);
  if (roleIds.size === 0) return null;
  const roles = await allRoles();
  const permissions = new Set<Permission>();
  for (const role of roles) if (roleIds.has(role.id)) for (const permission of role.permissions) permissions.add(permission);
  if (permissions.size === 0) return null;
  return { roles: [...roleIds], permissions, superAdmin: roleIds.has(SUPER_ADMIN), bootstrap };
}

export const isBuiltInRole = (id: string) => builtIn.has(id);
