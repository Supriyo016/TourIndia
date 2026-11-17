/** Helpers for reading text aloud with the browser's own voices. */

const normalise = (tag: string) => tag.replace(/_/g, "-").toLowerCase();

/** Picks the voice for a language: an exact match first, then any voice for the same base language. */
export function findVoice<V extends { lang: string; localService?: boolean; default?: boolean }>(voices: readonly V[], code: string): V | null {
  const wanted = normalise(code);
  const base = wanted.split("-")[0]!;
  const exact = voices.filter((voice) => normalise(voice.lang) === wanted);
  const sameBase = voices.filter((voice) => normalise(voice.lang).split("-")[0] === base);
  const pool = exact.length ? exact : sameBase;
  return pool.find((voice) => voice.default) ?? pool.find((voice) => voice.localService) ?? pool[0] ?? null;
}

/** Some browsers stop reading long utterances, so speech is queued in sentence-sized pieces. */
export function speechChunks(texts: string[], max = 220): string[] {
  const chunks: string[] = [];
  for (const text of texts) {
    const sentences = text.match(/[^.!?।॥]+[.!?।॥]*\s*/g) ?? [text];
    let current = "";
    for (const sentence of sentences) {
      if (current && current.length + sentence.length > max) {
        chunks.push(current.trim());
        current = "";
      }
      current += sentence;
      while (current.length > max * 2) {
        const cut = current.lastIndexOf(" ", max) > 0 ? current.lastIndexOf(" ", max) : max;
        chunks.push(current.slice(0, cut).trim());
        current = current.slice(cut);
      }
    }
    if (current.trim()) chunks.push(current.trim());
  }
  return chunks.filter(Boolean);
}

/** Voices often load a moment after the page; wait briefly for them. */
export function loadVoices(synth: SpeechSynthesis, waitMs = 1500): Promise<SpeechSynthesisVoice[]> {
  const now = synth.getVoices();
  if (now.length) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => {
      synth.removeEventListener("voiceschanged", done);
      window.clearTimeout(timer);
      resolve(synth.getVoices());
    };
    const timer = window.setTimeout(done, waitMs);
    synth.addEventListener("voiceschanged", done);
  });
}
