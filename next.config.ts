import type { NextConfig } from "next";

process.env.BROWSERSLIST_IGNORE_OLD_DATA ??= "true";
process.env.BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA ??= "true";

const getHostname = (value: string | undefined) => {
  if (!value) return null;

  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
};

const supabaseHostname =
  getHostname(process.env.NEXT_PUBLIC_SUPABASE_URL) ??
  getHostname(process.env.SUPABASE_URL);

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "montesion.me/camp",
      },
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
