export type SupportedLocale =
  | "en-US" // United States
  | "en-GB" // United Kingdom
  | "sv"    // Sweden (Svenska)
  | "zh-CN" // China (简体中文)
  | "nl"    // Netherlands (Nederlands)
  | "hi"    // India (हिन्दी)
  | "en-IN"; // India (English)

export interface CountryMeta {
  code: SupportedLocale;
  country: string;
  nativeCountry: string;
  language: string;
  nativeLanguage: string;
  flag: string;
}

export const SUPPORTED_LOCALES: CountryMeta[] = [
  {
    code: "en-US",
    country: "United States",
    nativeCountry: "United States",
    language: "English (US)",
    nativeLanguage: "English (US)",
    flag: "🇺🇸",
  },
  {
    code: "en-GB",
    country: "United Kingdom",
    nativeCountry: "United Kingdom",
    language: "English (UK)",
    nativeLanguage: "English (UK)",
    flag: "🇬🇧",
  },
  {
    code: "sv",
    country: "Sweden",
    nativeCountry: "Sverige",
    language: "Swedish",
    nativeLanguage: "Svenska",
    flag: "🇸🇪",
  },
  {
    code: "zh-CN",
    country: "China",
    nativeCountry: "中国",
    language: "Simplified Chinese",
    nativeLanguage: "简体中文",
    flag: "🇨🇳",
  },
  {
    code: "nl",
    country: "Netherlands",
    nativeCountry: "Nederland",
    language: "Dutch",
    nativeLanguage: "Nederlands",
    flag: "🇳🇱",
  },
  {
    code: "hi",
    country: "India",
    nativeCountry: "भारत",
    language: "Hindi",
    nativeLanguage: "हिन्दी",
    flag: "🇮🇳",
  },
  {
    code: "en-IN",
    country: "India",
    nativeCountry: "India",
    language: "English (India)",
    nativeLanguage: "English (India)",
    flag: "🇮🇳",
  },
];

export interface TranslationDictionary {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    docs: string;
    pricing: string;
    comparisons: string;
    openSource: string;
    github: string;
    getPortside: string;
    port80Proxy: string;
    selectLanguage: string;
  };
  hero: {
    taglinePre: string;
    taglinePost: string;
    subtitle: string;
    description: string;
    downloadWindows: string;
    allPlatforms: string;
    copied: string;
    copyInstall: string;
    terminalHint: string;
  };
  simulator: {
    sectionTitle: string;
    sectionSubtitle: string;
    tabLocalhost: string;
    tabTunnel: string;
    tabLan: string;
    tabHotspot: string;
    tabProfile: string;
    badgeFree: string;
    badgeSupporter: string;
    badgeUniversal: string;
    badgeHardware: string;
    badgeVanity: string;
    titleLocalhost: string;
    descLocalhost: string;
    titleTunnel: string;
    descTunnel: string;
    titleLan: string;
    descLan: string;
    titleHotspot: string;
    descHotspot: string;
    titleProfile: string;
    descProfile: string;
    targetLabel: string;
    protocolLabel: string;
    latencyLabel: string;
    scopeLabel: string;
    scopeLocal: string;
    scopeGlobal: string;
    scopeLan: string;
    scopeHotspot: string;
    scopeProfile: string;
    protocolLocalhost: string;
    protocolTunnel: string;
    protocolLan: string;
    protocolHotspot: string;
    protocolProfile: string;
    copyUrl: string;
    urlCopied: string;
  };
  features: {
    title: string;
    subtitle: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    feature4Title: string;
    feature4Desc: string;
    feature5Title: string;
    feature5Desc: string;
    feature6Title: string;
    feature6Desc: string;
  };
  showcase: {
    title: string;
    subtitle: string;
    publicTab: string;
    lanTab: string;
    previewMode: string;
    wireMode: string;
  };
  supporter: {
    badge: string;
    title: string;
    subtitle: string;
    price: string;
    period: string;
    description: string;
    ctaButton: string;
    perk1: string;
    perk2: string;
    perk3: string;
    perk4: string;
    perk5: string;
    freeTierHeading: string;
    freeTierDesc: string;
  };
  downloads: {
    title: string;
    subtitle: string;
    forWindows: string;
    forMacArm: string;
    forMacIntel: string;
    forLinuxAmd: string;
    forLinuxArm: string;
    downloadBtn: string;
    sourceCodeBtn: string;
    terminalInstallTitle: string;
    terminalInstallDesc: string;
  };
  faq: {
    title: string;
    subtitle: string;
    q1: string;
    a1: string;
    q2: string;
    a2: string;
    q3: string;
    a3: string;
    q4: string;
    a4: string;
    q5: string;
    a5: string;
  };
  docsCta: {
    title: string;
    subtitle: string;
    button: string;
  };
  footer: {
    tagline: string;
    productHeading: string;
    features: string;
    architecture: string;
    supporterPlan: string;
    downloadList: string;
    resourcesHeading: string;
    documentation: string;
    releases: string;
    sourceCode: string;
    creatorHeading: string;
    buyMeCoffee: string;
    copyright: string;
    loopbackNative: string;
    zeroTelemetry: string;
  };
}
