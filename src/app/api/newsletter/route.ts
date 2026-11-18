import { gated } from "@/features/settings/gate";
import { createFormHandler } from "@/lib/api/form-handler";
import { COLLECTIONS } from "@/lib/database/mongo";
import { newsletterSchema } from "@/lib/validation/forms";

// Admins can pause this from the settings page.
export const POST = gated("newsletter", createFormHandler({
  schema: newsletterSchema,
  bucket: "newsletter",
  limit: { max: 5, windowSeconds: 3600 },
  save: async (db, { email }) => {
    // An upsert gives the same response for new and existing addresses, so the form can't reveal who has signed up.
    await db.collection(COLLECTIONS.newsletter).updateOne(
      { email },
      { $setOnInsert: { email, consentedAt: new Date(), status: "subscribed" } },
      { upsert: true },
    );
  },
}));
