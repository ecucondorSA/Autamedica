import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createNextAppConfig } from '../../config/next-app.config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default createNextAppConfig({
  appDir: __dirname,
  output: 'standalone',
  trailingSlash: true,
  images: {
    unoptimized: false,
    domains: ['ewpsepaieakqbywxnidu.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ewpsepaieakqbywxnidu.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
});
