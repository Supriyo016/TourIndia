import Image from "next/image";
import { cn } from "@/lib/utils";
import skyline from "../../../public/images/footer/kolkata-neon-skyline.png";
import { LazySkylineActors } from "./LazySkylineActors";
import s from "./kolkata.module.css";

/**
 * The footer's neon Kolkata skyline (Howrah Bridge, Dakshineswar, Victoria Memorial, St Paul's)
 * with the city going about its evening in front: a tram, taxis, a cycle rickshaw, people strolling,
 * kites and festival fireworks.
 *
 * The skyline is the owner's illustration (2048 × 316, transparent). The moving layer shares its
 * coordinates, so traffic runs along the drawing's ground line; it loads only when the footer comes
 * near the screen. Motion uses transform and opacity only and stops under reduced motion.
 */
export function KolkataSkyline({ className }: { className?: string }) {
  return (
    <div className={cn(s.band, className)} aria-hidden>
      <div className={s.stage}>
        <Image src={skyline} alt="" sizes="(max-width: 640px) 760px, 100vw" className={s.image} draggable={false} />
        <LazySkylineActors />
      </div>
    </div>
  );
}
