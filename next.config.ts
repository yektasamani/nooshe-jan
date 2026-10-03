import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    // Photos no longer travel through Server Actions at all (uploaded
    // client-side straight to Supabase Storage — see
    // src/lib/upload-client.ts — since Vercel enforces a hard,
    // non-configurable 4.5MB request body limit on serverless functions
    // in production, which no setting here can raise). Forms now only
    // carry text fields and already-uploaded URLs, so this just needs
    // modest headroom above the 1mb default, not photo-sized limits.
    serverActions: {
      bodySizeLimit: "2mb",
    },
    proxyClientMaxBodySize: "2mb",
  },
};

export default nextConfig;
