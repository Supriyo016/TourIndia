import { buildSearchIndex } from "@/features/discovery/search-index";

export const dynamic = "force-static";

export function GET() {
  return Response.json(buildSearchIndex());
}
