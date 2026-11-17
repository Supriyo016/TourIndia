/**
 * Yatri, the chatbot's travel guide: a young guide in a cap and teal kurta with a shoulder bag,
 * shown head-and-shoulders as an avatar. Fixed palette so it reads on light and dark surfaces.
 * Moods: idle (breathing, glances, blinks, a slow head tilt), thinking (eyes up and to the side,
 * hand to chin, pulsing thought dots) and talking (mouth shapes and quick nods). Motion lives in
 * characters.module.css and only runs under prefers-reduced-motion: no-preference.
 */
import { useId, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import st from "./characters.module.css";

export type YatriMood = "idle" | "thinking" | "talking";
type Props = { className?: string; mood?: YatriMood };

const INK = "#1d1712";
const SKIN = ["#e3ab7f", "#b9764a", "#7d4a2a"];
const KURTA = ["#7fd6e3", "#1c7486", "#0a3b45"];
const CAP = ["#ffc46e", "#e8890c", "#9c4f00"];
const ln = { stroke: INK, strokeWidth: 1.4, strokeLinejoin: "round", strokeLinecap: "round" } as const;

export function YatriGuide({ className, mood = "idle" }: Props) {
  const id = "y" + useId().replace(/[^\w-]/g, "");
  const u = (k: string) => `url(#${id}${k})`;
  const thinking = mood === "thinking";
  const talking = mood === "talking";
  const tempo = { "--n": talking ? "1.9s" : "5.3s", "--w": "3.7s", "--k": thinking ? "6.1s" : "4.3s" } as CSSProperties;
  return (
    <svg viewBox="0 0 64 64" className={cn(st.rig, st.live, className)} style={tempo} aria-hidden data-mood={mood}>
      <defs>
        {(
          [
            ["s", SKIN],
            ["k", KURTA],
            ["c", CAP],
          ] as const
        ).map(([k, c]) => (
          <radialGradient key={k} id={id + k} cx=".35" cy=".3" r=".85">
            <stop offset="0" stopColor={c[0]} />
            <stop offset=".5" stopColor={c[1]} />
            <stop offset=".88" stopColor={c[2]} />
            <stop offset="1" stopColor={c[1]} />
          </radialGradient>
        ))}
      </defs>

      <path d="M28 36 h8 v8 q-4 3 -8 0z" fill={SKIN[2]} />
      {/* Shoulders, kurta and bag strap breathe together. */}
      <g className={st.breathe}>
        <path d="M8 64 q0 -18 16 -21 h16 q16 3 16 21z" fill={u("k")} {...ln} />
        <path d="M27 43 l5 9 l5 -9" fill="none" stroke="#fbf3e2" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M32 52 v8" stroke="#fbf3e2" strokeWidth="1.2" strokeDasharray="1.4 2.2" />
        <path d="M17 46 L47 64" stroke="#9c4f00" strokeWidth="4.2" strokeLinecap="round" />
        <path d="M17 46 L47 64" stroke={CAP[1]} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M12 54 q2 -8 9 -10" fill="none" stroke="#fff6dc" strokeOpacity=".6" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* Neck and head; idle and talking nod on the neck, thinking tilts toward the hand. */}
      <g className={thinking ? st.think : st.nod} style={{ transformOrigin: "50% 100%" }}>
        <ellipse cx="18.6" cy="28" rx="2.2" ry="3" fill={u("s")} {...ln} />
        <ellipse cx="45.4" cy="28" rx="2.2" ry="3" fill={u("s")} {...ln} />
        <ellipse cx="32" cy="27" rx="13" ry="14" fill={u("s")} {...ln} />
        <path d="M20.5 21 q11.5 -6 23 0 v-3 h-23z" fill="#2a1a12" />
        <path d="M19 20 q0 -12 13 -12 q13 0 13 12 q-13 -3.5 -26 0z" fill={u("c")} {...ln} />
        <path d="M19.5 19.6 q12.5 -3 25 0 q2.6 0.6 4.6 2.2 q-15 -3.2 -29.6 -2.2z" fill={CAP[2]} {...ln} strokeWidth={1.1} />
        <path d="M32 11.5 q-2.4 0 -2.4 2.4 q0 1.8 2.4 4 q2.4 -2.2 2.4 -4 q0 -2.4 -2.4 -2.4z" fill="#fbf3e2" />
        <circle cx="32" cy="13.9" r=".9" fill={CAP[2]} />
        <path d="M22 16 q3 -5 8 -6" fill="none" stroke="#fff6dc" strokeOpacity=".7" strokeWidth="1.2" strokeLinecap="round" />

        <path d={thinking ? "M24.5 23 q2.5 -2 5 -0.6 M34.5 22.2 q2.5 -1.2 5 0.4" : "M24.5 23.4 q2.5 -1.4 5 0 M34.5 23.4 q2.5 -1.4 5 0"} fill="none" stroke="#2a1a12" strokeWidth="1.3" strokeLinecap="round" />
        <g transform={thinking ? "translate(1.3 -1.4)" : undefined}>
          <g className={thinking ? undefined : st.look}>
            <g className={st.blink} style={{ transformOrigin: "50% 50%" }}>
              {[27, 37].map((x) => (
                <g key={x}>
                  <ellipse cx={x} cy="27" rx="1.7" ry="2.1" fill={INK} />
                  <circle cx={x + 0.6} cy="26.3" r=".6" fill="#fff" />
                </g>
              ))}
            </g>
          </g>
        </g>
        <path d="M31.4 28.5 q0.6 2.6 -0.4 3.4 h1.6" fill="none" stroke={SKIN[2]} strokeWidth="1" strokeLinecap="round" />
        <g fill="#e8738a" opacity=".35">
          <ellipse cx="24" cy="32" rx="2.4" ry="1.4" />
          <ellipse cx="40" cy="32" rx="2.4" ry="1.4" />
        </g>
        {talking ? (
          <g className={st.talk} style={{ transformOrigin: "50% 0%" }}>
            <ellipse cx="32" cy="35.4" rx="3.2" ry="2.2" fill="#5a1f1a" stroke={INK} strokeWidth="1.1" />
            <ellipse cx="32" cy="36.6" rx="1.8" ry=".8" fill="#e8738a" />
          </g>
        ) : thinking ? (
          <path d="M29.6 35.6 q2 -0.8 4.4 0.2" fill="none" {...ln} strokeWidth={1.3} />
        ) : (
          <path d="M28.4 34.6 q3.6 3 7.2 0" fill="none" {...ln} strokeWidth={1.3} />
        )}
      </g>

      {thinking && (
        <>
          <g className={st.think} style={{ transformOrigin: "30% 100%", animationDelay: "-0.3s" }}>
            <path d="M22 64 q-2 -12 6 -22" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
            <path d="M22 64 q-2 -12 6 -22" fill="none" stroke={KURTA[1]} strokeWidth="3.6" strokeLinecap="round" />
            <circle cx="29" cy="40.4" r="3.4" fill={u("s")} {...ln} />
            <path d="M27.4 38 q1.4 -1.4 3.4 -0.4" fill="none" stroke={SKIN[2]} strokeWidth=".9" strokeLinecap="round" />
          </g>
          <g fill="#fff" stroke={INK} strokeWidth="1">
            <circle cx="48" cy="14" r="1.4" />
            <circle cx="51.4" cy="9.6" r="2" />
            <rect x="50" y="1" width="13" height="7" rx="3.5" />
          </g>
          {[53, 56.5, 60].map((x, i) => (
            <circle key={x} className={st.dot} style={{ animationDelay: `${i * 0.2}s` }} cx={x} cy="4.5" r=".95" fill={INK} />
          ))}
        </>
      )}
    </svg>
  );
}
