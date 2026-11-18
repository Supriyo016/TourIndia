import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/features/admin/guard";
import { DESCRIPTION_MAX, DESCRIPTION_MIN, seoReport, TITLE_MAX, type Issue } from "@/features/seo/report";

export const metadata: Metadata = { title: "SEO", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const SHOW = 200;

function IssueTable({ id, title, intro, issues, empty }: { id: string; title: string; intro: string; issues: Issue[]; empty: string }) {
  return (
    <section aria-labelledby={id} className="card p-5">
      <h2 id={id} className="text-xl">
        {title} <span className={`chip ml-1 align-middle text-sm ${issues.length ? "text-danger" : ""}`}>{issues.length}</span>
      </h2>
      <p className="mt-1 text-sm text-ink-2">{intro}</p>
      {issues.length === 0 ? (
        <p className="mt-3 text-sm">{empty}</p>
      ) : (
        <div className="mt-3 max-h-[28rem] overflow-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="sticky top-0 bg-surface text-ink-2">
              <tr>
                <th scope="col" className="py-1.5 pr-3 font-semibold">Page or file</th>
                <th scope="col" className="py-1.5 pr-3 font-semibold">Problem</th>
                <th scope="col" className="py-1.5 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {issues.slice(0, SHOW).map((issue, index) => (
                <tr key={`${issue.path}-${issue.problem}-${index}`} className="border-t border-line align-top">
                  <td className="py-1.5 pr-3 break-all">
                    {issue.path.startsWith("/") && !/\.[a-z0-9]{2,5}$/i.test(issue.path) ? (
                      <a href={issue.path} className="link-text" target="_blank" rel="noopener">
                        {issue.path}
                      </a>
                    ) : (
                      <code>{issue.path}</code>
                    )}
                  </td>
                  <td className="py-1.5 pr-3">{issue.problem}</td>
                  <td className="py-1.5 break-words text-ink-2">{issue.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {issues.length > SHOW && <p className="mt-2 text-sm text-ink-2">Showing the first {SHOW} of {issues.length}.</p>}
        </div>
      )}
    </section>
  );
}

/** A read-only SEO report computed from the site's own pages, data and sitemap. */
export default async function AdminSeoPage() {
  const { session, access } = await requireAdminPage("seo.manage");
  const report = await seoReport();

  return (
    <AdminShell permissions={access.permissions} current="/admin/seo" email={session.user.email}>
      <h1>SEO</h1>
      <p className="mt-1 max-w-prose text-ink-2">
        Worked out just now from the site&apos;s own pages and data: {report.pagesChecked} pages, {report.sitemapUrls} addresses in the sitemap and {report.imagesChecked} images. This is a report; fixes are made in the content files for now.
      </p>

      <div className="mt-6 grid gap-5">
        <IssueTable
          id="meta-title"
          title="Titles and descriptions"
          intro={`Titles over ${TITLE_MAX} characters (with “| Tour India”) get cut off in results; descriptions work best between ${DESCRIPTION_MIN} and ${DESCRIPTION_MAX} characters and should be different on every page.`}
          issues={report.metadata}
          empty="Every page has its own title and description of a good length."
        />
        <IssueTable id="alt-title" title="Images and alt text" intro="Every image needs a short description for people using screen readers and for image search." issues={report.images} empty="Every image has alt text." />
        <IssueTable
          id="links-title"
          title="Broken internal links"
          intro="Links in the guides, navigation and related-place lists that point at pages which don't exist."
          issues={report.links}
          empty="No broken internal links found."
        />

        <section aria-labelledby="redirects-title" className="card p-5">
          <h2 id="redirects-title" className="text-xl">
            Redirects
          </h2>
          <p className="mt-1 text-sm text-ink-2">Permanent (308) redirects from old addresses, set in the site&apos;s code (src/config/redirects.ts).</p>
          <ul className="mt-3 grid gap-1.5 text-sm">
            {report.redirects.map((r) => (
              <li key={r.source}>
                <code>{r.source}</code> → <code>{r.destination}</code> {r.permanent ? "(permanent)" : "(temporary)"}
                {!r.destinationExists && <strong className="ml-2 text-danger">Goes to a page that doesn&apos;t exist</strong>}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="noindex-title" className="card p-5">
          <h2 id="noindex-title" className="text-xl">
            Kept out of search results
          </h2>
          <p className="mt-1 text-sm text-ink-2">These pages ask search engines not to index them, on purpose. None of them are in the sitemap.</p>
          <ul className="mt-3 grid gap-1.5 text-sm">
            {report.noindex.map((page) => (
              <li key={page.path}>
                <code>{page.path}</code>: {page.why}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AdminShell>
  );
}
