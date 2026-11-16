import styles from "./scenes.module.css";

/**
 * A quiet sky behind every page: kites, sky lanterns, birds and marigold petals
 * drifting at different depths. Pure CSS, so it costs no JavaScript; it sits
 * behind content, pauses with the tab and stays still for reduced motion.
 */

// [left %, depth in px (negative is further away), duration s, delay s]
const kites: [number, number, number, number][] = [
  [8, -300, 34, 0],
  [72, -120, 28, -9],
  [44, -520, 44, -20],
];
const lanterns: [number, number, number, number][] = [
  [18, -200, 38, -4],
  [61, -420, 52, -25],
  [86, -80, 31, -14],
  [33, -650, 60, -40],
];
const birds: [number, number, number, number][] = [
  [12, -260, 46, -6],
  [55, -480, 58, -30],
];
const petals: [number, number, number, number][] = [
  [5, -100, 24, -3],
  [27, -320, 30, -17],
  [48, -60, 22, -11],
  [69, -380, 33, -6],
  [91, -200, 27, -21],
];

function Kite() {
  return (
    <svg viewBox="0 0 60 110" className="h-full w-full">
      <path d="M30 2 56 34 30 70 4 34Z" fill="var(--accent)" />
      <path d="M30 2 30 70M4 34h52" stroke="rgb(0 0 0 / 0.25)" strokeWidth="1.5" />
      <path d="M30 2 56 34 30 34Z" fill="rgb(255 255 255 / 0.28)" />
      <path d="M30 70c-6 8 6 14 0 22s6 12 0 16" fill="none" stroke="var(--rani, #c2185b)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Lantern() {
  return (
    <svg viewBox="0 0 40 56" className="h-full w-full">
      <defs>
        <radialGradient id="ambient-lantern" cx="50%" cy="65%" r="60%">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="0.55" stopColor="#f6a93b" />
          <stop offset="1" stopColor="#d9622b" />
        </radialGradient>
      </defs>
      <path d="M8 6h24l6 40H2Z" fill="url(#ambient-lantern)" />
      <ellipse cx="20" cy="47" rx="9" ry="3" fill="#ffe08a" />
    </svg>
  );
}

function Bird() {
  return (
    <svg viewBox="0 0 60 24" className="h-full w-full">
      <path className={styles.wing} d="M2 14q14-14 28 0q14-14 28 0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Petal() {
  return (
    <svg viewBox="0 0 20 28" className="h-full w-full">
      <path d="M10 1C18 8 18 20 10 27 2 20 2 8 10 1Z" fill="#f4a62a" />
      <path d="M10 4v20" stroke="rgb(0 0 0 / 0.15)" />
    </svg>
  );
}

const style = ([left, depth, duration, delay]: [number, number, number, number]) =>
  ({ left: `${left}%`, "--z": `${depth}px`, animationDuration: `${duration}s`, animationDelay: `${delay}s` }) as React.CSSProperties;

export function AmbientScene() {
  return (
    <div aria-hidden className={`no-print ${styles.ambient}`}>
      {kites.map((item, index) => (
        <span key={`k${index}`} className={`${styles.sprite} ${styles.kite}`} style={style(item)}>
          <Kite />
        </span>
      ))}
      {lanterns.map((item, index) => (
        <span key={`l${index}`} className={`${styles.sprite} ${styles.lantern}`} style={style(item)}>
          <Lantern />
        </span>
      ))}
      {birds.map((item, index) => (
        <span key={`b${index}`} className={`${styles.sprite} ${styles.bird}`} style={style(item)}>
          <Bird />
        </span>
      ))}
      {petals.map((item, index) => (
        <span key={`p${index}`} className={`${styles.sprite} ${styles.petal} ${index > 2 ? styles.wide : ""}`} style={style(item)}>
          <Petal />
        </span>
      ))}
    </div>
  );
}
