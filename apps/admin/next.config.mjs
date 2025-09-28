/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@autamedica/ui', '@autamedica/shared'],
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;