"use client";

import { CompassCharacter } from "@/components/characters/lazy";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-x flex flex-col items-center py-20 text-center">
      <CompassCharacter className="h-32 w-32" />
      <h1 className="mt-5">Something went wrong</h1>
      <p className="lede mt-3">The page could not be displayed. Your saved places are unaffected.</p>
      <button type="button" className="btn btn-primary mt-6" onClick={reset}>Try again</button>
    </div>
  );
}
