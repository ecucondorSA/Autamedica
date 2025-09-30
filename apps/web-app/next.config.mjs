/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to enable SSR for auth components
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true }
};

export default nextConfig;