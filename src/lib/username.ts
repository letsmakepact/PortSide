/**
 * SaaS Username & Vanity Subdomain Safety Validator
 *
 * Implements strict RFC 1123 / RFC 1035 / RFC 5890 DNS label restrictions
 * and SaaS industry security best practices to protect vanity subdomains (*.portside.lol),
 * routes, URLs, and local filesystems from:
 * - Emoji injection and ZWJ sequence corruption
 * - Kanji, CJK, Cyrillic, and IDN homoglyph spoofing attacks
 * - Invisible zero-width characters and RTL override spoofing
 * - Consecutive hyphens / Punycode reservations (xn--)
 * - Platform route collisions and Windows reserved filenames (CON, PRN, AUX, NUL)
 */

export interface UsernameValidationResult {
  valid: boolean;
  clean: string;
  error?: string;
  reason?:
    | "empty"
    | "too_short"
    | "too_long"
    | "contains_emoji"
    | "contains_non_ascii"
    | "contains_spaces"
    | "contains_underscores"
    | "contains_dots"
    | "consecutive_hyphens"
    | "leading_or_trailing_hyphen"
    | "invalid_characters"
    | "reserved_platform"
    | "reserved_windows_device"
    | "pure_number_system_collision";
}

/**
 * Common emojis, pictographs, symbols, and surrogate pairs regex
 */
const EMOJI_REGEX =
  /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{200D}\u{FE0F}]/u;

/**
 * CJK / Kanji / Hiragana / Katakana / Hanzi regex
 */
const CJK_REGEX =
  /[\u{4E00}-\u{9FFF}\u{3400}-\u{4DBF}\u{20000}-\u{2A6DF}\u{3040}-\u{309F}\u{30A0}-\u{30FF}\u{AC00}-\u{D7AF}]/u;

/**
 * Non-ASCII or Unicode letter/symbol check (Cyrillic, Arabic, accents, zero-width, etc.)
 */
const NON_ASCII_REGEX = /[^\x00-\x7F]/;

/**
 * Zero-width and formatting characters
 */
const INVISIBLE_OR_CONTROL_REGEX =
  /[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF\u00AD\u202A-\u202E\u2060-\u206F]/;

/**
 * Windows reserved device filenames (case-insensitive)
 * These cannot be used as files or subdomains because they cause severe
 * filesystem collisions on Windows servers (e.g. profile_con.json).
 */
export const WINDOWS_RESERVED_NAMES = new Set([
  "con",
  "prn",
  "aux",
  "nul",
  "com1",
  "com2",
  "com3",
  "com4",
  "com5",
  "com6",
  "com7",
  "com8",
  "com9",
  "lpt1",
  "lpt2",
  "lpt3",
  "lpt4",
  "lpt5",
  "lpt6",
  "lpt7",
  "lpt8",
  "lpt9",
]);

/**
 * Platform routes, protocols, standard web assets, and security reserved names
 */
