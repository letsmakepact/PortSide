import { verifySessionTicket, verifyPairToken, SessionTicketPayload } from "./license";
import os from "os";
import crypto from "crypto";

export function getHardwareMachineId(): string {
  try {
    const interfaces = os.networkInterfaces();
    for (const key of Object.keys(interfaces)) {
      const ifaceList = interfaces[key];
      if (!ifaceList) continue;
      for (const iface of ifaceList) {
        if (!iface.internal && iface.mac && iface.mac !== "00:00:00:00:00:00") {
          const hash = crypto
            .createHash("sha256")
            .update("PORTSIDE-HW:" + iface.mac.toUpperCase())
            .digest("hex")
            .toUpperCase();
          return `PS-${hash.substring(0, 8)}-${hash.substring(8, 16)}`;
        }
      }
    }
  } catch {}
  return "PS-CABDA074-A01FD367";
}

// Global cache for live Ephemeral Supporter Session Ticket
declare global {
  // eslint-disable-next-line no-var
  var __PORTSIDE_LIVE_SESSION_TICKET__: string | null | undefined;
  // eslint-disable-next-line no-var
  var __PORTSIDE_LIVE_SESSION_PAYLOAD__: SessionTicketPayload | null | undefined;
}

const WEB_PORTAL_URL = process.env.PORTSIDE_WEB_URL || "https://portside.lol";

/**
 * Returns the currently active session ticket, or requests a fresh one from Portside-Web.
 * If the user's tier was tampered locally (e.g. cracked database or patched boolean),
 * the sovereign server will refuse to sign a session ticket, leaving the features inert.
 */
export async function getOrFetchSupporterSession(
  email: string,
  licenseKey?: string,
  forceRefresh = false
): Promise<{ valid: boolean; sessionTicket: string | null; payload: SessionTicketPayload | null; error?: string }> {
  const machineId = getHardwareMachineId();

  // Return cached session if still fresh (> 2 min remaining)
  if (!forceRefresh && global.__PORTSIDE_LIVE_SESSION_TICKET__ && global.__PORTSIDE_LIVE_SESSION_PAYLOAD__) {
    const remaining = global.__PORTSIDE_LIVE_SESSION_PAYLOAD__.expiresAt - Date.now();
    if (remaining > 2 * 60 * 1000) {
      return {
        valid: true,
        sessionTicket: global.__PORTSIDE_LIVE_SESSION_TICKET__,
        payload: global.__PORTSIDE_LIVE_SESSION_PAYLOAD__,
      };
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${WEB_PORTAL_URL}/api/supporter/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        machineId,
        licenseKey: licenseKey?.trim() || undefined,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      global.__PORTSIDE_LIVE_SESSION_TICKET__ = null;
      global.__PORTSIDE_LIVE_SESSION_PAYLOAD__ = null;
      return {
        valid: false,
        sessionTicket: null,
        payload: null,
        error: errData.error || "Server denied supporter session ticket.",
      };
    }

    const data = await res.json();
    const ticket = data.sessionTicket;
    if (!ticket) {
      return { valid: false, sessionTicket: null, payload: null, error: "Empty session ticket returned." };
    }

    // Authenticate signature locally with Ed25519 master public key
    const verified = verifySessionTicket(ticket, machineId, email);
    if (!verified.valid || !verified.payload) {
      return {
        valid: false,
        sessionTicket: null,
        payload: null,
        error: verified.error || "Cryptographic verification of server ticket failed.",
      };
    }

    // Cache valid session
    global.__PORTSIDE_LIVE_SESSION_TICKET__ = ticket;
    global.__PORTSIDE_LIVE_SESSION_PAYLOAD__ = verified.payload;

    // Notify Go launcher of active session ticket
    try {
      const launcherController = new AbortController();
      const launcherTimeout = setTimeout(() => launcherController.abort(), 800);
      await fetch("http://127.0.0.1:4242/api/pro/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket,
          machineId,
        }),
        signal: launcherController.signal,
      }).catch(() => {});
      clearTimeout(launcherTimeout);
    } catch {}

    return {
      valid: true,
      sessionTicket: ticket,
      payload: verified.payload,
    };
  } catch (err: any) {
    // If network error, check if we still have an unexpired cached ticket
    if (global.__PORTSIDE_LIVE_SESSION_TICKET__ && global.__PORTSIDE_LIVE_SESSION_PAYLOAD__) {
      if (Date.now() < global.__PORTSIDE_LIVE_SESSION_PAYLOAD__.expiresAt) {
        return {
          valid: true,
          sessionTicket: global.__PORTSIDE_LIVE_SESSION_TICKET__,
          payload: global.__PORTSIDE_LIVE_SESSION_PAYLOAD__,
        };
      }
    }

    return {
      valid: false,
      sessionTicket: null,
      payload: null,
      error: err?.message || "Failed to contact sovereign session server.",
    };
  }
}

/**
 * Requests a short-lived (5m) server-signed pair token for Hotspot or LAN fleet pairing.
 */
export async function requestPairToken(
  email: string
): Promise<{ valid: boolean; pairToken: string | null; error?: string }> {
  const session = await getOrFetchSupporterSession(email);
  if (!session.valid || !session.sessionTicket) {
    return { valid: false, pairToken: null, error: session.error || "Active session ticket required" };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${WEB_PORTAL_URL}/api/supporter/pair-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionTicket: session.sessionTicket,
        machineId: getHardwareMachineId(),
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return { valid: false, pairToken: null, error: "Failed to generate pairing token on server." };
    }

    const data = await res.json();
    const pairToken = data.pairToken;
    const verified = verifyPairToken(pairToken);
    if (!verified.valid) {
      return { valid: false, pairToken: null, error: "Pair token cryptographic verification failed." };
    }

    return { valid: true, pairToken };
  } catch (err: any) {
    return { valid: false, pairToken: null, error: err?.message || "Server timeout" };
  }
}
