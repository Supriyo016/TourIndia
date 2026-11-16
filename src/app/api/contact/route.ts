import { createFormHandler } from "@/lib/api/form-handler";
import { COLLECTIONS } from "@/lib/database/mongo";
import { contactSchema } from "@/lib/validation/forms";

export const POST = createFormHandler({
  schema: contactSchema,
  bucket: "contact",
  limit: { max: 5, windowSeconds: 3600 },
  save: async (db, data) => {
    await db.collection(COLLECTIONS.contact).insertOne({ ...data, status: "new", createdAt: new Date() });
  },
});
