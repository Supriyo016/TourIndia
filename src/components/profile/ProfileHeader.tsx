import Image from "next/image";
import type { ReactNode } from "react";
import { getImage, type ImageKey } from "@/lib/images";
import { Avatar } from "./Avatar";

/** Cover photo, avatar and name. Used on the profile overview and the public page. */
export function ProfileHeader({ cover, avatar, name, username, children }: { cover: string; avatar: string; name: string; username?: string; children?: ReactNode }) {
  const image = getImage(cover as ImageKey);
  return (
    <header className="card overflow-hidden">
      <div className="relative aspect-[3/1] min-h-28 bg-surface-2">
        {image && (
          <Image
            src={image.src}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 60rem, 100vw"
            className="object-cover"
            placeholder={image.blur ? "blur" : "empty"}
            blurDataURL={image.blur}
          />
        )}
      </div>
      <div className="flex flex-wrap items-end gap-4 px-5 pb-5">
        <Avatar id={avatar} size={96} className="relative z-10 -mt-12 border-4 border-[var(--surface)] bg-surface shadow-md" />
        <div className="min-w-0 flex-1 pt-3">
          <p className="text-2xl font-semibold break-words text-ink">{name || "Traveller"}</p>
          {username && <p className="text-ink-2">@{username}</p>}
        </div>
        {children}
      </div>
      {image && (
        <p className="px-5 pb-3 text-xs text-muted">
          Cover: {image.alt}. Photo {image.author}, {image.license}.
        </p>
      )}
    </header>
  );
}
