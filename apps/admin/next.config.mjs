/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@autamedica/ui', '@autamedica/shared'],
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;