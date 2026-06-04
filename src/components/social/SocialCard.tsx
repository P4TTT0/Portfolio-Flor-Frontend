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
      {/* Post-it card — large, centered */}
      <div
        className="relative w-full rounded-sm shadow-[6px_8px_24px_rgba(0,0,0,0.2)] transition-[filter] duration-200 group-hover:brightness-95 flex flex-col h-[60vh] min-h-[300px] sm:h-[65vh] md:h-[480px]"
        style={{
          backgroundColor: config.bg,
        }}
      >
        {/* Card content */}
        <div className="px-8 sm:px-10 pt-6 pb-8 flex flex-col flex-1">
          {/* Header: Icon + Platform name */}
          <div className="flex items-start gap-4 mb-4">
            {/* Icon box */}
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: config.accent }}
            >
              <Icon className="w-8 h-8 text-white" />
            </div>

            {/* Platform name + username */}
            <div className="min-w-0">
              <p className="font-body text-2xl font-bold text-neutral-900 leading-tight truncate">
                {social.platform}
              </p>
              {social.username && (
                <p
                  className="font-body text-lg font-semibold truncate mt-1"
                  style={{ color: config.accent }}
                >
                  {social.username}
                </p>
              )}
            </div>
          </div>

          {/* Dotted separator */}
          <div
            className="border-t border-dotted my-4"
            style={{ borderColor: `${config.accent}33` }}
          />

          {/* Description */}
          {social.description && (
            <p className="font-body text-base text-neutral-700 leading-relaxed line-clamp-4 mb-auto">
              {social.description}
            </p>
          )}

          {/* CTA */}
          <p
            className="font-body text-lg font-semibold mt-auto pt-4"
            style={{ color: config.accent }}
          >
            Visitar &rarr;
          </p>
        </div>
      </div>
    </a>
  );
}
