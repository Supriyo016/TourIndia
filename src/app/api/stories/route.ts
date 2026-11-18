import { gated } from "@/features/settings/gate";
import { createFormHandler } from "@/lib/api/form-handler";
import { COLLECTIONS } from "@/lib/database/mongo";
import { storySchema } from "@/lib/validation/forms";

// Admins can pause this from the settings page.
export const POST = gated("stories", createFormHandler({
  schema: storySchema,
  bucket: "stories",
  limit: { max: 3, windowSeconds: 3600 },
  save: async (db, data) => {
    // Everything starts as pending. Nothing is published until the owner sets status to "approved".
    await db.collection(COLLECTIONS.stories).insertOne({
      name: data.name,
      email: data.email,
      title: data.title,
      destination: data.destination,
      story: data.story,
      status: "pending",
      createdAt: new Date(),
    });
  },
}));
