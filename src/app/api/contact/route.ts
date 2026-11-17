import { randomUUID } from "node:crypto";
import { createFormHandler } from "@/lib/api/form-handler";
import { COLLECTIONS } from "@/lib/database/mongo";
import { contactSchema } from "@/lib/validation/forms";
import { newTicketReference } from "@/features/support/reference";
import { startingPriority } from "@/features/support/types";

/** Every contact message becomes a support ticket with a reference, category and priority. */
export const POST = createFormHandler({
  schema: contactSchema,
  bucket: "contact",
  limit: { max: 5, windowSeconds: 3600 },
  save: async (db, data) => {
    await db.collection<{ _id: string } & Record<string, unknown>>(COLLECTIONS.contact).insertOne({
      _id: randomUUID(),
      reference: newTicketReference(),
      ...data,
      priority: startingPriority(data.category),
      status: "new",
      notes: [],
      createdAt: new Date(),
    });
  },
});
