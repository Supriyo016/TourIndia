import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Pages are statically generated, so a per-request nonce is not available.
 * 'unsafe-inline' for scripts is the documented trade-off; see docs/SECURITY_AUDIT.md.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  // wasm-unsafe-eval lets the opt-in on-device model compile WebAssembly; it does not allow eval().
  // Google Maps hosts are the ones Google lists for the Maps JavaScript API.
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://maps.googleapis.com https://*.googleapis.com https://*.gstatic.com https://*.google.com https://*.ggpht.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://maps.googleapis.com https://*.googleapis.com https://*.gstatic.com https://*.google.com https://*.ggpht.com https://*.googleusercontent.com",
  "font-src 'self' https://fonts.gstatic.com",
  "worker-src 'self' blob:",
  // The on-device model downloads its weights from Hugging Face and its runtime from GitHub.
  `connect-src 'self' https://maps.googleapis.com https://*.googleapis.com https://*.gstatic.com https://*.google.com https://huggingface.co https://*.huggingface.co https://*.hf.co https://raw.githubusercontent.com${isDev ? " ws:" : ""}`,
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
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 828, 1080, 1280, 1600, 1920],
    minimumCacheTTL: 2678400,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // Addresses used by the original static site.
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/AboutUs.html", destination: "/about", permanent: true },
      { source: "/ContactUs.html", destination: "/contact", permanent: true },
    ];
  },
};

export default nextConfig;
