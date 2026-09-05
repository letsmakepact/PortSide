export function AnchorLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle
        cx="16"
        cy="6"
        r="2.5"
        stroke="currentColor"
        strokeWidth="2.2"
        fill="none"
      />

      <rect
        x="8.5"
        y="10.5"
        width="15"
        height="3"
        rx="1.5"
        fill="currentColor"
        opacity="0.9"
      />

      <rect
        x="14.5"
        y="8"
        width="3"
        height="16"
        rx="1.5"
        fill="currentColor"
      />

      <path
        d="M7 16C7 21 10.5 25 16 25C21.5 25 25 21 25 16"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
      />

      <polygon
        points="3.5,16.5 7.5,12 9.5,17"
        fill="currentColor"
      />
      <polygon
        points="28.5,16.5 24.5,12 22.5,17"
        fill="currentColor"
      />
    </svg>
  );
}

export function AnchorIconBox({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const boxClasses = {
    sm: "h-7 w-7 rounded-lg text-sky-400 bg-slate-800 border border-slate-700/60 shadow-xs",
    md: "h-8 w-8 rounded-lg text-sky-400 bg-slate-800 border border-slate-700/70 shadow-xs",
    lg: "h-10 w-10 rounded-xl text-sky-400 bg-slate-800 border border-slate-700/80 shadow-sm",
  }[size];

  const iconClasses = {
    sm: "h-4 w-4",
    md: "h-4.5 w-4.5",
    lg: "h-6 w-6",
  }[size];

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${boxClasses}`}
    >
      <AnchorLogo className={iconClasses} />
    </span>
  );
}
