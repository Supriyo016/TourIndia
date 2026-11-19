export type ErrorKind = "notFound" | "server" | "badGateway" | "unavailable" | "timeout" | "offline" | "unauthorized" | "forbidden" | "api";

export type ErrorCopy = { code: string; title: string; message: string; retry: boolean };

export const errorCopy: Record<ErrorKind, ErrorCopy> = {
  notFound: { code: "404", title: "This page has wandered off", message: "The address may be mistyped, or the page may have moved. Search for what you were looking for, or start from one of the guides.", retry: false },
  server: { code: "500", title: "Something went wrong on our side", message: "An unexpected problem stopped this page from loading. It has been logged, and trying again usually works.", retry: true },
  badGateway: { code: "502", title: "A connection on the way broke", message: "One of the services this page relies on sent back a bad response. Give it a moment and try again.", retry: true },
  unavailable: { code: "503", title: "We're taking a short break", message: "Tour India is briefly unavailable, usually for maintenance or a spike in visitors. Please try again in a few minutes.", retry: true },
  timeout: { code: "504", title: "That took too long", message: "The server didn't answer in time. Trying again in a moment normally does it.", retry: true },
  offline: { code: "Offline", title: "You're offline", message: "Check your Wi-Fi or mobile data. This page will load once you're back online.", retry: true },
  unauthorized: { code: "401", title: "Please sign in to continue", message: "This page belongs to an account. Sign in, then come back here.", retry: false },
  forbidden: { code: "403", title: "This area is off limits", message: "Your account doesn't have access to this page. If you think it should, let us know.", retry: false },
  api: { code: "Error", title: "We couldn't load this", message: "A request to our server failed. Check your connection and try again.", retry: true },
};

const byStatus: Record<number, ErrorKind> = { 401: "unauthorized", 403: "forbidden", 404: "notFound", 500: "server", 502: "badGateway", 503: "unavailable", 504: "timeout" };

export const statusPages = ["401", "403", "500", "502", "503", "504", "offline"] as const;

export function kindForStatus(status: number): ErrorKind {
  return byStatus[status] ?? (status >= 500 ? "server" : "api");
}

/** A short sentence for a failed request, safe to show in a form or toast. Never includes server details. */
export function describeFailure(status: number | "offline"): string {
  if (status === "offline" || (typeof navigator !== "undefined" && !navigator.onLine)) return "You're offline. Reconnect and try again.";
  if (status === 429) return "Too many tries in a short time. Please wait a minute and try again.";
  if (status === 408 || status === 504) return "The server took too long to answer. Please try again.";
  if (status === 401) return "Please sign in and try again.";
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return "We couldn't find that. It may have been removed.";
  if (status >= 500) return "Our server ran into a problem. Please try again in a moment.";
  return "Something went wrong. Please try again.";
}
