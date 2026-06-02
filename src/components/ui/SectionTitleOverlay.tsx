"use client";

import { useState, useEffect, useRef } from "react";

interface SectionTitleOverlayProps {
  imageSrc: string;
  duration?: number;
  imageWidth?: string;
}

export default function SectionTitleOverlay({
  imageSrc,
  duration = 2000,
  imageWidth = "60vw",
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
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            
            setIsFadingOut(false);
            setIsVisible(true);
            
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

  return (
    <>
      <span ref={sectionRef as React.RefObject<HTMLSpanElement>} className="hidden" aria-hidden="true" />
      
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ 
          zIndex: 100, 
          opacity: isVisible ? 1 : 0,
          transition: isFadingOut ? 'opacity 700ms ease-in-out' : 'none',
          display: isVisible || isFadingOut ? 'flex' : 'none',
        }}
      >
        <img
          src={imageSrc}
          alt=""
          aria-hidden="true"
          style={{
            width: imageWidth,
            height: "auto",
            maxWidth: '98vw',
          }}
        />
      </div>
    </>
  );
}
