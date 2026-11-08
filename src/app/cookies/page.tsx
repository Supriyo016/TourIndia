import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Cookies and storage", description: `How ${site.name} uses browser storage.`, alternates: { canonical: "/cookies" } };

const keys = [
  ["ti-theme", "Your light, dark or system theme choice"],
  ["ti-favourites", "Places on your wishlist"],
  ["ti-recent", "Guides you viewed recently"],
  ["ti-passport", "States you have marked as visited"],
  ["ti-trips", "Itineraries you saved"],
  ["ti-packing", "Your packing checklist"],
  ["ti-expenses", "Trip expenses you entered"],
];

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookies and storage"
      intro="This site does not set advertising or tracking cookies, which is why you see no cookie banner."
      sections={[
        { heading: "What we use instead", body: (
          <>
            <p>Your preferences and saved items are kept in your browser&apos;s local storage. They never leave your device unless you choose to share a trip link:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-ink-2">
              {keys.map(([key, purpose]) => <li key={key}><code>{key}</code>: {purpose}</li>)}
            </ul>
          </>
        ) },
        { heading: "Removing it", body: <p>You can remove this data at any time by clearing site data in your browser settings.</p> },
        { heading: "Third-party maps", body: <p>Destination maps load tiles from OpenStreetMap. That request does not set cookies through this site, but OpenStreetMap receives standard technical information such as your IP address.</p> },
      ]}
    />
  );
}
