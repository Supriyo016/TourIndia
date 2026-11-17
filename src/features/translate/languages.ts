/**
 * English plus the 22 languages in the Eighth Schedule of India's Constitution.
 * `code` is the BCP-47 tag used for the lang attribute and for matching speech voices.
 */
export interface Language {
  code: string;
  name: string;
  native: string;
  script: string;
  rtl?: boolean;
}

export const ENGLISH: Language = { code: "en-IN", name: "English", native: "English", script: "Latin" };

export const INDIAN_LANGUAGES = [
  { code: "as-IN", name: "Assamese", native: "অসমীয়া", script: "Bengali–Assamese" },
  { code: "bn-IN", name: "Bengali", native: "বাংলা", script: "Bengali" },
  { code: "brx-IN", name: "Bodo", native: "बर'", script: "Devanagari" },
  { code: "doi-IN", name: "Dogri", native: "डोगरी", script: "Devanagari" },
  { code: "gu-IN", name: "Gujarati", native: "ગુજરાતી", script: "Gujarati" },
  { code: "hi-IN", name: "Hindi", native: "हिन्दी", script: "Devanagari" },
  { code: "kn-IN", name: "Kannada", native: "ಕನ್ನಡ", script: "Kannada" },
  { code: "ks-IN", name: "Kashmiri", native: "کٲشُر", script: "Perso-Arabic", rtl: true },
  { code: "kok-IN", name: "Konkani", native: "कोंकणी", script: "Devanagari" },
  { code: "mai-IN", name: "Maithili", native: "मैथिली", script: "Devanagari" },
  { code: "ml-IN", name: "Malayalam", native: "മലയാളം", script: "Malayalam" },
  { code: "mni-IN", name: "Manipuri (Meitei)", native: "ꯃꯤꯇꯩꯂꯣꯟ", script: "Meitei Mayek" },
  { code: "mr-IN", name: "Marathi", native: "मराठी", script: "Devanagari" },
  { code: "ne-IN", name: "Nepali", native: "नेपाली", script: "Devanagari" },
  { code: "or-IN", name: "Odia", native: "ଓଡ଼ିଆ", script: "Odia" },
  { code: "pa-IN", name: "Punjabi", native: "ਪੰਜਾਬੀ", script: "Gurmukhi" },
  { code: "sa-IN", name: "Sanskrit", native: "संस्कृतम्", script: "Devanagari" },
  { code: "sat-IN", name: "Santali", native: "ᱥᱟᱱᱛᱟᱲᱤ", script: "Ol Chiki" },
  { code: "sd-IN", name: "Sindhi", native: "سنڌي", script: "Perso-Arabic", rtl: true },
  { code: "ta-IN", name: "Tamil", native: "தமிழ்", script: "Tamil" },
  { code: "te-IN", name: "Telugu", native: "తెలుగు", script: "Telugu" },
  { code: "ur-IN", name: "Urdu", native: "اردو", script: "Perso-Arabic", rtl: true },
] as const satisfies readonly Language[];

export type TranslationCode = (typeof INDIAN_LANGUAGES)[number]["code"];

export const TRANSLATION_CODES = INDIAN_LANGUAGES.map(({ code }) => code) as [TranslationCode, ...TranslationCode[]];

export const LANGUAGES: readonly Language[] = [ENGLISH, ...INDIAN_LANGUAGES];

export const getLanguage = (code: string): Language | undefined => LANGUAGES.find((language) => language.code === code);

/** Case-insensitive search over English name, native name and code. */
export function searchLanguages(query: string): Language[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...LANGUAGES];
  return LANGUAGES.filter(({ code, name, native }) => name.toLowerCase().includes(needle) || native.toLowerCase().includes(needle) || code.toLowerCase().startsWith(needle));
}
