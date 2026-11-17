import { YatriGuide, type YatriMood } from "@/components/characters/YatriGuide";
import { cn } from "@/lib/utils";
import styles from "./yatri.module.css";

export type { YatriMood };

/** Yatri's face in the chat: a round frame holding the animated travel guide. */
export function YatriAvatar({ large, mood = "idle" }: { large?: boolean; mood?: YatriMood }) {
  return (
    <span className={cn(styles.avatar, large && styles.avatarLarge)} aria-hidden>
      <YatriGuide mood={mood} className="size-full" />
    </span>
  );
}
