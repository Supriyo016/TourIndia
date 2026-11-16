/**
 * Content model for Tour India. Editorial data lives in src/data and is typed
 * against these interfaces, so adding a state or destination means adding one
 * record rather than touching components.
 */

export type RegionId =
  | "north"
  | "west"
  | "central"
  | "south"
  | "east"
  | "northeast"
  | "islands";

export type CategoryId =
  | "hill-stations"
  | "beaches"
  | "mountains"
  | "waterfalls"
  | "lakes"
  | "monuments"
  | "forts-palaces"
  | "temples-heritage"
  | "wildlife"
  | "national-parks"
  | "adventure"
  | "religious"
  | "cultural"
  | "village"
  | "photography"
  | "weekend"
  | "hidden-gems";

/** A month number, 1 (January) to 12 (December). */
export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface LatLng {
  lat: number;
  lng: number;
}

export interface SourceLink {
  label: string;
  url: string;
}

export interface Attraction {
  name: string;
  description: string;
  /** Editorial estimate of a typical visit, in hours. */
  visitHours: number;
  coordinates?: LatLng;
  /** Used by the trip planner to match traveller interests. */
  interests: TravelInterest[];
  /** Best part of the day to visit. */
  timeOfDay?: "morning" | "afternoon" | "evening" | "any";
}

export type TravelInterest =
  | "history"
  | "nature"
  | "spiritual"
  | "food"
  | "adventure"
  | "wildlife"
  | "culture"
  | "relaxation"
  | "photography"
  | "shopping";

export interface NearbyPlace {
  name: string;
  distanceKm: number;
  note: string;
  /** Set when the place has its own guide on this site. */
  destinationSlug?: string;
}

export interface Dish {
  name: string;
  note: string;
}

export interface Faq {
  question: string;
  answer: string;
}

/** Per person, per day, in INR. Editorial estimates; never live prices. */
export interface BudgetEstimate {
  budget: [number, number];
  midRange: [number, number];
  comfort: [number, number];
  /** What the estimate covers and what it leaves out. */
  assumptions: string;
}

export interface Destination {
  slug: string;
  name: string;
  /** Matches StateProfile.slug. */
  stateSlug: string;
  region: RegionId;
  /** One plain sentence on why someone would go. */
  tagline: string;
  categories: CategoryId[];
  coordinates: LatLng;
  /** Exact English Wikipedia article title, used to source a licensed lead image. */
  wikipediaTitle: string;
  popular: boolean;
  hiddenGem: boolean;

  /** 3 to 4 paragraphs: what it is, geography, why it matters, what it feels like to visit. */
  overview: string[];
  /** 2 to 3 paragraphs of historical background. */
  history: string[];
  attractions: Attraction[];

  bestMonths: Month[];
  bestTimeNote: string;
  recommendedDays: { min: number; max: number };
  budget: BudgetEstimate;

  gettingThere: { air: string; rail: string; road: string; local: string };
  accommodation: string;
  cuisine: Dish[];
  /** Festival names. Use Festival.slug in festivalSlugs when it exists. */
  festivals: string[];
  festivalSlugs?: string[];
  nearby: NearbyPlace[];

  precautions: string[];
  tips: string[];
  accessibility: string;
  responsibleTravel: string;
  /** Permits needed, if any. Omit when none apply. */
  permits?: string;
  faqs: Faq[];

  officialLinks: SourceLink[];
  sources: SourceLink[];
  /** ISO date on which this guide was last reviewed. */
  lastReviewed: string;
}

export interface StateProfile {
  slug: string;
  name: string;
  kind: "state" | "union-territory";
  capital: string;
  region: RegionId;
  /** Name used in the boundary GeoJSON, when it differs from `name`. */
  geoName?: string;
  tagline: string;
  /** 2 paragraphs. */
  overview: string[];
  culture: string;
  attractionsSummary: string[];
  cuisine: string[];
  festivals: string[];
  languages: string[];
  bestMonths: Month[];
  recommendedDays: { min: number; max: number };
  permitNote?: string;
  /** Only an official portal that has been confirmed to load. */
  tourismUrl?: string;
  wikipediaTitle: string;
  sources: SourceLink[];
  lastReviewed: string;
}

