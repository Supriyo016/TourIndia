import "server-only";
import { COLLECTIONS, getDatabase, isDatabaseConfigured } from "@/lib/database/mongo";

export interface CommunityStory {
  id: string;
  name: string;
  title: string;
  destination: string;
  story: string;
  publishedOn: string;
}

/** Approved reader stories only. Email addresses are never selected. */
export async function getApprovedStories(limit = 12): Promise<CommunityStory[]> {
  if (!isDatabaseConfigured()) return [];
  try {
    const db = await getDatabase();
    const rows = await db
      .collection(COLLECTIONS.stories)
      .find({ status: "approved" }, { projection: { name: 1, title: 1, destination: 1, story: 1, createdAt: 1 } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    return rows.map((row) => ({
      id: String(row._id),
      name: String(row.name),
      title: String(row.title),
      destination: String(row.destination),
      story: String(row.story),
      publishedOn: new Date(row.createdAt as Date).toISOString().slice(0, 10),
    }));
  } catch {
    return [];
  }
}
