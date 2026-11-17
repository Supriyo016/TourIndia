import { NextResponse, type NextRequest } from "next/server";
import { translateRequestSchema } from "@/features/translate/schema";
import { textsOnPage } from "@/features/translate/page-text";
import { TranslateError, translateTexts, type TranslateErrorCode } from "@/features/translate/translator";
import { site } from "@/config/site";
import { guardJsonPost } from "@/lib/api/form-handler";
import { isAllowed } from "@/lib/security/rate-limit";

export const maxDuration = 60;

const dailyLimit = () => {
  const value = Number(process.env.TRANSLATE_DAILY_LIMIT ?? 300);
  return Number.isInteger(value) && value > 0 ? value : 300;
};

const fail = (status: number, error: string, headers?: HeadersInit) => NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store", ...headers } });

const FAILURES: Record<TranslateErrorCode, [number, string]> = {
  "not-configured": [503, "Translation isn't set up on this site yet."],
  "daily-limit": [503, "Translation has reached its limit for today. Please try again tomorrow."],
  busy: [429, "The translator is busy. Please try again in a minute."],
  unavailable: [502, "Translation isn't available right now. Please try again later."],
};

export async function POST(request: NextRequest) {
  const guarded = await guardJsonPost(request, "translate", { max: 240, windowSeconds: 3600 });
  if (guarded instanceof NextResponse) return guarded;

  let body: unknown;
  try {
    body = JSON.parse(guarded.raw);
  } catch {
    return fail(400, "That request could not be read.");
  }
  const parsed = translateRequestSchema.safeParse(body);
  if (!parsed.success) return fail(422, parsed.error.issues[0]?.message ?? "That request wasn't valid.");
  if (!process.env.GROQ_API_KEY) return fail(...FAILURES["not-configured"]);

  const { lang, texts, path } = parsed.data;
  // Pages are checked against this site's own copy, never a host taken from the request.
  const origin = process.env.NODE_ENV === "production" ? site.url : request.nextUrl.origin;
  try {
    const translations = await translateTexts(lang, texts, {
      signal: request.signal,
      allowModel: (missing) => textsOnPage(origin, path, missing),
      // The site-wide cap counts only requests that reach the model; cached ones are free.
      beforeModelCall: () => isAllowed("translate-daily", "site", { max: dailyLimit(), windowSeconds: 86_400 }),
    });
    return NextResponse.json({ lang, translations }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code: TranslateErrorCode = error instanceof TranslateError ? error.code : "unavailable";
    const [status, message] = FAILURES[code];
    return fail(status, message, code === "busy" ? { "Retry-After": "60" } : undefined);
  }
}
