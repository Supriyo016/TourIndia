import type { Metadata } from "next";
import Link from "next/link";
import { DiyaCharacter, FoodCharacter, HistorianCharacter, DancerCharacter } from "@/components/characters/Characters";
import { PageIntro } from "@/components/ui/primitives";

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
      <PageIntro crumbs={[{ label: "Culture and festivals" }]} eyebrow="Culture" title="Culture and festivals" lede="Knowing what a place celebrates, cooks and makes changes how you travel through it." />
      <div className="container-x py-10">
        <ul className="grid gap-5 md:grid-cols-2">
          {sections.map(({ href, title, body, Art }) => (
            <li key={href} className="card card-hover flex items-center gap-5 p-6">
              <Art className="h-24 w-20 shrink-0" />
              <div>
                <h2 className="text-2xl"><Link href={href} className="after:absolute after:inset-0">{title}</Link></h2>
                <p className="mt-1.5 text-ink-2">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
