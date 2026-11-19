import type { Metadata } from "next";
import { ErrorScene } from "@/components/errors/ErrorScene";

export const metadata: Metadata = { title: "Sign in required", robots: { index: false, follow: false } };

export default function Unauthorized() {
  return <ErrorScene kind="unauthorized" />;
}
