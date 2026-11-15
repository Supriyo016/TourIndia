"use client";

import { useMemo, useState } from "react";
import { Download, Plus, Trash2, Undo2 } from "lucide-react";
import { CompassCharacter } from "@/components/characters/Characters";
import { formatLongDate } from "@/features/calendar/calendar";
import { isNoteList, STORAGE_KEYS, useStoredValue, type PlanNote } from "@/hooks/use-stored-value";

const NONE: PlanNote[] = [];
const MAX_NOTES = 100;

export function usePlanNotes() {
  return useStoredValue<PlanNote[]>(STORAGE_KEYS.notes, NONE, isNoteList);
}

/** Free-form trip notes, autosaved in this browser. Used on the calendar and in the planner. */
export function PlanNotes({ selectedDate = null, compact = false }: { selectedDate?: string | null; compact?: boolean }) {
  const [notes, setNotes, ready] = usePlanNotes();
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [onlyDay, setOnlyDay] = useState(false);
  const [deleted, setDeleted] = useState<PlanNote | null>(null);
  const [problem, setProblem] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return notes
      .filter((note) => !needle || `${note.title} ${note.body}`.toLowerCase().includes(needle))
      .filter((note) => !onlyDay || !selectedDate || note.date === selectedDate);
  }, [notes, query, onlyDay, selectedDate]);

  const add = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() && !body.trim()) {
      setProblem("Write a title or some plan details first.");
      return;
    }
    if (notes.length >= MAX_NOTES) {
      setProblem("You've reached 100 notes. Delete one to add another.");
      return;
    }
    const stored = setNotes((current) => [
      { id: `${Date.now()}`, title: title.trim() || "Untitled plan", body: body.trim(), date: selectedDate, updatedAt: new Date().toISOString() },
      ...current,
    ]);
    setProblem(stored ? "" : "This browser wouldn't let us save the note.");
    if (stored) {
      setTitle("");
      setBody("");
    }
  };

  const update = (id: string, change: Partial<PlanNote>) =>
    setNotes((current) => current.map((note) => (note.id === id ? { ...note, ...change, updatedAt: new Date().toISOString() } : note)));

  const remove = (note: PlanNote) => {
    setDeleted(note);
    setNotes((current) => current.filter((item) => item.id !== note.id));
  };

  const exportNotes = () => {
    const text = notes
      .map((note) => `${note.title}${note.date ? ` (${note.date})` : ""}\n${"-".repeat(40)}\n${note.body}\n`)
      .join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    link.download = "tour-india-notes.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div>
      <form onSubmit={add} className="space-y-2">
        <div className="field">
          <label className="field-label" htmlFor={compact ? "note-title-c" : "note-title"}>Plan title</label>
          <input id={compact ? "note-title-c" : "note-title"} className="input" maxLength={120} value={title} placeholder="For example, Kerala in December" onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div className="field">
          <label className="field-label" htmlFor={compact ? "note-body-c" : "note-body"}>Plan details</label>
          <textarea id={compact ? "note-body-c" : "note-body"} className="input" rows={compact ? 3 : 4} maxLength={5000} value={body} placeholder="Tickets to book, people to call, places to see" onChange={(event) => setBody(event.target.value)} />
        </div>
        {selectedDate && <p className="field-hint">This note will be attached to {formatLongDate(selectedDate)}.</p>}
        {problem && <p role="alert" className="field-error">{problem}</p>}
        <button type="submit" className="btn btn-primary"><Plus className="size-4" aria-hidden /> Add note</button>
      </form>

      {deleted && (
        <p role="status" className="mt-3 flex items-center gap-2 text-[0.95rem] text-ink-2">
          Note deleted.
          <button
            type="button"
            className="link-text inline-flex cursor-pointer items-center gap-1"
            onClick={() => {
              setNotes((current) => [deleted, ...current]);
              setDeleted(null);
            }}
          >
            <Undo2 className="size-3.5" aria-hidden /> Undo
          </button>
        </p>
      )}

      {ready && notes.length > 0 && (
        <div className="mt-5 flex flex-wrap items-end gap-3">
          <div className="field min-w-48 flex-1">
            <label className="field-label" htmlFor={compact ? "note-find-c" : "note-find"}>Search notes</label>
            <input id={compact ? "note-find-c" : "note-find"} className="input" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          {selectedDate && !compact && (
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-[0.95rem]">
              <input type="checkbox" className="size-4 accent-[var(--brand)]" checked={onlyDay} onChange={(event) => setOnlyDay(event.target.checked)} />
              Only this day
            </label>
          )}
          <button type="button" className="btn btn-outline" onClick={exportNotes}><Download className="size-4" aria-hidden /> Export</button>
        </div>
      )}

      <div className="mt-4">
        {ready && notes.length === 0 ? (
          <div className="flex items-center gap-3 text-[0.97rem] text-ink-2">
            <CompassCharacter className="h-14 w-14 shrink-0" />
            <p>No notes yet. Everything you write here is saved in this browser as you type.</p>
          </div>
        ) : visible.length === 0 && ready ? (
          <p className="text-ink-2">No notes match.</p>
        ) : (
          <ul className={compact ? "space-y-2" : "grid gap-3 md:grid-cols-2"}>
            {visible.map((note) => (
              <li key={note.id} className="rounded-[var(--radius-md)] border border-line bg-surface p-3">
                <div className="flex items-start gap-2">
                  <input aria-label="Note title" maxLength={120} value={note.title} onChange={(event) => update(note.id, { title: event.target.value })} className="min-w-0 flex-1 bg-transparent font-semibold focus:outline-none focus-visible:underline" />
                  <button type="button" className="icon-btn !size-8 shrink-0" aria-label={`Delete note: ${note.title}`} onClick={() => remove(note)}>
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
                {note.date && <p className="text-sm text-muted">{formatLongDate(note.date)}</p>}
                <textarea aria-label={`Details for ${note.title}`} rows={3} maxLength={5000} value={note.body} onChange={(event) => update(note.id, { body: event.target.value })} className="mt-1 w-full resize-y bg-transparent text-[0.95rem] text-ink-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
