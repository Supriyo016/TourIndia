import type { Metadata } from "next";
import { CommunityPanel } from "@/components/community/CommunityPanel";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, JsonLd, Photo, PhotoCredit } from "@/components/ui/primitives";
import { getDestination, getState } from "@/data";
import { foods } from "@/data/food";
import { regionName } from "@/data/taxonomy";

const find = (slug: string) => foods.find((food) => food.slug === slug);

export function generateStaticParams() {
  return foods.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/culture/food/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const food = find(slug);
  if (!food) return {};
  return { title: food.name, description: food.description, alternates: { canonical: `/culture/food/${slug}` } };
}

export default async function FoodDetailPage({ params }: PageProps<"/culture/food/[slug]">) {
  const { slug } = await params;
  const food = find(slug);
  if (!food) notFound();

  return (
    <article className="container-x max-w-4xl py-6">
      {food.recipe && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Recipe",
            name: food.name,
            description: food.description,
            recipeYield: `${food.recipe.serves} servings`,
            totalTime: `PT${food.recipe.timeMinutes}M`,
            recipeIngredient: food.recipe.ingredients,
            recipeInstructions: food.recipe.steps.map((text) => ({ "@type": "HowToStep", text })),
          }}
        />
      )}
      <Breadcrumbs items={[{ label: "Food", href: "/culture/food" }, { label: food.name }]} />
      <p className="eyebrow mt-5 mb-1">{regionName(food.region)}</p>
      <h1>{food.name}</h1>
      <p className="mt-2 text-muted">{food.stateSlugs.map((slugValue) => getState(slugValue)?.name).filter(Boolean).join(", ")}</p>
      <div className="relative mt-5 aspect-[16/9] overflow-hidden rounded-[var(--radius-lg)]">
        <Photo imageKey={`food:${food.slug}`} sizes="(min-width: 900px) 56rem, 100vw" priority />
      </div>
      <PhotoCredit imageKey={`food:${food.slug}`} className="mt-1.5" />
      <p className="lede mt-5">{food.description}</p>

      <div className="mt-7 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="mb-2 text-xl">Key ingredients</h2>
          <p className="text-ink-2">{food.ingredients.join(", ")}</p>
        </div>
        <div>
          <h2 className="mb-2 text-xl">Where to try it</h2>
          <ul className="space-y-1 text-ink-2">
            {food.whereToTry.map((place) => (
              <li key={place.place}>
                {place.destinationSlug && getDestination(place.destinationSlug) ? (
                  <Link prefetch={false} href={`/destinations/${place.destinationSlug}`} className="link-text">{place.place}</Link>
                ) : (
                  place.place
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {food.recipe && (
        <section className="card mt-9 p-6" aria-labelledby="recipe">
          <h2 id="recipe">Recipe</h2>
          <p className="mt-1 text-muted">Serves {food.recipe.serves} · about {food.recipe.timeMinutes} minutes</p>
          <div className="mt-5 grid gap-8 md:grid-cols-[2fr_3fr]">
            <div>
              <h3 className="mb-2 text-lg">Ingredients</h3>
              <ul className="list-disc space-y-1 pl-5 text-ink-2">
                {food.recipe.ingredients.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-lg">Method</h3>
              <ol className="list-decimal space-y-2 pl-5 text-ink-2">
                {food.recipe.steps.map((step) => <li key={step}>{step}</li>)}
              </ol>
            </div>
          </div>
        </section>
      )}
      <CommunityPanel target={{ type: "food", id: food.slug }} title={food.name} path={`/culture/food/${food.slug}`} />
    </article>
  );
}
