/** The Yatri terminal's command language. Pure logic; the panel performs any effect. */
export interface TerminalData {
  destinations: { slug: string; name: string; state: string; months: number[]; season: string; days: string; tagline: string }[];
  festivals: { slug: string; name: string; months: number[]; when: string }[];
  holidays: { date: string; name: string }[];
}

export interface TerminalLine {
  text: string;
  href?: string;
  tone?: "muted" | "error" | "accent";
}

export type TerminalEffect =
  | { type: "clear" }
  | { type: "exit" }
  | { type: "open"; href: string }
  | { type: "ask"; question: string }
  | { type: "weather"; slug: string; name: string }
  | { type: "theme"; value: "light" | "dark" | "system" }
  | { type: "note"; text: string }
  | { type: "notes" }
  | { type: "history" };

export interface TerminalResult {
  lines: TerminalLine[];
  effect?: TerminalEffect;
}

const PAGES: Record<string, string> = {
  home: "/",
  map: "/explore",
  explore: "/explore",
  discover: "/discover",
  planner: "/planner",
  plan: "/planner",
  calendar: "/calendar",
  notes: "/calendar#notes",
  festivals: "/culture/festivals",
  food: "/culture/food",
  heritage: "/culture/heritage",
  arts: "/culture/arts",
  gallery: "/gallery",
  bookings: "/bookings",
  services: "/services",
  safety: "/services#safety",
  stories: "/stories",
  saved: "/saved",
  about: "/about",
  contact: "/contact",
};

const COMMANDS: [string, string][] = [
  ["help", "show this list"],
  ["ask <question>", "ask Yatri anything about travel in India"],
  ["find <text>", "search destination guides"],
  ["guide <place>", "show a quick summary of a destination"],
  ["open <place|page>", "go to a guide or a page, such as: open map"],
  ["season <month>", "where to go in a month, such as: season july"],
  ["festivals [month]", "list festivals, optionally for one month"],
  ["holidays [month]", "list upcoming holidays"],
  ["weather <place>", "show the five-day forecast"],
  ["plan <places> [days]", "open the planner, such as: plan jaipur agra 6"],
  ["compare <a> <b>", "compare two destinations"],
  ["surprise", "open a random guide"],
  ["date", "show the date and time in India"],
  ["note <text>", "save a plan note"],
  ["notes", "list your notes"],
  ["theme <light|dark|system>", "change the theme"],
  ["history", "show commands you've run"],
  ["clear", "clear the screen"],
  ["exit", "close Yatri"],
];

export const COMMAND_NAMES = COMMANDS.map(([usage]) => usage.split(" ")[0]!);

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

function parseMonth(word: string | undefined): number | undefined {
  if (!word || word.length < 3) return undefined;
  const index = MONTHS.findIndex((name) => name.startsWith(word.toLowerCase()));
  return index >= 0 ? index + 1 : undefined;
}

const clean = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function findPlace(data: TerminalData, text: string) {
  const needle = clean(text);
  if (!needle) return undefined;
  return (
    data.destinations.find((item) => item.slug === text.toLowerCase() || clean(item.name) === needle) ??
    data.destinations.find((item) => clean(item.name).startsWith(needle) || item.slug.startsWith(needle.replace(/ /g, "-")))
  );
}

const error = (text: string): TerminalResult => ({ lines: [{ text, tone: "error" }] });
const usage = (text: string): TerminalResult => ({ lines: [{ text: `usage: ${text}`, tone: "muted" }] });
const guideLine = (item: TerminalData["destinations"][number]): TerminalLine => ({ text: `${item.name}, ${item.state}`, href: `/destinations/${item.slug}` });

