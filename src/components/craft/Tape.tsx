interface TapeProps {
  width?: string;
  rotation?: number;
  className?: string;
}

export default function Tape({
  width = "48px",
  rotation = -3,
  className = "",
}: TapeProps) {
  return (
    <span
      aria-hidden="true"
      className={`tape-strip block rounded-sm ${className}`}
      style={{
        width,
        height: "14px",
        transform: `rotate(${rotation}deg)`,
        willChange: "transform",
      }}
    />
  );
}
