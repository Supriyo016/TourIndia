"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, SquareTerminal, X } from "lucide-react";
import { BackpackerCharacter } from "@/components/characters/Characters";
import { cn } from "@/lib/utils";
import { YatriChat } from "./YatriChat";
import { YatriTerminal } from "./YatriTerminal";

type Tab = "chat" | "terminal";

export default function YatriPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("chat");
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panel.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const tabs: [Tab, string, typeof MessageCircle][] = [
    ["chat", "Chat", MessageCircle],
    ["terminal", "Terminal", SquareTerminal],
  ];

  return (
    <div
      ref={panel}
      tabIndex={-1}
      role="dialog"
      aria-label="Yatri, the Tour India assistant"
      className="no-print anim-pop fixed inset-x-2 top-2 bottom-2 z-50 flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-lg outline-none sm:inset-x-auto sm:top-auto sm:right-4 sm:bottom-4 sm:h-[min(38rem,calc(100dvh-2rem))] sm:w-[27rem]"
    >
      <div className="flex items-center gap-2 border-b border-line p-2 pl-3">
        <BackpackerCharacter className="h-9 w-auto" animated={false} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg leading-tight">Yatri</p>
          <p className="text-xs text-muted">Your Tour India assistant</p>
        </div>
        <div role="tablist" aria-label="Assistant mode" className="flex rounded-[var(--radius-md)] bg-surface-2 p-0.5">
          {tabs.map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn("inline-flex h-8 cursor-pointer items-center gap-1 rounded-[var(--radius-sm)] px-2 text-sm font-medium", tab === id ? "bg-surface text-brand shadow-sm" : "text-ink-2")}
            >
              <Icon className="size-4" aria-hidden /> {label}
            </button>
          ))}
        </div>
        <button type="button" className="icon-btn !size-9" aria-label="Close Yatri" onClick={onClose}>
          <X className="size-5" aria-hidden />
        </button>
      </div>
      {tab === "chat" ? <YatriChat onNavigate={onClose} /> : <YatriTerminal onClose={onClose} />}
    </div>
  );
}
