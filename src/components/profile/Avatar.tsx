import { avatarById, type AvatarSpec, type Scene, type Skin } from "@/features/profile/avatars";

const SKIN: Record<Skin, { face: string; shade: string }> = {
  s1: { face: "#f6d7c3", shade: "#e7b9a0" },
  s2: { face: "#eabf98", shade: "#d49f76" },
  s3: { face: "#c98f62", shade: "#ad744b" },
  s4: { face: "#a46a43", shade: "#875433" },
  s5: { face: "#74472b", shade: "#5c361f" },
};

const SKY: Record<Scene, [string, string]> = {
  mountains: ["#bfe0f5", "#e8f4fb"],
  sea: ["#9fdcef", "#e6f7fb"],
  dunes: ["#fcd9a8", "#fff1dc"],
  tea: ["#cdebc4", "#f0f9ec"],
  sunrise: ["#ffc59e", "#ffe9d6"],
  city: ["#c9cdf5", "#eceefe"],
  backwaters: ["#b4e6d6", "#e8f8f2"],
  monsoon: ["#aebfd6", "#dfe7f1"],
};

function Backdrop({ scene }: { scene: Scene }) {
  switch (scene) {
    case "mountains":
      return (
        <g>
          <path d="M-5 92 L28 48 L50 76 L74 40 L125 96 L125 125 L-5 125 Z" fill="#7a95b0" />
          <path d="M28 48 L36 58 L31 57 L26 61 L21 58 Z M74 40 L84 52 L78 51 L73 55 L67 50 Z" fill="#fff" />
          <path d="M-5 104 Q30 90 60 100 T125 98 L125 125 L-5 125 Z" fill="#5d7a92" />
        </g>
      );
    case "sea":
      return (
        <g>
          <circle cx="94" cy="30" r="10" fill="#ffd36e" />
          <path d="M-5 92 Q15 86 35 92 T75 92 T125 92 L125 125 L-5 125 Z" fill="#2aa5c7" />
          <path d="M-5 102 Q15 96 35 102 T75 102 T125 102 L125 125 L-5 125 Z" fill="#1b86a7" />
        </g>
      );
    case "dunes":
      return (
        <g>
          <circle cx="26" cy="30" r="11" fill="#ffb347" />
          <path d="M-5 96 Q30 72 64 92 T125 86 L125 125 L-5 125 Z" fill="#e8a65d" />
          <path d="M-5 108 Q40 92 80 106 T125 102 L125 125 L-5 125 Z" fill="#d38a42" />
        </g>
      );
    case "tea":
      return (
        <g>
          <path d="M-5 90 Q30 70 62 86 T125 80 L125 125 L-5 125 Z" fill="#5fae5a" />
          <path d="M-5 102 Q34 86 70 100 T125 96 L125 125 L-5 125 Z" fill="#3f8f45" />
          <path d="M4 94 Q30 82 56 92 M70 88 Q96 78 120 86" stroke="#2f7a37" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      );
    case "sunrise":
      return (
        <g>
          <circle cx="60" cy="82" r="34" fill="#ff9f5a" opacity=".7" />
          <path d="M-5 96 L125 96 L125 125 L-5 125 Z" fill="#c86b3c" />
          <path d="M8 96 L8 80 L14 74 L20 80 L20 96 M98 96 L98 76 L106 66 L114 76 L114 96" fill="#a14f2a" />
        </g>
      );
    case "city":
      return (
        <g fill="#6e74c4">
          <rect x="-2" y="70" width="18" height="60" />
          <rect x="18" y="58" width="14" height="70" />
          <rect x="88" y="62" width="16" height="66" />
          <rect x="106" y="74" width="20" height="54" />
          <path d="M34 80 Q42 66 50 80 Z M70 82 Q78 68 86 82 Z" fill="#8a8fd6" />
          <g fill="#ffe08a">
            <rect x="3" y="78" width="4" height="4" />
            <rect x="22" y="66" width="4" height="4" />
            <rect x="93" y="70" width="4" height="4" />
            <rect x="111" y="82" width="4" height="4" />
          </g>
        </g>
      );
    case "backwaters":
      return (
        <g>
          <path d="M14 90 C14 60 20 48 22 40 M22 40 C14 38 8 42 4 48 M22 40 C30 36 38 40 40 46 M22 40 C20 32 14 28 8 28" stroke="#2f7a52" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M-5 94 Q30 90 60 94 T125 94 L125 125 L-5 125 Z" fill="#3aa58a" />
          <path d="M84 90 Q100 98 116 90 L112 96 L88 96 Z" fill="#7a4a2a" />
        </g>
      );
    case "monsoon":
      return (
        <g>
          <ellipse cx="30" cy="26" rx="22" ry="9" fill="#8ea2bd" />
          <ellipse cx="92" cy="22" rx="24" ry="10" fill="#8ea2bd" />
          <g stroke="#6f86a6" strokeWidth="2" strokeLinecap="round">
            <path d="M18 40 L14 50 M34 42 L30 52 M84 38 L80 48 M100 40 L96 50 M110 36 L106 46" />
          </g>
          <path d="M-5 100 Q30 94 60 100 T125 100 L125 125 L-5 125 Z" fill="#5b7795" />
        </g>
      );
  }
}

