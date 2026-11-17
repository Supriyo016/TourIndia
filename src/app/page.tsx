import Link from "next/link";
import { ArrowRight, CalendarDays, MapPinned, Sparkles, UtensilsCrossed } from "lucide-react";
import {
  BackpackerCharacter,
  CameraCharacter,
  DiyaCharacter,
  FoodCharacter,
  TrainCharacter,
} from "@/components/characters/lazy";
import { DestinationCard } from "@/components/destinations/DestinationCard";
import { LazyNewsletter } from "@/components/forms/LazyNewsletter";
import { HeroSlider, type HeroSlide } from "@/components/hero/HeroSlider";
import { TourVideo } from "@/components/ui/TourVideo";
import { JsonLd, Photo, SectionHeading } from "@/components/ui/primitives";
import { publishedSocials, site } from "@/config/site";
import { destinations, inSeason } from "@/data";
import { circuits } from "@/data/circuits";
import { festivals } from "@/data/festivals";
import { foods } from "@/data/food";
import { stories } from "@/data/stories";
import { formatMonthRange, monthName } from "@/data/taxonomy";
import { getImage, type ImageKey } from "@/lib/images";

/** Image, place, region, guide link, then the tagline shown with that slide. */
const heroSlides: [ImageKey, string, string, string, string][] = [
  ["hero:taj-mahal", "Taj Mahal", "Agra", "/destinations/agra", "Marble that changes colour with the light"],
  ["hero:kerala", "Kumarakom backwaters", "Kerala", "/destinations/alappuzha", "Slow days on palm-lined canals"],
  ["hero:rajasthan", "Jaisalmer Fort", "Rajasthan", "/destinations/jaisalmer", "A golden fort at the edge of the Thar"],
  ["hero:ladakh", "Pangong Tso", "Ladakh", "/destinations/leh", "A high lake that changes blue by the hour"],
  ["hero:varanasi", "The ghats", "Varanasi", "/destinations/varanasi", "Evenings of lamps on the Ganga"],
  ["hero:hampi", "Virupaksha Temple", "Hampi", "/destinations/hampi", "A kingdom's capital, carved in granite"],
  ["hero:goa", "Coco Beach", "Goa", "/destinations/goa", "Sea, spice and Konkan sunsets"],
  ["hero:amritsar", "The Golden Temple", "Amritsar", "/destinations/amritsar", "A shrine where everyone eats together"],
  ["hero:northeast", "Mawphlang", "Meghalaya", "/destinations/shillong-sohra", "Hills where the clouds come to rest"],
  ["hero:udaipur", "Lake Pichola", "Udaipur", "/destinations/udaipur", "Palaces that float on a lake"],
  ["hero:konark", "Sun Temple", "Konark", "/destinations/puri-konark", "A stone chariot for the sun god"],
  ["hero:munnar", "Tea gardens", "Munnar", "/destinations/munnar", "Hills combed green with tea"],
];


const tips = [
  ["Book long trains early", "Popular overnight routes fill up weeks ahead. Reservations open well before departure.", "/stories/how-to-book-and-read-indian-train-tickets"],
  ["Check permits first", "Parts of the Northeast, Ladakh and the islands need permits, and the rules differ for Indian and foreign visitors.", "/stories/permits-for-restricted-areas"],
  ["Dress for sacred places", "Covered shoulders and knees are expected at most temples, mosques and gurdwaras.", "/stories/visiting-temples-mosques-and-gurdwaras-respectfully"],
] as const;

