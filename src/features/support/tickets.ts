import "server-only";
import { getStore, STORE_COLLECTIONS, type Filter, type Store } from "@/lib/database/store";
import type { UserDoc } from "@/lib/auth/session";
import { audit } from "@/lib/security/audit";
import { accessFor, type AdminAccess } from "@/features/admin/rbac";
import { CATEGORY_IDS, PRIORITY_IDS, STATUS_IDS, TICKET_STATUSES, type Priority, type TicketCategory, type TicketStatus } from "./types";
import { notifyEmail } from "@/features/notifications/service";

/**
 * Support tickets: contact-form messages with a reference, category, priority, status,
 * assignee and internal notes. Internal notes are never shown to the person who wrote in.
 */

export interface TicketNote {
  at: Date;
  by: string;
  byEmail: string;
  text: string;
}

export interface TicketDoc {
  _id: string;
  reference: string;
  name: string;
  email: string;
  category: TicketCategory;
  subject: string;
  message: string;
  priority: Priority;
  status: TicketStatus;
  assignedTo?: string;
  assignedEmail?: string;
  notes: TicketNote[];
  createdAt: Date;
  updatedAt?: Date;
  resolvedAt?: Date;
  [key: string]: unknown;
}

export class TicketError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

export const PAGE_SIZE = 25;
const PRIORITY_ORDER: Record<Priority, number> = { urgent: 0, high: 1, normal: 2, low: 3 };

async function tickets(): Promise<{ store: Store; collection: ReturnType<Store["collection"]> }> {
  const store = await getStore();
  if (!store) throw new TicketError("The database isn't connected.", 503);
  return { store, collection: store.collection(STORE_COLLECTIONS.tickets) };
}

export async function listTickets(input: { status?: TicketStatus | "open" | "all"; category?: TicketCategory; assignedTo?: string; page?: number }) {
  const { collection } = await tickets();
  const filter: Filter = {};
  if (input.status === "open" || !input.status) filter.status = { $in: ["new", "under_review", "in_progress"] };
  else if (input.status !== "all") filter.status = input.status;
  if (input.category) filter.category = input.category;
  if (input.assignedTo) filter.assignedTo = input.assignedTo;
  const total = await collection.countDocuments(filter);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Math.floor(input.page ?? 1)), pages);
  // Newest first from the database, then urgent ones to the top of the page.
  const rows = (await collection.find(filter, { sort: { createdAt: -1 }, skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE }).toArray()) as unknown as TicketDoc[];
  rows.sort((a, b) => PRIORITY_ORDER[a.priority ?? "normal"] - PRIORITY_ORDER[b.priority ?? "normal"]);
  return { rows, total, page, pages };
}

export async function countOpenTickets(): Promise<Record<TicketStatus | "total", number>> {
  const { collection } = await tickets();
  const counts = await Promise.all(STATUS_IDS.map((status) => collection.countDocuments({ status })));
  const result = Object.fromEntries(STATUS_IDS.map((status, i) => [status, counts[i]!])) as Record<TicketStatus, number>;
  return { ...result, total: result.new + result.under_review + result.in_progress };
}

export async function ticketByReference(reference: string): Promise<TicketDoc | null> {
  if (!/^S-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(reference)) return null;
  const { collection } = await tickets();
  return (await collection.findOne({ reference })) as unknown as TicketDoc | null;
}

interface Actor {
  user: Pick<UserDoc, "_id" | "email">;
  access: AdminAccess;
}

