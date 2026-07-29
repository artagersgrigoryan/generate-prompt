import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  serverExternalPackages: ["gray-matter"],
  async redirects() {
    // The website tool moved from /generator to /tools/website-prompt-generator.
    // Preserve SEO with permanent (301) redirects, including locale-prefixed URLs.
    return [
      {
        source: "/generator",
        destination: "/en/tools/website-prompt-generator",
        permanent: true,
      },
      {
        source: "/:locale(en|hy|ru)/generator",
        destination: "/:locale/tools/website-prompt-generator",
        permanent: true,
      },
      // The blog has no per-locale translations — hy/ru blog URLs served
      // duplicate English content under a different locale wrapper, which
      // Google flagged as "Discovered - currently not indexed". Collapse
      // them onto the single canonical /en URL instead of indexing 3x.
      {
        source: "/:locale(hy|ru)/blog/:path*",
        destination: "/en/blog/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://www.google-analytics.com",
              "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
