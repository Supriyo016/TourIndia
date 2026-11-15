import { categories, regions } from "@/data/taxonomy";

export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavItem extends NavLink {
  /** Shorter label for the desktop bar, where space is tight. */
  short?: string;
  groups?: { title: string; links: NavLink[] }[];
}

export const navigation: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Explore India",
    short: "Explore",
    href: "/explore",
    groups: [
      {
        title: "By region",
        links: regions.map((region) => ({
          label: region.name,
          href: `/explore?region=${region.id}`,
          description: region.blurb,
        })),
      },
    ],
  },
  {
    label: "Discover",
    href: "/discover",
    groups: [
      {
        title: "Travel styles",
        links: categories.map((category) => ({ label: category.name, href: `/discover/${category.id}` })),
      },
    ],
  },
  {
    label: "Plan Your Trip",
    short: "Plan",
    href: "/planner",
    groups: [
      {
        title: "Plan",
        links: [
          { label: "Trip planner", href: "/planner", description: "A day-by-day itinerary you can edit and export." },
          { label: "Compare destinations", href: "/compare", description: "Season, budget and duration side by side." },
          { label: "Travel quiz", href: "/quiz", description: "Five questions to narrow down where to go." },
          { label: "Calendar and notes", href: "/calendar", description: "Holidays by month, with your plan notes." },
          { label: "Saved and passport", href: "/saved", description: "Your wishlist, trips and state stamps." },
        ],
      },
    ],
  },
  { label: "Bookings", href: "/bookings" },
  {
    label: "Culture & Festivals",
    short: "Culture",
    href: "/culture",
    groups: [
      {
        title: "Culture",
        links: [
          { label: "Festival calendar", href: "/culture/festivals", description: "Filter by month and state." },
          { label: "Food explorer", href: "/culture/food", description: "Regional dishes and recipes." },
          { label: "Heritage explorer", href: "/culture/heritage", description: "World Heritage Sites, museums and forts." },
          { label: "Art and traditions", href: "/culture/arts", description: "Dance, music, craft, dress and language." },
        ],
      },
    ],
  },
  { label: "Services", href: "/services" },
  { label: "Gallery", href: "/gallery" },
  { label: "Travel Stories", short: "Stories", href: "/stories" },
  { label: "About Us", href: "/about" },
];

export const footerLinks: { title: string; links: NavLink[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Map of India", href: "/explore" },
      { label: "All destinations", href: "/discover" },
      { label: "Festival calendar", href: "/culture/festivals" },
      { label: "Food explorer", href: "/culture/food" },
      { label: "Heritage explorer", href: "/culture/heritage" },
      { label: "Gallery", href: "/gallery" },
    ],
  },
  {
    title: "Plan",
    links: [
      { label: "Trip planner", href: "/planner" },
      { label: "Calendar and notes", href: "/calendar" },
      { label: "Compare destinations", href: "/compare" },
      { label: "Travel quiz", href: "/quiz" },
      { label: "Saved and passport", href: "/saved" },
      { label: "Booking links", href: "/bookings" },
      { label: "Travel services", href: "/services" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Travel stories", href: "/stories" },
      { label: "Content policy", href: "/content-policy" },
      { label: "Photo credits", href: "/credits" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookies and storage", href: "/cookies" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
  },
];
