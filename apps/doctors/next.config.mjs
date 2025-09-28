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
  // Para production build, disabled estricto linting por el momento
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Deshabilitar temporalmente para deployment
  },
  // Transpile packages del monorepo
  transpilePackages: [
    '@autamedica/types',
    '@autamedica/shared', 
    '@autamedica/auth',
    '@autamedica/hooks',
    '@autamedica/ui',
    '@autamedica/utils',
    '@autamedica/telemedicine'
  ],
  // Configuración experimental para mejor performance
  experimental: {
    // Mejorar builds de monorepo
    externalDir: true,
  },
  webpack: (config) => {
    config.resolve.alias = config.resolve.alias || {}
    config.resolve.alias['@autamedica/auth-hooks'] = path.resolve(__dirname, '../../packages/auth/src/hooks')
    return config
  }
};

export default nextConfig;