export interface FestivalDate {
  /** Display label, for example "8 November 2027". */
  label: string;
  year: number;
  /** ISO date for sorting and calendar export, when a single start date is known. */
  isoStart?: string;
  source: SourceLink;
}

export interface FestivalPlace {
  place: string;
  note: string;
  destinationSlug?: string;
}

export type FestivalTheme =
  | "religious"
  | "harvest"
  | "seasonal"
  | "cultural"
  | "tribal"
  | "fair";

export interface Festival {
  slug: string;
  name: string;
  theme: FestivalTheme;
  /** Months in which the festival usually falls. */
  months: Month[];
  /** How the date is set, for example "Kartik Amavasya in the Hindu lunisolar calendar". */
  dateRule: string;
  /** Only dates confirmed against a cited source. */
  confirmedDates: FestivalDate[];
  /** State slugs, or an empty array for a pan-Indian festival. */
  stateSlugs: string[];
  panIndian: boolean;
  summary: string;
  history: string;
  significance: string;
  places: FestivalPlace[];
  travelAdvice: string;
  wikipediaTitle: string;
  sources: SourceLink[];
}

export interface Recipe {
  serves: number;
  timeMinutes: number;
  ingredients: string[];
  steps: string[];
}

export interface FoodItem {
  slug: string;
  name: string;
  region: RegionId;
  stateSlugs: string[];
  kind: "main" | "bread" | "rice" | "street" | "sweet" | "drink" | "snack";
  vegetarian: boolean;
  description: string;
  ingredients: string[];
  whereToTry: { place: string; destinationSlug?: string }[];
  recipe?: Recipe;
  wikipediaTitle: string;
}

export interface RegionalCuisine {
  region: RegionId;
  title: string;
  description: string;
  staples: string[];
}

export type HeritageKind =
  | "cultural"
  | "natural"
  | "mixed";

export interface UnescoSite {
  name: string;
  stateSlugs: string[];
  kind: HeritageKind;
  yearInscribed: number;
  summary: string;
  destinationSlug?: string;
  /** whc.unesco.org/en/list/<id> */
  unescoId: number;
  wikipediaTitle: string;
}

export interface MuseumOrSite {
  name: string;
  kind: "museum" | "archaeological-site" | "monument" | "fort-palace";
  stateSlug: string;
  city: string;
  summary: string;
  officialUrl?: string;
}

export type ArtCategory =
  | "classical-dance"
  | "folk-dance"
  | "music"
  | "handicraft"
  | "clothing"
  | "painting"
  | "language"
  | "custom";

export interface ArtForm {
  slug: string;
  name: string;
  category: ArtCategory;
  stateSlugs: string[];
  summary: string;
  whereToExperience: string;
  wikipediaTitle?: string;
}

/** An editorial guide. Never written as a first-person trip that did not happen. */
export interface Story {
  slug: string;
  title: string;
  dek: string;
  category: "How-to" | "Culture" | "Route" | "Season" | "Responsible travel";
  readingMinutes: number;
  body: { heading?: string; paragraphs: string[] }[];
  relatedDestinationSlugs: string[];
  wikipediaTitle: string;
  publishedOn: string;
  sources: SourceLink[];
}

export interface Circuit {
  slug: string;
  name: string;
  summary: string;
  days: number;
  destinationSlugs: string[];
  bestMonths: Month[];
  theme: string;
}

export interface LicensedImage {
  /** Path under /public. */
  src: string;
  width: number;
  height: number;
  /** Tiny base64 placeholder. */
  blur?: string;
  alt: string;
  author: string;
  license: string;
  licenseUrl?: string;
  sourceUrl: string;
}