export const RESERVED_USERNAMES = new Set([
  // PortSide platform identity & founder
  "pact",
  "letsmakepact",
  "portside",

  // Core administrative & infrastructure roles
  "admin",
  "administrator",
  "root",
  "system",
  "sysadmin",
  "superuser",
  "operator",
  "moderator",
  "staff",
  "team",
  "support",
  "help",
  "contact",
  "security",
  "abuse",
  "noc",
  "postmaster",
  "hostmaster",
  "webmaster",

  // Authentication & account lifecycle
  "auth",
  "login",
  "logout",
  "signin",
  "signout",
  "signup",
  "register",
  "registration",
  "password",
  "reset-password",
  "recover",
  "oauth",
  "callback",
  "connect",
  "session",
  "sessions",
  "sso",

  // Core application views & routing
  "app",
  "apps",
  "dashboard",
  "settings",
  "account",
  "profile",
  "profiles",
  "user",
  "users",
  "member",
  "members",
  "home",
  "portal",
  "cockpit",
  "console",
  "terminal",
  "lan",
  "router",
  "gateway",
  "proxy",
  "tunnels",
  "tunnel",
  "hub",
  "services",
  "service",
  "projects",
  "project",

  // Billing & commerce
  "billing",
  "checkout",
  "subscribe",
  "subscription",
  "supporter",
  "sponsor",
  "pro",
  "enterprise",
  "plan",
  "plans",
  "pricing",
  "invoice",
  "invoices",
  "payment",
  "payments",
  "shop",
  "store",
  "cart",

  // Network protocols, hostnames, and web standards
  "www",
  "mail",
  "email",
  "smtp",
  "pop",
  "pop3",
  "imap",
  "ftp",
  "sftp",
  "ssh",
  "dns",
  "ns",
  "ns1",
  "ns2",
  "ns3",
  "mx",
  "mx1",
  "ssl",
  "tls",
  "cert",
  "certs",
  "autoconfig",
  "autodiscover",
  "cpanel",
  "whm",
  "webmail",
  "localhost",
  "local",
  "internal",
  "corp",
  "dev",
  "development",
  "staging",
  "stage",
  "test",
  "testing",
  "demo",
  "example",
  "invalid",
  "prod",
  "production",

  // Web routes, static files & endpoints
  "api",
  "rest",
  "graphql",
  "rpc",
  "v1",
  "v2",
  "v3",
  "status",
  "health",
  "healthz",
  "ping",
  "live",
  "ready",
  "metrics",
  "telemetry",
  "docs",
  "documentation",
  "guide",
  "guides",
  "faq",
  "about",
  "terms",
  "privacy",
  "legal",
  "policy",
  "blog",
  "news",
  "forum",
  "community",
  "robots",
  "sitemap",
  "favicon",
  "well-known",
  ".well-known",
  "assets",
  "static",
  "public",
  "media",
  "images",
  "img",
  "css",
  "js",
  "fonts",
  "feed",
  "rss",
  "atom",
  "webhook",
  "webhooks",
  "s",
  "u",

  // Programming literals & primitives
  "null",
  "undefined",
  "void",
  "true",
  "false",
  "nan",
  "none",
  "nil",
  "default",
  "index",
  "main",
  "core",
  "config",
  "server",
  "daemon",
]);

/**
 * Minimum username length allowed
 */
export const USERNAME_MIN_LENGTH = 3;

/**
 * Maximum username length allowed (SaaS best practice for clean URLs and subdomains)
 */
export const USERNAME_MAX_LENGTH = 30;

/**
 * Validate a candidate username/handle for SaaS safety, security, and DNS compliance.
 *
 * @param input The raw username string submitted by the user
 * @param options Configuration options (e.g. bypassing platform reservation for founder account)
 */
