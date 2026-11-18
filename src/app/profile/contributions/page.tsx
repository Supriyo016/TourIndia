import Link from "next/link";
import { Flag, MessageSquare, PencilLine, ThumbsUp } from "lucide-react";
import { contributionsOf, type MyReport, type PageRef } from "@/features/contributions/service";
import { currentSession } from "@/lib/auth/session";

export const metadata = { title: "My contributions" };

const shortDate = (value: string) => new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const COMMENT_STATUS = {
  visible: { label: "Published", tone: "tag-verified" },
  pending: { label: "Waiting for a moderator", tone: "tag-estimate" },
  hidden: { label: "Hidden after reports, being checked", tone: "tag-estimate" },
  removed: { label: "Removed by a moderator", tone: "" },
} as const;

const EDIT_STATUS = {
  pending: { label: "Waiting for review", tone: "tag-estimate" },
  approved: { label: "Accepted and live", tone: "tag-verified" },
  rejected: { label: "Not accepted", tone: "" },
} as const;

const REPORT_REASON: Record<string, string> = {
  disrespectful: "Disrespectful",
  hateful: "Hateful",
  spam: "Spam",
  wrong: "Wrong information",
  personal: "Personal details",
};

const REPORT_OUTCOME: Record<MyReport["outcome"], string> = {
  visible: "Still up: moderators haven't removed it",
  pending: "Waiting for a moderator",
  hidden: "Hidden while moderators check it",
  removed: "Removed by a moderator",
  gone: "No longer on the site",
};

function PageLink({ page }: { page: PageRef }) {
  return page.path ? (
    <Link prefetch={false} href={`${page.path}#community-title`} className="link-text">
      {page.title}
    </Link>
  ) : (
    <span>{page.title}</span>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="card mt-3 p-5 text-ink-2">{children}</p>;
}

/** The person's own comments, suggested edits, reports and helpful votes. Only they see this. */
export default async function ContributionsPage() {
  const session = await currentSession().catch(() => null);
  if (!session) return null;
  const data = await contributionsOf(session.user._id).catch(() => null);

  return (
    <div className="grid gap-8">
      <div>
        <h1>My contributions</h1>
        <p className="mt-1 text-ink-2">What you&apos;ve added to the guide and where each thing stands. Only you can see this page.</p>
      </div>
      {data === null ? (
        <p className="text-ink-2">This isn&apos;t available right now. Please try again later.</p>
      ) : (
        <>
          <ul className="grid gap-3 sm:grid-cols-4" aria-label="Totals">
            {[
              { Icon: MessageSquare, value: data.comments.filter((c) => c.status === "visible").length, label: "published comments" },
              { Icon: ThumbsUp, value: data.helpful.total, label: data.helpful.total === 1 ? "helpful vote received" : "helpful votes received" },
              { Icon: PencilLine, value: data.edits.filter((e) => e.status === "approved").length, label: "edits accepted" },
              { Icon: Flag, value: data.reports.length, label: data.reports.length === 1 ? "report filed" : "reports filed" },
            ].map(({ Icon, value, label }) => (
              <li key={label} className="card flex items-center gap-3 p-4 sm:flex-col sm:items-start">
                <Icon className="size-5 text-muted" aria-hidden />
                <span>
                  <span className="block text-2xl font-semibold">{value}</span>
                  <span className="text-sm text-ink-2">{label}</span>
                </span>
              </li>
            ))}
          </ul>

          <section aria-labelledby="comments-title">
            <h2 id="comments-title" className="text-xl">
              Comments
            </h2>
            {data.helpful.total > 0 && (
              <p className="text-sm text-muted">
                {data.helpful.comments} of your comments {data.helpful.comments === 1 ? "has" : "have"} been marked helpful.
              </p>
            )}
            {data.comments.length === 0 ? (
              <Empty>No comments yet. Share a tip or ask a question at the bottom of any guide.</Empty>
            ) : (
              <ol className="mt-3 grid gap-3">
                {data.comments.map((comment) => (
                  <li key={comment.id} className="card grid gap-2 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="text-ink-2">
                        {comment.isReply ? "Reply on " : "On "}
                        <PageLink page={comment.page} /> · <time dateTime={comment.createdAt}>{shortDate(comment.createdAt)}</time>
                      </span>
                      <span className={`tag ${COMMENT_STATUS[comment.status].tone}`}>{COMMENT_STATUS[comment.status].label}</span>
                    </div>
                    <p className="line-clamp-4 whitespace-pre-line break-words">{comment.body}</p>
                    {comment.helpful > 0 && (
                      <p className="inline-flex items-center gap-1.5 text-sm text-forest">
                        <ThumbsUp className="size-4" aria-hidden /> {comment.helpful} {comment.helpful === 1 ? "person found this helpful" : "people found this helpful"}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section aria-labelledby="edits-title">
            <h2 id="edits-title" className="text-xl">
              Suggested edits
            </h2>
            {data.edits.length === 0 ? (
              <Empty>No suggestions yet. Spot something out of date in an encyclopedia entry? Use “Suggest an edit” on that page.</Empty>
            ) : (
              <ol className="mt-3 grid gap-3">
                {data.edits.map((edit) => (
                  <li key={edit.id} className="card flex flex-wrap items-center justify-between gap-2 p-4">
                    <span className="text-[0.97rem]">
                      {edit.field} on <PageLink page={edit.page} />
                      <span className="block text-sm text-muted">
                        Suggested {shortDate(edit.createdAt)}
                        {edit.reviewedAt ? `, reviewed ${shortDate(edit.reviewedAt)}` : ""}
                      </span>
                    </span>
                    <span className={`tag ${EDIT_STATUS[edit.status].tone}`}>{EDIT_STATUS[edit.status].label}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section aria-labelledby="reports-title">
            <h2 id="reports-title" className="text-xl">
              Reports you filed
            </h2>
            <p className="text-sm text-muted">Reports are anonymous: the person you reported never sees who it was.</p>
            {data.reports.length === 0 ? (
              <Empty>You haven&apos;t reported anything.</Empty>
            ) : (
              <ol className="mt-3 grid gap-3">
                {data.reports.map((report) => (
                  <li key={report.id} className="card grid gap-1 p-4 text-[0.97rem]">
                    <span>
                      {REPORT_REASON[report.reason] ?? "Report"}: a comment on <PageLink page={report.page} />
                    </span>
                    <span className="text-sm text-muted">
                      Filed {shortDate(report.createdAt)} · {REPORT_OUTCOME[report.outcome]}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </>
      )}
    </div>
  );
}
