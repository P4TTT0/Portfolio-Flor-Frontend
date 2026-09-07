import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
    ],
  },
  allowedDevOrigins: ["192.168.0.11", "192.168.0.11:*"],
};

export default nextConfig;