export async function updateTicket(actor: Actor, reference: string, change: { status?: TicketStatus; priority?: Priority; category?: TicketCategory; assignTo?: string | null }) {
  const { store, collection } = await tickets();
  const ticket = await ticketByReference(reference);
  if (!ticket) throw new TicketError("That ticket doesn't exist.", 404);
  if (change.status && !STATUS_IDS.includes(change.status)) throw new TicketError("Unknown status.");
  if (change.priority && !PRIORITY_IDS.includes(change.priority)) throw new TicketError("Unknown priority.");
  if (change.category && !CATEGORY_IDS.includes(change.category)) throw new TicketError("Unknown category.");

  const set: Record<string, unknown> = { updatedAt: new Date() };
  const unset: Record<string, ""> = {};
  const before: Record<string, unknown> = {};
  const after: Record<string, unknown> = {};
  for (const key of ["status", "priority", "category"] as const) {
    if (change[key] && change[key] !== ticket[key]) {
      before[key] = ticket[key];
      after[key] = change[key];
      set[key] = change[key];
    }
  }
  if (change.status === "resolved" && ticket.status !== "resolved") set.resolvedAt = new Date();

  if (change.assignTo !== undefined) {
    if (change.assignTo === null) {
      unset.assignedTo = "";
      unset.assignedEmail = "";
      before.assignedTo = ticket.assignedEmail ?? null;
      after.assignedTo = null;
    } else {
      // Tickets go only to admins who can work on them.
      const assignee = await store.collection<UserDoc>(STORE_COLLECTIONS.users).findOne({ _id: change.assignTo });
      const access = assignee ? await accessFor(assignee) : null;
      if (!assignee || !access?.permissions.has("support.manage")) throw new TicketError("Tickets can only be assigned to admins with the support permission.", 403);
      set.assignedTo = assignee._id;
      set.assignedEmail = assignee.email;
      before.assignedTo = ticket.assignedEmail ?? null;
      after.assignedTo = assignee.email;
    }
  }
  if (Object.keys(after).length === 0) return ticket;
  await collection.updateOne({ _id: ticket._id }, { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) });
  await audit({ actorId: actor.user._id, actorEmail: actor.user.email, action: "ticket.update", target: reference, outcome: "ok", before, after }, store);
  // The person who wrote in hears about status changes, if they have an account with that address.
  // Only the reference and status: the subject stays out, in case someone else used their address.
  if (after.status) {
    await notifyEmail(ticket.email, { kind: "support", title: `Your support request ${reference} is now ${TICKET_STATUSES[change.status!].toLowerCase()}`, body: change.status === "resolved" || change.status === "closed" ? "Reply to our email if you need anything else." : undefined }, store);
  }
  return ticketByReference(reference);
}

/** Adds an internal note. Notes are for admins only and are kept with the ticket. */
export async function addNote(actor: Actor, reference: string, text: string) {
  const { store, collection } = await tickets();
  const ticket = await ticketByReference(reference);
  if (!ticket) throw new TicketError("That ticket doesn't exist.", 404);
  const note: TicketNote = { at: new Date(), by: actor.user._id, byEmail: actor.user.email, text: text.trim().slice(0, 2000) };
  if (!note.text) throw new TicketError("Write the note first.");
  await collection.updateOne({ _id: ticket._id }, { $set: { notes: [...(ticket.notes ?? []), note].slice(-100), updatedAt: new Date() } });
  await audit({ actorId: actor.user._id, actorEmail: actor.user.email, action: "ticket.note", target: reference, outcome: "ok" }, store);
}

/** Admins a ticket can be assigned to: everyone whose roles include support. */
export async function supportAdmins(): Promise<{ id: string; email: string }[]> {
  const store = await getStore();
  if (!store) return [];
  const members = await store.collection(STORE_COLLECTIONS.adminMembers).find({}, { limit: 200 }).toArray();
  const ids = members.map((m) => m._id);
  const users = await store.collection<UserDoc>(STORE_COLLECTIONS.users).find({ $or: [{ _id: { $in: ids } }, { email: { $in: [...(process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)] } }] }, { limit: 200 }).toArray();
  const result: { id: string; email: string }[] = [];
  for (const user of users) if ((await accessFor(user))?.permissions.has("support.manage")) result.push({ id: user._id, email: user.email });
  return result.sort((a, b) => a.email.localeCompare(b.email));
}
