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
    description:
      "A local development reverse proxy, cockpit, and multi-device launchpad that provides clean *.localhost and *.local routing without editing hosts files or typing port numbers.",
    url: appUrl,
    image: `${appUrl}/opengraph-image`,
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
      category: "Free / PNC-1.0",
    },
    softwareRequirements: "Node.js >= 18 or Standalone Portside Launcher",
    featureList: [
      "Clean *.localhost routing without editing /etc/hosts",
      "Automatic Port 80 reverse proxying",
      "Multi-device testing on Smartphones and Tablets via QR code",
      "Smart TV 10-foot remote navigation with spatial D-pad controls",
      "Zero-config mDNS .local hostname resolution",
      "Live background port health monitor and latency tracker",
      "Project grouping and route pausing controls",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Portside",
    url: appUrl,
    description: "Route custom .localhost and .local domains directly to your dev servers without port numbers.",
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
