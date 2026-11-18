import "server-only";
import { getDatabase, isDatabaseConfigured } from "@/lib/database/mongo";
import { getStore, type Doc } from "@/lib/database/store";

/**
 * Read-only health checks for the admin health page. Vercel runs the servers, so there is nothing
 * here to restart: only what can be measured or read honestly.
 */

export interface DatabaseHealth {
  mode: "mongodb" | "memory" | "none";
  ok: boolean;
  latencyMs?: number;
  problem?: string;
}

export async function checkDatabase(): Promise<DatabaseHealth> {
  if (!isDatabaseConfigured()) {
    const store = await getStore();
    return store ? { mode: "memory", ok: true } : { mode: "none", ok: false, problem: "MONGODB_URI isn't set." };
  }
  const started = performance.now();
  try {
    const db = await getDatabase();
    await db.command({ ping: 1 });
    return { mode: "mongodb", ok: true, latencyMs: Math.round(performance.now() - started) };
  } catch (error) {
    // Only the error's class name: messages can include the host name.
    return { mode: "mongodb", ok: false, latencyMs: Math.round(performance.now() - started), problem: error instanceof Error ? error.name : "Unknown error" };
  }
}

/** What Vercel tells this build about itself (system environment variables), if anything. */
export function thisBuild() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  return {
    environment: process.env.VERCEL_ENV ?? (process.env.NODE_ENV === "production" ? "production" : "development"),
    commit: sha ? sha.slice(0, 7) : undefined,
    branch: process.env.VERCEL_GIT_COMMIT_REF || undefined,
    region: process.env.VERCEL_REGION || undefined,
  };
}

export interface Deployment {
  id: string;
  url?: string;
  state: string;
  target?: string;
  createdAt: Date;
  commit?: string;
  message?: string;
}

export type DeploymentInfo = { configured: false } | { configured: true; ok: false; problem: string } | { configured: true; ok: true; deployments: Deployment[] };

/**
 * The latest deployments from the Vercel API, only when the owner has added a read token
 * (VERCEL_API_TOKEN) and the project id (VERCEL_PROJECT_ID, plus VERCEL_TEAM_ID for team projects).
 */
export async function latestDeployments(fetcher: typeof fetch = fetch): Promise<DeploymentInfo> {
  const token = process.env.VERCEL_API_TOKEN;
  const project = process.env.VERCEL_PROJECT_ID;
  if (!token || !project) return { configured: false };
  const params = new URLSearchParams({ projectId: project, limit: "5" });
  if (process.env.VERCEL_TEAM_ID) params.set("teamId", process.env.VERCEL_TEAM_ID);
  try {
    const response = await fetcher(`https://api.vercel.com/v6/deployments?${params}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(4000) });
    if (!response.ok) return { configured: true, ok: false, problem: response.status === 401 || response.status === 403 ? "Vercel refused the token. Check it has read access to this project." : `Vercel answered ${response.status}.` };
    const data = (await response.json()) as { deployments?: (Doc & Record<string, unknown>)[] };
    const deployments = (data.deployments ?? []).slice(0, 5).map((d): Deployment => {
      const meta = (d.meta ?? {}) as Record<string, unknown>;
      return {
        id: String(d.uid ?? ""),
        url: typeof d.url === "string" ? d.url : undefined,
        state: String(d.state ?? d.readyState ?? "unknown"),
        target: typeof d.target === "string" ? d.target : undefined,
        createdAt: new Date(Number(d.created ?? d.createdAt ?? 0)),
        commit: typeof meta.githubCommitSha === "string" ? meta.githubCommitSha.slice(0, 7) : undefined,
        message: typeof meta.githubCommitMessage === "string" ? meta.githubCommitMessage.split("\n")[0]!.slice(0, 120) : undefined,
      };
    });
    return { configured: true, ok: true, deployments };
  } catch (error) {
    return { configured: true, ok: false, problem: error instanceof Error && error.name === "TimeoutError" ? "Vercel didn't answer in time." : "Couldn't reach Vercel." };
  }
}
