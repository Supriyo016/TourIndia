"use client";

import { TICKET_CATEGORIES } from "@/features/support/types";
import { contactSchema, newsletterSchema, storySchema } from "@/lib/validation/forms";
import { ApiForm } from "./ApiForm";

export function NewsletterForm() {
  return (
    <ApiForm
      schema={newsletterSchema}
      endpoint="/api/newsletter"
      submitLabel="Sign up"
      successTitle="You're on the list"
      successBody="We haven't started sending yet. To be removed at any time, use the contact form."
      defaultValues={{ email: "", consent: false }}
      fields={[
        { name: "email", label: "Email address", type: "email", placeholder: "you@example.com", autoComplete: "email" },
        { name: "consent", label: "Email me occasional Tour India updates. I can ask to be removed at any time through the contact form.", type: "checkbox" },
      ]}
    />
  );
}

export function ContactForm() {
  return (
    <ApiForm
      schema={contactSchema}
      endpoint="/api/contact"
      submitLabel="Send message"
      successTitle="Message received"
      successBody="Thank you for writing. A reply will come to the address you gave, if your message needs one."
      defaultValues={{ name: "", email: "", category: "general", subject: "", message: "" }}
      fields={[
        { name: "name", label: "Your name", autoComplete: "name" },
        { name: "email", label: "Email address", type: "email", autoComplete: "email" },
        { name: "category", label: "What's it about?", type: "select", options: Object.entries(TICKET_CATEGORIES).map(([value, label]) => ({ value, label })) },
        { name: "subject", label: "Subject" },
        { name: "message", label: "Message", type: "textarea" },
      ]}
    />
  );
}

export function StoryForm() {
  return (
    <ApiForm
      schema={storySchema}
      endpoint="/api/stories"
      submitLabel="Submit for review"
      successTitle="Thanks for sharing"
      successBody="Your story is waiting for review. It will only appear on the site if it is approved."
      defaultValues={{ name: "", email: "", title: "", destination: "", story: "", consent: false }}
      fields={[
        { name: "name", label: "Your name", hint: "Shown with your story if it is published.", autoComplete: "name" },
        { name: "email", label: "Email address", type: "email", hint: "Never published.", autoComplete: "email" },
        { name: "title", label: "Title" },
        { name: "destination", label: "Where did you go?" },
        { name: "story", label: "Your story", type: "textarea", hint: "At least 200 characters. Text only." },
        { name: "consent", label: "This is my own experience, and Tour India may edit and publish it with my name.", type: "checkbox" },
      ]}
    />
  );
}
