import {
  FaInstagram,
  FaFacebookF,
  FaXTwitter,
  FaLinkedinIn,
  FaYoutube,
  FaTiktok,
  FaSpotify,
  FaSoundcloud,
  FaGlobe,
} from "react-icons/fa6";
import type { ComponentType } from "react";

export interface PlatformConfig {
  bg: string;
  accent: string;
  icon: ComponentType<{ className?: string }>;
}

export const platformConfig: Record<string, PlatformConfig> = {
  instagram: {
    bg: "#fce8ec",
    accent: "#E4405F",
    icon: FaInstagram,
  },
  facebook: {
    bg: "#e3f0fc",
    accent: "#1877F2",
    icon: FaFacebookF,
  },
  twitter: {
    bg: "#f0f4f8",
    accent: "#000000",
    icon: FaXTwitter,
  },
  linkedin: {
    bg: "#e3f0fa",
    accent: "#0A66C2",
    icon: FaLinkedinIn,
  },
  youtube: {
    bg: "#ffe8e8",
    accent: "#FF0000",
    icon: FaYoutube,
  },
  tiktok: {
    bg: "#f0f0f0",
    accent: "#000000",
    icon: FaTiktok,
  },
  spotify: {
    bg: "#e6f7ed",
    accent: "#1DB954",
    icon: FaSpotify,
  },
  soundcloud: {
    bg: "#fff0e8",
    accent: "#FF5500",
    icon: FaSoundcloud,
  },
};

export function getPlatformConfig(platform: string): PlatformConfig {
  const key = platform.toLowerCase().trim();
  return platformConfig[key] || {
    bg: "#f0f0f0",
    accent: "#333333",
    icon: FaGlobe,
  };
}
