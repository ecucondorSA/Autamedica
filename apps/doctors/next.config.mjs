import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createNextAppConfig } from '../../config/next-app.config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default createNextAppConfig({
  appDir: __dirname,
  extendConfig: {
    // 🚀 Optimizaciones de performance para doctors portal
    compress: true,

    // Optimización de imágenes
    images: {
      unoptimized: false, // Habilitar optimización de imágenes
      formats: ['image/webp', 'image/avif'],
      minimumCacheTTL: 60,
      deviceSizes: [640, 750, 828, 1080, 1200, 1920],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },

    // Modularize Imports - Optimizar lucide-react
    modularizeImports: {
      'lucide-react': {
        transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
        skipDefaultConversion: true
      }
    },

    // Configuración experimental de performance
    experimental: {
      optimizePackageImports: ['lucide-react', '@livekit/components-react'],
      externalDir: true,
    },

    // Webpack optimizations
    webpack: (config, { isServer }) => {
      // Split chunks optimization
      if (!isServer) {
        config.optimization = {
          ...config.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              default: false,
              vendors: false,
              // Vendor chunk para node_modules
              vendor: {
                name: 'vendor',
                chunks: 'all',
                test: /node_modules/,
                priority: 20,
              },
              // Chunk separado para lucide-react (pesado)
              lucide: {
                name: 'lucide-icons',
                test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
                chunks: 'all',
                priority: 30,
              },
              // Chunk separado para LiveKit
              livekit: {
                name: 'livekit',
                test: /[\\/]node_modules[\\/]@livekit[\\/]/,
                chunks: 'async',
                priority: 25,
              },
              // Common chunk
              common: {
                name: 'common',
                minChunks: 2,
                chunks: 'async',
                priority: 10,
                reuseExistingChunk: true,
                enforce: true,
              },
            },
          },
        };
      }

      return config;
    },
  },
});
