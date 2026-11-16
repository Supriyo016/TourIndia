/**
 * The single source of truth for brand, ownership and contact details.
 * Components read from here; nothing else should hard-code these values.
 */

export type SocialId = "github" | "x" | "instagram" | "facebook" | "youtube" | "linkedin";

export interface SocialLink {
  id: SocialId;
  label: string;
  /** null until the owner confirms the account. A null entry is never rendered. */
  url: string | null;
  verifiedFrom: string;
}

export const site = {
  name: "Tour India",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  description:
    "An independent guide to India's states, destinations, festivals and food, with a trip planner that shows its working.",
  locale: "en_IN",

  owner: {
    name: "Supriyo Sarkar",
    designation: "Founder & Website Owner",
    githubUrl: "https://github.com/Supriyo016",
  },

  repositoryUrl: "https://github.com/Supriyo016/TourIndia",
  originalSiteUrl: "https://supriyo016.github.io/TourIndia/",

  /**
   * Published contact channels. These are deliberately empty: the addresses on
   * the original site were placeholders. Add a value only once the owner has
   * confirmed it; the Contact page and footer pick it up automatically.
   */
  contact: {
    email: null as string | null,
    phone: null as string | null,
    postalAddress: null as string | null,
  },

  social: [
    {
      id: "github",
      label: "GitHub",
      url: "https://github.com/Supriyo016",
      verifiedFrom: "Supplied by the owner",
    },
    {
      id: "x",
      label: "X (Twitter)",
      url: "https://x.com/Supriyo016",
      verifiedFrom: "Listed on the owner's public GitHub profile",
    },
    {
      id: "instagram",
      label: "Instagram",
      url: "https://www.instagram.com/supriyo016/",
      verifiedFrom: "Listed on the owner's public GitHub profile",
    },
    {
      id: "facebook",
      label: "Facebook",
      url: "https://www.facebook.com/profile.php?id=100070487584093",
      verifiedFrom: "Listed on the owner's public GitHub profile",
    },
    {
      id: "youtube",
      label: "YouTube",
      url: "https://www.youtube.com/@supriyo016",
      verifiedFrom: "Listed on the owner's public GitHub profile",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      url: null,
      verifiedFrom: "REQUIRES OWNER CONFIRMATION: not listed on the public GitHub profile",
    },
  ] satisfies SocialLink[] as SocialLink[],

  /**
   * Dated events, taken from the repository's public commit history.
   * Add milestones here only when there is evidence for them.
   */
  milestones: [
    {
      date: "2022-05-27",
      title: "First version committed",
      detail:
        "The GitHub repository is created and the first static version of Tour India, tagged 1.0.0.0 in its commit message, is committed.",
    },
    {
      date: "2022-05-28",
      title: "Early fixes",
      detail: "The home page is renamed and a first round of layout and HTML fixes lands.",
    },
    {
      date: "2022-06-10",
      title: "Branding added",
      detail: "The Tour India logo image is added to the project.",
    },
    {
      date: "2023-07-05",
      title: "Public address documented",
      detail: "The repository's readme records the site's GitHub Pages address.",
    },
    {
      date: "2026-11-08",
      title: "Rebuild begins",
      detail:
        "Work starts on the current platform: state and destination guides, the map, the trip planner and the culture sections.",
    },
  ],
} as const;

export const publishedSocials = site.social.filter(
  (link): link is SocialLink & { url: string } => link.url !== null,
);
