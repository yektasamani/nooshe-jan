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
    // Default 1mb body limit on Server Actions is too small for a phone
    // photo upload (dish/want-to-try/avatar photos all go through one),
    // and a dish can carry several photos in one submission — so this
    // needs to cover multiple photos at once, not just a single one.
    // proxyClientMaxBodySize gates the request before it even reaches the
    // action (this app has middleware, for Supabase auth) — both need to
    // move together or the lower one silently truncates the upload,
    // surfacing as a raw "Unexpected end of form" parse error instead of
    // a clean size-limit message.
    serverActions: {
      bodySizeLimit: "50mb",
    },
    proxyClientMaxBodySize: "50mb",
  },
};

export default nextConfig;
