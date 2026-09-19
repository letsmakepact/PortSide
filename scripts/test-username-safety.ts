import {
  validateUsername,
  sanitizeUsernameFallback,
  RESERVED_USERNAMES,
  WINDOWS_RESERVED_NAMES,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
} from "../src/lib/username";
import assert from "node:assert";

console.log("=================================================");
console.log("Running SaaS Username Safety Restriction Tests");
console.log("=================================================\n");

let passed = 0;
let failed = 0;

function it(desc: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${desc}`);
  } catch (err: any) {
    failed++;
    console.error(`  ✗ ${desc}`);
    console.error(`    ${err.message || err}`);
  }
}

// 1. Valid Standard Usernames
it("accepts valid alphanumeric usernames", () => {
  const validNames = [
    "alex",
    "john-doe",
    "dev123",
    "super-coder-99",
    "project-alpha",
    "node-42",
    "a-b-c",
  ];
  for (const name of validNames) {
    const res = validateUsername(name);
    assert.strictEqual(res.valid, true, `Expected "${name}" to be valid, got error: ${res.error}`);
    assert.strictEqual(res.clean, name.toLowerCase());
  }
});

// 2. Reject Emojis
it("rejects usernames containing emojis", () => {
  const emojiNames = [
    "🚀rocket",
    "dev🔥",
    "coder💻pro",
    "🌟",
    "cool😎guy",
    "cat🐱dog🐶",
    "test❤️love",
    "builder🛠️",
  ];
  for (const name of emojiNames) {
    const res = validateUsername(name);
    assert.strictEqual(res.valid, false, `Expected "${name}" with emoji to be rejected`);
    assert.strictEqual(res.reason, "contains_emoji");
    assert(res.error?.includes("Emojis are not permitted"), `Expected emoji error message for "${name}"`);
  }
});

// 3. Reject Kanji, CJK, and Asian scripts
it("rejects usernames containing Kanji and CJK characters", () => {
  const cjkNames = [
    "田中",
    "山田太郎",
    "東京dev",
    "ユーザー1",
    "김개발",
    "李小龙",
    "한글",
    "カタカナ",
  ];
  for (const name of cjkNames) {
    const res = validateUsername(name);
    assert.strictEqual(res.valid, false, `Expected CJK username "${name}" to be rejected`);
    assert.strictEqual(res.reason, "contains_non_ascii");
    assert(res.error?.includes("Kanji") || res.error?.includes("non-Latin"), `Expected non-Latin error for "${name}"`);
  }
});

// 4. Reject Cyrillic, Arabic, Greek, and Accents (Homoglyph prevention)
it("rejects non-ASCII homoglyphs, Cyrillic, Arabic, and diacritics", () => {
  const homoglyphs = [
    "аdmin", // Cyrillic 'а' (U+0430) spoofing Latin 'a'
    "suppоrt", // Cyrillic 'о' (U+043E)
    "móvil", // accented o
    "caffè", // accented e
    "über-coder", // umlaut
    "محمد", // Arabic
    "αθήνα", // Greek
  ];
  for (const name of homoglyphs) {
    const res = validateUsername(name);
    assert.strictEqual(res.valid, false, `Expected homoglyph "${name}" to be rejected`);
    assert.strictEqual(res.reason, "contains_non_ascii");
  }
});

// 5. Reject Invisible and Zero-Width Characters
it("rejects invisible, zero-width, and control characters", () => {
  const invisibleNames = [
    "alex\u200Bdev", // Zero-width space
    "test\u200Duser", // Zero-width joiner
    "ghost\uFEFFuser", // Byte order mark
    "safe\u00ADhyphen", // Soft hyphen
    "admin\u202Ereversed", // RTL override
    "null\0byte", // Null byte
  ];
  for (const name of invisibleNames) {
    const res = validateUsername(name);
    assert.strictEqual(res.valid, false, `Expected invisible char username to be rejected`);
  }
});

// 6. Delimiter Rules (spaces, underscores, dots, slashes)
it("rejects spaces, underscores, and dots with specific reasons", () => {
  assert.strictEqual(validateUsername("alex dev").reason, "contains_spaces");
  assert.strictEqual(validateUsername("alex_dev").reason, "contains_underscores");
  assert.strictEqual(validateUsername("alex.dev").reason, "contains_dots");
  assert.strictEqual(validateUsername("alex/dev").reason, "invalid_characters");
  assert.strictEqual(validateUsername("alex@dev").reason, "invalid_characters");
  assert.strictEqual(validateUsername("alex#dev").reason, "invalid_characters");
});

// 7. Hyphen Boundary & Sequence Rules
it("rejects leading, trailing, and consecutive hyphens (RFC 1123 / Punycode safety)", () => {
  assert.strictEqual(validateUsername("-leading").reason, "leading_or_trailing_hyphen");
  assert.strictEqual(validateUsername("trailing-").reason, "leading_or_trailing_hyphen");
  assert.strictEqual(validateUsername("-both-").reason, "leading_or_trailing_hyphen");
  assert.strictEqual(validateUsername("double--hyphen").reason, "consecutive_hyphens");
  assert.strictEqual(validateUsername("xn--punycode").reason, "consecutive_hyphens");
});

// 8. Length Boundaries
it("enforces length bounds (3 - 30 characters)", () => {
  assert.strictEqual(validateUsername("a").reason, "too_short");
  assert.strictEqual(validateUsername("ab").reason, "too_short");
  assert.strictEqual(validateUsername("abc").valid, true);

  const thirtyChars = "a".repeat(30);
  assert.strictEqual(validateUsername(thirtyChars).valid, true);

  const thirtyOneChars = "a".repeat(31);
  assert.strictEqual(validateUsername(thirtyOneChars).reason, "too_long");
});

// 9. Windows Reserved Device Names
it("rejects Windows reserved filenames (CON, PRN, AUX, NUL, COM1-9, LPT1-9)", () => {
  const windowsNames = ["con", "prn", "aux", "nul", "com1", "com9", "lpt1", "lpt5"];
  for (const name of windowsNames) {
    const res = validateUsername(name);
    assert.strictEqual(res.valid, false, `Expected "${name}" to be rejected as Windows device name`);
    assert.strictEqual(res.reason, "reserved_windows_device");
  }
});

// 10. Reserved Platform Routes & System Roles
it("rejects platform routes, security endpoints, and core roles", () => {
  const reserved = [
    "admin",
    "administrator",
    "root",
    "api",
    "auth",
    "login",
    "register",
    "billing",
    "settings",
    "dashboard",
    "portside",
    "pact",
    "support",
    "status",
    "docs",
    "localhost",
    "null",
    "undefined",
  ];
  for (const name of reserved) {
    const res = validateUsername(name);
    assert.strictEqual(res.valid, false, `Expected reserved name "${name}" to be rejected`);
    assert.strictEqual(res.reason, "reserved_platform");
  }

  // Pact bypass option
  const pactBypass = validateUsername("pact", { isPact: true });
  assert.strictEqual(pactBypass.valid, true);
});

// 11. Pure Numbers Matching Network Ports
it("rejects pure numbers colliding with network ports", () => {
  assert.strictEqual(validateUsername("80").reason, "too_short");
  assert.strictEqual(validateUsername("443").reason, "pure_number_system_collision");
  assert.strictEqual(validateUsername("3000").reason, "pure_number_system_collision");
  assert.strictEqual(validateUsername("8080").reason, "pure_number_system_collision");

  // Alphanumeric numbers should be fine
  assert.strictEqual(validateUsername("port-8080").valid, true);
  assert.strictEqual(validateUsername("web3").valid, true);
});

// 12. Fallback Sanitization
it("safely generates valid fallback username from arbitrary inputs", () => {
  const kanjiFallback = sanitizeUsernameFallback("田中太郎", "dev");
  assert.strictEqual(kanjiFallback.startsWith("dev-"), true);
  assert.strictEqual(validateUsername(kanjiFallback).valid, true);

  assert.strictEqual(sanitizeUsernameFallback("🚀 Super Dev 🚀"), "super-dev");
  assert.strictEqual(validateUsername(sanitizeUsernameFallback("🚀 Super Dev 🚀")).valid, true);

  assert.strictEqual(sanitizeUsernameFallback("user@example.com"), "user-example-com");
  assert.strictEqual(validateUsername(sanitizeUsernameFallback("user@example.com")).valid, true);

  assert.strictEqual(sanitizeUsernameFallback("admin"), "admin-user");
  assert.strictEqual(validateUsername(sanitizeUsernameFallback("admin")).valid, true);

  assert.strictEqual(sanitizeUsernameFallback("con"), "con-user");
  assert.strictEqual(validateUsername(sanitizeUsernameFallback("con")).valid, true);

  assert.strictEqual(sanitizeUsernameFallback("---leading---"), "leading");
  assert.strictEqual(validateUsername(sanitizeUsernameFallback("---leading---")).valid, true);
});

console.log("\n=================================================");
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log("=================================================");

if (failed > 0) {
  process.exit(1);
}
