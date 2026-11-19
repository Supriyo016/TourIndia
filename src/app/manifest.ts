import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name}: discover and plan travel across India`,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0e1a20",
    theme_color: "#14505c",
    categories: ["travel", "education"],
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
    shortcuts: [
      { name: "Explore the map", url: "/explore" },
      { name: "Plan a trip", url: "/planner" },
      { name: "Festival calendar", url: "/calendar" },
    ],
  };
}
