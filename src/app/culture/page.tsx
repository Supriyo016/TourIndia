import { ScrollRail } from "@/components/ui/ScrollRail";
import type { Metadata } from "next";
import Link from "next/link";
import { DiyaCharacter, FoodCharacter, HistorianCharacter, DancerCharacter } from "@/components/characters/lazy";
import { PageIntro } from "@/components/ui/primitives";
import { artForms } from "@/data/arts";
import { festivals } from "@/data/festivals";
import { foods } from "@/data/food";
import { states } from "@/data/states";
import { monthNames, regions } from "@/data/taxonomy";

export const metadata: Metadata = {
  title: "Culture and festivals",
  description: "India's festival calendar, regional food, World Heritage Sites and living arts.",
  alternates: { canonical: "/culture" },
};

const sections = [
  { href: "/culture/festivals", title: "Festival calendar", body: "Filter festivals by month and state, and learn how each date is set and where to experience it.", Art: DiyaCharacter },
  { href: "/culture/food", title: "Food explorer", body: "Regional cuisines, signature dishes, recipes to try and where to eat them.", Art: FoodCharacter },
  { href: "/culture/heritage", title: "Heritage explorer", body: "India's UNESCO World Heritage Sites, along with museums, forts and archaeological sites.", Art: HistorianCharacter },
  { href: "/culture/arts", title: "Art and traditions", body: "Classical and folk dance, music, crafts, dress, painting, language and regional custom.", Art: DancerCharacter },
];

export default function CulturePage() {
  return (
    <>
      <PageIntro imageKey="festival:durga-puja" crumbs={[{ label: "Culture and festivals" }]} eyebrow="Culture" title="Culture and festivals" lede="Knowing what a place celebrates, cooks and makes changes how you travel through it." />
      <div className="container-x py-10">
        <ul className="grid gap-5 md:grid-cols-2">
          {sections.map(({ href, title, body, Art }) => (
            <li key={href} data-tilt className="card card-hover relative flex items-center gap-5 p-6">
              <Art className="h-24 w-20 shrink-0" />
              <div>
                <h2 className="text-2xl"><Link prefetch={false} href={href} className="after:absolute after:inset-0">{title}</Link></h2>
                <p className="mt-1.5 text-ink-2">{body}</p>
              </div>
            </li>
          ))}
        </ul>

        <section aria-labelledby="year-title" className="mt-14">
          <h2 id="year-title">The festival year</h2>
          <p className="mt-1 text-ink-2">Scroll through the months. Lunar festivals move between years, so check each one for confirmed dates.</p>
          <ScrollRail as="ol" label="Festivals by month" className="mt-5">
            {monthNames.map((month, index) => {
              const list = festivals.filter((festival) => festival.months.includes((index + 1) as never));
              return (
                <li key={month} className="card p-4">
                  <h3 className="text-lg">{month}</h3>
                  {list.length ? (
                    <ul className="mt-2 space-y-1 text-[0.95rem]">
                      {list.map((festival) => (
                        <li key={festival.slug}>
                          <Link prefetch={false} href={`/culture/festivals/${festival.slug}`} className="link-u text-ink-2 hover:text-brand">{festival.name}</Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-muted">No festivals in our guides this month.</p>
                  )}
                </li>
              );
            })}
          </ScrollRail>
        </section>

        <section aria-labelledby="regions-title" className="mt-14">
          <h2 id="regions-title">Culture by region</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {regions.map((region) => {
              const regionStates = new Set(states.filter((state) => state.region === region.id).map((state) => state.slug));
              const regionFestivals = festivals.filter((festival) => festival.stateSlugs.some((slug) => regionStates.has(slug)));
              const regionArts = artForms.filter((form) => form.stateSlugs.some((slug) => regionStates.has(slug)));
              const regionFoods = foods.filter((food) => food.region === region.id);
              if (!regionStates.size) return null;
              return (
                <article key={region.id} data-tilt className="card p-5">
                  <h3 className="text-xl">{region.name}</h3>
                  <p className="mt-1 text-sm text-muted">{regionFestivals.length} festivals · {regionArts.length} art forms{regionFoods.length ? ` · ${regionFoods.length} dishes` : ""}</p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {[...regionFestivals.slice(0, 2).map((item) => [item.name, `/culture/festivals/${item.slug}`]), ...regionArts.slice(0, 2).map((item) => [item.name, `/culture/arts/${item.slug}`]), ...regionFoods.slice(0, 2).map((item) => [item.name, `/culture/food/${item.slug}`])].map(([name, href]) => (
                      <li key={href}>
                        <Link prefetch={false} href={href!} className="chip !min-h-9 text-sm">{name}</Link>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