function HairBack({ spec }: { spec: AvatarSpec }) {
  const c = spec.hairColour;
  if (spec.hair === "long") return <path d="M37 56 C34 33 48 26 60 26 C73 26 87 33 83 56 L86 94 C80 99 73 95 70 90 L50 90 C47 95 40 99 34 94 Z" fill={c} />;
  if (spec.hair === "bob") return <path d="M37 58 C34 34 48 27 60 27 C73 27 86 34 83 58 L84 76 C78 80 72 76 72 72 L48 72 C48 76 42 80 36 76 Z" fill={c} />;
  if (spec.hair === "bun") return <circle cx="60" cy="27" r="9" fill={c} />;
  return null;
}

function HairFront({ spec }: { spec: AvatarSpec }) {
  const c = spec.hairColour;
  switch (spec.hair) {
    case "short":
    case "bun":
    case "long":
    case "bob":
      return <path d="M38 55 C37 36 49 29 61 29 C73 29 84 37 82 55 C79 45 71 40 62 41 C52 41 44 46 38 55 Z" fill={c} />;
    case "crop":
      return <path d="M40 50 C40 36 50 31 60 31 C71 31 80 36 80 50 C76 44 69 41 60 41 C51 41 44 44 40 50 Z" fill={c} />;
    case "curly":
      return (
        <g fill={c}>
          {[
            [42, 46], [46, 38], [53, 33], [61, 31], [69, 33], [75, 38], [79, 46], [50, 42], [70, 42], [60, 38],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="7" />
          ))}
        </g>
      );
    case "cap":
      return (
        <g>
          <path d="M39 52 C39 35 50 29 60 29 C71 29 81 35 81 52 Z" fill={spec.top} />
          <path d="M58 50 L96 52 C96 56 88 58 78 57 L58 55 Z" fill={spec.top} opacity=".85" />
          <circle cx="60" cy="30" r="2.5" fill="#fff" opacity=".7" />
        </g>
      );
    case "hat":
      return (
        <g>
          <ellipse cx="60" cy="44" rx="34" ry="7" fill="#d9b26f" />
          <path d="M44 44 C44 30 52 25 60 25 C68 25 76 30 76 44 Z" fill="#e8c582" />
          <path d="M44 40 L76 40 L76 44 L44 44 Z" fill={spec.top} />
        </g>
      );
  }
}

