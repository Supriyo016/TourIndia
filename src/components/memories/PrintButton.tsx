"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label = "Print or save as PDF" }: { label?: string }) {
  return (
    <button type="button" className="btn btn-accent" onClick={() => window.print()}>
      <Printer className="size-4" aria-hidden /> {label}
    </button>
  );
}
