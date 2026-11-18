import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { FLAGS, type Flag } from "./flags";
import { isEnabled } from "./settings";

/** A 503 with a friendly reason when an admin has turned a feature off; null when it's on. */
export async function featureOff(flag: Flag): Promise<NextResponse | null> {
  return (await isEnabled(flag)) ? null : NextResponse.json({ error: FLAGS[flag].off, code: "feature-off" }, { status: 503 });
}

/** Wraps a route handler so it only runs while the feature is on. */
export const gated =
  <R extends Response>(flag: Flag, handler: (request: NextRequest) => Promise<R>) =>
  async (request: NextRequest) =>
    (await featureOff(flag)) ?? handler(request);
