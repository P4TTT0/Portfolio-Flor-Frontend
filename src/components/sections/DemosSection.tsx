"use client";

import Image from "next/image";
import type { DemoItem } from "@/lib/use-sanity-content";
import DemoCard from "@/components/demos/DemoCard";

interface DemosSectionProps {
  id: string;
  demos: DemoItem[];
}

export default function DemosSection({ id, demos }: DemosSectionProps) {
  return (
    <section id={id} className="snap-start h-screen flex items-center justify-center relative overflow-hidden">
      {/* Pizarra container — centered, fills most of the viewport */}
      <div className="relative w-full max-w-[min(88vw,1050px)] px-2 sm:px-4">
        {/* Pizarra background image */}
        <Image
          src="/assets/elements/pizarra.png"
          alt="Pizarra de demos"
          width={1200}
          height={800}
          className="w-full h-auto"
          style={{ aspectRatio: "3 / 2" }}
          priority
        />

        {/* Paper star decoration — centered on top-right corner, half in half out */}
        <img
          src="/assets/elements/paper-star.png"
          alt=""
          className="absolute pointer-events-none"
          style={{
            top: 5,
            right: 30,
            width: 111,
            height: "auto",
            zIndex: 20,
          }}
          aria-hidden="true"
        />

        {/* Headphones decoration — centered on bottom-left corner, half in half out */}
        <img
          src="/assets/elements/headphones.png"
          alt=""
          className="absolute pointer-events-none"
          style={{
            bottom: 0,
            left: 0,
            transform: "translate(-50%, 50%)",
            width: "80px",
            height: "auto",
            zIndex: 20,
          }}
          aria-hidden="true"
        />

        {/* Grid overlay — positioned inside the cork area (inset from frame) */}
        <div
          className="absolute grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 items-start content-start"
          style={{
            top: "14%",
            left: "12%",
            right: "12%",
            bottom: "14%",
          }}
        >
          {demos.map((demo, i) => (
            <DemoCard key={demo.title} demo={demo} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
