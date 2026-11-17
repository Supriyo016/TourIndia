/**
 * Original Tour India character cast, drawn as soft-shaded "3D" cartoons: every part has a
 * radial gradient for volume (highlight, base, core shadow and a reflected-light edge), a warm
 * rim light, a two-layer contact shadow and an ink outline.
 * All motion is layered CSS (characters.module.css): a slow asymmetric 3D turn, breathing, a
 * squash-and-stretch bob with a contact shadow that shrinks as the body rises, heads and cloth
 * that lag behind the body, glancing eyes with single and double blinks, and prop loops that
 * wind up and overshoot. Each character has its own tempo (Rig `t`), and parts run on unrelated
 * durations so the combined loop rarely repeats. Motion only runs inside
 * prefers-reduced-motion: no-preference, and only when `animated` is true.
 * Gradient ids come from useId() so several copies can share a page. All characters are
 * decorative and hidden from assistive technology.
 */
import { useId, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import st from "./characters.module.css";

const INK = "#13262b";

/** Highlight, base and core-shadow tones for each material. */
const PAL = {
  sa: ["#ffc46e", "#e8890c", "#9c4f00"],
  go: ["#fff3a6", "#e6c61a", "#9a7c00"],
  pe: ["#7fd6e3", "#1c7486", "#0a3b45"],
  ra: ["#ff9ad0", "#c2277f", "#681043"],
  fo: ["#9ee6bd", "#3a8a63", "#1a4a32"],
  sk: ["#f6cfa6", "#c98a5a", "#87522c"],
  cr: ["#ffffff", "#fbf3e2", "#d6c29a"],
  gr: ["#eef5f6", "#9fb0b5", "#5c7075"],
  dk: ["#4d666d", "#13262b", "#040b0d"],
} as const;
type Tone = keyof typeof PAL;
type Paint = (k: Tone | "sh" | "gl" | "fl") => string;

type Props = { className?: string; animated?: boolean };

const s = { stroke: INK, strokeWidth: 2.5, strokeLinejoin: "round", strokeLinecap: "round" } as const;
/** Outline for closed shapes, where joins and caps never show. */
const r = { stroke: INK, strokeWidth: 2.5 } as const;

/** Transform origin and phase offset for one moving part. */
const o = (origin: string, delay?: number): CSSProperties => ({
  transformOrigin: origin,
  animationDelay: delay ? `${delay}s` : undefined,
});

function useKit(): [string, Paint] {
  const id = "c" + useId().replace(/[^\w-]/g, "");
  return [id, (k) => `url(#${id}${k})`];
}

function Kit({ id, t, flame }: { id: string; t: Tone[]; flame?: boolean }) {
  return (
    <defs>
      {t.map((k) => (
        <radialGradient key={k} id={id + k} cx=".34" cy=".28" r=".85">
          <stop offset="0" stopColor={PAL[k][0]} />
          <stop offset=".46" stopColor={PAL[k][1]} />
          <stop offset=".84" stopColor={PAL[k][2]} />
          <stop offset="1" stopColor={PAL[k][1]} />
        </radialGradient>
      ))}
      <radialGradient id={id + "sh"}>
        <stop offset="0" stopColor="#000" stopOpacity=".3" />
        <stop offset=".55" stopColor="#000" stopOpacity=".12" />
        <stop offset="1" stopColor="#000" stopOpacity="0" />
      </radialGradient>
      {flame && (
        <>
          <radialGradient id={id + "gl"}>
            <stop offset="0" stopColor="#fff6b0" stopOpacity=".95" />
            <stop offset=".45" stopColor="#ffb02e" stopOpacity=".45" />
            <stop offset="1" stopColor="#ff8a00" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={id + "fl"} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#ff7a00" />
            <stop offset=".55" stopColor="#ffd23a" />
            <stop offset="1" stopColor="#fff8d0" />
          </linearGradient>
        </>
      )}
    </defs>
  );
}

/** Per-character tempo in seconds: b bob, k blink, w breath, n head, h hop (half a stride). */
type Tempo = Partial<Record<"b" | "k" | "w" | "n" | "h", number>>;

function Rig({ vb, className, animated, t, children }: Props & { vb: string; t?: Tempo; children: ReactNode }) {
  const style = Object.fromEntries(Object.entries(t ?? {}).map(([k, v]) => ["--" + k, `${v}s`])) as CSSProperties;
  return (
    <svg viewBox={vb} className={cn(st.rig, animated && st.live, className)} style={style} aria-hidden>
      {children}
    </svg>
  );
}

/** Soft ambient shadow plus a tighter contact core; `still` for figures that never leave the ground. */
function Shadow({ f, cx, cy, rx, ry = 4, still }: { f: Paint; cx: number; cy: number; rx: number; ry?: number; still?: boolean }) {
  return (
    <g className={still ? undefined : st.shadow}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={f("sh")} />
      <ellipse cx={cx} cy={cy} rx={rx * 0.55} ry={ry * 0.6} fill={f("sh")} />
    </g>
  );
}

/** Groups a head so it turns on the neck, out of step with the body. */
function Head({ at, d = 0, children }: { at: string; d?: number; children: ReactNode }) {
  return (
    <g className={st.nod} style={o(at, -d)}>
      {children}
    </g>
  );
}

/** Glossy eyes that glance and blink; `d` offsets both so characters never blink in unison. */
function Eyes({ x, y, gap = 12, r = 2.8, d = 0 }: { x: number; y: number; gap?: number; r?: number; d?: number }) {
  const c = Math.round(r * 38) / 100;
  const ry = Math.round(r * 12) / 10;
  return (
    <g className={st.look} style={o("50% 50%", -d * 1.7)}>
      <g className={st.blink} style={o("50% 50%", -d)}>
        {[x - gap / 2, x + gap / 2].map((ex) => (
          <g key={ex}>
            <ellipse cx={ex} cy={y} rx={r} ry={ry} fill={INK} />
            <circle cx={ex + c} cy={y - c} r={c} fill="#fff" />
          </g>
        ))}
      </g>
    </g>
  );
}

function Smile({ x, y, w = 10 }: { x: number; y: number; w?: number }) {
  return <path d={`M${x - w / 2} ${y} q${w / 2} ${w / 2} ${w} 0`} fill="none" {...s} strokeWidth={2.2} />;
}

function Blush({ x, y, gap }: { x: number; y: number; gap: number }) {
  return (
    <g fill={PAL.ra[0]} opacity=".45">
      <ellipse cx={x - gap / 2} cy={y} rx="4" ry="2.4" />
      <ellipse cx={x + gap / 2} cy={y} rx="4" ry="2.4" />
    </g>
  );
}

/** An outlined limb: ink underlay, a coloured stroke and a thin highlight along the lit side. */
function Limb({ d, c = PAL.sk[1], w = 12 }: { d: string; c?: string; w?: number }) {
  return (
    <>
      <path d={d} fill="none" stroke={INK} strokeWidth={w} strokeLinecap="round" />
      <path d={d} fill="none" stroke={c} strokeWidth={w - 5} strokeLinecap="round" />
      <path d={d} fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth={(w - 5) / 3} strokeLinecap="round" transform="translate(-1 -1)" />
    </>
  );
}

/** Haathi, the elephant mascot: a trunk wave with a wind-up, an ear flap and a swinging tail. */
export function ElephantCharacter({ className, animated = true }: Props) {
  const [id, f] = useKit();
  return (
    <Rig vb="0 0 160 150" className={className} animated={animated} t={{ b: 3.7, k: 5.3, w: 4.1, n: 6.7 }}>
      <Kit id={id} t={["gr", "ra", "sa", "go"]} />
      <Shadow f={f} cx={90} cy={125} rx={50} />
      <g className={st.bob}>
        <g className={st.breathe}>
          <path className={st.wag} style={o("0% 0%", -0.6)} d="M131 92 q12 4 9 18" fill="none" {...s} strokeWidth={3} />
          <path d="M46 122 V96 q0 -40 44 -40 q42 0 42 42 v24 h-20 v-16 h-44 v16z" fill={f("gr")} {...s} />
          <path className={st.rim} d="M100 60 q26 6 28 34" />
          {[51, 59, 117, 125].map((x) => (
            <circle key={x} cx={x + 1} cy="119" r="2.4" fill={PAL.cr[1]} />
          ))}
          <g className={st.drag} style={o("50% 0%")}>
            <path d="M60 104 h52 v8 h-52z" fill={f("go")} {...s} />
            <path d="M66 112 v5 M80 112 v5 M94 112 v5 M106 112 v5" stroke={PAL.ra[1]} strokeWidth="3" strokeLinecap="round" />
          </g>
          <Head at="70% 100%">
            <g className={st.flap} style={o("90% 30%")}>
              <ellipse cx="44" cy="62" rx="26" ry="31" fill={f("gr")} {...r} />
              <ellipse cx="44" cy="62" rx="15" ry="20" fill={f("ra")} opacity=".8" />
            </g>
            <circle cx="74" cy="66" r="29" fill={f("gr")} {...r} />
            <path className={st.rim} d="M51 56 a26 26 0 0 1 18 -18" />
            <ellipse className={st.hl} cx="68" cy="46" rx="7" ry="3.5" />
            <path d="M64 37 q10 -12 22 -2 l-8 11 h-7z" fill={f("sa")} {...s} />
            <circle className={st.twinkle} cx="75" cy="33" r="3.5" fill={f("go")} {...r} strokeWidth={1.8} />
            <Eyes x={76} y={60} gap={20} r={3} />
            <Blush x={75} y={72} gap={30} />
            <path d="M82 82 q-3 7 -11 7" fill="none" stroke={PAL.cr[1]} strokeWidth="4" strokeLinecap="round" />
            <g className={st.trunk} style={o("0% 90%")}>
              <Limb d="M84 80 q24 8 25 -16 q1 -9 9 -6" c={PAL.gr[1]} w={15} />
            </g>
          </Head>
        </g>
      </g>
    </Rig>
  );
}

/** A backpacker walking in place: legs and arms out of phase, a lagging head and a bouncing pack. */
export function BackpackerCharacter({ className, animated = true }: Props) {
  const [id, f] = useKit();
  return (
    <Rig vb="0 0 120 170" className={className} animated={animated} t={{ h: 0.47, k: 4.3 }}>
      <Kit id={id} t={["ra", "pe", "sa", "sk", "fo"]} />
      <Shadow f={f} cx={60} cy={161} rx={30} still />
      <g className={st.hop}>
        <g className={st.jiggle} style={o("50% 0%", -0.2)}>
          <rect x="28" y="62" width="26" height="50" rx="9" fill={f("ra")} {...r} />
          <path className={st.rim} d="M32 72 q0 -6 5 -7" />
        </g>
        <g className={st.arm} style={o("100% 0%", -0.06)}>
          <Limb d="M46 72 L40 104" />
        </g>
        {[42, 65].map((x, i) => (
          <g key={x} className={st.step} style={o("50% 0%", i ? -0.47 : 0)}>
            <rect x={x} y="108" width="13" height="44" rx="4" fill={f("pe")} {...r} />
            <rect x={x - 2} y="148" width="18" height="10" rx="4" fill={INK} />
          </g>
        ))}
        <path d="M40 66 q0 -12 14 -12 h18 q14 0 14 12 v50 h-46z" fill={f("sa")} {...s} />
        <path d="M50 56 v58" stroke={PAL.ra[2]} strokeWidth="4" strokeLinecap="round" />
        <path className={st.rim} d="M44 70 q0 -10 10 -11" />
        <g className={st.arm} style={o("0% 0%", -0.53)}>
          <Limb d="M84 72 L92 104" />
        </g>
        <g className={st.jiggle} style={o("50% 100%")}>
          <circle cx="63" cy="34" r="21" fill={f("sk")} {...r} />
          <ellipse className={st.hl} cx="55" cy="24" rx="5" ry="2.5" />
          <path d="M41 30 q22 -30 44 0 q-22 -9 -44 0z" fill={f("fo")} {...s} />
          <path d="M36 32 h54" {...s} fill="none" />
          <Eyes x={63} y={38} gap={13} d={1.3} />
          <Smile x={63} y={45} />
          <Blush x={63} y={44} gap={26} />
        </g>
      </g>
    </Rig>
  );
}

/** A local guide holding up a rippling flag, free arm swinging and head turning to the group. */
export function GuideCharacter({ className, animated = true }: Props) {
  const [id, f] = useKit();
  return (
    <Rig vb="0 0 120 170" className={className} animated={animated} t={{ b: 3.3, k: 4.9, w: 3.9, n: 5.9 }}>
      <Kit id={id} t={["sa", "cr", "pe", "sk", "dk"]} />
      <Shadow f={f} cx={56} cy={161} rx={30} />
      <g className={st.bob}>
        <g className={st.breathe}>
          <path d="M100 16 V112" {...s} strokeWidth={3} fill="none" />
          <path className={st.flag} style={o("100% 50%")} d="M100 16 l-28 9 l28 11z" fill={f("sa")} {...s} />
          <path d="M36 112 v44 h14 v-34 h8 v34 h14 v-44z" fill={f("cr")} {...s} />
          <rect x="34" y="152" width="17" height="8" rx="3" fill={f("dk")} />
          <rect x="57" y="152" width="17" height="8" rx="3" fill={f("dk")} />
          <g className={st.swing} style={o("100% 0%", -0.4)}>
            <Limb d="M32 74 L26 104" />
          </g>
          <path d="M28 70 q0 -14 16 -14 h22 q16 0 16 14 v48 h-54z" fill={f("pe")} {...s} />
          <path className={st.drag} d="M36 60 L78 116" stroke={PAL.go[1]} strokeWidth="5" />
          <path className={st.rim} d="M32 78 q0 -15 12 -17" />
          <Limb d="M82 76 L100 72" />
          <Head at="50% 100%" d={1.1}>
            <circle cx="55" cy="35" r="21" fill={f("sk")} {...r} />
            <ellipse className={st.hl} cx="47" cy="26" rx="5" ry="2.5" />
            <path d="M33 30 q4 -22 22 -22 q18 0 22 22 q-22 -8 -44 0z" fill={f("dk")} />
            <path d="M46 46 q9 5 18 0" fill="none" {...s} strokeWidth={4} />
            <Eyes x={55} y={37} gap={14} d={2.2} />
            <Blush x={55} y={44} gap={28} />
          </Head>
        </g>
      </g>
    </Rig>
  );
}

/** The train that crosses the footer: an uneven rattle, spinning wheels and drifting smoke. */
export function TrainCharacter({ className, animated = true }: Props) {
  const [id, f] = useKit();
  return (
    <Rig vb="0 0 200 70" className={className} animated={animated} t={{ k: 5.7 }}>
      <Kit id={id} t={["pe", "sa", "ra", "cr"]} />
      <Shadow f={f} cx={100} cy={66} rx={96} ry={3.5} still />
      <g fill="#fff" stroke={PAL.gr[1]}>
        {[0, -0.9, -1.7].map((d, i) => (
          <circle key={d} className={st.puff} style={o("50% 50%", d)} cx="170" cy="9" r={4.5 - i * 0.6} />
        ))}
      </g>
      <g className={st.rattle}>
        <rect x="4" y="14" width="74" height="40" rx="7" fill={f("pe")} {...r} />
        <rect x="82" y="14" width="74" height="40" rx="7" fill={f("sa")} {...r} />
        <path d="M10 45 h62 M88 45 h62" stroke={PAL.go[1]} strokeWidth="3" strokeLinecap="round" />
        <path className={st.rim} d="M9 20 h64 M87 20 h64" />
        <rect x="76" y="40" width="8" height="5" fill={INK} />
        <g fill={f("cr")} {...r} strokeWidth={2}>
          {[12, 34, 56, 90, 112, 134].map((x) => (
            <rect key={x} x={x} y="24" width="14" height="13" rx="2" />
          ))}
        </g>
        <rect x="165" y="8" width="10" height="10" rx="2" fill={INK} />
        <g className={st.rattle} style={o("50% 100%", -0.2)}>
          <path d="M160 54 V26 q0 -12 14 -12 q22 0 22 40z" fill={f("ra")} {...s} />
          <path className={st.rim} d="M164 40 V28 q0 -8 8 -10" />
          <circle cx="177" cy="33" r="7.5" fill={f("cr")} {...r} strokeWidth={2} />
          <Eyes x={177} y={32} gap={5.5} r={1.7} d={0.8} />
          <path d="M174 37 q3 2.5 6 0" fill="none" {...s} strokeWidth={1.6} />
        </g>
      </g>
      <g fill={INK} stroke={PAL.cr[2]} strokeWidth={2}>
        {[20, 62, 98, 140, 176].map((x) => (
          <g key={x} className={st.spin}>
            <circle cx={x} cy="58" r="8.5" />
            <path d={`M${x - 6} 58 h12 M${x} 52 v12`} />
            <circle cx={x} cy="58" r="2.4" fill={PAL.go[1]} stroke="none" />
          </g>
        ))}
      </g>
    </Rig>
  );
}

/** A mountaineer beside a small summit: rippling flag, a swinging pompom and a slow look around. */
export function MountaineerCharacter({ className, animated = true }: Props) {
  const [id, f] = useKit();
  return (
    <Rig vb="0 0 180 150" className={className} animated={animated} t={{ b: 4.1, k: 6.1, w: 3.5, n: 7.3 }}>
      <Kit id={id} t={["pe", "cr", "ra", "sk", "sa"]} />
      <path d="M6 142 L70 40 L134 142z" fill={f("pe")} {...s} />
      <path d="M50 72 L70 40 L90 72 l-10 -6 l-10 8 l-10 -8z" fill={f("cr")} {...s} />
      <path className={st.rim} d="M64 50 L54 66" />
      <path d="M70 40 V14" {...s} fill="none" />
      <path className={st.flag} style={o("0% 50%", -0.5)} d="M70 14 l22 7 l-22 7z" fill={f("sa")} {...s} strokeWidth={2} />
      <path className={st.twinkle} style={o("50% 50%", -1)} d="M58 84 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2z" fill="#fff" />
      <Shadow f={f} cx={136} cy={142} rx={26} ry={3.5} />
      <g className={st.bob}>
        <g className={st.breathe}>
          <path d="M120 140 v-30 h11 v20 h6 v-20 h11 v30z" fill={INK} />
          <path d="M112 112 q0 -22 22 -22 q22 0 22 22 v8 h-44z" fill={f("ra")} {...s} />
          <path className={st.rim} d="M116 108 q1 -12 10 -15" />
          <Limb d="M152 104 L162 100" />
          <path d="M158 142 L168 88" {...s} fill="none" strokeWidth={4} />
          <Head at="50% 100%" d={2}>
            <circle cx="134" cy="72" r="16" fill={f("sk")} {...r} />
            <path d="M117 68 q17 -24 34 0z" fill={f("sa")} {...s} />
            <circle className={st.wag} style={o("50% 100%", -0.3)} cx="134" cy="51" r="4.5" fill={PAL.go[1]} {...r} />
            <Eyes x={134} y={74} gap={12} r={2.3} d={3} />
            <Smile x={134} y={80} w={8} />
          </Head>
        </g>
      </g>
    </Rig>
  );
}

/** A camera that braces, clicks, fires its flash and kicks back, then glances around. */
export function CameraCharacter({ className, animated = true }: Props) {
  const [id, f] = useKit();
  return (
    <Rig vb="0 0 140 110" className={className} animated={animated} t={{ b: 3.1, k: 4.4, w: 3.7 }}>
      <Kit id={id} t={["go", "pe", "cr", "sa", "ra", "dk"]} />
      <Shadow f={f} cx={70} cy={104} rx={54} />
      <g className={st.bob}>
        <g className={st.breathe}>
          <g className={st.recoil} style={o("50% 100%")}>
            <rect className={st.press} x="94" y="14" width="16" height="10" rx="3" fill={f("ra")} {...r} strokeWidth={2} />
            <path d="M48 22 l8 -12 h28 l8 12z" fill={f("go")} {...s} />
            <rect x="10" y="22" width="120" height="76" rx="12" fill={f("pe")} {...r} />
            <rect x="12" y="50" width="116" height="22" fill={INK} opacity=".22" />
            <path className={st.rim} d="M16 44 v-10 q0 -6 6 -6 h20" />
            <circle cx="70" cy="60" r="31" fill={f("dk")} {...r} />
            <circle cx="70" cy="60" r="25" fill={f("cr")} />
            <circle className={st.spinSlow} cx="70" cy="60" r="20" fill="none" stroke={PAL.pe[1]} strokeOpacity=".4" strokeWidth="2" strokeDasharray="5 5" />
            <ellipse className={st.hl} cx="60" cy="44" rx="8" ry="4" />
            <Eyes x={70} y={56} gap={16} r={3.2} d={0.5} />
            <Smile x={70} y={66} w={12} />
            <Blush x={70} y={66} gap={30} />
            <circle cx="114" cy="38" r="5.5" fill={f("sa")} {...r} strokeWidth={2} />
          </g>
          <g className={st.flash}>
            <circle cx="114" cy="38" r="12" fill="#fff6b0" opacity=".6" />
            <path d="M114 24 l3 10 l10 4 l-10 4 l-3 10 l-3 -10 l-10 -4 l10 -4z" fill="#fff" />
          </g>
        </g>
      </g>
    </Rig>
  );
}

/** A cook stirring a pot on the boil: the hat lags behind the head and steam curls up unevenly. */
export function FoodCharacter({ className, animated = true }: Props) {
  const [id, f] = useKit();
  return (
    <Rig vb="0 0 150 170" className={className} animated={animated} t={{ b: 3.5, k: 5.1, w: 4.3, n: 4.7 }}>
      <Kit id={id} t={["cr", "sk", "ra", "sa", "dk"]} />
      <Shadow f={f} cx={76} cy={165} rx={52} ry={3.5} still />
      <g className={st.bob}>
        <g className={st.breathe}>
          <path d="M40 118 q0 -44 36 -44 q36 0 36 44z" fill={f("cr")} {...s} />
          <path className={st.rim} d="M48 104 q2 -20 16 -26" />
          <g className={st.stir} style={o("0% 100%")}>
            <path d="M108 94 L136 66" stroke={INK} strokeWidth="5" strokeLinecap="round" />
            <circle cx="139" cy="62" r="8" fill={f("sa")} {...r} />
          </g>
          <Head at="50% 100%" d={0.8}>
            <circle cx="76" cy="52" r="24" fill={f("sk")} {...r} />
            <ellipse className={st.hl} cx="67" cy="42" rx="6" ry="3" />
            <path className={st.drag} style={o("50% 100%")} d="M52 40 q-12 -22 10 -22 q14 -14 28 0 q20 0 8 22z" fill={f("cr")} {...s} />
            <Eyes x={76} y={54} gap={14} d={2.6} />
            <path d="M68 62 q8 -4 16 0" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
            <Smile x={76} y={65} w={8} />
            <Blush x={76} y={62} gap={30} />
          </Head>
        </g>
      </g>
      {[50, 76, 102].map((x, i) => (
        <path
          key={x}
          className={st.steam}
          style={{ ...o("50% 100%", -i * 1.1), animationDuration: `${3.3 + i * 0.7}s` }}
          d={`M${x} 118 q-6 -8 0 -16 q6 -8 0 -16`}
          fill="none"
          stroke="#fff"
          strokeOpacity=".85"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      ))}
      <path d="M30 122 h92 l-8 36 q-2 6 -8 6 h-60 q-6 0 -8 -6z" fill={f("ra")} {...s} />
      <path d="M36 134 h80" stroke={PAL.go[1]} strokeWidth="3" />
      <path className={st.rim} d="M38 130 l5 24" />
      <path d="M22 122 h108" {...s} strokeWidth={6} />
    </Rig>
  );
}

/** A diya whose flame and inner core flicker on different beats, with glow and drifting embers. */
export function DiyaCharacter({ className, animated = true }: Props) {
  const [id, f] = useKit();
  return (
    <Rig vb="0 0 130 120" className={className} animated={animated} t={{ k: 5.9, w: 4.7 }}>
      <Kit id={id} t={["ra", "go"]} flame />
      <Shadow f={f} cx={65} cy={112} rx={48} still />
      <circle className={st.glow} cx="65" cy="36" r="34" fill={f("gl")} />
      {[
        [58, 0],
        [72, -1.3],
        [65, -2.2],
      ].map(([x, d]) => (
        <circle key={x} className={st.ember} style={o("50% 50%", d)} cx={x} cy="22" r="1.6" fill="#ffd65a" />
      ))}
      <g className={st.flicker} style={o("50% 100%")}>
        <path d="M65 8 q22 26 0 50 q-22 -24 0 -50z" fill={f("fl")} {...s} />
        <g className={st.core} style={o("50% 100%")}>
          <path d="M65 28 q9 12 0 24 q-9 -12 0 -24z" fill={PAL.sa[1]} />
          <ellipse cx="65" cy="46" rx="2.5" ry="5" fill="#fff" opacity=".8" />
        </g>
      </g>
      <g className={st.breathe}>
        <path d="M12 62 h106 q-4 46 -53 46 q-49 0 -53 -46z" fill={f("ra")} {...s} />
        <path className={st.rim} d="M20 72 q4 20 22 28" />
        <path d="M22 68 h86" stroke={PAL.go[1]} strokeWidth="4" strokeLinecap="round" />
        {[30, 100].map((x) => (
          <circle key={x} cx={x} cy="82" r="3" fill={f("go")} />
        ))}
        <Eyes x={65} y={80} gap={30} r={3} d={1.1} />
        <Smile x={65} y={90} w={14} />
        <Blush x={65} y={90} gap={44} />
      </g>
    </Rig>
  );
}

const wave = (y: number) => `M-32 ${y} q8 -5 16 0${" t16 0".repeat(15)}`;

/** A wooden houseboat: bob and rock on unrelated beats, a rippling pennant and moving water. */
export function BoatCharacter({ className, animated = true }: Props) {
  const [id, f] = useKit();
  return (
    <Rig vb="0 0 190 110" className={className} animated={animated} t={{ b: 3.1, k: 5.5 }}>
      <Kit id={id} t={["fo", "cr", "sa", "pe", "go"]} />
      <ellipse className={st.shadow} cx="95" cy="98" rx="80" ry="6" fill={PAL.pe[2]} opacity=".25" />
      <g className={st.bob}>
        <g className={st.rock} style={o("50% 100%")}>
          <path d="M95 27 V8" {...s} strokeWidth={2} fill="none" />
          <path className={st.flag} style={o("0% 50%")} d="M95 8 l14 5 l-14 5z" fill={f("sa")} {...s} strokeWidth={1.8} />
          <path d="M46 44 q48 -38 98 0z" fill={f("fo")} {...s} />
          <path className={st.rim} d="M58 38 q16 -12 32 -13" />
          <rect x="56" y="44" width="78" height="26" fill={f("cr")} {...r} />
          <rect x="62" y="49" width="12" height="11" rx="2" fill={f("pe")} opacity=".7" />
          <rect x="116" y="49" width="12" height="11" rx="2" fill={f("pe")} opacity=".7" />
          <Eyes x={95} y={55} gap={18} d={2} />
          <Smile x={95} y={62} w={12} />
          <path d="M8 58 q84 26 174 0 q-8 36 -42 36 h-90 q-34 0 -42 -36z" fill={f("sa")} {...s} />
          <path d="M16 68 q79 22 158 0" fill="none" stroke={PAL.go[1]} strokeWidth="3" />
          <path className={st.rim} d="M20 72 q6 14 22 18" />
        </g>
      </g>
      <path className={st.waterSlow} d={wave(98)} fill="none" stroke={PAL.pe[0]} strokeOpacity=".7" strokeWidth="2.5" strokeLinecap="round" />
      <path className={st.water} d={wave(104)} fill="none" stroke={PAL.pe[1]} strokeWidth="3" strokeLinecap="round" />
    </Rig>
  );
}

/** A brass compass whose needle hunts for north, settles with a damped wobble, then gets nudged. */
export function CompassCharacter({ className, animated = true }: Props) {
  const [id, f] = useKit();
  return (
    <Rig vb="0 0 120 120" className={className} animated={animated} t={{ b: 3.9, w: 5.1 }}>
      <Kit id={id} t={["go", "cr", "ra", "gr"]} />
      <Shadow f={f} cx={60} cy={114} rx={38} ry={3.5} />
      <g className={st.bob}>
        <circle cx="60" cy="58" r="50" fill={f("go")} {...r} />
        <circle cx="60" cy="58" r="42" fill={f("cr")} {...r} strokeWidth={2} />
        <circle className={st.spinSlow} cx="60" cy="58" r="35" fill="none" stroke={PAL.pe[1]} strokeWidth="3" strokeDasharray="4 7" />
        <path d="M60 19 l4 7 h-8z" fill={PAL.ra[1]} />
        <g className={st.needle}>
          <path d="M60 22 L70 58 H50z" fill={f("ra")} {...s} />
          <path d="M60 94 L70 58 H50z" fill={f("gr")} {...s} />
        </g>
        <circle cx="60" cy="58" r="7" fill={f("go")} {...r} />
        <path className={st.rim} d="M22 46 a40 40 0 0 1 26 -28" />
        <ellipse className={st.glint} cx="44" cy="34" rx="12" ry="5" fill="#fff" opacity=".5" transform="rotate(-30 44 34)" />
      </g>
    </Rig>
  );
}

/** A tiger cub: a tail swish that overshoots, ears that twitch on their own beats, a turning head. */
export function TigerCharacter({ className, animated = true }: Props) {
  const [id, f] = useKit();
  return (
    <Rig vb="0 0 140 130" className={className} animated={animated} t={{ b: 3.6, k: 4.1, w: 3.3, n: 6.3 }}>
      <Kit id={id} t={["sa", "cr"]} />
      <Shadow f={f} cx={70} cy={124} rx={46} />
      <g className={st.swish} style={o("0% 100%")}>
        <Limb d="M106 108 q26 -2 22 -34" c={PAL.sa[1]} w={11} />
        <path d="M124 92 l6 -2 M127 82 l6 -1" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      </g>
      <g className={st.bob}>
        <g className={st.breathe}>
          <Head at="50% 90%" d={1.4}>
            {[36, 104].map((x, i) => (
              <g key={x} className={st.twitch} style={{ ...o("50% 100%", i ? -1.7 : 0), animationDuration: i ? "5.3s" : undefined }}>
                <circle cx={x} cy="30" r="15" fill={f("sa")} {...r} />
                <circle cx={x} cy="31" r="7" fill={f("cr")} />
              </g>
            ))}
            <circle cx="70" cy="68" r="50" fill={f("sa")} {...r} />
            <path className={st.rim} d="M28 50 a46 46 0 0 1 28 -26" />
            <path d="M70 20 v18 M52 24 l4 14 M88 24 l-4 14 M22 66 h16 M118 66 h-16 M26 86 l14 -6 M114 86 l-14 -6" {...s} strokeWidth={5} fill="none" />
            <ellipse cx="70" cy="90" rx="24" ry="18" fill={f("cr")} {...r} />
            <Eyes x={70} y={62} gap={36} r={4} d={0.3} />
            <path d="M63 80 h14 l-7 7z" fill={INK} />
            <path d="M70 87 v5 M60 96 q10 6 20 0 M44 88 l-14 -2 M44 94 l-14 2 M96 88 l14 -2 M96 94 l14 2" {...s} strokeWidth={1.8} fill="none" />
            <Blush x={70} y={78} gap={56} />
          </Head>
          {[50, 90].map((x) => (
            <ellipse key={x} cx={x} cy="116" rx="12" ry="7" fill={f("cr")} {...r} />
          ))}
        </g>
      </g>
    </Rig>
  );
}

/** An archaeologist reading a field book: head dips to the page, pages flip, spectacles glint. */
export function HistorianCharacter({ className, animated = true }: Props) {
  const [id, f] = useKit();
  return (
    <Rig vb="0 0 130 170" className={className} animated={animated} t={{ b: 4.3, k: 6.7, w: 4.1, n: 5.3 }}>
      <Kit id={id} t={["fo", "sk", "cr", "sa", "dk"]} />
      <Shadow f={f} cx={60} cy={161} rx={32} ry={3.5} />
      <g className={st.bob}>
        <g className={st.breathe}>
          <path d="M40 114 v42 h14 v-32 h10 v32 h14 v-42z" fill={f("dk")} />
          <path d="M30 72 q0 -14 16 -14 h26 q16 0 16 14 v46 h-58z" fill={f("fo")} {...s} />
          <path d="M31 104 h56" stroke={PAL.sa[2]} strokeWidth="4" />
          <path className={st.rim} d="M34 80 q0 -15 12 -17" />
          <Limb d="M84 82 L94 92" />
          <Head at="50% 100%" d={0.6}>
            <circle cx="59" cy="38" r="20" fill={f("sk")} {...r} />
            <g className={st.drag} style={o("50% 100%")}>
              <path d="M30 34 h58" {...s} strokeWidth={6} />
              <path d="M38 33 q0 -24 21 -24 q21 0 21 24z" fill={f("cr")} {...s} />
              <path d="M38 29 h42" stroke={PAL.sa[1]} strokeWidth="3" />
              <ellipse className={st.hl} cx="51" cy="18" rx="6" ry="3" />
            </g>
            <Eyes x={59} y={42} gap={14} r={2.1} d={1.6} />
            <g fill="none" {...s} strokeWidth={2}>
              <circle cx="52" cy="42" r="6.5" />
              <circle cx="66" cy="42" r="6.5" />
            </g>
            <path className={st.glint} d="M48 39 l3 -2 M62 39 l3 -2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
            <Smile x={59} y={52} w={9} />
          </Head>
          <rect x="84" y="76" width="40" height="28" rx="3" fill={f("sa")} {...r} />
          <path d="M86 79 h17 v22 h-17z M105 79 h17 v22 h-17z" fill={f("cr")} />
          <path d="M89 85 h11 M89 91 h8 M108 85 h11 M108 91 h8" stroke={INK} strokeOpacity=".4" strokeWidth="1.6" />
          <g className={st.page} style={o("0% 50%")}>
            <path d="M104 79 h18 v22 h-18z" fill={f("cr")} stroke={INK} strokeOpacity=".3" />
            <path d="M108 87 h10 M108 93 h7" stroke={INK} strokeOpacity=".35" strokeWidth="1.6" />
          </g>
        </g>
      </g>
    </Rig>
  );
}

/** Festive dancer on a two-step beat: the skirt trails the hips, arms answer each other, head sways. */
export function DancerCharacter({ className, animated = true }: Props) {
  const [id, f] = useKit();
  return (
    <Rig vb="0 0 150 170" className={className} animated={animated} t={{ h: 0.62, k: 3.9 }}>
      <Kit id={id} t={["ra", "sa", "sk", "go", "dk"]} />
      <Shadow f={f} cx={75} cy={163} rx={44} ry={3.5} still />
      <g className={st.hop}>
        <g className={st.sway} style={o("50% 0%", -0.12)}>
          <path d="M34 160 l26 -66 h30 l26 66z" fill={f("ra")} {...s} />
          <path d="M46 160 l18 -66 M104 160 l-18 -66 M75 160 v-66" stroke={PAL.go[1]} strokeWidth="4" />
          <path className={st.rim} d="M40 152 l20 -52" />
        </g>
        <path d="M58 94 v-26 q0 -8 8 -8 h18 q8 0 8 8 v26z" fill={f("sa")} {...s} />
        <path className={st.rim} d="M62 88 v-18 q0 -6 5 -6" />
        <g className={st.wave} style={o("0% 100%", -0.1)}>
          <Limb d="M92 70 L126 42" />
          <circle cx="122" cy="45" r="3" fill="none" stroke={PAL.go[1]} strokeWidth="2" />
        </g>
        <g className={st.wave} style={o("100% 100%", -0.72)}>
          <Limb d="M58 70 L26 44" />
          <circle cx="30" cy="47" r="3" fill="none" stroke={PAL.go[1]} strokeWidth="2" />
        </g>
        <g className={st.sway} style={{ ...o("50% 100%", -0.9), animationDuration: "2.48s" }}>
          <circle cx="75" cy="40" r="20" fill={f("sk")} {...r} />
          <path d="M54 40 q-2 -26 21 -26 q23 0 21 26 q-6 -12 -21 -12 q-15 0 -21 12z" fill={f("dk")} />
          <circle className={st.twinkle} cx="75" cy="11" r="6" fill={f("go")} {...r} />
          <circle cx="75" cy="33" r="1.8" fill={PAL.ra[1]} />
          <Eyes x={75} y={41} gap={12} d={3.4} />
          <Smile x={75} y={48} w={9} />
          <Blush x={75} y={47} gap={24} />
        </g>
      </g>
    </Rig>
  );
}
