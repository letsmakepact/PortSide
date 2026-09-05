import os from "os";

export interface LanInterfaceInfo {
  name: string;
  ip: string;
}

export function getLanIp(): string {
  const interfaces = os.networkInterfaces();
  const candidates: { name: string; ip: string; priority: number }[] = [];

  for (const name of Object.keys(interfaces)) {
    const list = interfaces[name];
    if (!list) continue;

    for (const info of list) {
      if (info.family === "IPv4" && !info.internal) {
        const lowerName = name.toLowerCase();
        let priority = 10;

        if (lowerName.includes("wi-fi") || lowerName.includes("wifi") || lowerName.includes("wlan")) {
          priority = 100;
        } else if (lowerName.includes("ethernet") && !lowerName.includes("veth") && !lowerName.includes("wsl")) {
          priority = 80;
        } else if (lowerName.includes("tailscale") || lowerName.includes("vpn") || lowerName.includes("mullvad")) {
          priority = 5;
        } else if (lowerName.includes("vethernet") || lowerName.includes("docker") || lowerName.includes("wsl")) {
          priority = 1;
        }

        candidates.push({ name, ip: info.address, priority });
      }
    }
  }

  candidates.sort((a, b) => b.priority - a.priority);
  return candidates[0]?.ip || "127.0.0.1";
}

export function getLanUrls(hostname: string, port = "80", customIp?: string) {
  const ip = customIp || getLanIp();
  const portSuffix = port === "80" || port === "443" ? "" : `:${port}`;

  return {
    lanIp: ip,
    localMdnsUrl: `http://${hostname}.local${portSuffix}`,
    portalLocalUrl: `http://portside.local${portSuffix}`,
    subdomainUrl: `http://${hostname}.${ip}.nip.io${portSuffix}`,
    directUrl: `http://${ip}${portSuffix}/s/${hostname}`,
    portalUrl: `http://${ip}${portSuffix}/lan`,
  };
}
