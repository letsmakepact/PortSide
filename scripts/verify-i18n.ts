import { SUPPORTED_LOCALES } from "../src/lib/i18n/types";
import { enUS } from "../src/lib/i18n/locales/en-US";
import { enGB } from "../src/lib/i18n/locales/en-GB";
import { sv } from "../src/lib/i18n/locales/sv";
import { zhCN } from "../src/lib/i18n/locales/zh-CN";
import { nl } from "../src/lib/i18n/locales/nl";
import { hi } from "../src/lib/i18n/locales/hi";
import { enIN } from "../src/lib/i18n/locales/en-IN";

const dicts = {
  "en-US": enUS,
  "en-GB": enGB,
  sv: sv,
  "zh-CN": zhCN,
  nl: nl,
  hi: hi,
  "en-IN": enIN,
};

console.log("Checking all 7 locale dictionaries...");

const expectedCountries = [
  "United States",
  "United Kingdom",
  "Sweden",
  "China",
  "Netherlands",
  "India",
];

console.log(`Checking supported locales (${SUPPORTED_LOCALES.length} locales configured):`);
for (const loc of SUPPORTED_LOCALES) {
  console.log(`- [${loc.code}] ${loc.flag} ${loc.country} (${loc.nativeCountry}) -> ${loc.nativeLanguage}`);
}

function getKeys(obj: any, prefix = ""): string[] {
  let keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      keys = keys.concat(getKeys(v, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const baseKeys = getKeys(enUS);
console.log(`\nBase dictionary contains ${baseKeys.length} translation keys.`);

let allPassed = true;

for (const [code, dict] of Object.entries(dicts)) {
  const keys = getKeys(dict);
  const missing = baseKeys.filter((k) => !keys.includes(k));
  if (missing.length > 0) {
    console.error(`[ERROR] Locale ${code} is missing keys:`, missing);
    allPassed = false;
  } else {
    console.log(`[PASS] Locale ${code}: all ${keys.length} keys present and matching.`);
  }

  // Check no empty strings
  for (const k of baseKeys) {
    const parts = k.split(".");
    let val: any = dict;
    for (const p of parts) {
      val = val?.[p];
    }
    if (typeof val !== "string" || val.trim().length === 0) {
      console.error(`[ERROR] Locale ${code} has empty or invalid value for key: ${k}`);
      allPassed = false;
    }
  }
}

if (allPassed) {
  console.log("\nALL TRANSLATIONS VERIFIED SUCCESSFULLY!");
  process.exit(0);
} else {
  console.error("\nTRANSLATION VERIFICATION FAILED!");
  process.exit(1);
}
