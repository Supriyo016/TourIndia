import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { QuestionActions } from "@/components/admin/yatri/QuestionActions";
import { requireAdminPage } from "@/features/admin/guard";
import { isAssistantConnected } from "@/features/assistant/agent";
import { listQuestions, RETENTION_DAYS, usage, type QuestionFilter } from "@/features/assistant/insights";

export const metadata: Metadata = { title: "Yatri", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const FILTERS: [QuestionFilter, string][] = [
  ["attention", "Needs attention"],
  ["unanswered", "Unanswered"],
  ["low", "Low confidence"],
  ["down", "Thumbs down"],
  ["up", "Thumbs up"],
  ["handled", "Handled"],
  ["all", "All"],
];
const CONFIDENCE = { ok: "Answered", low: "Low confidence", unanswered: "Unanswered" } as const;
const when = (value: Date) => value.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });

/** How Yatri is doing: daily usage, and the questions it couldn't answer well, to review and mark handled. */
export default async function AdminYatriPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const { session, access } = await requireAdminPage("yatri.manage");
  const { show } = await searchParams;
  const filter = (FILTERS.find(([id]) => id === show)?.[0] ?? "attention") as QuestionFilter;
  const [days, questions] = await Promise.all([usage(14), listQuestions(filter)]);
  const total = (key: "questions" | "ai" | "guide" | "low" | "unanswered" | "up" | "down") => days.reduce((sum, row) => sum + (row[key] ?? 0), 0);

  return (
    <AdminShell permissions={access.permissions} current="/admin/yatri" email={session.user.email}>
      <h1>Yatri</h1>
      <p className="mt-1 max-w-prose text-ink-2">
        {isAssistantConnected() ? "The AI model is connected." : "No AI model is connected, so Yatri answers from the guides."} Counts start from when this was switched on. A question&apos;s words are kept only if the visitor accepted optional storage, with emails, numbers and links removed, and everything is deleted after {RETENTION_DAYS} days.
      </p>

      <section aria-labelledby="usage-title" className="mt-6">
        <h2 id="usage-title" className="text-xl">
          Last 14 days
        </h2>
        {days.length === 0 ? (
          <p className="mt-2 text-ink-2">No questions recorded yet.</p>
        ) : (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="text-ink-2">
                <tr>
                  {["Day", "Questions", "AI", "From guides", "Low confidence", "Unanswered", "Helpful", "Not helpful"].map((label) => (
                    <th key={label} scope="col" className="py-2 pr-4 font-semibold">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((row) => (
                  <tr key={row._id} className="border-t border-line">
                    <td className="py-2 pr-4">{row._id}</td>
                    {(["questions", "ai", "guide", "low", "unanswered", "up", "down"] as const).map((key) => (
                      <td key={key} className="py-2 pr-4">
                        {row[key] ?? 0}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t border-line font-semibold">
                  <td className="py-2 pr-4">Total</td>
                  {(["questions", "ai", "guide", "low", "unanswered", "up", "down"] as const).map((key) => (
                    <td key={key} className="py-2 pr-4">
                      {total(key)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="questions-title" className="mt-8">
        <h2 id="questions-title" className="text-xl">
          Questions
        </h2>
        <nav aria-label="Filter questions" className="mt-3 flex flex-wrap gap-2">
          {FILTERS.map(([id, label]) => (
            <Link key={id} prefetch={false} href={id === "attention" ? "/admin/yatri" : `/admin/yatri?show=${id}`} aria-current={filter === id ? "true" : undefined} className="chip">
              {label}
            </Link>
          ))}
        </nav>
        {questions.length === 0 ? (
          <p className="mt-3 text-ink-2">Nothing here.</p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {questions.map((item) => (
              <li key={item._id} className="card grid gap-2 p-4">
                <p className={item.question ? "" : "text-ink-2 italic"}>{item.question ?? "Words not kept (no consent to optional storage)."}</p>
                <p className="text-xs text-ink-2">
                  {when(item.createdAt)} · {item.mode === "ai" ? "AI" : "From the guides"} · {CONFIDENCE[item.confidence]}
                  {item.feedback ? ` · ${item.feedback === "up" ? "Helpful" : "Not helpful"}` : ""}
                  {item.status === "handled" ? ` · Handled${item.handledNote ? `: ${item.handledNote}` : ""}` : ""}
                </p>
                <QuestionActions id={item._id} handled={item.status === "handled"} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}
