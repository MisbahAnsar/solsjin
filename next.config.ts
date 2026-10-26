import { createHmac } from "node:crypto";
import type { NextConfig } from "next";
import { COMING_SOON_PATH, PREVIEW_COOKIE, isComingSoon } from "./lib/gate";

const dev = process.env.NODE_ENV !== "production";

/**
 * Coming-soon gate as build-time rewrites, served straight from Vercel's CDN: no proxy/function
 * invocation per page view. Visitors with the preview cookie (see proxy.ts) skip the rewrites.
 * Changing COMING_SOON or PREVIEW_SECRET needs a redeploy (it already did).
 */
const gated = isComingSoon();
const previewSecret = process.env.PREVIEW_SECRET ?? "";
const previewToken = previewSecret.length >= 12 ? createHmac("sha256", previewSecret).update("solsjin-preview").digest("hex") : null;
const notPreview = previewToken ? [{ type: "cookie" as const, key: PREVIEW_COOKIE, value: previewToken }] : undefined;
const STATIC_EXT = "ico|svg|png|jpe?g|gif|webp|avif|woff2?|ttf|otf|webmanifest|txt|xml";

const csp = [
  "default-src 'self'",
  // Next's inline bootstrap + the theme script need 'unsafe-inline' unless every page is rendered
  // per request with a nonce, which would cost a function invocation per view.
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https://*.solana.com wss://*.solana.com https://api.jup.ag https://*.jup.ag${dev ? " ws: http://localhost:*" : ""}`,
  "media-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // No Vercel Image Optimization (Hobby quota): the only next/image is a tiny local avatar.
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/:file((?!.*/).*\\.(?:jpg|png|svg|ico))", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "no-store" }] },
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  async redirects() {
    return gated ? [] : [{ source: COMING_SOON_PATH, destination: "/", permanent: false }];
  },
  async rewrites() {
    if (!gated) return [];
    return {
      beforeFiles: [
        // Other APIs don't exist while gated (static 404, no function).
        { source: "/api/:path((?!waitlist|admin/).*)", destination: "/gated-404", missing: notPreview },
        // Every page shows the coming-soon page (prerendered, URL unchanged).
        {
          source: `/((?!api/|gated-404|coming-soon|admin/launch|_next/|_vercel/|.*\\.(?:${STATIC_EXT})$).*)`,
          destination: COMING_SOON_PATH,
          missing: notPreview,
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
