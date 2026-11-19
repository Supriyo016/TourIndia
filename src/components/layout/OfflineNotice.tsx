"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Wifi, WifiOff } from "lucide-react";

const subscribe = (notify: () => void) => {
  window.addEventListener("online", notify);
  window.addEventListener("offline", notify);
  return () => {
    window.removeEventListener("online", notify);
    window.removeEventListener("offline", notify);
  };
};

/** A banner while the connection is down, and a brief "back online" note when it returns. */
export function OfflineNotice() {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
  const [restored, setRestored] = useState(false);
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!online) {
      wasOffline.current = true;
      return;
    }
    if (!wasOffline.current) return;
    wasOffline.current = false;
    const show = window.setTimeout(() => setRestored(true), 0);
    const hide = window.setTimeout(() => setRestored(false), 3000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [online]);

  if (online && !restored) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`no-print anim-pop fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-md items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md ${online ? "bg-[rgb(22_120_70/0.92)]" : "bg-[rgb(20_24_28/0.92)]"}`}
    >
      {online ? <Wifi className="size-4" aria-hidden /> : <WifiOff className="size-4" aria-hidden />}
      {online ? "Back online" : "You're offline. Some features may be unavailable."}
      {!online && (
        <button type="button" onClick={() => window.location.reload()} className="ml-1 rounded-full bg-white/15 px-3 py-1 hover:bg-white/25">
          Retry
        </button>
      )}
    </div>
  );
}
