/**
 * Global Next.js configuration focused on security headers.
 * Individual apps can extend this configuration if they need overrides.
 */

const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self';",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
