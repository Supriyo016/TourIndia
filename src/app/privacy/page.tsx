import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/ui/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Privacy policy", description: `How ${site.name} handles your information.`, alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      intro="We collect as little as we can. This page sets out what that is and why."
      sections={[
        { heading: "Who is responsible", body: <p>{site.name} is owned by {site.owner.name}. To ask about your information, use the <Link className="link-text" href="/contact">contact form</Link>.</p> },
        {
          heading: "What you send us",
          body: (
            <>
              <p>If you use a form, we store what you enter: your name, email and message for the contact form; your email and consent for the newsletter; and your name, email and story for story submissions.</p>
              <p>We use this only to reply, to send the updates you asked for, or to review and publish your story. Email addresses are never published.</p>
            </>
          ),
        },
        { heading: "What stays on your device", body: <p>Your wishlist, saved trips, notes, passport stamps, packing list, expenses, and, if you allow it, recently viewed places, theme and Yatri chat are kept in your browser&apos;s local storage. They are not sent to us. Clearing your browser data removes them. See <Link className="link-text" href="/cookies">cookies and storage</Link>.</p> },
        { heading: "The Yatri assistant", body: <p>When Yatri is connected to its AI model, the messages you send are passed through our server to Anthropic, which generates the reply and processes them under its own terms. We do not store your conversations on our server. Please don&apos;t share personal, payment or passport details with Yatri. Replies can be wrong, so check anything important.</p> },
        { heading: "Abuse prevention", body: <p>To limit automated abuse of forms, we store a salted hash of your IP address for a short period. We do not store the address itself.</p> },
        {
          heading: "Third parties",
          body: (
            <p>
              We do not use advertising or analytics scripts. Anthropic processes messages sent to Yatri when it is connected. When you view a destination map, your browser requests map tiles from OpenStreetMap, which receives your IP address. Weather forecasts are fetched by our server from Open-Meteo. Our hosting provider and database provider process data on our behalf and may keep technical logs. If you follow a share or external link, that site&apos;s own policy applies.
            </p>
          ),
        },
        { heading: "How long we keep it", body: <p>Contact messages and story submissions are kept for as long as needed to deal with them. Newsletter addresses are kept until you ask to be removed through the contact form. Rate-limit records expire automatically within hours.</p> },
        { heading: "Your choices", body: <p>You can ask to see, correct or delete information you have sent us through the <Link className="link-text" href="/contact">contact form</Link>. Rights under the laws that apply to you, including India&apos;s Digital Personal Data Protection Act, 2023, are unaffected by this policy.</p> },
      ]}
    />
  );
}
