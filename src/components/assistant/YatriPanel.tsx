"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, SquareTerminal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AskMode } from "./ask";
import styles from "./yatri.module.css";
import { YatriChat } from "./YatriChat";
import { YatriOrb } from "./YatriOrb";
import { YatriTerminal } from "./YatriTerminal";

type Tab = "chat" | "terminal";

/** Yatri's concierge panel: a side panel on larger screens and a full-screen sheet on phones. */
export default function YatriPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("chat");
  const [mode, setMode] = useState<AskMode | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panel.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div ref={panel} tabIndex={-1} role="dialog" aria-label="Yatri, the Tour India assistant" className={cn("no-print outline-none", styles.panel)}>
      <header className={styles.panelHead}>
        <YatriOrb large />
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg leading-tight">Yatri</p>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <span className={cn(styles.liveDot, mode === "guide" && styles.guideDot)} aria-hidden />
            {mode === "guide" ? "Answering from the guides" : "Your India travel concierge"}
          </p>
        </div>
        <button
          type="button"
          className="icon-btn !size-9"
          aria-label={tab === "chat" ? "Open the Yatri terminal" : "Back to chat"}
          title={tab === "chat" ? "Terminal" : "Chat"}
          onClick={() => setTab(tab === "chat" ? "terminal" : "chat")}
        >
          {tab === "chat" ? <SquareTerminal className="size-[1.1rem]" aria-hidden /> : <MessageCircle className="size-[1.1rem]" aria-hidden />}
        </button>
        <button type="button" className="icon-btn !size-9" aria-label="Close Yatri" onClick={onClose}>
          <X className="size-5" aria-hidden />
        </button>
      </header>
      {tab === "chat" ? <YatriChat onNavigate={onClose} onMode={setMode} /> : <YatriTerminal onClose={onClose} />}
    </div>
  );
}
