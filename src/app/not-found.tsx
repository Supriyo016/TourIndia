import Link from "next/link";
import { CompassCharacter } from "@/components/characters/Characters";

export default function NotFound() {
  return (
    <div className="container-x flex flex-col items-center py-20 text-center">
      <CompassCharacter className="h-32 w-32" />
      <h1 className="mt-5">This page has wandered off</h1>
      <p className="lede mt-3">The address may be mistyped, or the page may have moved.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/" className="btn btn-primary">Back to home</Link>
        <Link href="/discover" className="btn btn-outline">Browse guides</Link>
      </div>
    </div>
  );
}
