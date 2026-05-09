import type { ReactNode } from "react";
import Tape from "./Tape";

interface PostItProps {
  children: ReactNode;
  color?: string;
  rotation?: number;
}

export default function PostIt({
  children,
  color = "peach",
  rotation = -4,
}: PostItProps) {
  return (
    <div
      aria-hidden="true"
      className={`bg-${color} relative flex flex-col items-center justify-center
        p-4 pt-6 shadow-[1px_3px_8px_rgba(0,0,0,0.12)]`}
      style={{
        width: "100px",
        minHeight: "100px",
        transform: `rotate(${rotation}deg)`,
        willChange: "transform",
      }}
    >
      <Tape rotation={-5} className="absolute -top-1.5 left-1/2 -translate-x-1/2" />
      {children}
    </div>
  );
}
