import { PageIntro } from "./primitives";
import { formatDate } from "@/lib/utils";

export interface LegalSection {
  id?: string;
  heading: string;
  body: React.ReactNode;
}

const UPDATED = "2026-11-08";

export function LegalPage({ title, intro, sections }: { title: string; intro: string; sections: LegalSection[] }) {
  return (
    <>
      <PageIntro crumbs={[{ label: title }]} title={title} lede={intro} />
      <div className="container-x max-w-3xl py-10">
        <p className="text-sm text-muted">Last updated {formatDate(UPDATED)}</p>
        <div className="prose-guide mt-6 space-y-8">
          {sections.map((section) => (
            <section key={section.heading} id={section.id}>
              <h2 className="mb-2 !text-2xl">{section.heading}</h2>
              {section.body}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
