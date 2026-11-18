import type { MetadataRoute } from "next";
import { AI_BOT_NAMES, HONEYPOT_PATHS } from "@/lib/ai-bots";

export default function robots(): MetadataRoute.Robots {
  const disallowAll = ["/", ...HONEYPOT_PATHS, "/tarpit", "/incele/", "/demos/"];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...HONEYPOT_PATHS, "/tarpit", "/api/"],
      },
      ...AI_BOT_NAMES.map((userAgent) => ({
        userAgent,
        disallow: disallowAll,
      })),
    ],
    sitemap: "https://www.izdemo.com/sitemap.xml",
    host: "https://www.izdemo.com",
  };
}
