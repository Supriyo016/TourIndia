import type { NextConfig } from "next";
import { redirects } from "./src/config/redirects";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Pages are statically generated, so a per-request nonce is not available.
 * 'unsafe-inline' for scripts is the documented trade-off; see docs/SECURITY_AUDIT.md.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  // Only the two Google Maps script hosts: wider Google wildcards include JSONP endpoints and public buckets.
  `script-src 'self' 'unsafe-inline' https://maps.googleapis.com https://maps.gstatic.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://*.google.com https://*.ggpht.com https://*.googleusercontent.com",
  "font-src 'self' https://fonts.gstatic.com",
  "worker-src 'self' blob:",
  `connect-src 'self' https://maps.googleapis.com https://places.googleapis.com${isDev ? " ws:" : ""}`,
  "media-src 'self'",
  "object-src 'none'",
  // Google's keyless map embeds, used when no Maps API key is set.
  "frame-src https://maps.google.com https://www.google.com",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  ...(isDev
    ? []
    : [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    // Puts the stylesheet inside each page, so the first paint doesn't wait for a separate CSS request.
    inlineCss: false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 828, 1080, 1280, 1600, 1920],
    minimumCacheTTL: 2678400,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // Kept in src/config/redirects.ts so the admin SEO centre lists the same ones.
    return redirects;
  },
};

export default nextConfig;
