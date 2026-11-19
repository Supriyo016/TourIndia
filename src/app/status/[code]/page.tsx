import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ErrorScene } from "@/components/errors/ErrorScene";
import { errorCopy, kindForStatus, statusPages } from "@/lib/http-errors";

type Props = { params: Promise<{ code: string }> };

const kindOf = (code: string) => (code === "offline" ? "offline" : kindForStatus(Number(code)));

export const dynamicParams = false;
export const generateStaticParams = () => statusPages.map((code) => ({ code }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return { title: errorCopy[kindOf(code)].title, robots: { index: false, follow: false } };
}

/** Friendly pages for gateway, maintenance, timeout, auth and offline states, linked from API failures and the proxy. */
export default async function StatusPage({ params }: Props) {
  const { code } = await params;
  if (!(statusPages as readonly string[]).includes(code)) notFound();
  return <ErrorScene kind={kindOf(code)} />;
}
