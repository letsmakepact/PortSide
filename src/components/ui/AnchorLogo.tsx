export function AnchorLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle
        cx="16"
        cy="5.5"
        r="2.6"
        stroke="#38bdf8"
        strokeWidth="2.2"
        fill="none"
      />

      <rect
        x="8.5"
        y="9.5"
        width="15"
        height="3.2"
        rx="1.6"
        fill="#7dd3fc"
      />

      <rect
        x="14.4"
        y="7"
        width="3.2"
        height="17.5"
        rx="1.6"
        fill="#0ea5e9"
      />

      <path
        d="M6 16.5C6 22 10.2 26 16 26C21.8 26 26 22 26 16.5"
        stroke="#38bdf8"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />

      <polygon
        points="2.8,17 7.2,12 9.5,17.5"
        fill="#7dd3fc"
      />
      <polygon
        points="29.2,17 24.8,12 22.5,17.5"
        fill="#7dd3fc"
      />
    </svg>
  );
}

export function AnchorIconBox({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const boxClasses = {
    sm: "h-8 w-8 rounded-lg",
    md: "h-9 w-9 rounded-xl",
    lg: "h-12 w-12 rounded-2xl",
  }[size];

  const iconClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }[size];

  return (
    <span
      className={`flex items-center justify-center bg-sky-950/80 border border-sky-400/40 shadow-lg shadow-sky-500/25 ${boxClasses}`}
    >
      <AnchorLogo className={iconClasses} />
    </span>
  );
}
