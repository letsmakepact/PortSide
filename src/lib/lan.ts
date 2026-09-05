import os from "os";

export interface LanInterfaceInfo {
  name: string;
  ip: string;
}

export function getLanIp(): string {
  const interfaces = os.networkInterfaces();
  const candidates: { name: string; ip: string; priority: number }[] = [];

  const isVpnOrVirtual = (name: string) => {
    const lower = name.toLowerCase();
    const banned = [
      "mullvad", "vpn", "wireguard", "wintun", "openvpn",
      "nord", "proton", "tailscale", "expressvpn", "tun",
      "tap", "docker", "wsl", "veth", "hyper-v", "loopback",
      "pseudo", "teredo", "isatap", "virtual", "vbox", "vmware",
    ];
    return banned.some((b) => lower.includes(b));
  };

  for (const name of Object.keys(interfaces)) {
    const list = interfaces[name];
    if (!list) continue;

    for (const info of list) {
      if (info.family === "IPv4" && !info.internal) {
        const lowerName = name.toLowerCase();
        const ip = info.address;

        // Skip link-local and virtual host-only IPs
        if (ip.startsWith("169.254.") || ip.startsWith("192.168.56.")) {
          continue;
        }

        let priority = 10;

        if (isVpnOrVirtual(lowerName)) {
          priority = -100;
        } else if (lowerName.includes("wi-fi") || lowerName.includes("wifi") || lowerName.includes("wlan")) {
          priority = 100;
        } else if (lowerName.includes("ethernet")) {
          priority = 80;
        }

        if (ip.startsWith("192.168.")) {
          priority += 20;
        } else if (ip.startsWith("10.") && !isVpnOrVirtual(lowerName)) {
          priority += 10;
        }

        candidates.push({ name, ip, priority });
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
