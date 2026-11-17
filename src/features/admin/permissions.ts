/**
 * Admin permissions and built-in roles. Pure data, shared by the server checks and the admin UI
 * (the UI only uses it to hide controls; every API checks permissions again on the server).
 */

export const PERMISSIONS = {
  "analytics.view": "See analytics and dashboards",
  "analytics.export": "Export analytics reports",
  "users.view": "See the user directory",
  "users.manage": "Edit user details and restore accounts",
  "users.ban": "Suspend and ban accounts",
  "users.delete": "Delete or anonymise accounts",
  "users.sessions": "Sign users out of their sessions",
  "moderation.manage": "Handle reports, comments, edits and appeals",
  "content.edit": "Edit and draft site content",
  "content.publish": "Publish, schedule and archive content",
  "content.delete": "Delete content",
  "media.manage": "Manage images, illustrations and credits",
  "seo.manage": "Manage titles, descriptions and redirects",
  "support.manage": "Handle support tickets and contact messages",
  "yatri.manage": "Manage Yatri's knowledge and see its usage",
  "settings.manage": "Change site settings and feature flags",
  "security.manage": "Use the security centre and emergency controls",
  "logs.view": "Read audit, security and application logs",
  "backup.create": "Create and download backups",
  "backup.restore": "Restore a backup",
  "admins.manage": "Add and remove admins",
  "roles.manage": "Create and change roles",
} as const;

export type Permission = keyof typeof PERMISSIONS;
export const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as Permission[];

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  builtIn: boolean;
}

const role = (id: string, name: string, description: string, permissions: Permission[]): RoleDefinition => ({ id, name, description, permissions, builtIn: true });

export const SUPER_ADMIN = "super_admin";

export const BUILT_IN_ROLES: RoleDefinition[] = [
  role(SUPER_ADMIN, "Super Admin", "Everything, including admins, roles and restores.", ALL_PERMISSIONS),
  role("admin", "Admin", "Runs the site day to day; can't manage admins, roles or restores.", ALL_PERMISSIONS.filter((p) => !["admins.manage", "roles.manage", "backup.restore"].includes(p))),
  role("content_manager", "Content Manager", "Owns the content: edits, publishes, media and SEO.", ["content.edit", "content.publish", "content.delete", "media.manage", "seo.manage", "analytics.view"]),
  role("editor", "Editor", "Drafts and edits content for review.", ["content.edit", "media.manage"]),
  role("moderator", "Moderator", "Keeps the community safe: reports, comments and bans.", ["moderation.manage", "users.view", "users.ban"]),
  role("analyst", "Analyst", "Reads analytics and exports reports.", ["analytics.view", "analytics.export"]),
  role("support_manager", "Support Manager", "Answers support tickets and helps users with their accounts.", ["support.manage", "users.view", "users.sessions"]),
  role("developer", "Developer", "Reads logs and health data and manages Yatri.", ["logs.view", "analytics.view", "yatri.manage"]),
];

export const isPermission = (value: string): value is Permission => value in PERMISSIONS;
