import type { Permission } from "@/features/admin/permissions";

/**
 * The CMS workflow, as pure data shared by the server and the admin screens (which only use it to
 * decide which buttons to show; the server checks every transition again).
 *
 * Draft → Review → Approved → Published → Archived. A reviewer can send a version back to Draft.
 * An approved version can be published now or scheduled for later. Publishing a version archives
 * the one that was live before it.
 */
export const VERSION_STATUSES = ["draft", "review", "approved", "published", "archived"] as const;
export type VersionStatus = (typeof VERSION_STATUSES)[number];

export const STATUS_LABELS: Record<VersionStatus, string> = {
  draft: "Draft",
  review: "In review",
  approved: "Approved",
  published: "Published",
  archived: "Archived",
};

export const CONTENT_ACTIONS = ["create", "save", "submit", "approve", "reject", "publish", "schedule", "unschedule", "archive", "restore", "delete"] as const;
export type ContentAction = (typeof CONTENT_ACTIONS)[number];

interface Rule {
  /** Statuses the version must be in. Empty for "create". */
  from: VersionStatus[];
  permission: Permission;
  /** Needs an authenticator code from the last 15 minutes. */
  fresh?: boolean;
}

export const RULES: Record<ContentAction, Rule> = {
  create: { from: [], permission: "content.edit" },
  save: { from: ["draft"], permission: "content.edit" },
  submit: { from: ["draft"], permission: "content.edit" },
  approve: { from: ["review"], permission: "content.publish" },
  reject: { from: ["review", "approved"], permission: "content.publish" },
  publish: { from: ["approved"], permission: "content.publish" },
  schedule: { from: ["approved"], permission: "content.publish" },
  unschedule: { from: ["approved"], permission: "content.publish" },
  // Archiving a draft discards it; archiving the published version takes the page back to the guide's own text.
  archive: { from: ["draft", "review", "approved", "published"], permission: "content.edit" },
  restore: { from: ["published", "archived", "approved", "review", "draft"], permission: "content.edit" },
  delete: { from: ["draft", "review", "approved", "archived"], permission: "content.delete", fresh: true },
};

/** Archiving what's live is unpublishing, which needs the publish permission. */
export const permissionFor = (action: ContentAction, status?: VersionStatus): Permission =>
  action === "archive" && status === "published" ? "content.publish" : RULES[action].permission;

export const canTransition = (action: ContentAction, status: VersionStatus) => RULES[action].from.includes(status);

/** Which actions a person with these permissions may take on a version in this status. */
export function availableActions(status: VersionStatus, permissions: ReadonlySet<string>, scheduled: boolean): ContentAction[] {
  return CONTENT_ACTIONS.filter((action) => {
    if (action === "create" || !canTransition(action, status)) return false;
    if (action === "schedule" && scheduled) return false;
    if (action === "unschedule" && !scheduled) return false;
    return permissions.has(permissionFor(action, status));
  });
}

/** Limits on what one version may hold. */
export const LIMITS = { textChars: 2000, items: 20, itemChars: 1500, note: 300, openVersions: 20 } as const;