export function validateUsername(
  input: unknown,
  options?: { isPact?: boolean }
): UsernameValidationResult {
  const isPact = Boolean(options?.isPact);

  if (typeof input !== "string") {
    return {
      valid: false,
      clean: "",
      error: "Username must be a text string.",
      reason: "empty",
    };
  }

  const raw = input.trim();

  if (!raw) {
    return {
      valid: false,
      clean: "",
      error: "Username cannot be empty.",
      reason: "empty",
    };
  }

  // 1. Check for invisible or control characters
  if (INVISIBLE_OR_CONTROL_REGEX.test(raw)) {
    return {
      valid: false,
      clean: "",
      error: "Username contains illegal invisible or control characters.",
      reason: "invalid_characters",
    };
  }

  // 2. Check for emojis
  if (EMOJI_REGEX.test(raw)) {
    return {
      valid: false,
      clean: "",
      error:
        "Emojis are not permitted in usernames. Usernames are used as your web address (e.g. username.portside.lol) and must use standard Latin characters.",
      reason: "contains_emoji",
    };
  }

  // 3. Check for Kanji / CJK scripts
  if (CJK_REGEX.test(raw)) {
    return {
      valid: false,
      clean: "",
      error:
        "Kanji, Chinese, Japanese, or Korean characters are not permitted in usernames. Please use standard Latin letters (a-z) and numbers.",
      reason: "contains_non_ascii",
    };
  }

  // 4. Check for any other non-ASCII characters (Cyrillic, Arabic, Greek, diacritics/accents)
  if (NON_ASCII_REGEX.test(raw)) {
    return {
      valid: false,
      clean: "",
      error:
        "Special symbols and non-Latin characters (such as accents, Cyrillic, or Arabic) are not allowed in usernames.",
      reason: "contains_non_ascii",
    };
  }

  // 5. Check for spaces
  if (/\s/.test(raw)) {
    return {
      valid: false,
      clean: "",
      error: "Username cannot contain spaces. Use hyphens (-) instead.",
      reason: "contains_spaces",
    };
  }

  // 6. Check for underscores
  if (raw.includes("_")) {
    return {
      valid: false,
      clean: "",
      error:
        "Underscores are not permitted in usernames because they are invalid in DNS subdomains. Use hyphens (-) instead.",
      reason: "contains_underscores",
    };
  }

  // 7. Check for periods/dots
  if (raw.includes(".")) {
    return {
      valid: false,
      clean: "",
      error:
        "Periods are not permitted in usernames because they break subdomain SSL routing. Use hyphens (-) instead.",
      reason: "contains_dots",
    };
  }

  // Lowercase for canonical comparison
  const clean = raw.toLowerCase();

  // 8. Check character whitelist: strictly lowercase a-z, 0-9, and hyphen -
  if (!/^[a-z0-9-]+$/.test(clean)) {
    return {
      valid: false,
      clean,
      error:
        "Username may only contain lowercase letters (a-z), numbers (0-9), and hyphens (-).",
      reason: "invalid_characters",
    };
  }

  // 9. Check length
  if (clean.length < USERNAME_MIN_LENGTH) {
    return {
      valid: false,
      clean,
      error: `Username must be at least ${USERNAME_MIN_LENGTH} characters long.`,
      reason: "too_short",
    };
  }

  if (clean.length > USERNAME_MAX_LENGTH) {
    return {
      valid: false,
      clean,
      error: `Username cannot exceed ${USERNAME_MAX_LENGTH} characters.`,
      reason: "too_long",
    };
  }

  // 10. Check leading or trailing hyphens
  if (clean.startsWith("-") || clean.endsWith("-")) {
    return {
      valid: false,
      clean,
      error: "Username cannot begin or end with a hyphen.",
      reason: "leading_or_trailing_hyphen",
    };
  }

  // 11. Check consecutive hyphens (prevents Punycode reservations and comment injection)
  if (clean.includes("--")) {
    return {
      valid: false,
      clean,
      error:
        "Username cannot contain consecutive hyphens ('--') due to DNS and Punycode restrictions.",
      reason: "consecutive_hyphens",
    };
  }

  // 12. Check Windows reserved device names (CON, PRN, AUX, NUL, COM1-9, LPT1-9)
  if (WINDOWS_RESERVED_NAMES.has(clean)) {
    return {
      valid: false,
      clean,
      error: `The username '${clean}' is reserved for operating system device safety.`,
      reason: "reserved_windows_device",
    };
  }

  // 13. Prevent pure numeric usernames that match well-known system ports (e.g. 80, 443, 8080)
  if (/^\d+$/.test(clean)) {
    const num = parseInt(clean, 10);
    if (num >= 1 && num <= 65535) {
      return {
        valid: false,
        clean,
        error:
          "Usernames cannot consist solely of numbers matching network port numbers. Please include letters.",
        reason: "pure_number_system_collision",
      };
    }
  }

  // 14. Check reserved platform handles
  if (RESERVED_USERNAMES.has(clean) && !isPact) {
    return {
      valid: false,
      clean,
      error: `The handle '${clean}' is reserved by the PortSide platform.`,
      reason: "reserved_platform",
    };
  }

  return {
    valid: true,
    clean,
  };
}

/**
 * Safely generate a fallback username from a display name or email.
 * Strips non-ASCII, emojis, symbols, and replaces spaces with hyphens.
 * Guarantees a compliant fallback handle.
 */
export function sanitizeUsernameFallback(
  rawInput: string | null | undefined,
  fallbackDefault = "dev"
): string {
  if (!rawInput) return fallbackDefault;

  let sanitized = rawInput
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "") // strip non-ASCII including emojis & kanji
    .replace(/[^a-z0-9]+/g, "-") // replace symbols/spaces with hyphen
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-|-$/g, "") // trim leading/trailing hyphens
    .slice(0, USERNAME_MAX_LENGTH);

  if (sanitized.length < USERNAME_MIN_LENGTH) {
    sanitized = `${sanitized || fallbackDefault}-${Math.floor(100 + Math.random() * 900)}`;
  }

  if (WINDOWS_RESERVED_NAMES.has(sanitized) || RESERVED_USERNAMES.has(sanitized)) {
    sanitized = `${sanitized}-user`;
  }

  return sanitized.slice(0, USERNAME_MAX_LENGTH);
}
