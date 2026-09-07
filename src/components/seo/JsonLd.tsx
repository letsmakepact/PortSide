import React from "react";

interface JsonLdProps {
  appUrl?: string;
}

export function JsonLd({ appUrl = "https://portside.lol" }: JsonLdProps) {
  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Portside",
    operatingSystem: "Windows, macOS, Linux, iOS, Android, Smart TV (webOS, Tizen, Android TV)",
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "Reverse Proxy, Port Forwarding, Local Development, Dev Server Manager",
    description:
      "The premier open-source local reverse proxy and multi-device development cockpit. Route custom .localhost and .local domains to internal dev ports without editing hosts files or paying for cloud hosting subscriptions.",
    url: appUrl,
    image: `${appUrl}/opengraph-image`,
    license: "https://github.com/letsmakepact/PortSide/blob/main/LICENSE",
    keywords: [
      "custom ports",
      "custom port router",
      "cheap websites to host on",
      "free local hosting alternative",
      "open source cool projects",
      "open source developer tools",
      "localhost reverse proxy",
      "clean localhost subdomains",
      "zero config reverse proxy",
      "ngrok alternative open source",
      "cloudflare tunnel alternative for local dev",
      "test dev server on mobile",
      "smart tv web testing",
      "port 80 proxy",
      "rfc 6761 localhost",
    ],
    author: {
      "@type": "Person",
      name: "pact",
      url: "https://github.com/letsmakepact",
      sameAs: [
        "https://github.com/letsmakepact",
        "https://t.me/pactwithdevil",
        "https://buymeacoffee.com/pacts",
      ],
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      category: "Free Open Source / PNC-1.0",
    },
    softwareRequirements: "Node.js >= 18 or Standalone Portside Launcher",
    featureList: [
      "Route custom subdomains to custom ports without editing /etc/hosts",
      "Cheap and free alternative to cloud preview servers and paid tunnels",
      "Automatic Port 80 reverse proxying compliant with RFC 6761",
      "Multi-device testing on Smartphones and Tablets via QR code over Wi-Fi",
      "Smart TV 10-foot remote navigation with spatial D-pad controls",
      "Zero-config mDNS .local hostname resolution",
      "Live background port health monitor and latency tracker",
      "Project grouping, tags, and route pausing controls",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Portside",
    url: appUrl,
    description:
      "Route custom .localhost and .local domains directly to your dev servers without port numbers. Free and open-source local development cockpit.",
    publisher: {
      "@type": "Person",
      name: "pact",
      url: "https://github.com/letsmakepact",
    },
    inLanguage: "en-US",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
