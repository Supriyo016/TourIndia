import "server-only";
import { isDatabaseConfigured } from "@/lib/database/mongo";
import { getStore, type Store } from "@/lib/database/store";
import { accountStats, communityStats, requestStats, type AccountStats, type CommunityStats, type RequestStats } from "./dashboard";
import { contentCounts, integrationStatus, siteInfo, yatriStatus, type YatriStatus } from "./status";

export interface DashboardData {
  generatedAt: Date;
  /** "mongodb", "memory" (development only) or null when no store could be reached. */
  storage: "mongodb" | "memory" | null;
  /** Set when the store was missing or a query failed; the store-backed cards are then null. */
  storeNote: string | null;
  accounts: AccountStats | null;
  community: CommunityStats | null;
  requests: RequestStats | null;
  yatri: YatriStatus;
  integrations: ReturnType<typeof integrationStatus>;
  content: ReturnType<typeof contentCounts>;
  site: ReturnType<typeof siteInfo>;
}

/** Call only after the admin check. Never throws: a database fault leaves the config cards working. */
export async function loadDashboard({ store: given, now = new Date() }: { store?: Store | null; now?: Date } = {}): Promise<DashboardData> {
  const databaseConfigured = isDatabaseConfigured();
  const base = { generatedAt: now, integrations: integrationStatus(), content: contentCounts(), site: siteInfo() };
  let store: Store | null = null;
  try {
    store = given === undefined ? await getStore() : given;
  } catch {
    store = null;
  }
  const storage = store ? (databaseConfigured ? "mongodb" : "memory") : null;
  if (!store) {
    return { ...base, storage, storeNote: "The database isn't connected, so accounts, community, requests and Yatri use can't be shown.", accounts: null, community: null, requests: null, yatri: await yatriStatus(null, { now }) };
  }
  try {
    const [accounts, community, requests, yatri] = await Promise.all([
      accountStats(store, now),
      communityStats(store),
      requestStats(store, now),
      yatriStatus(store, { databaseConfigured, now }),
    ]);
    return { ...base, storage, storeNote: null, accounts, community, requests, yatri };
  } catch (error) {
    console.error("[admin-dashboard]", error instanceof Error ? error.message : "query failed");
    return { ...base, storage, storeNote: "The database didn't answer, so accounts, community, requests and Yatri use can't be shown right now.", accounts: null, community: null, requests: null, yatri: await yatriStatus(null, { now }) };
  }
}
