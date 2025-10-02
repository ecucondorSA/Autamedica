import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  transpilePackages: [
    '@autamedica/types',
    '@autamedica/shared',
    '@autamedica/auth',
    '@autamedica/hooks',
    '@autamedica/telemedicine'
  ],
  experimental: {
    externalDir: true,
  },
  outputFileTracingRoot: path.join(__dirname, '../../'),
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.alias = config.resolve.alias || {}
    config.resolve.alias['@autamedica/auth-hooks'] = path.resolve(__dirname, '../../packages/auth/src/hooks')
    return config
  }
};

export default nextConfig;
