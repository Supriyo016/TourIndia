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
        { heading: "Who is responsible", body: <p>{site.name} is owned by {site.owner.name}. To ask about your information, use the <Link prefetch={false} className="link-text" href="/contact">contact form</Link>.</p> },
        {
          heading: "What you send us",
          body: (
            <>
              <p>If you use a form, we store what you enter: your name, email and message for the contact form; your email and consent for the newsletter; and your name, email and story for story submissions.</p>
              <p>We use this only to reply, to send the updates you asked for, or to review and publish your story. Email addresses are never published.</p>
            </>
          ),
        },
        { heading: "What stays on your device", body: <p>If you&apos;re not signed in, your wishlist, saved trips, notes, travel passport, packing list, expenses, and, if you allow it, recently viewed places, theme and Yatri chat are kept in your browser&apos;s local storage. They are not sent to us. Clearing your browser data removes them. Once you sign in, saved places, collections, trips, notes and your passport are kept in your account instead, so you can see them on any device; only you can see your notes and passport, and deleting your account deletes them. See <Link prefetch={false} className="link-text" href="/cookies">cookies and storage</Link>.</p> },
        { heading: "The Yatri assistant", body: <p>The messages you send to Yatri pass through our server to Groq, which runs the AI model that writes the reply and processes them under its own terms. We do not store your conversations on our server. Please don&apos;t share personal, payment or passport details with Yatri. Replies can be wrong, so check anything important.</p> },
        {
          heading: "Visit statistics (only if you allow analytics)",
          body: (
            <>
              <p>If you turn on Analytics in Cookie settings, a small script of our own tells our server, after the page has loaded, which pages you open and which features you use: searching (the words, tidied to lowercase, and how many results came back), building or saving a trip plan, saving a place, opening or asking Yatri, making a share link, and signing in. It also sends how fast the page loaded and responded (Largest Contentful Paint, Interaction to Next Paint and Cumulative Layout Shift).</p>
              <p>With each of these we record only: the page address (private share links, trip pages and public profiles are counted under a placeholder, and query strings are never sent), the name of the site that linked to you (not the full address), whether you&apos;re on a phone, tablet or computer, your browser&apos;s family (for example Chrome), and your country and Indian state as our hosting provider works them out from the network.</p>
              <p>We don&apos;t store your IP address, your browser&apos;s full user agent, any cookie or identifier, or your account. To count unique visitors, the server mixes your IP address and browser with a secret key that changes every day and keeps only the result, for two days, apart from everything else. Tomorrow you get an unrelated one, so you can&apos;t be followed across days. Search words that look like an email address or phone number are dropped.</p>
              <p>Individual records are deleted after 90 days. Daily totals (for example &ldquo;120 views of the Goa guide on 3 March&rdquo;) are kept to show trends. Nothing is shared with anyone or used for advertising. With Analytics off, which is the default, none of this happens and the script isn&apos;t even downloaded.</p>
            </>
          ),
        },
        { heading: "Abuse prevention", body: <p>To limit automated abuse of forms, we store a salted hash of your IP address for a short period. We do not store the address itself.</p> },
        {
          heading: "Third parties",
          body: (
            <p>
              We do not use advertising or third-party analytics scripts; the visit statistics above are counted by our own server. Groq processes messages sent to Yatri. When you view a map, your browser loads it from Google Maps, which receives your IP address under Google&apos;s privacy policy. Weather forecasts are fetched by our server from Open-Meteo. Our hosting provider and database provider process data on our behalf and may keep technical logs. If you follow a share or external link, that site&apos;s own policy applies.
            </p>
          ),
        },
        { heading: "How long we keep it", body: <p>Contact messages and story submissions are kept for as long as needed to deal with them. Newsletter addresses are kept until you ask to be removed through the contact form. Rate-limit records expire automatically within hours. Analytics records are deleted after 90 days and the daily visitor key after two; daily totals are kept. In-app notifications are cleared after six months. We keep private backup copies of the database so it can be recovered after a fault; when you delete your account it is removed from the site at once, but stays in backups made before then until those copies are deleted.</p> },
        { heading: "Your choices", body: <p>You can ask to see, correct or delete information you have sent us through the <Link prefetch={false} className="link-text" href="/contact">contact form</Link>. Rights under the laws that apply to you, including India&apos;s Digital Personal Data Protection Act, 2023, are unaffected by this policy.</p> },
      ]}
    />
  );
}
