import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    '@autamedica/types',
    '@autamedica/shared',
    '@autamedica/auth',
    '@autamedica/hooks',
    '@autamedica/ui',
    '@autamedica/utils',
    '@autamedica/telemedicine'
  ],
  experimental: {
    externalDir: true,
  },
  outputFileTracingRoot: path.join(__dirname, '../../'),
  webpack: (config) => {
    config.resolve.alias = config.resolve.alias || {}
    config.resolve.alias['@autamedica/auth-hooks'] = path.resolve(__dirname, '../../packages/auth/src/hooks')
    config.resolve.extensions.push('.ts', '.tsx')
    config.resolve.symlinks = true
    return config
  }
};

export default nextConfig;
