import Link from "next/link";
import { BadgeArt } from "@/components/achievements/BadgeArt";
import { QuizHistoryControls } from "@/components/achievements/QuizHistoryControls";
import { achievementsFor, type Achievement, type AchievementGroup } from "@/features/achievements/service";
import { answerValues } from "@/features/quiz/params";
import { questions, type QuizAnswers } from "@/features/quiz/questions";
import { listAttempts } from "@/features/quiz/history";
import { currentSession } from "@/lib/auth/session";

export const metadata = { title: "Achievements" };

const GROUPS: { group: AchievementGroup; hint: string }[] = [
  { group: "Passport", hint: "From the states and Union Territories you mark as visited." },
  { group: "Planning", hint: "From trips and collections saved to your account." },
  { group: "Memories", hint: "From the travel memories you keep." },
  { group: "Quiz", hint: "From travel quiz results saved while signed in." },
  { group: "Community", hint: "From comments, helpful votes and accepted edits." },
];

const shortDate = (value: string) => new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function summary(answers: QuizAnswers): string {
  return questions
    .flatMap((question) => {
      const values = answerValues(answers, question.id);
      return values.length ? [values.map((value) => question.choices.find((choice) => choice.value === value)?.label ?? value).join(", ")] : [];
    })
    .join(" · ");
}

function Card({ item }: { item: Achievement }) {
  return (
    <li className={`card flex items-center gap-4 p-4 ${item.earned ? "" : "bg-surface-2"}`}>
      <BadgeArt art={item.art} group={item.group} earned={item.earned} size={60} className="shrink-0" />
      <div className="min-w-0">
        <h3 className="text-base">
          {item.name}
          {!item.earned && <span className="sr-only"> (not earned yet)</span>}
        </h3>
        <p className="text-sm text-ink-2">{item.description}</p>
        {item.earned ? (
          <p className="mt-1 text-xs font-semibold text-forest">{item.earnedAt ? `Earned ${shortDate(item.earnedAt)}` : "Earned"}</p>
        ) : (
          item.progress && (
            <div className="mt-1.5">
              <div
                className="h-1.5 w-32 overflow-hidden rounded-full bg-line"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={item.progress.target}
                aria-valuenow={item.progress.current}
                aria-label={`${item.name} progress`}
              >
                <div className="h-full bg-[var(--brand)]" style={{ width: `${(item.progress.current / item.progress.target) * 100}%` }} />
              </div>
              <p className="mt-0.5 text-xs text-muted">
                {item.progress.current} of {item.progress.target}
              </p>
            </div>
          )
        )}
      </div>
    </li>
  );
}

/** Achievements from real activity, and the person's saved travel quiz results. */
export default async function AchievementsPage() {
  const session = await currentSession().catch(() => null);
  if (!session) return null;
  const [list, attempts] = await Promise.all([achievementsFor(session.user._id, { record: true }).catch(() => null), listAttempts(session.user._id).catch(() => [])]);
  const earned = list?.filter((item) => item.earned).length ?? 0;

  return (
    <div className="grid gap-8">
      <div>
        <h1>Achievements</h1>
        <p className="mt-1 text-ink-2">
          Earned only from what you actually do here. {list ? `${earned} of ${list.length} so far.` : ""} Choose whether they show on your page in{" "}
          <Link prefetch={false} href="/profile/privacy" className="link-text">
            Privacy
          </Link>
          .
        </p>
      </div>
      {list === null ? (
        <p className="text-ink-2">Achievements aren&apos;t available right now. Please try again later.</p>
      ) : (
        GROUPS.map(({ group, hint }) => (
          <section key={group} aria-labelledby={`group-${group}`}>
            <h2 id={`group-${group}`} className="text-xl">
              {group}
            </h2>
            <p className="text-sm text-muted">{hint}</p>
            <ul className="mt-3 grid gap-3 md:grid-cols-2">
              {list
                .filter((item) => item.group === group)
                .map((item) => (
                  <Card key={item.id} item={item} />
                ))}
            </ul>
          </section>
        ))
      )}

      <section id="quiz" aria-labelledby="quiz-title" className="scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="quiz-title" className="text-xl">
              Quiz history
            </h2>
            <p className="text-sm text-muted">Results from the travel quiz, saved while you were signed in. Only you can see them.</p>
          </div>
          {attempts.length > 0 && <QuizHistoryControls label="Clear quiz history" />}
        </div>
        {attempts.length === 0 ? (
          <p className="card mt-3 p-5 text-ink-2">
            No results yet.{" "}
            <Link prefetch={false} href="/quiz" className="link-text">
              Take the travel quiz
            </Link>{" "}
            and your results are kept here.
          </p>
        ) : (
          <ol className="mt-3 grid gap-3">
            {attempts.map((attempt) => (
              <li key={attempt.id} className="card grid gap-2 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm text-muted">
                    <time dateTime={attempt.createdAt}>{shortDate(attempt.createdAt)}</time>
                  </p>
                  <QuizHistoryControls id={attempt.id} label={`Remove the result from ${shortDate(attempt.createdAt)}`} />
                </div>
                <p className="text-sm break-words text-ink-2">{summary(attempt.answers) || "No answers"}</p>
                {attempt.matches.length > 0 && (
                  <p className="text-[0.97rem]">
                    <span className="font-semibold">Top matches: </span>
                    {attempt.matches.map((match, index) => (
                      <span key={match.slug}>
                        {index > 0 && ", "}
                        <Link prefetch={false} href={`/destinations/${match.slug}`} className="link-text">
                          {match.name}
                        </Link>
                      </span>
                    ))}
                  </p>
                )}
                <p>
                  <Link prefetch={false} href={`/quiz?${attempt.query}&step=results#quiz`} className="link-text text-sm">
                    See this result again
                  </Link>
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
