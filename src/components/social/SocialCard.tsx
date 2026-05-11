"use client";

import type { SocialItem } from "@/lib/use-sanity-content";
import { getPlatformConfig } from "@/lib/platform-config";

interface SocialCardProps {
  social: SocialItem;
  index: number;
}

export default function SocialCard({ social, index }: SocialCardProps) {
  const config = getPlatformConfig(social.platform);
  const Icon = config.icon;

  // Alternating rotation: even = 1.6deg, odd = -1.6deg
  const rotation = index % 2 === 0 ? 1.6 : -1.6;

  return (
    <a
      href={social.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block w-full"
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-label={`Visitar perfil de ${social.platform}`}
    >
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
