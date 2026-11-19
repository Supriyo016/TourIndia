"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineNotice() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    setOffline(!navigator.onLine);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div role="alert" className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-2 bg-danger px-4 py-2.5 text-sm font-semibold text-white shadow-lg">
      <WifiOff className="size-4" aria-hidden />
      You are offline. Some features may be unavailable.
    </div>
  );
}
