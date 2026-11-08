import type { RegionId } from "@/types/content";

export interface Badge {
  id: string;
  name: string;
  description: string;
  earned: boolean;
}

const COASTAL = ["goa", "kerala", "tamil-nadu", "karnataka", "maharashtra", "gujarat", "odisha", "west-bengal", "andhra-pradesh", "puducherry"];
const HIMALAYAN = ["jammu-and-kashmir", "ladakh", "himachal-pradesh", "uttarakhand", "sikkim", "arunachal-pradesh"];
const NORTHEAST = ["assam", "arunachal-pradesh", "nagaland", "manipur", "mizoram", "meghalaya", "tripura", "sikkim"];

/** Badges are earned only from stamps the traveller records themselves on this device. */
export function computeBadges(stamps: string[], regionOf: (slug: string) => RegionId | undefined): Badge[] {
  const has = (list: string[]) => list.filter((slug) => stamps.includes(slug)).length;
  const regions = new Set(stamps.map(regionOf).filter(Boolean));
  return [
    { id: "first", name: "First stamp", description: "Add your first state or Union Territory.", earned: stamps.length >= 1 },
    { id: "five", name: "Five stamps", description: "Visit five states or Union Territories.", earned: stamps.length >= 5 },
    { id: "regions", name: "Four corners", description: "Visit at least four regions of India.", earned: regions.size >= 4 },
    { id: "coast", name: "Coastal", description: "Visit three coastal states or territories.", earned: has(COASTAL) >= 3 },
    { id: "himalaya", name: "High country", description: "Visit two Himalayan states or territories.", earned: has(HIMALAYAN) >= 2 },
    { id: "northeast", name: "Eight sisters and beyond", description: "Visit three Northeastern states.", earned: has(NORTHEAST) >= 3 },
    { id: "all", name: "All of India", description: "Stamp all 36 states and Union Territories.", earned: stamps.length >= 36 },
  ];
}
