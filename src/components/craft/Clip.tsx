interface ClipProps {
  type?: "paperclip" | "binder";
  color?: string;
  className?: string;
}

export default function Clip({
  type = "paperclip",
  color = "currentColor",
  className = "",
}: ClipProps) {
  if (type === "binder") {
    return (
      <svg
        aria-hidden="true"
        className={className}
        width="24"
        height="32"
        viewBox="0 0 24 32"
        fill="none"
      >
        <rect
          x="3"
          y="2"
          width="18"
          height="22"
          rx="1"
          stroke={color}
          strokeWidth="1.5"
        />
        <path
          d="M7 8 L17 8 M7 12 L17 12 M7 16 L17 16 M7 20 L13 20"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className={className}
      width="18"
      height="36"
      viewBox="0 0 18 36"
      fill="none"
    >
      <path
        d="M3 4
           A6 6 0 0 1 15 4
           L15 28
           A4 4 0 0 1 7 28
           L7 12
           A1.5 1.5 0 0 1 10 12
           L10 24"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
