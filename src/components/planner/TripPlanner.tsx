"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { BookmarkPlus, CalendarPlus, Check, Link2, Printer, Sparkles } from "lucide-react";
import { BackpackerCharacter, DancerCharacter } from "@/components/characters/lazy";
import {
  generateItinerary,
  moveItem,
  toIcs,
  type Itinerary,
  type PlannerDestination as Destination,
  type TransportMode,
  type Pace,
  type Diet,
  type TripDay,
} from "@/features/itinerary/generate";
import { decodeShared, isValidTripDate, shareHash, storedInput } from "@/features/itinerary/share";
import { postJson, useAuth } from "@/components/auth/AuthProvider";
import { isSavedTripList, STORAGE_KEYS, useStoredValue, type SavedTrip } from "@/hooks/use-stored-value";
import { startCities } from "@/data/start-cities";
import { interests as interestOptions } from "@/data/taxonomy";
import { formatINR } from "@/lib/utils";
import type { TravelInterest } from "@/types/content";
import { PlanNotes } from "@/components/notes/PlanNotes";
import { ItineraryDays } from "./ItineraryDays";
import { hasMapsKey } from "@/lib/google-maps";
import { GoogleRouteMap } from "./GoogleRouteMap";
import { RouteOverlay } from "./RouteOverlay";
import { ExpenseTracker, PackingChecklist } from "./TripExtras";
import { MapsAndLinks, TripAnalysisPanel } from "./TripAnalysisPanel";
import type { FestivalFact } from "@/features/itinerary/analysis";
import { track } from "@/lib/analytics/track";

const NO_TRIPS: SavedTrip[] = [];

interface FormState {
  startName: string;
  slugs: string[];
  startDate: string;
  travellers: number;
  days: number;
  budget: string;
  transport: TransportMode;
  interests: TravelInterest[];
  pace: Pace;
  diet: Diet;
  withChildren: boolean;
  withSeniors: boolean;
  stepFree: boolean;
}

const INITIAL: FormState = {
  startName: "Delhi",
  slugs: [],
  startDate: "",
  travellers: 2,
  days: 6,
  budget: "",
  transport: "mixed",
  interests: [],
  pace: "balanced",
  diet: "any",
  withChildren: false,
  withSeniors: false,
  stepFree: false,
};

interface PlannerProps {
  catalogue: Destination[];
  festivals: FestivalFact[];
  states: { slug: string; name: string; tourismUrl?: string }[];
  mapBase: ReactNode;
  map: { width: number; height: number; scale: number; translate: number[] };
}

interface InitialState {
  form: FormState;
  trip: Itinerary | null;
  days: TripDay[];
  status: string;
}

/** Works out the starting state from a shared link, a saved trip or a "plan a trip here" link. */
function readInitialState(params: URLSearchParams, hash: string, catalogue: Destination[]): InitialState {
  const shared = hash.startsWith("#trip=") ? hash.slice(6) : null;
  if (shared !== null) {
    const decoded = decodeShared(shared, catalogue);
    if (decoded) return { form: INITIAL, trip: decoded.trip, days: decoded.days, status: "" };
    return { form: INITIAL, trip: null, days: [], status: "That shared trip link could not be read." };
  }
  const slugs = (params.get("d") ?? "").split(",").filter((slug) => catalogue.some((item) => item.slug === slug));
  const days = Number(params.get("days"));
  return {
    form: slugs.length ? { ...INITIAL, slugs, days: Number.isInteger(days) && days > 0 ? days : INITIAL.days } : INITIAL,
    trip: null,
    days: [],
    status: "",
  };
}

function subscribeToHash(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}

/** Keyed on the address, so following a new planner link starts fresh. */
export function TripPlanner(props: PlannerProps) {
  const params = useSearchParams();
  const hash = useSyncExternalStore(subscribeToHash, () => window.location.hash, () => "");
  // ?trip=<id> means the plan came from "My trips", so saving updates that trip.
  const editing = /^[0-9a-f-]{36}$/.test(params.get("trip") ?? "") ? params.get("trip") : null;
  return <Planner key={`${params.toString()}${hash}`} {...props} editing={editing} initial={readInitialState(params, hash, props.catalogue)} />;
}

