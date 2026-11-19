"use client";

import { useEffect, useSyncExternalStore } from "react";
import { ErrorScene } from "@/components/errors/ErrorScene";
import type { ErrorKind } from "@/lib/http-errors";

const subscribe = (notify: () => void) => {
  window.addEventListener("online", notify);
  window.addEventListener("offline", notify);
  return () => {
    window.removeEventListener("online", notify);
    window.removeEventListener("offline", notify);
  };
};

/** Picks the closest explanation without ever showing the error's own text, which may contain server details. */
function kindFor(error: Error, online: boolean): ErrorKind {
  if (!online) return "offline";
  const text = `${error.name} ${error.message}`.toLowerCase();
  if (/timeout|timed out|aborted/.test(text)) return "timeout";
  if (/failed to fetch|networkerror|load failed|chunkloaderror|loading chunk/.test(text)) return "api";
  return "server";
}

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);

  useEffect(() => {
    console.error("[page error]", error.digest ?? error.name);
  }, [error]);

  return <ErrorScene kind={kindFor(error, online)} onRetry={reset} />;
}
