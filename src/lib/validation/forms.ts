import { z } from "zod";

const text = (label: string, min: number, max: number) =>
  z
    .string({ error: `${label} is required.` })
    .trim()
    .min(min, min === 1 ? `${label} is required.` : `${label} must be at least ${min} characters.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

const email = z.string().trim().toLowerCase().max(254, "That email address is too long.").pipe(z.email("Enter a valid email address."));

export const contactSchema = z.object({
  name: text("Name", 2, 80),
  email,
  subject: text("Subject", 3, 120),
  message: text("Message", 10, 3000),
});

export const newsletterSchema = z.object({
  email,
  consent: z.literal(true, { error: "Please confirm you are happy to be emailed." }),
});

export const storySchema = z.object({
  name: text("Name", 2, 80),
  email,
  title: text("Title", 5, 120),
  destination: text("Place", 2, 80),
  story: text("Your story", 200, 6000),
  consent: z.literal(true, { error: "Please confirm this is your own experience." }),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type StoryInput = z.infer<typeof storySchema>;
