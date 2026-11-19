import type { ReactNode } from "react";
import { errorCopy, type ErrorKind } from "@/lib/http-errors";
import { ErrorIllustration } from "./ErrorIllustration";
import { ErrorActions } from "./ErrorActions";

export function ErrorScene({ kind, onRetry, children }: { kind: ErrorKind; onRetry?: () => void; children?: ReactNode }) {
  const copy = errorCopy[kind];
  return (
    <section className="container-x flex flex-col items-center py-14 text-center sm:py-20" aria-labelledby="error-title">
      <ErrorIllustration kind={kind} />
      <p className="mt-6 text-sm font-bold tracking-wide text-accent-ink">{copy.code === "Offline" || copy.code === "Error" ? copy.code : `Error ${copy.code}`}</p>
      <h1 id="error-title" className="mt-1 text-3xl font-bold text-balance sm:text-4xl">{copy.title}</h1>
      <p className="lede mt-3 max-w-lg text-ink-2">{copy.message}</p>
      {children}
      <ErrorActions retry={copy.retry} onRetry={onRetry} code={copy.code} />
    </section>
  );
}
