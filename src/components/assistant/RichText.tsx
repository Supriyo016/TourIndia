import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { safePath } from "@/lib/safe-path";

const INLINE = /\[([^\]]+)\]\((\/[^/\s)][^\s)]*|\/)\)|\*\*([^*]+)\*\*/g;

function renderInline(text: string, onNavigate?: () => void): ReactNode[] {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE)) {
    const index = match.index;
    if (index > last) parts.push(text.slice(last, index));
    if (match[1] && match[2]) {
      parts.push(
        <Link prefetch={false} key={index} href={safePath(match[2])} onClick={onNavigate} className="link-text">
          {match[1]}
        </Link>,
      );
    } else {
      parts.push(<strong key={index}>{match[3]}</strong>);
    }
    last = index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/**
 * Renders replies as React text. Only same-site links and bold are recognised,
 * so nothing in a reply can become markup or a link to another website.
 */
export function RichText({ text, onNavigate }: { text: string; onNavigate?: () => void }) {
  const blocks = text.split(/\n{1,}/).filter((line) => line.trim());
  return (
    <div className="space-y-1.5">
      {blocks.map((line, index) => {
        const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
        return (
          <Fragment key={index}>
            {bullet ? <p className="pl-3 -indent-3">• {renderInline(bullet[1]!, onNavigate)}</p> : <p>{renderInline(line, onNavigate)}</p>}
          </Fragment>
        );
      })}
    </div>
  );
}
