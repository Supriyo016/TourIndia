import { NextResponse, type NextRequest } from "next/server";
import { getDestination } from "@/data";

interface OpenMeteoDaily {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: (number | null)[];
}

/**
 * Forecast for a guide on this site. Coordinates come from our own content, never
 * from the request, so this cannot be used to reach arbitrary hosts or locations.
 */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug") ?? "";
  const destination = /^[a-z-]{2,40}$/.test(slug) ? getDestination(slug) : undefined;
  if (!destination) {
    return NextResponse.json({ error: "Unknown destination." }, { status: 404 });
  }

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(destination.coordinates.lat));
  url.searchParams.set("longitude", String(destination.coordinates.lng));
  url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_probability_max");
  url.searchParams.set("forecast_days", "5");
  url.searchParams.set("timezone", "Asia/Kolkata");

  try {
    const response = await fetch(url, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(6000) });
    if (!response.ok) throw new Error(`Upstream ${response.status}`);
    const { daily } = (await response.json()) as { daily: OpenMeteoDaily };
    return NextResponse.json(
      {
        days: daily.time.map((date, index) => ({
          date,
          max: daily.temperature_2m_max[index],
          min: daily.temperature_2m_min[index],
          rain: daily.precipitation_probability_max[index] ?? null,
        })),
      },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" } },
    );
  } catch {
    return NextResponse.json({ error: "Forecast unavailable." }, { status: 502 });
  }
}
