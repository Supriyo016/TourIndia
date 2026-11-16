import styles from "./yatri.module.css";

/** Yatri's mark: a simple diya (oil lamp) in a round saffron badge, with a softly flickering flame. */
export function YatriOrb({ large }: { large?: boolean }) {
  return (
    <span aria-hidden className={`${styles.orb} ${large ? styles.large : ""}`}>
      <svg viewBox="0 0 40 40" className="size-full">
        <circle cx="20" cy="20" r="19" fill="#fbe9c8" stroke="#c2410c" strokeWidth="1.5" />
        <path className={styles.flame} d="M20 9c3 4 3.6 7 0 11-3.6-4-3-7 0-11Z" fill="#f59e0b" />
        <path d="M20 13c1.3 2 1.5 3.6 0 5.4-1.5-1.8-1.3-3.4 0-5.4Z" fill="#fde68a" />
        <path d="M9 22h22c-1 5-5.4 8-11 8s-10-3-11-8Z" fill="#b45309" />
        <path d="M12 22h16" stroke="#7c2d12" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M16 26.5h8" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
      </svg>
    </span>
  );
}