function Planner({ catalogue, festivals, states, mapBase, map, initial, editing }: PlannerProps & { initial: InitialState; editing: string | null }) {
  const router = useRouter();
  const { user } = useAuth();
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(initial.form);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [trip, setTrip] = useState<Itinerary | null>(initial.trip);
  const [days, setDays] = useState<TripDay[]>(initial.days);
  const [status, setStatus] = useState(initial.status);
  const [picker, setPicker] = useState("");
  const [, setSaved] = useStoredValue<SavedTrip[]>(STORAGE_KEYS.trips, NO_TRIPS, isSavedTripList);

  const chosen = useMemo(
    () => form.slugs.map((slug) => catalogue.find((item) => item.slug === slug)).filter((item): item is Destination => Boolean(item)),
    [form.slugs, catalogue],
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));

  const generate = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (form.slugs.length === 0) next.slugs = "Add at least one destination.";
    if (form.slugs.length > 6) next.slugs = "Choose six destinations at most.";
    if (!Number.isInteger(form.days) || form.days < 1 || form.days > 45) next.days = "Enter between 1 and 45 days.";
    if (!Number.isInteger(form.travellers) || form.travellers < 1 || form.travellers > 30) next.travellers = "Enter between 1 and 30 travellers.";
    const budget = form.budget.trim() ? Number(form.budget) : null;
    if (budget !== null && (!Number.isFinite(budget) || budget <= 0 || budget > 1e10)) next.budget = "Enter a positive amount, or leave this empty.";
    if (form.startDate && !isValidTripDate(form.startDate)) next.startDate = "Enter a valid date.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const city = startCities.find((item) => item.name === form.startName) ?? startCities[0]!;
    const result = generateItinerary(
      {
        startName: city.name,
        start: city.point,
        destinationSlugs: form.slugs,
        startDate: form.startDate || null,
        travellers: form.travellers,
        days: form.days,
        budget,
        transport: form.transport,
        interests: form.interests,
        pace: form.pace,
        diet: form.diet,
        withChildren: form.withChildren,
        withSeniors: form.withSeniors,
        stepFree: form.stepFree,
      },
      catalogue,
    );
    setTrip(result);
    setDays(result.days);
    track("planner_build");
    setStatus("");
    window.setTimeout(() => document.getElementById("itinerary")?.scrollIntoView({ block: "start" }), 40);
  };

  const shareLink = () => {
    if (!trip) return "";
    const url = new URL("/planner", window.location.origin);
    url.hash = shareHash(trip.input, days);
    return url.toString();
  };

  const downloadCalendar = () => {
    const blob = new Blob([toIcs(days)], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "tour-india-trip.ics";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  /** Signed in: saves to the account (or updates the trip being edited). Otherwise: this browser. */
  const saveTrip = async () => {
    if (!trip) return;
    const name = trip.input.destinationSlugs
      .map((slug) => catalogue.find((item) => item.slug === slug)?.name)
      .filter(Boolean)
      .join(", ");
    if (user) {
      setSaving(true);
      try {
        const plan = { input: storedInput(trip.input), layout: days.map((day) => day.items.map((item) => item.id)) };
        if (editing) {
          await postJson("/api/trips", { action: "update-plan", id: editing, ...plan });
          setSavedId(editing);
        } else {
          const { trip: created } = await postJson<{ trip: { id: string } }>("/api/trips", { action: "create", name: name.slice(0, 80), ...plan });
          setSavedId(created.id);
        }
        setStatus("Trip saved to your account.");
        track("planner_save", { k: "account" });
      } catch (problem) {
        setStatus((problem as Error).message);
      } finally {
        setSaving(false);
      }
      return;
    }
    const stored = setSaved((current) => [{ id: `${Date.now()}`, name, input: trip.input, days, savedAt: new Date().toISOString() }, ...current].slice(0, 20));
    if (stored) track("planner_save", { k: "device" });
    setStatus(stored ? "Trip saved on this device." : "This browser wouldn't let us save the trip. Use Copy share link to keep it.");
  };

  const months = trip?.input.startDate ? [Number(trip.input.startDate.slice(5, 7))] : [];
  const tripDestinations = trip ? trip.input.destinationSlugs.flatMap((slug) => catalogue.filter((item) => item.slug === slug)) : [];
  const hasDates = days.some((day) => day.date);

  return (
    <div>
      <form onSubmit={generate} noValidate className="card no-print grid gap-5 p-5 sm:p-6 lg:grid-cols-3">
        <div className="field">
          <label className="field-label" htmlFor="p-start">Starting from</label>
          <select id="p-start" className="input" value={form.startName} onChange={(event) => update("startName", event.target.value)}>
            {startCities.map((city) => (
              <option key={city.name}>{city.name}</option>
            ))}
          </select>
        </div>

        <div className="field lg:col-span-2">
          <label className="field-label" htmlFor="p-dest">Destinations</label>
          <select
            id="p-dest"
            className="input"
            value={picker}
            aria-invalid={Boolean(errors.slugs)}
            aria-describedby={errors.slugs ? "p-dest-err" : undefined}
            onChange={(event) => {
              const slug = event.target.value;
              setPicker("");
              if (slug && !form.slugs.includes(slug)) update("slugs", [...form.slugs, slug]);
            }}
          >
            <option value="">Add a destination</option>
            {catalogue.map((item) => (
              <option key={item.slug} value={item.slug} disabled={form.slugs.includes(item.slug)}>
                {item.name}
              </option>
            ))}
          </select>
          {errors.slugs && <p id="p-dest-err" className="field-error">{errors.slugs}</p>}
          {chosen.length > 0 && (
            <ul className="flex flex-wrap gap-2 pt-1" aria-label="Chosen destinations">
              {chosen.map((item) => (
                <li key={item.slug}>
                  <button type="button" className="chip" aria-pressed="true" onClick={() => update("slugs", form.slugs.filter((slug) => slug !== item.slug))}>
                    {item.name} <span aria-hidden>×</span>
                    <span className="sr-only">. Remove</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="p-date">Start date (optional)</label>
          <input id="p-date" type="date" className="input" value={form.startDate} aria-invalid={Boolean(errors.startDate)} onChange={(event) => update("startDate", event.target.value)} />
          {errors.startDate && <p className="field-error">{errors.startDate}</p>}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="p-days">Number of days</label>
          <input id="p-days" type="number" min={1} max={45} className="input" value={form.days} aria-invalid={Boolean(errors.days)} onChange={(event) => update("days", Number(event.target.value))} />
          {errors.days && <p className="field-error">{errors.days}</p>}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="p-people">Travellers</label>
          <input id="p-people" type="number" min={1} max={30} className="input" value={form.travellers} aria-invalid={Boolean(errors.travellers)} onChange={(event) => update("travellers", Number(event.target.value))} />
          {errors.travellers && <p className="field-error">{errors.travellers}</p>}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="p-budget">Total budget in ₹ (optional)</label>
          <input id="p-budget" inputMode="numeric" className="input" placeholder="For example, 60000" value={form.budget} aria-invalid={Boolean(errors.budget)} onChange={(event) => update("budget", event.target.value)} />
          {errors.budget ? <p className="field-error">{errors.budget}</p> : <p className="field-hint">For the whole group.</p>}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="p-mode">Preferred transport</label>
          <select id="p-mode" className="input" value={form.transport} onChange={(event) => update("transport", event.target.value as TransportMode)}>
            <option value="mixed">Whatever suits each leg</option>
            <option value="train">Train</option>
            <option value="road">Road</option>
            <option value="flight">Flight</option>
          </select>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="p-pace">Pace</label>
          <select id="p-pace" className="input" value={form.pace} onChange={(event) => update("pace", event.target.value as Pace)}>
            <option value="relaxed">Relaxed (about 5 hours a day)</option>
            <option value="balanced">Balanced (about 7 hours a day)</option>
            <option value="packed">Packed (about 9 hours a day)</option>
          </select>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="p-diet">Food</label>
          <select id="p-diet" className="input" value={form.diet} onChange={(event) => update("diet", event.target.value as Diet)}>
            <option value="any">Anything</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="jain">Jain</option>
          </select>
        </div>

        <fieldset className="field">
          <legend className="field-label">Who is travelling</legend>
          <div className="mt-1 grid gap-1.5 text-[0.97rem]">
            {([
              ["withChildren", "Children"],
              ["withSeniors", "Older travellers"],
              ["stepFree", "Someone who needs step-free access"],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2">
                <input type="checkbox" className="size-4 accent-[var(--brand)]" checked={form[key]} onChange={(event) => update(key, event.target.checked)} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="lg:col-span-3">
          <legend className="field-label mb-2">What interests you?</legend>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((option) => {
              const on = form.interests.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  className="chip"
                  aria-pressed={on}
                  onClick={() => update("interests", on ? form.interests.filter((id) => id !== option.id) : [...form.interests, option.id])}
                >
                  {option.name}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex items-center gap-4 lg:col-span-3">
          <button type="submit" className="btn btn-accent">
            <Sparkles className="size-4" aria-hidden /> Build my itinerary
          </button>
          {status && <p role="status" className="text-[0.97rem] text-ink-2">{status}</p>}
        </div>
      </form>

      {!trip && (
        <div className="no-print mt-8 flex items-center justify-center gap-5 text-ink-2">
          <BackpackerCharacter className="h-28 w-auto" />
          <p className="max-w-md">Add a destination or two above and your day-by-day plan will appear here.</p>
        </div>
      )}

      {trip && (
        <section id="itinerary" className="mt-10" aria-labelledby="itinerary-title">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 id="itinerary-title">Your {days.length}-day itinerary</h2>
              <p className="mt-1 text-ink-2">
                From {trip.input.startName}, for {trip.input.travellers} {trip.input.travellers === 1 ? "traveller" : "travellers"}.
              </p>
            </div>
            <div className="no-print flex flex-wrap gap-2">
              <button type="button" className="btn btn-outline" onClick={() => window.print()}>
                <Printer className="size-4" aria-hidden /> Print or save as PDF
              </button>
              <button
                type="button"
                className="btn btn-outline"
                disabled={!hasDates}
                title={hasDates ? undefined : "Add a start date first"}
                onClick={downloadCalendar}
              >
                <CalendarPlus className="size-4" aria-hidden /> Add to calendar
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={async () => {
                  try {
                    track("share_link", { k: "planner" });
                    await navigator.clipboard.writeText(shareLink());
                    setStatus("Share link copied.");
                  } catch {
                    window.prompt("Copy this link", shareLink());
                  }
                }}
              >
                <Link2 className="size-4" aria-hidden /> Copy share link
              </button>
              <button type="button" className="btn btn-primary" disabled={saving} onClick={() => void saveTrip()}>
                <BookmarkPlus className="size-4" aria-hidden /> {user && editing ? "Save changes" : "Save trip"}
              </button>
            </div>
          </div>

          {status.startsWith("Trip saved") ? (
            <div role="status" className="no-print anim-pop mt-4 flex items-center gap-3 rounded-[var(--radius-md)] bg-brand-soft p-3">
              <DancerCharacter className="h-14 w-auto" />
              <p>
                <Check className="mr-1 inline size-4" aria-hidden />
                {savedId ? "Saved to your trips." : "Saved on this device."}{" "}
                <button type="button" onClick={() => router.push(savedId ? `/profile/trips/${savedId}` : "/saved")} className="link-text cursor-pointer">
                  {savedId ? "Open the trip" : "View saved trips"}
                </button>
              </p>
            </div>
          ) : null}

          {trip.warnings.length > 0 && (
            <ul className="mt-5 space-y-2">
              {trip.warnings.map((warning) => (
                <li key={warning} className="rounded-[var(--radius-md)] border-l-4 border-accent bg-surface-2 p-3 text-[0.97rem] text-ink-2">
                  {warning}
                </li>
              ))}
            </ul>
          )}

          <TripAnalysisPanel trip={{ ...trip, days }} catalogue={catalogue} festivals={festivals} />

          <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <ItineraryDays days={days} onChange={setDays} moveItem={moveItem} />

            <aside className="space-y-5 print:hidden lg:sticky lg:top-24">
              <div className="card p-4">
                <h3 className="mb-2 text-lg">Route</h3>
                {hasMapsKey ? (
                  <GoogleRouteMap legs={trip.legs} />
                ) : (
                  <div className="relative">
                    {mapBase}
                    <RouteOverlay legs={trip.legs} map={map} />
                  </div>
                )}
                <ol className="mt-3 space-y-1 text-sm text-ink-2">
                  {trip.legs.map((leg) => (
                    <li key={`${leg.from}-${leg.to}`}>
                      {leg.from} to {leg.to}: about {leg.hours} h by {leg.mode}
                    </li>
                  ))}
                </ol>
              </div>

              <MapsAndLinks trip={trip} states={states.filter((state) => tripDestinations.some((place) => place.stateSlug === state.slug))} />

              <div className="card p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-lg">Estimated cost</h3>
                  <span className="tag tag-estimate">Estimate</span>
                </div>
                <dl className="space-y-1.5 text-[0.97rem]">
                  <div className="flex justify-between"><dt className="text-muted">Stay, food, local</dt><dd>{formatINR(trip.totals.ground)}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Travel out and between stops</dt><dd>{formatINR(trip.totals.travel)}</dd></div>
                  <div className="flex justify-between border-t border-line pt-1.5 font-semibold"><dt>Per person</dt><dd>{formatINR(trip.totals.perPerson)}</dd></div>
                  <div className="flex justify-between font-semibold"><dt>Group total</dt><dd>{formatINR(trip.totals.group)}</dd></div>
                </dl>
                <p className="mt-2 text-sm text-muted">Costed at {trip.tier === "midRange" ? "mid-range" : trip.tier} level. Fares and rooms are not live.</p>
              </div>

              <details className="card p-4">
                <summary className="cursor-pointer text-lg font-semibold">Plan notes</summary>
                <div className="mt-3">
                  <PlanNotes compact selectedDate={trip.input.startDate} />
                </div>
              </details>

              <PackingChecklist destinations={tripDestinations} months={months} />
              <ExpenseTracker travellers={trip.input.travellers} />
            </aside>
          </div>
        </section>
      )}
    </div>
  );
}
