import type { Metadata } from "next";
import { ErrorScene } from "@/components/errors/ErrorScene";

export const metadata: Metadata = { title: "Access denied", robots: { index: false, follow: false } };

export default function Forbidden() {
  return <ErrorScene kind="forbidden" />;
}
