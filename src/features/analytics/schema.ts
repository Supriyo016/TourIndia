import { z } from "zod";
import { EVENT_VARIANTS, FEATURE_EVENTS, type FeatureEvent } from "./shared";

/** What the beacon may send to /api/collect. Anything else is refused. */
const path = z.string().max(300);

/** `e` marks the first page of a visit (with its referrer); `from` is that first page, sent with the second one. */
const view = z.object({ t: z.literal("view"), p: path, e: z.literal(true).optional(), r: z.string().max(80).optional(), from: path.optional() }).strict();
const event = z
  .object({
    t: z.literal("event"),
    n: z.enum(Object.keys(FEATURE_EVENTS) as [FeatureEvent, ...FeatureEvent[]]),
    p: path,
    k: z.enum(EVENT_VARIANTS).optional(),
    q: z.string().max(100).optional(),
    c: z.number().int().min(0).max(10_000).optional(),
  })
  .strict();
const vital = z
  .object({
    t: z.literal("vital"),
    n: z.enum(["LCP", "INP", "CLS"]),
    v: z.number().finite().min(0),
    p: path,
  })
  .strict()
  .refine((item) => (item.n === "CLS" ? item.v <= 10 : item.v <= 60_000), { message: "That measurement is out of range." });

export const beaconSchema = z.object({ events: z.array(z.discriminatedUnion("t", [view, event, vital])).min(1).max(20) }).strict();
export type BeaconEvent = z.infer<typeof beaconSchema>["events"][number];
