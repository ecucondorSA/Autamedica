# Cloudflare Deployment Guide for Altamedica Web App

This guide outlines the recommended configuration for deploying the Altamedica web app (`web-app`) to Cloudflare Pages.

## Build Settings

In the Cloudflare Pages project settings, use the following configuration:

*   **Framework preset:** `Next.js`
*   **Build command:** `pnpm build:cloudflare`
*   **Build output directory:** `.vercel/output/static`
*   **Root directory:** `apps/web-app`

## Environment Variables

All necessary environment variables from `.env.production` should be added to the "Environment variables" section of your Cloudflare Pages project settings.

## Node.js Version

To ensure compatibility, it is recommended to create a `.nvmrc` file in the root of the repository with the desired Node.js version. For example:

```
18.17.1
```

This will ensure that Cloudflare Pages uses the correct Node.js version to build the application.