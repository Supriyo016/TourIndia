import styles from "./yatri.module.css";

/** Yatri's animated mark: a turning planet with a ring and a paper plane in orbit. */
export function YatriOrb({ large }: { large?: boolean }) {
  return (
    <span aria-hidden className={`${styles.orb} ${large ? styles.large : ""}`}>
      <span className={styles.ring} />
      <span className={styles.planet} />
      <span className={styles.plane} />
    </span>
  );
}
