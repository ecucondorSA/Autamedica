import path from 'node:path';

const DEFAULT_TRANSPILE_PACKAGES = [
  '@autamedica/types',
  '@autamedica/shared',
  '@autamedica/auth',
  '@autamedica/hooks',
  '@autamedica/ui',
  '@autamedica/utils',
  '@autamedica/telemedicine',
  '@autamedica/session',
  '@autamedica/config',
  '@autamedica/supabase-client',
];

const PUBLIC_ENV_PREFIX = 'NEXT_PUBLIC_';

const unique = (items) => Array.from(new Set(items.filter(Boolean)));

const collectPublicRuntimeEnv = () => Object.fromEntries(
  Object.entries(process.env)
    .filter(([key, value]) => key.startsWith(PUBLIC_ENV_PREFIX) && value !== undefined)
);

export function createNextAppConfig({
  appDir,
  output = 'standalone',
  extraTranspile = [],
  aliasAuthHooks = true,
  includeImagesConfig = true,
  ignoreLintDuringBuild = true,
  ignoreTypeErrorsDuringBuild = true,
  extendConfig = {},
  extendWebpack,
} = {}) {
  if (!appDir) {
    throw new Error('createNextAppConfig requires `appDir` to be provided');
  }

  const runtimeEnv = {
    ...collectPublicRuntimeEnv(),
    ...(extendConfig.env ?? {}),
  };

  const config = {
    trailingSlash: true,
    output,
    poweredByHeader: false,
    env: runtimeEnv,
    experimental: {
      externalDir: true,
      ...(extendConfig.experimental ?? {}),
    },
    transpilePackages: unique([
      ...DEFAULT_TRANSPILE_PACKAGES,
      ...extraTranspile,
      ...(extendConfig.transpilePackages ?? []),
    ]),
  };

  if (includeImagesConfig) {
    config.images = extendConfig.images ?? { unoptimized: true };
  } else if (extendConfig.images) {
    config.images = extendConfig.images;
  }

  if (ignoreLintDuringBuild) {
    config.eslint = extendConfig.eslint ?? { ignoreDuringBuilds: true };
  } else if (extendConfig.eslint) {
    config.eslint = extendConfig.eslint;
  }

  if (ignoreTypeErrorsDuringBuild) {
    config.typescript = extendConfig.typescript ?? { ignoreBuildErrors: true };
  } else if (extendConfig.typescript) {
    config.typescript = extendConfig.typescript;
  }

  const authHooksPath = path.resolve(appDir, '../../packages/auth/src/hooks');

  const baseWebpack = (webpackConfig) => {
    const nextConfig = webpackConfig;
    nextConfig.resolve = nextConfig.resolve ?? {};
    nextConfig.resolve.alias = { ...(nextConfig.resolve.alias ?? {}) };
    if (aliasAuthHooks && !nextConfig.resolve.alias['@autamedica/auth-hooks']) {
      nextConfig.resolve.alias['@autamedica/auth-hooks'] = authHooksPath;
    }
    nextConfig.resolve.extensions = unique([...(nextConfig.resolve.extensions ?? []), '.ts', '.tsx']);
    nextConfig.resolve.symlinks = true;
    return nextConfig;
  };

  if (extendConfig.webpack || extendWebpack) {
    const userWebpack = extendWebpack ?? extendConfig.webpack;
    config.webpack = (webpackConfig, ...rest) => {
      const updated = baseWebpack(webpackConfig);
      return userWebpack(updated, ...rest);
    };
  } else {
    config.webpack = baseWebpack;
  }

  config.outputFileTracingRoot = extendConfig.outputFileTracingRoot
    ?? path.join(appDir, '../../');

  // Merge remaining config overrides (shallow)
  for (const [key, value] of Object.entries(extendConfig)) {
    if (['experimental', 'transpilePackages', 'images', 'eslint', 'typescript', 'webpack', 'outputFileTracingRoot', 'env'].includes(key)) {
      continue;
    }
    config[key] = value;
  }

  return config;
}
