"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export interface CompareRow {
  slug: string;
  name: string;
  state: string;
  season: string;
  days: string;
  budget: string;
  midRange: string;
  comfort: string;
  styles: string;
  getThere: string;
  permits: string;
  access: string;
}

const ROWS: [keyof CompareRow, string][] = [
  ["state", "State"],
  ["season", "Best months"],
  ["days", "Suggested stay"],
  ["budget", "Budget estimate, per day"],
  ["midRange", "Mid-range estimate, per day"],
  ["comfort", "Comfort estimate, per day"],
  ["styles", "Good for"],
  ["getThere", "Nearest air link"],
  ["permits", "Permits"],
  ["access", "Accessibility"],
];

export function CompareTool({ rows }: { rows: CompareRow[] }) {
  const params = useSearchParams();
  const known = (slug: string | null) => (rows.some((row) => row.slug === slug) ? slug! : "");
  const [slugs, setSlugs] = useState([known(params.get("a")) || "jaipur", known(params.get("b")) || "udaipur", known(params.get("c"))]);
  const selected = slugs.map((slug) => rows.find((row) => row.slug === slug));
  const shown = selected.filter((row) => row !== undefined);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        {slugs.map((slug, index) => (
          <div className="field" key={index}>
            <label className="field-label" htmlFor={`c-${index}`}>Destination {index + 1}{index === 2 && " (optional)"}</label>
            <select
              id={`c-${index}`}
              className="input"
              value={slug}
              onChange={(event) => setSlugs((current) => current.map((value, position) => (position === index ? event.target.value : value)))}
            >
              <option value="">None</option>
              {rows.map((row) => (
                <option key={row.slug} value={row.slug} disabled={slugs.includes(row.slug) && row.slug !== slug}>{row.name}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="mt-6 text-ink-2">Choose at least one destination to compare.</p>
      ) : (
        <div className="relative mt-6 overflow-x-auto rounded-[var(--radius-lg)] border border-line">
          <table className="w-full min-w-[40rem] border-collapse bg-surface text-left text-[0.97rem]">
            <caption className="sr-only">Comparison of the selected destinations</caption>
            <thead>
              <tr className="bg-surface-2">
                <td className="w-44 p-3"><span className="sr-only">Attribute</span></td>
                {shown.map((row) => (
                  <th key={row.slug} scope="col" className="p-3 font-display text-lg">
                    <Link href={`/destinations/${row.slug}`} className="link-text">{row.name}</Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([key, label]) => (
                <tr key={key} className="border-t border-line align-top">
                  <th scope="row" className="p-3 font-semibold text-muted">{label}</th>
                  {shown.map((row) => (
                    <td key={row.slug} className="p-3 text-ink-2">{row[key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {shown.length > 0 && (
        <Link href={`/planner?d=${shown.map((row) => row.slug).join(",")}`} className="btn btn-accent mt-5">
          Plan a trip with these
        </Link>
      )}
    </div>
  );
}
