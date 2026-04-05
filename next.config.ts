import type { NextConfig } from "next";

const vercelOrigin =
  process.env.VERCEL_URL && !process.env.VERCEL_URL.startsWith("http")
    ? `https://${process.env.VERCEL_URL}`
    : process.env.VERCEL_URL;

/** NextAuth client (`next-auth/react`) reads `NEXTAUTH_URL`; mirror `AUTH_URL` so signOut/session URLs match the deployed host on Vercel. */
const nextAuthPublicUrl =
  process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? vercelOrigin ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    NEXTAUTH_URL: nextAuthPublicUrl,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(self), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
