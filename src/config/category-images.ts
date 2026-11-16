import type { ImageKey } from "@/lib/images";
import type { CategoryId } from "@/types/content";

/** A photo of the kind of place each travel style is about, shown behind the title. */
export const categoryImage: Record<CategoryId, ImageKey> = {
  "hill-stations": "destination:darjeeling",
  beaches: "hero:goa",
  mountains: "hero:ladakh",
  waterfalls: "destination:shillong-sohra",
  lakes: "hero:kashmir",
  monuments: "unesco:qutb-minar-and-its-monuments-delhi",
  "forts-palaces": "hero:rajasthan",
  "temples-heritage": "destination:madurai",
  wildlife: "unesco:kaziranga-national-park",
  "national-parks": "destination:kanha",
  adventure: "destination:spiti-valley",
  religious: "hero:varanasi",
  cultural: "festival:hornbill",
  village: "destination:majuli",
  photography: "destination:ziro",
  weekend: "destination:rishikesh",
  "hidden-gems": "destination:gandikota",
};
