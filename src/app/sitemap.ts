import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { destinations, states } from "@/data";
import { festivals } from "@/data/festivals";
import { foods } from "@/data/food";
import { stories } from "@/data/stories";
import { artForms } from "@/data/arts";
import { categories } from "@/data/taxonomy";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/explore",
    "/discover",
    "/planner",
    "/calendar",
    "/compare",
    "/quiz",
    "/bookings",
    "/services",
    "/gallery",
    "/stories",
    "/culture",
    "/culture/festivals",
    "/culture/food",
    "/culture/heritage",
    "/culture/arts",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/cookies",
    "/disclaimer",
    "/content-policy",
    "/credits",
    "/encyclopedia",
    ...states.map(({ slug }) => `/explore/${slug}`),
    ...destinations.map(({ slug }) => `/destinations/${slug}`),
    ...categories.map(({ id }) => `/discover/${id}`),
    ...festivals.map(({ slug }) => `/culture/festivals/${slug}`),
    ...foods.map(({ slug }) => `/culture/food/${slug}`),
    ...stories.map(({ slug }) => `/stories/${slug}`),
    ...artForms.map(({ slug }) => `/culture/arts/${slug}`),
    ...destinations.map(({ slug }) => `/encyclopedia/${slug}`),
    ...states.map(({ slug }) => `/encyclopedia/states/${slug}`),
  ];
  return paths.map((path) => ({ url: `${site.url}${path}` }));
}
