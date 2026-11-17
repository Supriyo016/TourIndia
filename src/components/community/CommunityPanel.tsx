"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Flag, Heart, Link2, MessageCircleQuestion, Reply, Share2, Star, ThumbsUp, Trash2 } from "lucide-react";
import { postJson, useAuth } from "@/components/auth/AuthProvider";
import { COMMENT_KINDS, TARGET_LABELS, type CommentKind, type Target } from "@/features/community/targets";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/profile/Avatar";

interface Comment {
  id: string;
  parentId: string | null;
  authorName: string;
  author?: { username: string; avatar: string };
  kind: CommentKind;
  body: string;
  helpful: number;
  createdAt: string;
  mine: boolean;
}
interface Thread {
  stats: { loves: number; comments: number; ratingCount: number; ratingAverage: number | null };
  comments: Comment[];
  me: { loved: boolean; rating: number | null } | null;
}

const when = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function ShareButtons({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);
  // The public address, not window.location, so server and browser render the same links.
  const url = new URL(path, site.url).toString();
  const text = `${title} on Tour India`;
  const links = [
    ["WhatsApp", `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`],
    ["X", `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`],
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`],
    ["Email", `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`],
  ] as const;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="chip"
        onClick={async () => {
          if (navigator.share) {
            await navigator.share({ title: text, url }).catch(() => undefined);
            return;
          }
          await navigator.clipboard.writeText(url).catch(() => undefined);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        }}
      >
        <Share2 className="size-4" aria-hidden /> Share
      </button>
      <button
        type="button"
        className="chip"
        onClick={async () => {
          await navigator.clipboard.writeText(url).catch(() => undefined);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        }}
      >
        <Link2 className="size-4" aria-hidden /> {copied ? "Copied" : "Copy link"}
      </button>
      {links.map(([label, href]) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="chip">
          {label}
        </a>
      ))}
    </div>
  );
}

function Composer({ onSubmit, parentId, onDone }: { onSubmit: (body: string, kind: CommentKind, parentId?: string) => Promise<string | void>; parentId?: string; onDone?: () => void }) {
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<CommentKind>("viewpoint");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="grid gap-2"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        setNote("");
        try {
          const result = await onSubmit(body, kind, parentId);
          setBody("");
          if (result) setNote(result);
          onDone?.();
        } catch (problem) {
          setError((problem as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      {!parentId && (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="What are you posting?">
          {(Object.keys(COMMENT_KINDS) as CommentKind[]).map((value) => (
            <button key={value} type="button" role="radio" aria-checked={kind === value} className="chip aria-checked:!border-brand aria-checked:!bg-brand-soft aria-checked:!text-brand" onClick={() => setKind(value)}>
              {COMMENT_KINDS[value]}
            </button>
          ))}
        </div>
      )}
      <label className="sr-only" htmlFor={`compose-${parentId ?? "root"}`}>
        {parentId ? "Your reply" : "Your comment"}
      </label>
      <textarea
        id={`compose-${parentId ?? "root"}`}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        required
        minLength={3}
        maxLength={2000}
        rows={parentId ? 2 : 3}
        placeholder={parentId ? "Write a reply" : kind === "tip" ? "A tip that would help other travellers" : kind === "question" ? "Ask other travellers" : "Your experience or point of view"}
        className="input min-h-20 resize-y"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn btn-accent" disabled={busy || body.trim().length < 3}>
          {busy ? "Posting…" : parentId ? "Reply" : "Post"}
        </button>
        <span className="text-xs text-muted tabular-nums">{body.length}/2000</span>
      </div>
      <p role="alert" aria-live="polite" className="field-error min-h-5">
        {error}
      </p>
      {note && (
        <p role="status" className="text-sm text-ink-2">
          {note}
        </p>
      )}
    </form>
  );
}

/**
 * Love, rating, sharing and discussion for one page. Reading is open to everyone;
 * writing asks the visitor to sign in. Loads when it scrolls near the screen.
 */
export function CommunityPanel({ target, title, path }: { target: Target; title: string; path: string }) {
  const { user, openSignIn } = useAuth();
  const [thread, setThread] = useState<Thread | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [filter, setFilter] = useState<CommentKind | "all">("all");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [flash, setFlash] = useState("");
  const root = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const label = TARGET_LABELS[target.type];

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/community?type=${target.type}&id=${encodeURIComponent(target.id)}`, { cache: "no-store" });
      if (!response.ok) throw new Error();
      setThread((await response.json()) as Thread);
    } catch {
      setUnavailable(true);
    }
  }, [target.type, target.id]);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => entry?.isIntersecting && setVisible(true), { rootMargin: "400px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Reloads when the panel comes into view and whenever the visitor signs in or out.
  useEffect(() => {
    if (!visible) return;
    const handle = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(handle);
  }, [visible, load, user?.id]);

  const act = async <T,>(body: Record<string, unknown>, reason: string): Promise<T | undefined> => {
    if (!user) {
      openSignIn(reason);
      return undefined;
    }
    try {
      return await postJson<T>("/api/community", body);
    } catch (problem) {
      setFlash((problem as Error).message);
      return undefined;
    }
  };

  const love = async () => {
    const result = await act<{ loved: boolean; loves: number }>({ action: "love", target }, `Sign in to love this ${label}.`);
    if (result && thread) setThread({ ...thread, stats: { ...thread.stats, loves: result.loves }, me: { rating: thread.me?.rating ?? null, loved: result.loved } });
  };

  const rate = async (stars: number) => {
    const result = await act<{ rating: number; ratingCount: number; ratingAverage: number }>({ action: "rate", target, stars }, `Sign in to rate this ${label}.`);
    if (result && thread) setThread({ ...thread, stats: { ...thread.stats, ratingCount: result.ratingCount, ratingAverage: result.ratingAverage }, me: { loved: thread.me?.loved ?? false, rating: result.rating } });
  };

  const post = async (body: string, kind: CommentKind, parentId?: string) => {
    const result = await postJson<{ status: string; note?: string }>("/api/community", { action: "comment", target, body, kind, ...(parentId ? { parentId } : {}) });
    await load();
    setReplyTo(null);
    return result.status === "pending" ? `Thanks. ${result.note ?? "An admin will check it before it appears."}` : result.note;
  };

  const comments = thread?.comments ?? [];
  const topLevel = comments.filter((comment) => !comment.parentId && (filter === "all" || comment.kind === filter));
  const replies = (id: string) => comments.filter((comment) => comment.parentId === id).reverse();

  const renderComment = (comment: Comment, isReply = false) => (
    <article key={comment.id} className={cn("rounded-[var(--radius-md)] border border-line bg-surface p-4", isReply && "ml-6 border-dashed")}>
      <header className="flex flex-wrap items-center gap-x-2 text-sm">
        {comment.author ? (
          <a href={`/u/${comment.author.username}`} className="inline-flex items-center gap-1.5 font-semibold text-ink hover:underline">
            <Avatar id={comment.author.avatar} size={24} />
            {comment.authorName}
          </a>
        ) : (
          <span className="font-semibold text-ink">{comment.authorName}</span>
        )}
        {!isReply && <span className="tag tag-editorial">{COMMENT_KINDS[comment.kind]}</span>}
        <time dateTime={comment.createdAt} className="text-muted">
          {when(comment.createdAt)}
        </time>
      </header>
      <p className="mt-2 whitespace-pre-line text-ink-2">{comment.body}</p>
      <div className="mt-2 flex flex-wrap gap-1 text-sm">
        <button type="button" className="chip !min-h-9" onClick={async () => {
          const result = await act<{ helpful: number }>({ action: "helpful", commentId: comment.id }, "Sign in to mark comments as helpful.");
          if (result && thread) setThread({ ...thread, comments: thread.comments.map((item) => (item.id === comment.id ? { ...item, helpful: result.helpful } : item)) });
        }}>
          <ThumbsUp className="size-3.5" aria-hidden /> Helpful{comment.helpful ? ` (${comment.helpful})` : ""}
        </button>
        {!isReply && (
          <button type="button" className="chip !min-h-9" aria-expanded={replyTo === comment.id} onClick={() => (user ? setReplyTo(replyTo === comment.id ? null : comment.id) : openSignIn("Sign in to reply."))}>
            <Reply className="size-3.5" aria-hidden /> {comment.kind === "question" ? "Answer" : "Reply"}
          </button>
        )}
        {comment.mine ? (
          <button type="button" className="chip !min-h-9" onClick={async () => {
            if (!window.confirm("Delete your comment?")) return;
            if (await act({ action: "delete", commentId: comment.id }, "")) await load();
          }}>
            <Trash2 className="size-3.5" aria-hidden /> Delete
          </button>
        ) : (
          <button type="button" className="chip !min-h-9" onClick={async () => {
            const result = await act<{ message: string }>({ action: "report", commentId: comment.id, reason: "disrespectful" }, "Sign in to report a comment.");
            if (result) setFlash(result.message);
          }}>
            <Flag className="size-3.5" aria-hidden /> Report
          </button>
        )}
      </div>
      {replyTo === comment.id && (
        <div className="mt-3">
          <Composer parentId={comment.id} onSubmit={post} />
        </div>
      )}
      {!isReply && replies(comment.id).length > 0 && <div className="mt-3 grid gap-2">{replies(comment.id).map((reply) => renderComment(reply, true))}</div>}
    </article>
  );

  return (
    <section ref={root} aria-labelledby="community-title" className="card mt-10 p-5 sm:p-7">
      <h2 id="community-title" className="text-2xl">Travellers on {title}</h2>
      <p className="mt-1 text-sm text-ink-2">
        Share what you saw, ask a question, or help someone plan. Be kind and respect every faith and community; hostile or hateful posts are removed.
      </p>

      {unavailable ? (
        <p className="mt-5 rounded-[var(--radius-md)] bg-surface-2 p-4 text-sm">Comments and ratings aren&apos;t available right now.</p>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
            <button type="button" aria-pressed={Boolean(thread?.me?.loved)} onClick={love} className="love-btn chip !min-h-11 aria-pressed:!border-rani aria-pressed:!text-rani" disabled={!thread}>
              <Heart className={cn("size-5", thread?.me?.loved && "fill-current")} aria-hidden />
              Love <span className="tabular-nums">{thread?.stats.loves ?? "–"}</span>
            </button>

            <div className="flex items-center gap-2">
              <div role="radiogroup" aria-label={`Your rating for ${title}`} className="flex">
                {[1, 2, 3, 4, 5].map((stars) => (
                  <button
                    key={stars}
                    type="button"
                    role="radio"
                    aria-checked={thread?.me?.rating === stars}
                    aria-label={`${stars} star${stars > 1 ? "s" : ""}`}
                    onClick={() => rate(stars)}
                    disabled={!thread}
                    className="flex size-10 items-center justify-center text-gold hover:scale-110"
                  >
                    <Star className={cn("size-6", (thread?.me?.rating ?? 0) >= stars && "fill-current")} aria-hidden />
                  </button>
                ))}
              </div>
              <span className="text-sm text-ink-2 tabular-nums">
                {thread?.stats.ratingAverage ? `${thread.stats.ratingAverage} from ${thread.stats.ratingCount} rating${thread.stats.ratingCount === 1 ? "" : "s"}` : "No ratings yet"}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <ShareButtons title={title} path={path} />
          </div>

          {flash && (
            <p role="status" className="mt-4 rounded-[var(--radius-md)] bg-surface-2 p-3 text-sm">
              {flash}
            </p>
          )}

          <div className="mt-7">
            {user ? (
              user.profileComplete ? (
                <Composer onSubmit={post} />
              ) : (
                <p className="text-sm">
                  <a href="/profile/details" className="link-text">Add your name to your profile</a> to post.
                </p>
              )
            ) : (
              <button type="button" className="btn btn-outline" onClick={() => openSignIn("Sign in to join the conversation.")}>
                <MessageCircleQuestion className="size-4" aria-hidden /> Sign in to comment, ask or share a tip
              </button>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Show">
            {(["all", ...Object.keys(COMMENT_KINDS)] as const).map((value) => (
              <button key={value} type="button" className="chip" aria-pressed={filter === value} onClick={() => setFilter(value as CommentKind | "all")}>
                {value === "all" ? `All (${thread?.stats.comments ?? 0})` : COMMENT_KINDS[value as CommentKind]}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3" aria-live="polite">
            {!thread ? (
              <p className="text-sm text-muted">Loading comments…</p>
            ) : topLevel.length ? (
              topLevel.map((comment) => renderComment(comment))
            ) : (
              <p className="text-sm text-muted">Nothing here yet. Be the first to share something useful.</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
