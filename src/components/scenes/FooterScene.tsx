import { BoatCharacter, TrainCharacter } from "@/components/characters/Characters";
import styles from "./scenes.module.css";

/**
 * The footer's own landscape, drawn in depth: Himalayan peaks far back, temple
 * hills in the middle, a viaduct the train crosses, and a river with boats in
 * front. Each layer loops at its own speed, so the view seems to move past.
 */
const peaks = "M0 120 70 52 120 92 190 30 250 86 320 44 390 100 460 38 530 94 600 56 660 120Z";
const hills = "M0 120C60 80 110 78 170 96S280 70 340 88 450 64 520 90 610 78 660 98V120Z";

export function FooterScene() {
  return (
    <div aria-hidden className={styles.footerScene}>
      <div className={styles.sun} />
      <div className={`${styles.layer} ${styles.far}`}>
        {[0, 1].map((copy) => (
          <svg key={copy} viewBox="0 0 660 120" preserveAspectRatio="none">
            <path d={peaks} fill="#1d5560" />
            <path d="M190 30 205 48 182 46ZM460 38 474 56 450 54ZM320 44 333 60 310 58Z" fill="#e8f1f1" opacity="0.85" />
          </svg>
        ))}
      </div>
      <div className={`${styles.layer} ${styles.mid}`}>
        {[0, 1].map((copy) => (
          <svg key={copy} viewBox="0 0 660 120" preserveAspectRatio="none">
            <path d={hills} fill="#174750" />
            {/* Temple spires on the ridge. */}
            <path d="M150 92v-18l6-14 6 14v18ZM430 78v-16l5-12 5 12v16ZM560 86h20v-10l-10-10-10 10Z" fill="#123b43" />
          </svg>
        ))}
      </div>
      <div className={styles.bridge}>
        <div className={styles.train}>
          <TrainCharacter className="h-9 w-auto" />
        </div>
      </div>
      <div className={styles.river}>
        <div className={`${styles.boat} ${styles.boatOne}`}>
          <BoatCharacter className="h-10 w-auto" />
        </div>
        <div className={`${styles.boat} ${styles.boatTwo}`}>
          <BoatCharacter className="h-7 w-auto" />
        </div>
      </div>
      {[12, 38, 66, 88].map((left, index) => (
        <span key={left} className={styles.rising} style={{ left: `${left}%`, animationDelay: `${index * -3.5}s` }} />
      ))}
    </div>
  );
}
