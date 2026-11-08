import type { Metadata } from "next";
import Link from "next/link";
import { FoodCharacter } from "@/components/characters/Characters";
import { PageIntro, Photo } from "@/components/ui/primitives";
import { foods, regionalCuisines } from "@/data/food";
import { regionName } from "@/data/taxonomy";

export const metadata: Metadata = {
  title: "Indian food explorer",
  description: "Regional cuisines of India, signature dishes, ingredients, recipes and where to try them.",
  alternates: { canonical: "/culture/food" },
};

export default function FoodPage() {
  return (
    <>
      <PageIntro crumbs={[{ label: "Culture", href: "/culture" }, { label: "Food" }]} eyebrow="Food explorer" title="Eat across India" lede="There is no single Indian cuisine. Each region's food follows its crops, coasts, faiths and history." />
      <div className="container-x py-10">
        <div className="space-y-14">
          {regionalCuisines.map((cuisine, index) => {
            const dishes = foods.filter((food) => food.region === cuisine.region);
            return (
              <section key={cuisine.region} aria-labelledby={`r-${cuisine.region}`}>
                <div className="mb-5 flex items-end justify-between gap-6">
                  <div className="max-w-3xl">
                    <p className="eyebrow mb-1">{regionName(cuisine.region)}</p>
                    <h2 id={`r-${cuisine.region}`}>{cuisine.title}</h2>
                    <p className="mt-2 text-ink-2">{cuisine.description}</p>
                    <p className="mt-2 text-[0.95rem] text-muted">Staples: {cuisine.staples.join(", ")}</p>
                  </div>
                  {index === 0 && <FoodCharacter className="hidden h-24 w-auto shrink-0 md:block" />}
                </div>
                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {dishes.map((food) => (
                    <li key={food.slug} className="card card-hover overflow-hidden">
                      <div className="zoom-media relative aspect-[4/3]">
                        <Photo imageKey={`food:${food.slug}`} sizes="(min-width: 1024px) 25vw, 92vw" />
                      </div>
                      <div className="p-4">
                        <div className="mb-1 flex flex-wrap gap-1.5">
                          {food.vegetarian && <span className="tag">Vegetarian</span>}
                          {food.recipe && <span className="tag tag-editorial">Recipe</span>}
                        </div>
                        <h3 className="text-lg"><Link href={`/culture/food/${food.slug}`} className="after:absolute after:inset-0">{food.name}</Link></h3>
                        <p className="mt-1 line-clamp-2 text-[0.95rem] text-ink-2">{food.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
