/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@autamedica/types', '@autamedica/shared', '@autamedica/auth'],
  // output: 'export', // Disabled to support dynamic route handlers (OAuth callback)
  trailingSlash: true,
  // distDir: 'out', // Use default .next for OpenNext
  experimental: {
    externalDir: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  poweredByHeader: false,
  compress: true,
  images: {
    domains: ['gtyvdircfhmdjiaelqkg.supabase.co'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  headers: async () => ([
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        {
          key: 'Content-Security-Policy',
          value: "frame-ancestors 'self' https://*.autamedica.com; connect-src 'self' https://*.autamedica.com https://*.supabase.co wss: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.autamedica.com"
        },
        { key: 'Access-Control-Allow-Origin', value: 'https://autamedica.com' },
        { key: 'Access-Control-Allow-Credentials', value: 'true' },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
        },
      ],
    },
  ]),
};

export default nextConfig;