import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Cookies and storage", description: `How ${site.name} uses cookies and browser storage, and the choices you have.`, alternates: { canonical: "/cookies" } };

const cookies = [
  ["ti_consent", "Essential", "Records your cookie choice and the policy version. Readable by the site's scripts so pages can respect it. Holds no personal data.", "180 days"],
  ["__Host-ti_sid", "Essential", "Set only if you use Yatri. A random, signed, anonymous session that limits abuse of the assistant. HttpOnly, Secure and SameSite=Strict.", "24 hours"],
];

const preferenceKeys = [
  ["ti-theme", "Your light, dark or system theme choice"],
  ["ti-recent", "Guides you viewed recently"],
  ["ti-yatri", "Your conversation with Yatri"],
];

const featureKeys = [
  ["ti-favourites", "Places on your wishlist"],
  ["ti-passport-v2", "Your travel passport: states you want to visit, are exploring or have visited"],
  ["ti-trips", "Itineraries you saved"],
  ["ti-notes", "Your plan notes"],
  ["ti-saved-owner", "Which account the saved places, passport and notes on this device belong to"],
  ["ti-packing", "Your packing checklist"],
  ["ti-expenses", "Trip expenses you entered"],
];

const KeyList = ({ items }: { items: string[][] }) => (
  <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-2">
    {items.map(([key, purpose]) => <li key={key}><code>{key}</code>: {purpose}</li>)}
  </ul>
);

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookies and storage"
      intro="This site sets no advertising or tracking cookies. You can change your choice at any time with Cookie settings in the footer."
      sections={[
        { heading: "Cookies", body: (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-left text-[0.95rem]">
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="py-2 pr-3">Name</th>
                  <th scope="col" className="py-2 pr-3">Type</th>
                  <th scope="col" className="py-2 pr-3">Purpose</th>
                  <th scope="col" className="py-2">Lasts</th>
                </tr>
              </thead>
              <tbody>
                {cookies.map(([name, type, purpose, lasts]) => (
                  <tr key={name} className="border-b border-line align-top text-ink-2">
                    <td className="py-2 pr-3"><code>{name}</code></td>
                    <td className="py-2 pr-3">{type}</td>
                    <td className="py-2 pr-3">{purpose}</td>
                    <td className="py-2">{lasts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) },
        { heading: "Optional preferences", body: (
          <>
            <p>These are kept in your browser only if you allow Preferences. If you turn them off, they are deleted.</p>
            <KeyList items={preferenceKeys} />
          </>
        ) },
        { heading: "Things you choose to save", body: (
          <>
            <p>When you press save, or write a note, the result is kept in your browser&apos;s local storage so the feature can work. If you&apos;re not signed in, it never leaves your device unless you share a trip link. If you are, saved places, your passport and notes are also kept in your account, and the browser holds a copy so the page responds straight away; signing out removes that copy.</p>
            <KeyList items={featureKeys} />
          </>
        ) },
        { heading: "Removing it", body: <p>You can remove all of this at any time by clearing site data in your browser settings.</p> },
        { heading: "Third-party maps", body: <p>Destination maps load tiles from OpenStreetMap. That request does not set cookies through this site, but OpenStreetMap receives standard technical information such as your IP address.</p> },
      ]}
    />
  );
}
