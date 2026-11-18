"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { DatabaseBackup, FileCheck2, History, TriangleAlert } from "lucide-react";
import { adminRequest } from "./adminFetch";

const JSON_HEADERS = { "Content-Type": "application/json" };
const UPLOAD_HEADERS = { "Content-Type": "application/gzip" };
const total = (counts?: Record<string, number>) => Object.values(counts ?? {}).reduce((a, b) => a + b, 0);
const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function Message({ error, children }: { error?: string; children?: React.ReactNode }) {
  return (
    <div role="status" aria-live="polite" className="mt-3 text-sm">
      {error ? <p className="text-danger">{error}</p> : children}
    </div>
  );
}

/** Creates a backup and downloads it. */
export function CreateBackup() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  const run = async () => {
    setBusy(true);
    setError("");
    setDone("");
    try {
      // Asks for a fresh authenticator code first if needed, then downloads.
      await adminRequest("/api/admin/backups", { headers: JSON_HEADERS, body: JSON.stringify({ action: "check" }) });
      const response = await adminRequest("/api/admin/backups", { headers: JSON_HEADERS, body: JSON.stringify({ action: "export" }) });
      const blob = await response.blob();
      const name = /filename="([^"]+)"/.exec(response.headers.get("content-disposition") ?? "")?.[1] ?? "tour-india-backup.json.gz";
      const url = URL.createObjectURL(blob);
      const link = Object.assign(document.createElement("a"), { href: url, download: name });
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setDone(`Downloaded ${name} (${(blob.size / 1024).toFixed(0)} KB). Keep it somewhere safe and private: it holds members' personal data.`);
      router.refresh();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "The backup couldn't be made.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button type="button" className="btn btn-primary" onClick={run} disabled={busy}>
        <DatabaseBackup className="size-4" aria-hidden /> {busy ? "Making the backup…" : "Create and download a backup"}
      </button>
      <Message error={error}>{done && <p>{done}</p>}</Message>
    </div>
  );
}

interface VerifyReply {
  ok: boolean;
  problems: string[];
  createdAt?: string;
  checksum?: string;
  counts?: Record<string, number>;
  unknown?: string[];
  madeHere?: { at: string; by: string };
}

function FilePicker({ id, onFile }: { id: string; onFile: (file: File | null) => void }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        Backup file (.json.gz, up to 4 MB)
      </label>
      <input id={id} type="file" accept=".gz,.json,application/gzip,application/json" className="input max-w-full" onChange={(event) => onFile(event.target.files?.[0] ?? null)} />
    </div>
  );
}

