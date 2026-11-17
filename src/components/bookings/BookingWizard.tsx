"use client";

import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { postJson, useAuth } from "@/components/auth/AuthProvider";
import { BOOKING_KINDS, BUDGET_TIERS, bookingSchema, estimateBooking, nightsBetween, type BookingInput, type BookingKind } from "@/features/bookings/schema";
import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface BookingPlace {
  slug: string;
  name: string;
  state: string;
  budget: Record<"budget" | "midRange" | "comfort", { min: number; max: number }>;
}

const STEPS = ["What", "Where and when", "Who", "Preferences", "Review"] as const;
const DRAFT_KEY = "ti-booking-draft";
const today = () => new Date().toISOString().slice(0, 10);
const plus = (iso: string, days: number) => {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const EMPTY: BookingInput = { kind: "stay", destination: "", checkIn: "", checkOut: "", flexibleDates: false, adults: 2, children: 0, rooms: 1, tier: "midRange", stepFree: false, phone: "", notes: "" };

/**
 * A five-step request for planning help. Nothing is reserved or charged: the request reaches the
 * site owner, who replies by email with suggestions and where to book. The draft is kept for this browser tab only.
 */
export function BookingWizard({ places }: { places: BookingPlace[] }) {
  const { user, openSignIn } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<BookingInput>(EMPTY);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Restores a draft from earlier in this tab. Session storage only: it's gone when the tab closes.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      try {
        const saved = JSON.parse(window.sessionStorage.getItem(DRAFT_KEY) ?? "null") as Partial<BookingInput> | null;
        const destination = new URLSearchParams(window.location.search).get("destination");
        setForm((current) => ({ ...current, ...(saved ?? {}), ...(destination && places.some((place) => place.slug === destination) ? { destination } : {}) }));
      } catch {
        // A damaged draft is ignored.
      }
    }, 0);
    return () => window.clearTimeout(handle);
  }, [places]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch {
      // Storage can be unavailable in private windows.
    }
  }, [form]);

  const set = <K extends keyof BookingInput>(key: K, value: BookingInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  const place = places.find((item) => item.slug === form.destination);
  const estimate = place && form.checkIn && form.checkOut > form.checkIn ? estimateBooking(form, place.budget[form.tier]) : null;

  const stepError = (): string => {
    if (step === 1) {
      if (!form.destination) return "Choose a destination.";
      if (!form.checkIn || !form.checkOut) return "Choose your dates.";
      if (form.checkIn < today()) return "The start date has passed.";
      if (form.checkOut <= form.checkIn) return "The end date must be after the start date.";
      if (nightsBetween(form.checkIn, form.checkOut) > 60) return "Requests can cover up to 60 nights.";
    }
    if (step === 2 && form.rooms > form.adults + form.children) return "More rooms than people.";
    return "";
  };

  const next = () => {
    const problem = stepError();
    setError(problem);
    if (!problem) setStep(step + 1);
  };

  const submit = async () => {
    const parsed = bookingSchema.safeParse(form);
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Please check the details.");
    if (!user) return openSignIn("Sign in to send your request. We reply by email.");
    setBusy(true);
    setError("");
    try {
      const result = await postJson<{ reference: string }>("/api/bookings", parsed.data);
      setSent(result.reference);
      window.sessionStorage.removeItem(DRAFT_KEY);
    } catch (problem) {
      setError((problem as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="card p-6 text-center" role="status">
        <Check className="mx-auto size-10 text-forest" aria-hidden />
        <h3 className="mt-2 text-2xl">Request sent</h3>
        <p className="mt-2 text-ink-2">
          Your reference is <strong className="font-mono text-ink">{sent}</strong>. We&apos;ll reply to {user?.email} with suggestions and where to book. Nothing has been booked or charged.
        </p>
        <a href="/profile#requests" className="btn btn-outline mt-4">See your requests</a>
      </div>
    );
  }

  return (
    <div className="card p-5 sm:p-7">
      <ol className="mb-6 flex flex-wrap gap-2" aria-label="Steps">
        {STEPS.map((label, index) => (
          <li key={label} aria-current={index === step ? "step" : undefined} className={cn("flex items-center gap-2 rounded-full px-3 py-1 text-sm", index === step ? "bg-brand text-on-brand" : index < step ? "bg-brand-soft text-brand" : "bg-surface-2 text-muted")}>
            <span className="font-semibold tabular-nums">{index + 1}</span> {label}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <fieldset>
          <legend className="text-xl font-semibold">What would you like help with?</legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(Object.keys(BOOKING_KINDS) as BookingKind[]).map((kind) => (
              <label key={kind} data-tilt className={cn("card flex cursor-pointer items-center gap-3 p-4", form.kind === kind && "outline-2 outline-brand")}>
                <input type="radio" name="kind" checked={form.kind === kind} onChange={() => set("kind", kind)} className="size-4 accent-[var(--brand)]" />
                <span className="font-semibold">{BOOKING_KINDS[kind]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {step === 1 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field sm:col-span-2">
            <span className="field-label">Destination</span>
            <select className="input" value={form.destination} onChange={(event) => set("destination", event.target.value)}>
              <option value="">Choose a place</option>
              {places.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}, {item.state}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">From</span>
            <input type="date" className="input" min={today()} value={form.checkIn} onChange={(event) => setForm((current) => ({ ...current, checkIn: event.target.value, checkOut: current.checkOut > event.target.value ? current.checkOut : plus(event.target.value, 2) }))} />
          </label>
          <label className="field">
            <span className="field-label">To</span>
            <input type="date" className="input" min={form.checkIn ? plus(form.checkIn, 1) : today()} value={form.checkOut} onChange={(event) => set("checkOut", event.target.value)} />
          </label>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" className="size-4 accent-[var(--brand)]" checked={form.flexibleDates} onChange={(event) => set("flexibleDates", event.target.checked)} />
            My dates are flexible by a few days
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {([
            ["adults", "Adults", 1, 30],
            ["children", "Children (under 12)", 0, 20],
            ["rooms", "Rooms", 1, 15],
          ] as const).map(([key, label, min, max]) => (
            <div key={key} className="field">
              <span className="field-label" id={`${key}-label`}>{label}</span>
              <div className="flex items-center gap-2" role="group" aria-labelledby={`${key}-label`}>
                <button type="button" className="icon-btn border border-line" aria-label={`Fewer ${label.toLowerCase()}`} disabled={form[key] <= min} onClick={() => set(key, form[key] - 1)}>
                  −
                </button>
                <output className="w-10 text-center text-xl font-semibold tabular-nums" aria-live="polite">{form[key]}</output>
                <button type="button" className="icon-btn border border-line" aria-label={`More ${label.toLowerCase()}`} disabled={form[key] >= max} onClick={() => set(key, form[key] + 1)}>
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-4">
          <fieldset>
            <legend className="field-label">Budget level</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(Object.keys(BUDGET_TIERS) as (keyof typeof BUDGET_TIERS)[]).map((tier) => (
                <button key={tier} type="button" className="chip" aria-pressed={form.tier === tier} onClick={() => set("tier", tier)}>
                  {BUDGET_TIERS[tier]}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="size-4 accent-[var(--brand)]" checked={form.stepFree} onChange={(event) => set("stepFree", event.target.checked)} />
            Someone needs step-free access
          </label>
          <label className="field">
            <span className="field-label">
              Phone <span className="font-normal text-muted">(optional, if you prefer a call)</span>
            </span>
            <input type="tel" autoComplete="tel" className="input max-w-xs" value={form.phone} onChange={(event) => set("phone", event.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">Anything else?</span>
            <textarea className="input min-h-24" maxLength={1000} placeholder="Diet, occasions, things you'd love to do…" value={form.notes} onChange={(event) => set("notes", event.target.value)} />
          </label>
        </div>
      )}

      {step === 4 && (
        <div>
          <h3 className="text-xl">Check your request</h3>
          <dl className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {[
              ["Help with", BOOKING_KINDS[form.kind]],
              ["Destination", place ? `${place.name}, ${place.state}` : "—"],
              ["Dates", `${form.checkIn} to ${form.checkOut}${form.flexibleDates ? " (flexible)" : ""}`],
              ["Nights", String(nightsBetween(form.checkIn, form.checkOut))],
              ["Travellers", `${form.adults} adult${form.adults > 1 ? "s" : ""}${form.children ? `, ${form.children} child${form.children > 1 ? "ren" : ""}` : ""}, ${form.rooms} room${form.rooms > 1 ? "s" : ""}`],
              ["Budget level", BUDGET_TIERS[form.tier]],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-line py-1.5">
                <dt className="text-muted">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          {estimate && (
            <p className="mt-4 rounded-[var(--radius-md)] bg-brand-soft p-3 text-sm">
              Rough cost on the ground: <strong>{formatINR(estimate.min)} to {formatINR(estimate.max)}</strong> for {estimate.nights} night{estimate.nights === 1 ? "" : "s"}, from our guide&apos;s daily figures. Not a quote.
            </p>
          )}
          <p className="mt-3 text-sm text-muted">This asks for help planning. Tour India doesn&apos;t book or charge anything: we reply with suggestions and the official places to book.</p>
        </div>
      )}

      <p role="alert" aria-live="polite" className="field-error mt-4 min-h-5">
        {error}
      </p>
      <div className="mt-2 flex flex-wrap justify-between gap-3">
        <button type="button" className="btn btn-outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
          <ChevronLeft className="size-4" aria-hidden /> Back
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" className="btn btn-accent" onClick={next}>
            Next <ChevronRight className="size-4" aria-hidden />
          </button>
        ) : (
          <button type="button" className="btn btn-accent" disabled={busy} onClick={submit}>
            {busy ? "Sending…" : user ? "Send request" : "Sign in and send"}
          </button>
        )}
      </div>
    </div>
  );
}
