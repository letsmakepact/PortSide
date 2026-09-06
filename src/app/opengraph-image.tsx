import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt = "Portside · Name Your Localhost";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b0f19",
          backgroundImage:
            "radial-gradient(circle at 50% 30%, #0369a1 0%, #0b0f19 70%)",
          padding: "60px",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          color: "#f8fafc",
          position: "relative",
        }}
      >
        {/* Subtle grid background accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.15,
            backgroundImage:
              "linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Anchor Card Container */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 180,
            height: 180,
            borderRadius: 36,
            backgroundColor: "#0f172a",
            border: "2px solid #38bdf8",
            boxShadow: "0 0 60px rgba(56, 189, 248, 0.35)",
            marginBottom: 36,
          }}
        >
          {/* Signature Anchor SVG */}
          <svg
            viewBox="0 0 32 32"
            fill="none"
            style={{
              width: 110,
              height: 110,
            }}
          >
            {/* Anchor Ring */}
            <circle
              cx="16"
              cy="6"
              r="2.5"
              stroke="#38bdf8"
              strokeWidth="2.2"
              fill="none"
            />
            {/* Crossbar */}
            <rect
              x="8.5"
              y="10.5"
              width="15"
              height="3"
              rx="1.5"
              fill="#38bdf8"
              opacity="0.9"
            />
            {/* Central Shank */}
            <rect
              x="14.5"
              y="8"
              width="3"
              height="16"
              rx="1.5"
              fill="#38bdf8"
            />
            {/* Curved Anchor Arms */}
            <path
              d="M7 16C7 21 10.5 25 16 25C21.5 25 25 21 25 16"
              stroke="#38bdf8"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />
            {/* Left Fluke Arrow */}
            <polygon
              points="3.5,16.5 7.5,12 9.5,17"
              fill="#38bdf8"
            />
            {/* Right Fluke Arrow */}
            <polygon
              points="28.5,16.5 24.5,12 22.5,17"
              fill="#38bdf8"
            />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#ffffff",
            marginBottom: 16,
          }}
        >
          <span>Portside</span>
          <span style={{ color: "#38bdf8" }}>·</span>
          <span style={{ color: "#38bdf8" }}>Name Your Localhost</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 26,
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.4,
            marginBottom: 32,
          }}
        >
          Route custom .localhost and .local domains directly to your dev servers without port numbers. Zero-config mDNS and mobile & TV access.
        </div>

        {/* Footer Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 22px",
            borderRadius: 9999,
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            fontSize: 18,
            color: "#38bdf8",
            fontWeight: 600,
          }}
        >
          <span>Created by pact</span>
          <span>·</span>
          <span>portside.lol</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
