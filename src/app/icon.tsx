import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export function generateImageMetadata() {
  return [
    {
      contentType: "image/png",
      size: { width: 32, height: 32 },
      id: "32",
    },
    {
      contentType: "image/png",
      size: { width: 192, height: 192 },
      id: "192",
    },
    {
      contentType: "image/png",
      size: { width: 512, height: 512 },
      id: "512",
    },
  ];
}

export default async function Icon({ id }: { id?: Promise<string> | string }) {
  const resolvedId = typeof id === "object" && id !== null ? await id : id;
  const isLarge = resolvedId === "512";
  const isMedium = resolvedId === "192";
  const size = isLarge ? 512 : isMedium ? 192 : 32;
  const borderRadius = isLarge ? 102 : isMedium ? 38 : 7;
  const borderWidth = isLarge ? 8 : isMedium ? 3 : 1;
  const svgSize = isLarge ? 340 : isMedium ? 128 : 22;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius,
          backgroundColor: "#0b0f19",
          border: `${borderWidth}px solid #38bdf8`,
        }}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          style={{ width: svgSize, height: svgSize }}
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
      width: size,
      height: size,
    }
  );
}
