import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "*.cloudflarestorage.com" },
    ],
  },
  serverExternalPackages: ["@aws-sdk/client-s3"],
};

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: false,
  cacheOnNavigation: true,
  reloadOnOnline: false,
  additionalPrecacheEntries: [{ url: "/downloads", revision: "v1" }],
});

export default withSerwist(nextConfig);
