import type { MetadataRoute } from "next";
import { isComingSoon } from "@/lib/gate";
import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  // While gated only the landing page exists; keep crawlers (and their traffic) off everything else.
  if (isComingSoon()) return { rules: { userAgent: "*", allow: ["/$", "/coming-soon/opengraph-image", "/_next/static/", "/fonts/"], disallow: "/" }, host: SITE_URL };
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }, host: SITE_URL };
}
