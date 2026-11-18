"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { availableActions, STATUS_LABELS, type ContentAction, type VersionStatus } from "@/features/content/workflow";
import { adminPost } from "../adminFetch";

export interface FieldDef {
  field: string;
  label: string;
  kind: "text" | "paragraphs" | "list";
}

export interface VersionRow {
  id: string;
  number: number;
  status: VersionStatus;
  note: string;
  source: string;
  author: string;
  updatedAt: string;
  publishAt?: string;
  publishedAt?: string;
  changed: string[];
  reviewNote?: string;
  basedOn: number | null;
}

const API = "/api/admin/content";

function useSender() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const send = async (body: Record<string, unknown>, done: string) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const reply = await adminPost<{ id?: string }>(API, body);
      setNotice(done);
      startTransition(() => router.refresh());
      return reply;
    } catch (problem) {
      setError((problem as Error).message);
      return null;
    } finally {
      setBusy(false);
    }
  };
  return { send, disabled: busy || pending, error, notice, router };
}

function Messages({ error, notice }: { error: string; notice: string }) {
  return (
    <>
      <p aria-live="polite" className={notice ? "text-sm" : "sr-only"}>
        {notice}
      </p>
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
    </>
  );
}

export function PublishDueButton({ count }: { count: number }) {
  const { send, disabled, error, notice } = useSender();
  return (
    <div className="grid justify-items-end gap-1">
      <button type="button" className="btn btn-primary" disabled={disabled} onClick={() => void send({ action: "publish-due" }, "Scheduled versions published.")}>
        Publish {count} due {count === 1 ? "version" : "versions"} now
      </button>
      <Messages error={error} notice={notice} />
    </div>
  );
}

/** Starts a draft from what's live on the page now, then opens it. */
export function StartDraft({ type, slug, base }: { type: string; slug: string; base: string }) {
  const { send, disabled, error, notice, router } = useSender();
  return (
    <div className="grid gap-2">
      <button
        type="button"
        className="btn btn-primary justify-self-start"
        disabled={disabled}
        onClick={async () => {
          const reply = await send({ action: "create", target: { type, id: slug } }, "Draft started.");
          if (reply?.id) router.push(`${base}?edit=${reply.id}`);
        }}
      >
        Start a new draft
      </button>
      <Messages error={error} notice={notice} />
    </div>
  );
}

/** The text boxes for one draft. Fields left as the guide's own text aren't stored. */
export function DraftEditor({ id, number, defs, initial, note, permissions, preview }: { id: string; number: number; defs: FieldDef[]; initial: Record<string, string>; note: string; permissions: string[]; preview: string }) {
  const { send, disabled, error, notice } = useSender();
  const [values, setValues] = useState(initial);
  const [summary, setSummary] = useState(note);
  const canSubmit = permissions.includes("content.edit");
  const save = () => send({ action: "save", id, fields: values, note: summary }, "Draft saved.");
  return (
    <form
      className="card mt-4 grid gap-5 p-5"
      aria-labelledby="draft-title"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="draft-title" className="text-xl">
          Editing draft, version {number}
        </h2>
        <Link prefetch={false} href={preview} className="link-text text-sm">
          Preview this draft
        </Link>
      </div>
      <Messages error={error} notice={notice} />
      <div className="grid gap-1.5">
        <label htmlFor="draft-note" className="text-sm font-semibold">
          What changed and why
        </label>
        <input id="draft-note" className="input" maxLength={300} value={summary} onChange={(event) => setSummary(event.target.value)} />
      </div>
      {defs.map(({ field, label, kind }) => (
        <div key={field} className="grid gap-1.5">
          <label htmlFor={`f-${field}`} className="text-sm font-semibold">
            {label}
          </label>
          <span id={`f-${field}-hint`} className="text-xs text-ink-2">
            {kind === "paragraphs" ? "Leave a blank line between paragraphs." : kind === "list" ? "One item per line." : "A short piece of text."}
          </span>
          <textarea
            id={`f-${field}`}
            aria-describedby={`f-${field}-hint`}
            className="input min-h-24 py-2"
            rows={kind === "text" ? 2 : 6}
            value={values[field] ?? ""}
            onChange={(event) => setValues({ ...values, [field]: event.target.value })}
          />
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" disabled={disabled}>
          Save draft
        </button>
        {canSubmit && (
          <button
            type="button"
            className="btn btn-outline"
            disabled={disabled}
            onClick={async () => {
              if (await save()) await send({ action: "submit", id }, "Saved and sent for review.");
            }}
          >
            Save and send for review
          </button>
        )}
      </div>
    </form>
  );
}

const ACTION_LABELS: Partial<Record<ContentAction, string>> = {
  submit: "Send for review",
  approve: "Approve",
  reject: "Send back",
  publish: "Publish now",
  schedule: "Schedule",
  unschedule: "Cancel schedule",
  archive: "Archive",
  restore: "Restore as new draft",
  delete: "Delete",
};

/** One row of the version history, with the steps this admin may take on it. */
export function VersionActions({ row, permissions, base }: { row: VersionRow; permissions: string[]; base: string }) {
  const { send, disabled, error, notice, router } = useSender();
  const [when, setWhen] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const actions = availableActions(row.status, new Set(permissions), Boolean(row.publishAt)).filter((action) => action !== "save");

  const run = async (action: ContentAction) => {
    if (action === "schedule") return setScheduling(true);
    if (action === "delete" && !window.confirm(`Delete version ${row.number}? This can't be undone.`)) return;
    if (action === "archive" && row.status === "published" && !window.confirm("Unpublish this version? The page goes back to the guide's own text.")) return;
    const note = action === "reject" ? window.prompt("What needs changing? (optional)") : undefined;
    if (note === null) return;
    const reply = await send({ action, id: row.id, ...(action === "reject" && note ? { note } : {}) }, `${ACTION_LABELS[action]}: done.`);
    if (action === "restore" && reply?.id) router.push(`${base}?edit=${reply.id}`);
  };

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-1.5">
        {row.status === "draft" && permissions.includes("content.edit") && (
          <Link prefetch={false} href={`${base}?edit=${row.id}`} className="chip">
            Edit
          </Link>
        )}
        <Link prefetch={false} href={`/admin/content/preview/${row.id}`} className="chip">
          Preview
        </Link>
        {actions.map((action) => (
          <button key={action} type="button" className="chip" disabled={disabled} onClick={() => void run(action)}>
            {ACTION_LABELS[action]}
          </button>
        ))}
      </div>
      {scheduling && (
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const at = new Date(when);
            if (Number.isNaN(at.getTime())) return;
            void send({ action: "schedule", id: row.id, at: at.toISOString() }, "Scheduled.").then(() => setScheduling(false));
          }}
        >
          <div className="grid gap-1">
            <label htmlFor={`when-${row.id}`} className="text-xs font-semibold">
              Go live at (your time)
            </label>
            <input id={`when-${row.id}`} type="datetime-local" required className="input" value={when} onChange={(event) => setWhen(event.target.value)} />
          </div>
          <button className="btn btn-primary" disabled={disabled}>
            Schedule
          </button>
          <button type="button" className="btn btn-outline" onClick={() => setScheduling(false)}>
            Cancel
          </button>
        </form>
      )}
      <Messages error={error} notice={notice} />
    </div>
  );
}

export const statusLabel = (status: VersionStatus) => STATUS_LABELS[status];
