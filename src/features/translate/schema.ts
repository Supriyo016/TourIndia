import { z } from "zod";
import { TRANSLATION_CODES } from "./languages";

export const MAX_TEXTS = 30;
export const MAX_TEXT_CHARS = 1500;
export const MAX_TOTAL_CHARS = 12_000;

export const translateRequestSchema = z
  .object({
    lang: z.enum(TRANSLATION_CODES, { message: "Choose one of the listed languages." }),
    /** The page being read; only text found on it is translated. */
    path: z.string().max(220).regex(/^\//, "Send the page's path."),
    texts: z
      .array(
        z
          .string()
          .max(MAX_TEXT_CHARS, `Each piece of text can be at most ${MAX_TEXT_CHARS} characters.`)
          .refine((text) => text.trim().length > 0, "Text can't be empty."),
      )
      .min(1, "Send at least one piece of text.")
      .max(MAX_TEXTS, `Send at most ${MAX_TEXTS} pieces of text at a time.`),
  })
  .strict()
  .refine(({ texts }) => texts.reduce((sum, text) => sum + text.length, 0) <= MAX_TOTAL_CHARS, "That's too much text for one request.");

export type TranslateRequest = z.infer<typeof translateRequestSchema>;

export interface TranslateResponse {
  lang: string;
  translations: string[];
}