export function runCommand(input: string, data: TerminalData, today: string, random: () => number = Math.random): TerminalResult {
  const line = input.trim();
  if (!line) return { lines: [] };
  const [rawCommand = "", ...args] = line.split(/\s+/);
  const command = rawCommand.toLowerCase();
  const rest = args.join(" ");

  switch (command) {
    case "help":
      return { lines: COMMANDS.map(([name, description]) => ({ text: `${name}  ${description}` })) };
    case "clear":
      return { lines: [], effect: { type: "clear" } };
    case "exit":
    case "quit":
      return { lines: [], effect: { type: "exit" } };
    case "history":
      return { lines: [], effect: { type: "history" } };
    case "notes":
      return { lines: [], effect: { type: "notes" } };
    case "date":
      return { lines: [{ text: new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "medium" }).format(new Date()) + " IST" }] };
    case "ask":
      return rest ? { lines: [], effect: { type: "ask", question: rest } } : usage("ask <question>");
    case "note":
      return rest ? { lines: [{ text: "Note saved. Type notes to list them.", tone: "accent" }], effect: { type: "note", text: rest } } : usage("note <text>");
    case "find": {
      if (!rest) return usage("find <text>");
      const needle = clean(rest);
      const found = data.destinations.filter((item) => clean(`${item.name} ${item.state} ${item.tagline}`).includes(needle)).slice(0, 10);
      return found.length ? { lines: found.map(guideLine) } : error(`Nothing matches "${rest}".`);
    }
    case "guide": {
      if (!rest) return usage("guide <place>");
      const place = findPlace(data, rest);
      if (!place) return error(`No guide for "${rest}". Try: find ${rest}`);
      return {
        lines: [
          { text: `${place.name}, ${place.state}`, tone: "accent" },
          { text: place.tagline },
          { text: `Best months: ${place.season}` },
          { text: `Typical stay: ${place.days} days` },
          { text: "Read the full guide", href: `/destinations/${place.slug}` },
        ],
      };
    }
    case "open":
    case "cd":
    case "go": {
      if (!rest) return usage("open <place|page>");
      const page = PAGES[rest.toLowerCase()];
      if (page) return { lines: [{ text: `Opening ${rest}...`, tone: "muted" }], effect: { type: "open", href: page } };
      const place = findPlace(data, rest);
      if (place) return { lines: [{ text: `Opening ${place.name}...`, tone: "muted" }], effect: { type: "open", href: `/destinations/${place.slug}` } };
      return error(`Can't find "${rest}". Pages: ${Object.keys(PAGES).join(", ")}`);
    }
    case "season": {
      const month = parseMonth(args[0]);
      if (!month) return usage("season <month>");
      const found = data.destinations.filter((item) => item.months.includes(month)).slice(0, 12);
      return { lines: [{ text: `Good in ${MONTHS[month - 1]}:`, tone: "accent" }, ...found.map(guideLine)] };
    }
    case "festivals": {
      const month = parseMonth(args[0]);
      if (args[0] && !month) return usage("festivals [month]");
      const found = data.festivals.filter((item) => !month || item.months.includes(month));
      return found.length
        ? { lines: found.map((item) => ({ text: `${item.name}: ${item.when}`, href: `/culture/festivals/${item.slug}` })) }
        : error("No festivals listed for that month.");
    }
    case "holidays": {
      const month = parseMonth(args[0]);
      if (args[0] && !month) return usage("holidays [month]");
      const found = data.holidays.filter((item) => item.date >= today && (!month || Number(item.date.slice(5, 7)) === month)).slice(0, 12);
      return found.length ? { lines: found.map((item) => ({ text: `${item.date}  ${item.name}` })) } : error("No upcoming holidays listed for that month.");
    }
    case "weather": {
      if (!rest) return usage("weather <place>");
      const place = findPlace(data, rest);
      return place ? { lines: [{ text: `Fetching the forecast for ${place.name}...`, tone: "muted" }], effect: { type: "weather", slug: place.slug, name: place.name } } : error(`No guide for "${rest}".`);
    }
    case "plan": {
      const numbers = args.filter((word) => /^\d+$/.test(word));
      const places = args.filter((word) => !/^\d+$/.test(word)).map((word) => findPlace(data, word));
      if (places.length === 0 || places.some((place) => !place)) return usage("plan <places> [days]  (one word per place, such as: plan jaipur agra 6)");
      const days = numbers[0] ? `&days=${Math.min(Math.max(Number(numbers[0]), 1), 45)}` : "";
      return { lines: [{ text: "Opening the planner...", tone: "muted" }], effect: { type: "open", href: `/planner?d=${places.map((place) => place!.slug).join(",")}${days}` } };
    }
    case "compare": {
      const a = findPlace(data, args[0] ?? "");
      const b = findPlace(data, args[1] ?? "");
      if (!a || !b) return usage("compare <a> <b>");
      return { lines: [{ text: `Comparing ${a.name} and ${b.name}...`, tone: "muted" }], effect: { type: "open", href: `/compare?a=${a.slug}&b=${b.slug}` } };
    }
    case "surprise": {
      const pick = data.destinations[Math.floor(random() * data.destinations.length)];
      return pick ? { lines: [{ text: `How about ${pick.name}?`, tone: "accent" }], effect: { type: "open", href: `/destinations/${pick.slug}` } } : error("No guides loaded.");
    }
    case "theme": {
      const value = args[0]?.toLowerCase();
      if (value === "light" || value === "dark" || value === "system") return { lines: [{ text: `Theme set to ${value}.`, tone: "accent" }], effect: { type: "theme", value } };
      return usage("theme <light|dark|system>");
    }
    default:
      return error(`Unknown command: ${command}. Type help, or ask Yatri with: ask ${line}`);
  }
}

/** Completes the command name, or a place name after a command that takes one. */
export function completeCommand(input: string, data: TerminalData): string {
  const parts = input.split(/\s+/);
  if (parts.length === 1) {
    const matches = COMMAND_NAMES.filter((name) => name.startsWith(parts[0]!.toLowerCase()));
    return matches.length === 1 ? `${matches[0]} ` : input;
  }
  const last = parts[parts.length - 1]!.toLowerCase();
  if (!last) return input;
  const places = data.destinations.filter((item) => item.slug.startsWith(last));
  const pages = parts[0] === "open" ? Object.keys(PAGES).filter((name) => name.startsWith(last)) : [];
  const matches = [...places.map((item) => item.slug), ...pages];
  if (matches.length !== 1) return input;
  return [...parts.slice(0, -1), matches[0]].join(" ");
}
