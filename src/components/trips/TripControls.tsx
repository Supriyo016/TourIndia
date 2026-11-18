"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Archive, ArchiveRestore, CalendarPlus, Check, Copy, CopyPlus, Link2, Link2Off, Map, Pencil, Printer, Trash2 } from "lucide-react";
import { postJson } from "@/components/auth/AuthProvider";
import { toIcs, type TripDay } from "@/features/itinerary/generate";
import { track } from "@/lib/analytics/track";

interface Props {
  id: string;
  name: string;
  status: "active" | "archived";
  shareId: string | null;
  plannerHash: string;
  days: TripDay[];
}

/** Everything the owner can do with a saved trip. */
export function TripControls({ id, name, status, shareId: initialShare, plannerHash, days }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(name);
  const [shareId, setShareId] = useState(initialShare);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const hasDates = days.some((day) => day.date);
  const link = shareId ? `${typeof window === "undefined" ? "" : window.location.origin}/t/${shareId}` : "";

  const run = async (body: Record<string, unknown>, after?: (result: Record<string, unknown>) => void) => {
    setBusy(true);
    setError("");
    try {
      const result = await postJson<Record<string, unknown>>("/api/trips", { id, ...body });
      after?.(result);
      startTransition(() => router.refresh());
    } catch (problem) {
      setError((problem as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const disabled = busy || pending;

  const downloadCalendar = () => {
    const blob = new Blob([toIcs(days)], { type: "text/calendar;charset=utf-8" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `${name.replace(/[^\w-]+/g, "-").replace(/^-|-$/g, "") || "trip"}.ics`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  return (
    <div className="no-print grid gap-4">
      {renaming ? (
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void run({ action: "rename", name: draft }, () => setRenaming(false));
          }}
        >
          <label className="field min-w-56 flex-1">
            <span className="field-label">Trip name</span>
            <input value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={80} required className="input" />
          </label>
          <button type="submit" className="btn btn-accent" disabled={disabled}>
            Save name
          </button>
          <button type="button" className="btn btn-outline" onClick={() => setRenaming(false)}>
            Cancel
          </button>
        </form>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <a href={`/planner?trip=${id}#${plannerHash}`} className="btn btn-primary">
          <Map className="size-4" aria-hidden /> Edit in the planner
        </a>
        <button type="button" className="btn btn-outline" onClick={() => window.print()}>
          <Printer className="size-4" aria-hidden /> Print or save as PDF
        </button>
        <button type="button" className="btn btn-outline" disabled={!hasDates} title={hasDates ? undefined : "Add a start date in the planner first"} onClick={downloadCalendar}>
          <CalendarPlus className="size-4" aria-hidden /> Add to calendar
        </button>
        {!renaming && (
          <button type="button" className="btn btn-outline" onClick={() => setRenaming(true)}>
            <Pencil className="size-4" aria-hidden /> Rename
          </button>
        )}
        <button type="button" className="btn btn-outline" disabled={disabled} onClick={() => void run({ action: "duplicate" }, (result) => router.push(`/profile/trips/${(result.trip as { id: string }).id}`))}>
          <CopyPlus className="size-4" aria-hidden /> Duplicate
        </button>
        <button type="button" className="btn btn-outline" disabled={disabled} onClick={() => void run({ action: "archive", archived: status === "active" })}>
          {status === "active" ? <Archive className="size-4" aria-hidden /> : <ArchiveRestore className="size-4" aria-hidden />}
          {status === "active" ? "Archive" : "Restore"}
        </button>
        <button
          type="button"
          className="btn border border-danger text-danger"
          disabled={disabled}
          onBlur={() => setConfirmDelete(false)}
          onClick={() => (confirmDelete ? void run({ action: "delete" }, () => router.push("/profile/trips")) : setConfirmDelete(true))}
        >
          <Trash2 className="size-4" aria-hidden /> {confirmDelete ? "Delete for good?" : "Delete"}
        </button>
      </div>

      <div className="card p-4">
        <h2 className="text-lg">Share a read-only copy</h2>
        {shareId ? (
          <div className="mt-2 grid gap-2">
            <span className="flex gap-2">
              <input readOnly aria-label="Read-only link" value={link} className="input min-w-0 flex-1 text-sm" onFocus={(event) => event.target.select()} />
              <button
                type="button"
                className="btn btn-outline shrink-0"
                onClick={() => {
                  void navigator.clipboard?.writeText(link).then(() => {
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 2000);
                  });
                }}
              >
                {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                {copied ? "Copied" : "Copy"}
              </button>
            </span>
            <p className="text-sm text-muted">Shows the plan and the estimate. Never your expenses, the people on them, or who made it.</p>
            <button type="button" className="btn btn-outline justify-self-start" disabled={disabled} onClick={() => void run({ action: "share", on: false }, () => setShareId(null))}>
              <Link2Off className="size-4" aria-hidden /> Turn off the link
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-outline mt-2" disabled={disabled} onClick={() => void run({ action: "share", on: true }, (result) => {
            setShareId(result.shareId as string);
            track("share_link", { k: "trip" });
          })}>
            <Link2 className="size-4" aria-hidden /> Make a read-only link
          </button>
        )}
      </div>

      <p role="alert" aria-live="polite" className="field-error empty:hidden">
        {error}
      </p>
    </div>
  );
}