/** Checks a downloaded backup without changing anything. */
export function VerifyBackup() {
  const id = useId();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<VerifyReply | null>(null);

  const run = async () => {
    if (!file) return setError("Choose a backup file first.");
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const response = await adminRequest("/api/admin/backups/verify", { headers: UPLOAD_HEADERS, body: await file.arrayBuffer() });
      setResult((await response.json()) as VerifyReply);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "The file couldn't be checked.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-3">
      <FilePicker id={id} onFile={setFile} />
      <div>
        <button type="button" className="btn btn-outline" onClick={run} disabled={busy || !file}>
          <FileCheck2 className="size-4" aria-hidden /> {busy ? "Checking…" : "Verify this file"}
        </button>
      </div>
      <Message error={error}>
        {result?.ok && (
          <div>
            <p className="font-semibold">This backup is complete and unchanged.</p>
            <p className="text-ink-2">
              Made {result.createdAt ? when(result.createdAt) : "at an unknown time"}, {total(result.counts)} records in {Object.keys(result.counts ?? {}).length} collections. Checksum <code className="break-all">{result.checksum?.slice(0, 16)}…</code>
            </p>
            <p className="text-ink-2">{result.madeHere ? `It matches a backup made here by ${result.madeHere.by}.` : "It doesn't match any backup in this site's history (it may come from another copy of the site)."}</p>
            {result.unknown && <p className="text-ink-2">Collections this site doesn&apos;t use, which a restore would skip: {result.unknown.join(", ")}.</p>}
          </div>
        )}
        {result && !result.ok && (
          <div>
            <p className="font-semibold text-danger">This file didn&apos;t pass the checks.</p>
            <ul className="mt-1 list-disc pl-5">
              {result.problems.slice(0, 10).map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          </div>
        )}
      </Message>
    </div>
  );
}

interface Plan {
  name: string;
  inFile: number;
  unchanged: number;
  replace: number;
  add: number;
  skipped?: string;
}

/** The guarded restore: dry run first, then a typed confirmation. Super Admins only (checked on the server too). */
export function RestoreBackup() {
  const id = useId();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dry, setDry] = useState<{ checksum: string; createdAt: string; plans: Plan[]; confirmation: string } | null>(null);
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState<{ restored: number; failed: number } | null>(null);

  const choose = (next: File | null) => {
    setFile(next);
    setDry(null);
    setDone(null);
    setTyped("");
  };

  const runDry = async () => {
    if (!file) return setError("Choose a backup file first.");
    setBusy(true);
    setError("");
    setDone(null);
    try {
      const response = await adminRequest("/api/admin/backups/restore?mode=dry-run", { headers: UPLOAD_HEADERS, body: await file.arrayBuffer() });
      setDry(await response.json());
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "The dry run didn't work.");
    } finally {
      setBusy(false);
    }
  };

  const runRestore = async () => {
    if (!file || !dry || typed.trim() !== dry.confirmation) return;
    setBusy(true);
    setError("");
    try {
      const response = await adminRequest("/api/admin/backups/restore?mode=restore", { headers: { ...UPLOAD_HEADERS, "x-restore-confirm": encodeURIComponent(typed.trim()) }, body: await file.arrayBuffer() });
      setDone(await response.json());
      setDry(null);
      setTyped("");
      router.refresh();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "The restore didn't work.");
    } finally {
      setBusy(false);
    }
  };

  const changes = dry ? dry.plans.reduce((n, p) => n + (p.skipped ? 0 : p.replace + p.add), 0) : 0;
  return (
    <div className="grid gap-3">
      <FilePicker id={id} onFile={choose} />
      <div>
        <button type="button" className="btn btn-outline" onClick={runDry} disabled={busy || !file}>
          <History className="size-4" aria-hidden /> {busy && !dry ? "Checking…" : "Dry run: show what would change"}
        </button>
      </div>
      <Message error={error}>
        {done && (
          <p className={done.failed ? "font-semibold text-danger" : "font-semibold"}>
            Restored {done.restored} records{done.failed ? `; ${done.failed} couldn't be written (see the logs)` : ""}.
          </p>
        )}
      </Message>
      {dry && (
        <div className="grid gap-3">
          <p className="text-sm">
            Backup from <strong>{when(dry.createdAt)}</strong>. Restoring would change <strong>{changes}</strong> {changes === 1 ? "record" : "records"}; nothing has been written yet.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="text-ink-2">
                <tr>
                  <th scope="col" className="py-1 pr-3 font-semibold">Collection</th>
                  <th scope="col" className="py-1 pr-3 font-semibold">In the file</th>
                  <th scope="col" className="py-1 pr-3 font-semibold">Unchanged</th>
                  <th scope="col" className="py-1 pr-3 font-semibold">Replaced</th>
                  <th scope="col" className="py-1 font-semibold">Put back</th>
                </tr>
              </thead>
              <tbody>
                {dry.plans.map((p) => (
                  <tr key={p.name} className="border-t border-line">
                    <th scope="row" className="py-1.5 pr-3 font-normal">
                      <code>{p.name}</code>
                    </th>
                    {p.skipped ? (
                      <td colSpan={4} className="py-1.5 text-ink-2">
                        {p.inFile} in the file. Skipped: {p.skipped}.
                      </td>
                    ) : (
                      <>
                        <td className="py-1.5 pr-3">{p.inFile}</td>
                        <td className="py-1.5 pr-3">{p.unchanged}</td>
                        <td className={`py-1.5 pr-3 ${p.replace ? "font-semibold" : ""}`}>{p.replace}</td>
                        <td className={`py-1.5 ${p.add ? "font-semibold" : ""}`}>{p.add}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {changes > 0 && (
            <div className="rounded-[var(--radius-md)] border border-danger p-4">
              <p className="flex items-start gap-2 text-sm">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
                <span>
                  Replaced records go back to how they were in the backup, so changes made since then are lost. Records created since are kept. This can&apos;t be undone, so download a fresh backup first.
                </span>
              </p>
              <label htmlFor={`${id}-confirm`} className="mt-3 block text-sm font-semibold">
                Type <code>{dry.confirmation}</code> to confirm
              </label>
              <input id={`${id}-confirm`} className="input mt-1.5 w-64 max-w-full" autoComplete="off" spellCheck={false} value={typed} onChange={(event) => setTyped(event.target.value)} />
              <div className="mt-3">
                <button type="button" className="btn btn-primary" onClick={runRestore} disabled={busy || typed.trim() !== dry.confirmation}>
                  {busy ? "Restoring…" : "Restore these records"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
