"use client";

import { useEffect, useRef, useState } from "react";

interface BioCardProps {
  bio: string;
  picture?: string | null;
}

const DESIGN_WIDTH = 600;
const DESIGN_HEIGHT = 500;

export default function BioCard({ bio, picture }: BioCardProps) {
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el?.parentElement) return;

    const updateScale = () => {
      const parent = el.parentElement!;
      const width = window.innerWidth;
      const scaleX = parent.clientWidth / DESIGN_WIDTH;
      const scaleY = parent.clientHeight / DESIGN_HEIGHT;
      // In desktop (>1024px), allow scaling up to fill the space
      const maxScale = width < 1024 ? 1 : 2.5;
      setScale(Math.min(scaleX, scaleY, maxScale));
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el.parentElement);
    window.addEventListener("resize", updateScale);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  return (
    <div className="relative w-full flex-1 min-h-0 overflow-visible" style={{ height: "80%" }}>
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          marginLeft: -DESIGN_WIDTH / 2,
          marginTop: -DESIGN_HEIGHT / 2,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: isMobile ? -80 : isTablet ? -50 : undefined,
            right: !isMobile && !isTablet ? -112 : undefined,
            top: isMobile ? -100 : isTablet ? -115 : -150,
            width: isMobile ? 760 : isTablet ? 700 : 900,
            height: isMobile ? 700 : isTablet ? 670 : 800,
            transform: isMobile ? "rotate(87deg)" : "rotate(-3deg)",
            transformOrigin: "center center",
            zIndex: 40,
          }}
        >
          <img
            src="/assets/elements/paper.png"
            alt=""
            aria-hidden="true"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              pointerEvents: "none",
              opacity: 0.7,
            }}
          />

          <div
            style={{
              position: "absolute",
              top: isMobile ? 35 : isTablet ? 137 : 145,
              right: isMobile ? 176 : isTablet ? 71 : 95,
              bottom: isMobile ? 35 : isTablet ? 137 : 145,
              left: isMobile ? 176 : isTablet ? 71 : 95,
              transform: isMobile ? "rotate(-90deg)" : "none",
              transformOrigin: "center center",
            }}
          >
            <p
              className="font-body"
              style={{
                whiteSpace: "pre-line",
                fontSize: isMobile ? 25 : isTablet ? 25 : 32,
                lineHeight: 1.9,
                color: "rgb(94, 94, 94)",
                textAlign: "justify",
                margin: 0,
              }}
            >
              {bio}
            </p>
          </div>
        </div>

        <img
          src="/assets/elements/stars.png"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            right: isMobile ? 332 : isTablet ? 193 : 162,
            bottom: isMobile ? -35 : isTablet ? 107 : 43,
            width: isMobile ? 142 : isTablet ? 125 : 151,
            zIndex: 52,
            pointerEvents: "none",
            transform: "rotate(-26deg)",
            filter: "drop-shadow(rgba(0, 0, 0, 0.15) 1px 2px 3px)",
          }}
        />

        {picture && (
          <img
            src={picture}
            alt="Foto de perfil"
            style={{
              position: "absolute",
              right: isMobile ? 9 : isTablet ? -54 : undefined,
              left: !isMobile && !isTablet ? 514 : undefined,
              bottom: isMobile ? -58 : isTablet ? -9 : -49,
              width: isMobile ? 217 : isTablet ? 218 : 242,
              aspectRatio: "1 / 1",
              objectFit: "cover",
              borderRadius: 2,
              zIndex: 49,
              transform: "rotate(8deg)",
              boxShadow: "rgba(0, 0, 0, 0.1) 1px 2px 4px",
            }}
          />
        )}

        <img
          src="/assets/elements/polaroid-frame.png"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            right: isMobile ? 2 : isTablet ? -64 : undefined,
            left: !isMobile && !isTablet ? 500 : undefined,
            bottom: isMobile ? -117 : isTablet ? -69 : -113,
            width: isMobile ? 236 : isTablet ? 243 : 267,
            zIndex: 50,
            pointerEvents: "none",
            transform: "rotate(8deg)",
            filter: "drop-shadow(rgba(0, 0, 0, 0.15) 2px 4px 8px)",
          }}
        />

        <img
          src="/assets/elements/clip.png"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            right: isMobile ? 17 : isTablet ? -47 : -123,
            bottom: isMobile ? 72 : isTablet ? 123 : 102,
            width: isMobile ? 65 : isTablet ? 71 : 75,
            zIndex: 60,
            pointerEvents: "none",
            transform: isMobile ? "rotate(10deg)" : isTablet ? "rotate(15deg)" : "rotate(9deg)",
            filter: "drop-shadow(rgba(0, 0, 0, 0.15) 1px 2px 3px)",
          }}
        />
      </div>
    </div>
  );
}
