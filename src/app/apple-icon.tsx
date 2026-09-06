import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 36,
          backgroundColor: "#0b0f19",
          border: "3px solid #38bdf8",
        }}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          style={{ width: 120, height: 120 }}
        >
          <circle
            cx="16"
            cy="6"
            r="2.5"
            stroke="#38bdf8"
            strokeWidth="2.2"
            fill="none"
          />
          <rect
            x="8.5"
            y="10.5"
            width="15"
            height="3"
            rx="1.5"
            fill="#38bdf8"
            opacity="0.9"
          />
          <rect
            x="14.5"
            y="8"
            width="3"
            height="16"
            rx="1.5"
            fill="#38bdf8"
          />
          <path
            d="M7 16C7 21 10.5 25 16 25C21.5 25 25 21 25 16"
            stroke="#38bdf8"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
          <polygon points="3.5,16.5 7.5,12 9.5,17" fill="#38bdf8" />
          <polygon points="28.5,16.5 24.5,12 22.5,17" fill="#38bdf8" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
