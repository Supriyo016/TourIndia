/**
 * Finds the readable text blocks inside a page region and swaps their text nodes
 * in place. Only Text nodes' values change, so links, buttons and markup stay as
 * they are and nothing is ever parsed as HTML.
 */
export const BLOCK_SELECTOR = "h1,h2,h3,h4,h5,h6,p,li,dt,dd,figcaption,blockquote,td,th,caption,summary";
export const SKIP_SELECTOR = [
  "nav",
  "form",
  "button",
  "select",
  "textarea",
  "input",
  "script",
  "style",
  "noscript",
  "code",
  "pre",
  "kbd",
  "svg",
  "[aria-hidden='true']",
  "[translate='no']",
  ".notranslate",
  "[contenteditable]",
  "[role='dialog']",
  "[aria-live]",
  "[data-translate-skip]",
  // Visitors' comments update live, so they are left as written.
  "[aria-labelledby='community-title']",
].join(",");

/** Longest piece sent in one item; the API allows 1500. */
export const MAX_PART_CHARS = 1400;
const HAS_LETTER = /\p{L}/u;
const MARKER = /⟦(\d+)⟧/g;

export interface Unit {
  element: HTMLElement;
  nodes: Text[];
  /** What is sent to the translator; long single-node text is split into several parts. */
  parts: string[];
}

const collapse = (text: string) => text.replace(/\s+/g, " ").trim();

/** Joins a block's text nodes, marking where each one starts so the translation can be split back. */
export function encodeSegments(values: string[]): string {
  if (values.length === 1) return collapse(values[0]!);
  return collapse(values.map((value, index) => `⟦${index}⟧${value}`).join(""));
}

/** Splits a translation back into one string per text node, or null if the markers didn't survive. */
export function decodeSegments(translation: string, count: number): string[] | null {
  if (count === 1) return [collapse(translation.replace(MARKER, " "))];
  const found = [...translation.matchAll(MARKER)];
  if (found.length !== count || found.some((match, index) => Number(match[1]) !== index)) return null;
  const segments = found.map((match, index) => collapse(translation.slice(match.index! + match[0].length, found[index + 1]?.index ?? translation.length)));
  return segments.some(Boolean) ? segments : null;
}

/** Splits long text at sentence ends so each part fits one request item. */
export function splitLong(text: string, max = MAX_PART_CHARS): string[] {
  if (text.length <= max) return [text];
  const sentences = text.match(/[^.!?।]+[.!?।]+["')\]]*\s*|[^.!?।]+$/g) ?? [text];
  const parts: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (current && current.length + sentence.length > max) {
      parts.push(current.trim());
      current = "";
    }
    if (sentence.length > max) {
      for (let index = 0; index < sentence.length; index += max) parts.push(sentence.slice(index, index + max).trim());
    } else current += sentence;
  }
  if (current.trim()) parts.push(current.trim());
  return parts.filter(Boolean);
}

/** The text nodes that belong to this block itself, not to a nested block or a skipped element. */
function ownTextNodes(block: HTMLElement): Text[] {
  const nodes: Text[] = [];
  const walker = block.ownerDocument.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    if (!parent || parent.closest(BLOCK_SELECTOR) !== block || parent.closest(SKIP_SELECTOR)) continue;
    if (HAS_LETTER.test(node.nodeValue ?? "")) nodes.push(node as Text);
  }
  return nodes;
}

export function collectUnits(root: Element): Unit[] {
  const units: Unit[] = [];
  for (const element of root.querySelectorAll<HTMLElement>(BLOCK_SELECTOR)) {
    if (element.closest(SKIP_SELECTOR)) continue;
    const nodes = ownTextNodes(element);
    if (!nodes.length) continue;
    const source = encodeSegments(nodes.map((node) => node.nodeValue ?? ""));
    if (nodes.length > 1 && source.length > MAX_PART_CHARS) continue;
    units.push({ element, nodes, parts: nodes.length === 1 ? splitLong(source) : [source] });
  }
  return units;
}

/** The text a unit shows right now, for reading aloud. */
export const unitText = (unit: Unit) => collapse(unit.nodes.map((node) => node.nodeValue ?? "").join(""));

/** Remembers original text and attributes so "Show original" can put everything back. */
export class PageText {
  private originals = new Map<Text, string>();
  private applied = new Map<Text, string>();
  private attributes = new Map<HTMLElement, { lang: string | null; dir: string | null }>();

  /** Applies a translation to one unit. Returns false if it couldn't be matched to the text nodes. */
  apply(unit: Unit, translation: string, lang: string, rtl: boolean): boolean {
    const segments = decodeSegments(translation, unit.nodes.length);
    if (!segments) return false;
    unit.nodes.forEach((node, index) => {
      const original = this.originals.get(node) ?? node.nodeValue ?? "";
      this.originals.set(node, original);
      const lead = /^\s*/.exec(original)![0] ? " " : "";
      const trail = /\s*$/.exec(original)![0] ? " " : "";
      const value = `${lead}${segments[index]}${trail}`;
      node.nodeValue = value;
      this.applied.set(node, value);
    });
    if (!this.attributes.has(unit.element)) this.attributes.set(unit.element, { lang: unit.element.getAttribute("lang"), dir: unit.element.getAttribute("dir") });
    unit.element.setAttribute("lang", lang);
    unit.element.setAttribute("dir", rtl ? "rtl" : "ltr");
    return true;
  }

  restore() {
    for (const [node, original] of this.originals) {
      // If the page itself has since changed this text, leave the page's version.
      if (node.nodeValue === this.applied.get(node)) node.nodeValue = original;
    }
    for (const [element, { lang, dir }] of this.attributes) {
      if (lang === null) element.removeAttribute("lang");
      else element.setAttribute("lang", lang);
      if (dir === null) element.removeAttribute("dir");
      else element.setAttribute("dir", dir);
    }
    this.originals.clear();
    this.applied.clear();
    this.attributes.clear();
  }
}

/** Groups texts into requests the API accepts. */
export function batchTexts(texts: string[], maxItems = 30, maxChars = 6000): string[][] {
  const batches: string[][] = [];
  let current: string[] = [];
  let size = 0;
  for (const text of texts) {
    if (current.length && (current.length >= maxItems || size + text.length > maxChars)) {
      batches.push(current);
      current = [];
      size = 0;
    }
    current.push(text);
    size += text.length;
  }
  if (current.length) batches.push(current);
  return batches;
}