export default function HomePage() {
  const slides: HeroSlide[] = heroSlides.flatMap(([key, place, region, href, tagline]) => {
    const image = getImage(key);
    return image ? [{ src: image.src, blur: image.blur, alt: image.alt, place, region, href, tagline, credit: `${image.author}, ${image.license}` }] : [];
  });

  const month = new Date().getMonth() + 1;
  const seasonal = inSeason(month).filter((item) => item.popular).slice(0, 4);
  const popular = destinations.filter((item) => item.popular).slice(0, 8);
  const gems = destinations.filter((item) => item.hiddenGem).slice(0, 4);
  const upcomingFestivals = festivals
    .filter((festival) => festival.months.some((value) => value === month || value === (month % 12) + 1))
    .slice(0, 4);
  const featuredFoods = foods.filter((food) => getImage(`food:${food.slug}`)).slice(0, 4);
  const storyList = stories.slice(0, 2);
  const gallery = destinations.filter((item) => getImage(`gallery:${item.slug}-2`)).slice(0, 6);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.name,
          url: site.url,
          description: site.description,
          founder: { "@type": "Person", name: site.owner.name },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: site.name,
          url: site.url,
          logo: `${site.url}/icon.svg`,
          founder: { "@type": "Person", name: site.owner.name },
          sameAs: publishedSocials.map((link) => link.url),
        }}
      />
      {slides.length > 0 ? (
        <HeroSlider slides={slides} />
      ) : (
        <section className="bg-[#0e3c46] py-24 text-white">
          <div className="container-x"><h1 className="!text-white">Explore our India</h1></div>
        </section>
      )}

      <section className="section lazy-render bg-surface-2" aria-labelledby="popular">
        <div className="container-x">
          <SectionHeading
            eyebrow="Popular"
            title="Places most first-time visitors ask about"
            action={<Link prefetch={false} href="/discover" className="btn btn-outline">All guides <ArrowRight className="nudge size-4" aria-hidden /></Link>}
          />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((item, index) => (
              <li key={item.slug} className={index >= 4 ? "reveal max-sm:hidden" : "reveal"}><DestinationCard destination={item} /></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section lazy-render" aria-label="Lesser-known places">
        <div className="container-x">
          <SectionHeading eyebrow="Quieter" title="Lesser-known places" lede="Fewer crowds, usually with more effort to reach." action={<Link prefetch={false} href="/discover/hidden-gems" className="btn btn-outline">More quiet places</Link>} />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {gems.map((item, index) => (
              <li key={item.slug} className={index >= 2 ? "reveal max-sm:hidden" : "reveal"}><DestinationCard destination={item} /></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section lazy-render bg-brand-strong text-white dark:bg-surface" aria-labelledby="season">
        <div className="container-x">
          <p className="eyebrow !text-[#f7c26b]">Right now</p>
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="season" className="!text-white">Good to visit in {monthName(month)}</h2>
              <p className="mt-2 max-w-xl text-white/85">Chosen from each guide&apos;s recommended months, so this list changes through the year.</p>
            </div>
            <Link prefetch={false} href={`/discover?month=${month}`} className="btn btn-on-photo">See all for {monthName(month)}</Link>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {seasonal.map((item, index) => (
              <li key={item.slug} className={index >= 2 ? "max-sm:hidden" : undefined}><DestinationCard destination={item} /></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section lazy-render" aria-labelledby="festivals">
        <div className="container-x grid items-start gap-10 lg:grid-cols-[2fr_3fr]">
          <div className="reveal">
            <DiyaCharacter className="mb-3 h-20 w-auto" />
            <p className="eyebrow mb-1.5">Culture</p>
            <h2 id="festivals">Festivals, food and living traditions</h2>
            <p className="lede mt-3">Many festivals follow lunar calendars, so dates shift each year. We show how each date is set and link to a source when a date is confirmed.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link prefetch={false} href="/culture/festivals" className="btn btn-primary"><CalendarDays className="size-4" aria-hidden /> Festival calendar</Link>
              <Link prefetch={false} href="/culture/arts" className="btn btn-outline">Art and traditions</Link>
              <Link prefetch={false} href="/culture/heritage" className="btn btn-outline">World Heritage Sites</Link>
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {upcomingFestivals.map((festival, index) => (
              <li key={festival.slug} className={`card card-hover reveal overflow-hidden ${index >= 2 ? "max-sm:hidden" : ""}`}>
                <div className="zoom-media relative aspect-[16/9]">
                  <Photo imageKey={`festival:${festival.slug}`} sizes="(min-width: 1024px) 28vw, 92vw" />
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted">Usually {formatMonthRange(festival.months)}</p>
                  <h3 className="text-lg">
                    <Link prefetch={false} href={`/culture/festivals/${festival.slug}`} className="after:absolute after:inset-0">{festival.name}</Link>
                  </h3>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section lazy-render bg-surface-2" aria-labelledby="circuits">
        <div className="container-x">
          <SectionHeading eyebrow="Routes" title="Travel circuits to start from" lede="Editorial suggestions. Open one in the planner and change anything you like." />
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {circuits.map((circuit, index) => (
              <li key={circuit.slug} className={`card card-hover flex flex-col p-5 ${index >= 3 ? "max-sm:hidden" : ""}`}>
                <p className="text-sm font-medium text-accent-ink">{circuit.theme}</p>
                <h3 className="mt-1">{circuit.name}</h3>
                <p className="mt-1.5 flex-1 text-[0.97rem] text-ink-2">{circuit.summary}</p>
                <p className="mt-3 text-sm text-muted">{circuit.days} days · {formatMonthRange(circuit.bestMonths)}</p>
                <Link prefetch={false} href={`/planner?d=${circuit.destinationSlugs.join(",")}&days=${circuit.days}`} className="link-text mt-2">
                  Open in planner
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section lazy-render" aria-labelledby="planner-promo">
        <div className="container-x">
          <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-brand-soft p-6 sm:p-10">
            <div className="grid items-center gap-8 md:grid-cols-[3fr_1fr]">
              <div>
                <p className="eyebrow mb-1.5">Trip planner</p>
                <h2 id="planner-promo">A day-by-day plan you can rearrange</h2>
                <p className="lede mt-3">Pick your places, dates and interests. You get an order that makes sense, daily plans and clearly labelled cost estimates, ready for your calendar.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link prefetch={false} href="/planner" className="btn btn-accent"><Sparkles className="size-4" aria-hidden /> Build an itinerary</Link>
                  <Link prefetch={false} href="/quiz" className="btn btn-outline">Not sure where to go?</Link>
                </div>
              </div>
              <BackpackerCharacter className="mx-auto hidden h-44 w-auto md:block" />
            </div>
            <div aria-hidden className="mt-6"><TrainCharacter className="h-10 w-auto opacity-90" /></div>
          </div>
        </div>
      </section>

      <section className="section lazy-render bg-surface-2" aria-labelledby="food">
        <div className="container-x">
          <div className="flex items-end justify-between gap-6">
            <SectionHeading eyebrow="Food explorer" title="Eat your way across the regions" action={<Link prefetch={false} href="/culture/food" className="btn btn-outline"><UtensilsCrossed className="size-4" aria-hidden /> All dishes</Link>} />
            <FoodCharacter className="mb-6 hidden h-24 w-auto shrink-0 lg:block" />
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredFoods.map((food, index) => (
              <li key={food.slug} className={`card card-hover overflow-hidden ${index >= 2 ? "max-sm:hidden" : ""}`}>
                <div className="zoom-media relative aspect-[4/3]">
                  <Photo imageKey={`food:${food.slug}`} sizes="(min-width: 1024px) 25vw, 92vw" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg"><Link prefetch={false} href={`/culture/food/${food.slug}`} className="after:absolute after:inset-0">{food.name}</Link></h3>
                  <p className="mt-1 line-clamp-2 text-[0.95rem] text-ink-2">{food.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section lazy-render" aria-labelledby="stories">
        <div className="container-x">
          <SectionHeading eyebrow="Travel stories" title="Practical reading before you go" action={<Link prefetch={false} href="/stories" className="btn btn-outline">All stories</Link>} />
          <ul className="grid gap-5 md:grid-cols-2">
            {storyList.map((story) => (
              <li key={story.slug} className="card card-hover overflow-hidden">
                <div className="zoom-media relative aspect-[16/9]">
                  <Photo imageKey={`story:${story.slug}`} sizes="(min-width: 768px) 32vw, 92vw" />
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted">{story.category} · {story.readingMinutes} min read</p>
                  <h3 className="mt-1 text-lg"><Link prefetch={false} href={`/stories/${story.slug}`} className="after:absolute after:inset-0">{story.title}</Link></h3>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section lazy-render" aria-labelledby="video-tour">
        <div className="container-x">
          <SectionHeading eyebrow="Video tour" title="See India in motion" lede="A short film of the places and celebrations that make the trip worthwhile." />
          <TourVideo />
        </div>
      </section>

      <section className="section lazy-render bg-surface-2" aria-labelledby="gallery-title">
        <div className="container-x">
          <div className="flex items-end justify-between gap-6">
            <SectionHeading eyebrow="Gallery" title="India in pictures" action={<Link prefetch={false} href="/gallery" className="btn btn-outline"><MapPinned className="size-4" aria-hidden /> Open gallery</Link>} />
            <CameraCharacter className="mb-6 hidden h-20 w-auto shrink-0 lg:block" />
          </div>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {gallery.map((item) => (
              <li key={item.slug} className="zoom-media relative aspect-[4/3] rounded-[var(--radius-md)]">
                <Link prefetch={false} href={`/destinations/${item.slug}`} aria-label={item.name}>
                  <Photo imageKey={`gallery:${item.slug}-2`} sizes="(min-width: 768px) 32vw, 46vw" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section lazy-render" aria-label="Travel tips and newsletter">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-1.5">Before you go</p>
            <h2 className="mb-5">Three things worth knowing</h2>
            <ol className="space-y-4">
              {tips.map(([title, body, href], index) => (
                <li key={title} className="flex gap-4">
                  <span className="font-display text-3xl leading-none text-accent-ink" aria-hidden>{index + 1}</span>
                  <div>
                    <Link prefetch={false} href={href} className="link-text text-[1.05rem]">{title}</Link>
                    <p className="text-[0.97rem] text-ink-2">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="card p-6">
            <h2 className="text-2xl">Occasional updates</h2>
            <p className="mt-2 mb-4 text-ink-2">New guides and festival dates, sent rarely. Your address is used for nothing else.</p>
            <LazyNewsletter />
          </div>
        </div>
      </section>
    </>
  );
}
