import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export function ensureUserPortsideDirectory(): string {
  try {
    const home = os.homedir();
    const portsideDir = path.join(home, "Portside");
    const updatesDir = path.join(portsideDir, "updates");

    if (!fs.existsSync(portsideDir)) {
      fs.mkdirSync(portsideDir, { recursive: true });
    }
    if (!fs.existsSync(updatesDir)) {
      fs.mkdirSync(updatesDir, { recursive: true });
    }

    return portsideDir;
  } catch {
    return "";
  }
}
