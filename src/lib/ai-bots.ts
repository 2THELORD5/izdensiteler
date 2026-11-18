/** Known AI / training crawler user-agents (politeness filter + robots sync). */
export const AI_BOT_UA =
  /GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|anthropic-ai|Applebot-Extended|Bytespider|CCBot|Diffbot|FacebookBot|Google-Extended|GoogleOther|ImagesiftBot|meta-externalagent|Meta-ExternalAgent|omgili|Omit|PerplexityBot|YouBot|cohere-ai|DataForSeoBot|Amazonbot|PetalBot|Timpibot|Webzio-Extended|AI2Bot|FriendlyCrawler|img2dataset|Scrapy|python-requests|curl\/|wget\//i;

export const AI_BOT_NAMES = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "anthropic-ai",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
  "Diffbot",
  "FacebookBot",
  "Google-Extended",
  "ImagesiftBot",
  "meta-externalagent",
  "PerplexityBot",
  "Amazonbot",
  "cohere-ai",
  "YouBot",
  "PetalBot",
  "Timpibot",
  "AI2Bot",
] as const;

/** Paths disallowed in robots.txt — bait for scrapers that ignore robots. */
export const HONEYPOT_PATHS = [
  "/api/internal/config-export",
  "/api/trap",
  "/_trap/archive",
  "/.well-known/training-opt-out",
] as const;