/** One of the preset illustrated avatars. Decorative unless a label is given. */
export function Avatar({ id, size = 48, label, className = "" }: { id?: string; size?: number; label?: string; className?: string }) {
  const spec = avatarById(id);
  const skin = SKIN[spec.skin];
  const [top, bottom] = SKY[spec.scene];
  const has = (extra: string) => (spec.extras as readonly string[]).includes(extra);
  const gradient = `sky-${spec.id}`;

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={`shrink-0 overflow-hidden rounded-full ${className}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect width="120" height="120" fill={`url(#${gradient})`} />
      <Backdrop scene={spec.scene} />
      <HairBack spec={spec} />
      {/* Shoulders and neck */}
      <path d="M18 122 C20 98 38 87 60 87 C82 87 100 98 102 122 Z" fill={spec.top} />
      <path d="M50 88 Q60 96 70 88" stroke="#000" strokeOpacity=".15" strokeWidth="2" fill="none" />
      <rect x="52" y="70" width="16" height="19" rx="7" fill={skin.shade} />
      {has("scarf") && <path d="M44 86 Q60 98 76 86 L78 92 Q60 104 42 92 Z M70 92 L76 110 L68 110 L64 96 Z" fill="#facc15" />}
      {has("camera") && (
        <g>
          <path d="M40 90 L66 112" stroke="#1f2937" strokeWidth="2.5" />
          <rect x="60" y="104" width="18" height="12" rx="2.5" fill="#1f2937" />
          <circle cx="69" cy="110" r="3.6" fill="#94a3b8" />
        </g>
      )}
      {/* Head */}
      <circle cx="40" cy="59" r="4.5" fill={skin.shade} />
      <circle cx="80" cy="59" r="4.5" fill={skin.shade} />
      <ellipse cx="60" cy="57" rx="20" ry="23" fill={skin.face} />
      {has("beard") && <path d="M41 60 C42 76 50 82 60 82 C70 82 78 76 79 60 C76 70 70 72 60 72 C50 72 44 70 41 60 Z" fill={spec.hairColour} />}
      {has("moustache") && <path d="M52 67 Q56 64 60 66 Q64 64 68 67 Q64 69 60 68 Q56 69 52 67 Z" fill={spec.hairColour} />}
      <ellipse cx="52" cy="58" rx="2.3" ry="2.6" fill="#1f1510" />
      <ellipse cx="68" cy="58" rx="2.3" ry="2.6" fill="#1f1510" />
      <path d="M48 52 Q52 50 55 52 M65 52 Q68 50 72 52" stroke={spec.hairColour} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="47" cy="65" r="3.2" fill="#f87171" opacity=".25" />
      <circle cx="73" cy="65" r="3.2" fill="#f87171" opacity=".25" />
      <path d="M54 70 Q60 75 66 70" stroke="#7c2d12" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <HairFront spec={spec} />
      {has("glasses") && (
        <g stroke="#1f2937" strokeWidth="1.8" fill="none">
          <circle cx="52" cy="58" r="5.5" />
          <circle cx="68" cy="58" r="5.5" />
          <path d="M57.5 58 L62.5 58" />
        </g>
      )}
      {has("sunglasses") && (
        <g fill="#1f2937">
          <rect x="45" y="54" width="13" height="8" rx="3" />
          <rect x="62" y="54" width="13" height="8" rx="3" />
          <rect x="57" y="56" width="6" height="2" />
        </g>
      )}
      {has("earrings") && (
        <g fill="#f59e0b">
          <circle cx="40" cy="66" r="2.2" />
          <circle cx="80" cy="66" r="2.2" />
        </g>
      )}
      {has("flower") && (
        <g transform="translate(78 40)">
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse key={angle} cx="0" cy="-4" rx="2.6" ry="4" fill="#fb7185" transform={`rotate(${angle})`} />
          ))}
          <circle r="2.2" fill="#fde047" />
        </g>
      )}
      {has("headphones") && (
        <g>
          <path d="M37 58 C37 34 48 26 60 26 C72 26 83 34 83 58" stroke="#111827" strokeWidth="4" fill="none" />
          <rect x="33" y="52" width="8" height="14" rx="3.5" fill="#111827" />
          <rect x="79" y="52" width="8" height="14" rx="3.5" fill="#111827" />
        </g>
      )}
    </svg>
  );
}
