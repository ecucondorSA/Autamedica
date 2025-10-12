/** @type {import('next').NextConfig} */
const PUBLIC_ENV_PREFIX = 'NEXT_PUBLIC_';

const publicRuntimeEnv = Object.fromEntries(
  Object.entries(process.env)
    .filter(([key, value]) => key.startsWith(PUBLIC_ENV_PREFIX) && value !== undefined)
);

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@autamedica/types', '@autamedica/shared', '@autamedica/auth'],
  output: 'standalone', // Required for OpenNext.js Cloudflare
  trailingSlash: false,
  env: publicRuntimeEnv,
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
    unoptimized: true, // Disable optimization for Cloudflare Pages compatibility
    domains: ['ewpsepaieakqbywxnidu.supabase.co'],
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
    // API routes handle their own CORS
    {
      source: '/api/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
      ],
    },
    // All other routes get security headers
    {
      source: '/((?!api).*)',
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        {
          key: 'Content-Security-Policy',
          value: "frame-ancestors 'self' https://*.autamedica.com; connect-src 'self' https://*.autamedica.com https://*.supabase.co wss: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.autamedica.com https://*.cloudflare.com https://*.cloudflareinsights.com"
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
