"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Flag, Home, RotateCw } from "lucide-react";

export function ErrorActions({ retry, onRetry, code }: { retry?: boolean; onRetry?: () => void; code: string }) {
  const router = useRouter();
  const report = `/contact?topic=${encodeURIComponent(`Problem report (${code})`)}`;
  return (
    <div className="mt-7 flex flex-wrap justify-center gap-2">
      {retry && (
        <button type="button" onClick={onRetry ?? (() => window.location.reload())} className="btn btn-primary">
          <RotateCw className="size-4" aria-hidden /> Try again
        </button>
      )}
      <Link prefetch={false} href="/" className={retry ? "btn btn-outline" : "btn btn-primary"}>
        <Home className="size-4" aria-hidden /> Go home
      </Link>
      <button type="button" onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))} className="btn btn-outline">
        <ArrowLeft className="size-4" aria-hidden /> Go back
      </button>
      <Link prefetch={false} href={report} className="btn btn-outline">
        <Flag className="size-4" aria-hidden /> Report a problem
      </Link>
    </div>
  );
}
