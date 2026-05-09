"use client";

import type { SocialItem } from "@/lib/use-sanity-content";
import { getPlatformConfig } from "@/lib/platform-config";
import { randomRotation } from "@/lib/youtube-utils";

interface SocialCardProps {
  social: SocialItem;
}

export default function SocialCard({ social }: SocialCardProps) {
  const config = getPlatformConfig(social.platform);
  const rotation = randomRotation(-3, 3);
  const Icon = config.icon;

  return (
    <a
      href={social.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block w-full"
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-label={`Visitar perfil de ${social.platform}`}
    >
      {/* Washi tape — positioned ABOVE the card */}
      <div
        className="relative mx-auto w-9 h-3 rounded-sm z-20"
        style={{
          backgroundColor: config.accent,
          opacity: 0.3,
          backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 2px, ${config.accent}22 2px, ${config.accent}22 4px)`,
          marginBottom: "-4px",
        }}
      />

      {/* Post-it card — fixed height, fills column width */}
      <div
        className="relative w-full rounded-sm shadow-[3px_4px_14px_rgba(0,0,0,0.15)] transition-[filter] duration-200 group-hover:brightness-95 flex flex-col"
        style={{
          backgroundColor: config.bg,
          height: "170px",
        }}
      >
        {/* Card content */}
        <div className="px-3 sm:px-4 pt-2 pb-3 flex flex-col flex-1">
          {/* Header: Icon + Platform name */}
          <div className="flex items-start gap-2.5 mb-1.5">
            {/* Icon box */}
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: config.accent }}
            >
              <Icon className="w-4 h-4 text-white" />
            </div>

            {/* Platform name + username */}
            <div className="min-w-0">
              <p className="font-body text-sm font-bold text-neutral-900 leading-tight truncate">
                {social.platform}
              </p>
              {social.username && (
                <p
                  className="font-body text-xs font-semibold truncate mt-0.5"
                  style={{ color: config.accent }}
                >
                  {social.username}
                </p>
              )}
            </div>
          </div>

          {/* Dotted separator */}
          <div
            className="border-t border-dotted my-1.5"
            style={{ borderColor: `${config.accent}33` }}
          />

          {/* Description */}
          {social.description && (
            <p className="font-body text-xs text-neutral-700 leading-snug line-clamp-2 mb-auto">
              {social.description}
            </p>
          )}

          {/* CTA */}
          <p
            className="font-body text-xs font-semibold mt-auto pt-1"
            style={{ color: config.accent }}
          >
            Visitar &rarr;
          </p>
        </div>
      </div>
    </a>
  );
}
