/**
 * Permanent redirects, read by next.config.ts and listed in the admin SEO centre.
 * Addresses used by the original static site.
 */
export const redirects: { source: string; destination: string; permanent: boolean }[] = [
  { source: "/index.html", destination: "/", permanent: true },
  { source: "/AboutUs.html", destination: "/about", permanent: true },
  { source: "/ContactUs.html", destination: "/contact", permanent: true },
];
