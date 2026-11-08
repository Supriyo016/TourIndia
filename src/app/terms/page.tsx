import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/ui/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Terms and conditions", description: `Terms for using ${site.name}.`, alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms and conditions"
      intro="By using this website you agree to these terms."
      sections={[
        { heading: "What this site is", body: <p>{site.name} provides travel information and planning tools. It is not a travel agent, tour operator, booking provider or payment processor, and no contract for travel services is formed through it.</p> },
        { heading: "Information and estimates", body: <p>We try to keep information accurate, but it can be incomplete or out of date. Costs and travel times are estimates. Check anything important with an official source before you rely on it. See the <Link className="link-text" href="/disclaimer">disclaimer</Link>.</p> },
        { heading: "Your submissions", body: <p>If you submit a story, you confirm it is your own and you allow us to edit and publish it with the name you give. Do not submit anything unlawful, misleading or that infringes another person&apos;s rights. We may decline or remove any submission.</p> },
        { heading: "Acceptable use", body: <p>Do not attempt to disrupt the site, get around its security or rate limits, or send automated submissions.</p> },
        { heading: "Intellectual property", body: <p>Text and illustrations on this site belong to {site.name} unless stated otherwise. Photographs are the work of their authors and are used under the licences listed on the <Link className="link-text" href="/credits">credits page</Link>.</p> },
        { heading: "External links", body: <p>We link to other websites for convenience and are not responsible for their content or services.</p> },
        { heading: "Liability", body: <p>To the extent the law allows, {site.name} is not liable for loss arising from your use of this site or your reliance on its information. Nothing here limits rights that cannot legally be limited.</p> },
        { heading: "Changes and governing law", body: <p>We may update these terms, and the date above shows the latest version. These terms are governed by the laws of India.</p> },
      ]}
    />
  );
}
