"use client";

import { useState, useEffect, useRef } from "react";

interface SectionTitleOverlayProps {
  title: string;
  duration?: number;
  textColor?: string;
  effect?: "layered" | "marquee" | "wiggle";
}

export default function SectionTitleOverlay({
  title,
  duration = 2000,
  textColor = "#3D3D3D",
  effect = "layered",
}: SectionTitleOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const section = sectionRef.current?.closest("section");
    if (!section) return;

    sectionRef.current = section;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Clear any existing timeout
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            
            // Instant appearance (no fade-in)
            setIsFadingOut(false);
            setIsVisible(true);
            
            // Schedule fade out
            timeoutRef.current = setTimeout(() => {
              setIsFadingOut(true);
              setIsVisible(false);
            }, duration);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [duration]);

  // Marquee effect for Demos
  if (effect === "marquee") {
    const repeatedText = Array(16).fill(title).join(" • ");
    
    return (
      <>
        <span ref={sectionRef as React.RefObject<HTMLSpanElement>} className="hidden" aria-hidden="true" />
        
        {/* Top marquee - left to right */}
        <div
          className="absolute left-0 right-0 pointer-events-none overflow-hidden"
          style={{ 
            top: '0.5vh',
            zIndex: 20, 
            opacity: isVisible ? 1 : 0,
            transition: isFadingOut ? 'opacity 700ms ease-in-out' : 'none',
            display: isVisible || isFadingOut ? 'block' : 'none'
          }}
        >
          <div className="marquee-ltr font-cormorant-garamond font-bold text-[3vw] tracking-tight whitespace-nowrap" style={{ color: textColor }}>
            {repeatedText}
          </div>
        </div>

        {/* Bottom marquee - right to left */}
        <div
          className="absolute left-0 right-0 pointer-events-none overflow-hidden"
          style={{ 
            bottom: '0.5vh',
            zIndex: 20, 
            opacity: isVisible ? 1 : 0,
            transition: isFadingOut ? 'opacity 700ms ease-in-out' : 'none',
            display: isVisible || isFadingOut ? 'block' : 'none'
          }}
        >
          <div className="marquee-rtl font-cormorant-garamond font-bold text-[3vw] tracking-tight whitespace-nowrap" style={{ color: textColor }}>
            {repeatedText}
          </div>
        </div>
      </>
    );
  }

  // Wiggle effect for Redes (handwritten style)
  if (effect === "wiggle") {
    return (
      <>
        <span ref={sectionRef as React.RefObject<HTMLSpanElement>} className="hidden" aria-hidden="true" />
        
        <div
          className="absolute inset-0 flex items-start justify-center pointer-events-none"
          style={{ 
            zIndex: 100, 
            opacity: isVisible ? 1 : 0,
            transition: isFadingOut ? 'opacity 700ms ease-in-out' : 'none',
            display: isVisible || isFadingOut ? 'flex' : 'none',
            paddingTop: '0.5vh'
          }}
        >
          <div className="wiggle-handwritten">
            <h2
              className="font-heading font-black tracking-tight whitespace-nowrap"
              style={{
                color: textColor,
                fontSize: `calc(100vw / ${title.length * 0.6})`
              }}
              aria-hidden="true"
            >
              {title}
            </h2>
          </div>
        </div>
      </>
    );
  }

  // Layered effect for Samples
  return (
    <>
      <span ref={sectionRef as React.RefObject<HTMLSpanElement>} className="hidden" aria-hidden="true" />
      
      {/* Layer 0: Solid text (BELOW section content) */}
      <div
        className="absolute inset-0 flex items-start justify-center pointer-events-none"
        style={{ 
          zIndex: 10, 
          opacity: isVisible ? 1 : 0,
          transition: isFadingOut ? 'opacity 700ms ease-in-out' : 'none',
          display: isVisible || isFadingOut ? 'flex' : 'none',
          paddingTop: '0.5vh'
        }}
      >
        <div>
          <h2
            className="font-league-spartan font-black tracking-tight whitespace-nowrap section-title-float"
            style={{ 
              color: textColor,
              fontSize: `calc(100vw / ${title.length * 0.6})`
            }}
            aria-hidden="true"
          >
            {title}
          </h2>
        </div>
      </div>

      {/* Layer 2: Outline text (ABOVE section content) */}
      <div
        className="absolute inset-0 flex items-start justify-center pointer-events-none"
        style={{ 
          zIndex: 100, 
          opacity: isVisible ? 1 : 0,
          transition: isFadingOut ? 'opacity 700ms ease-in-out' : 'none',
          display: isVisible || isFadingOut ? 'flex' : 'none',
          paddingTop: '0.5vh'
        }}
      >
        <div>
          <h2
            className="font-league-spartan font-black tracking-tight whitespace-nowrap section-title-float"
            style={{
              color: "transparent",
              WebkitTextStroke: `2px ${textColor}`,
              fontSize: `calc(100vw / ${title.length * 0.6})`
            }}
            aria-hidden="true"
          >
            {title}
          </h2>
        </div>
      </div>
    </>
  );
}
