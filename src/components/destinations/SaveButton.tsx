"use client";

import { Heart } from "lucide-react";
import { useFavourites } from "@/hooks/use-stored-value";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics/track";

export function SaveButton({ slug, name, variant = "icon" }: { slug: string; name: string; variant?: "icon" | "full" }) {
  const { favourites, toggle, ready } = useFavourites();
  const saved = ready && favourites.includes(slug);
  const press = () => {
    if (!saved) track("save_place");
    toggle(slug);
  };

  if (variant === "full") {
    return (
      <button type="button" className="btn btn-outline" aria-pressed={saved} onClick={press}>
        <Heart className={cn("size-5", saved && "fill-rani text-rani")} aria-hidden />
        {saved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from saved` : `Save ${name}`}
      onClick={press}
      className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-surface/95 text-ink shadow-md transition-transform hover:scale-105"
    >
      <Heart className={cn("size-5", saved && "fill-rani text-rani")} aria-hidden />
    </button>
  );
}
