const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  transpilePackages: [
    "@autamedica/types",
    "@autamedica/shared",
    "@autamedica/auth",
    "@autamedica/hooks"
  ],
  async headers() {
    const isDevelopment = process.env.NODE_ENV === "development";
    const isStaging = process.env.NODE_ENV === "staging";
    const isProduction = process.env.NODE_ENV === "production";

    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "media-src 'self' blob:",
      "connect-src 'self' https://*.supabase.co https://*.supabase.io https://api.autamedica.com https://*.sentry.io wss://*.supabase.co",
      "frame-src 'self' https://www.google.com",
      "worker-src 'self' blob:",
      "child-src 'self' blob:",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "manifest-src 'self'"
    ];

    if (isDevelopment) {
      cspDirectives[1] = "script-src 'self' 'unsafe-eval' 'unsafe-inline' *";
      cspDirectives[4] = "connect-src 'self' http://localhost:* ws://localhost:* https://*.supabase.co https://*.sentry.io wss://*.supabase.co";
    }

    const securityHeaders = [
      {
        key: "Content-Security-Policy",
        value: cspDirectives.join("; ")
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload"
      },
      {
        key: "X-Frame-Options",
        value: "DENY"
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff"
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin"
      },
      {
        key: "X-DNS-Prefetch-Control",
        value: "off"
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()"
      },
      {
        key: "Cache-Control",
        value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
      },
      {
        key: "Expires",
        value: "0"
      },
      {
        key: "Pragma",
        value: "no-cache"
      },
      {
        key: "ETag",
        value: `"${Date.now()}-${Math.random().toString(36).substr(2, 9)}"`
      },
      {
        key: "X-Robots-Tag",
        value: isProduction ? "index, follow" : "noindex, nofollow"
      },
      {
        key: "X-Medical-Data-Protection",
        value: "HIPAA-Compliant"
      }
    ];

    if (isDevelopment) {
      securityHeaders.push({
        key: "X-Development-Mode",
        value: "true"
      });
    }

    if (isStaging) {
      securityHeaders.push({
        key: "X-Staging-Environment",
        value: "true"
      });
    }

    return [
      {
        source: "/(.*)",
        headers: securityHeaders
      },
      {
        source: "/api/(.*)",
        headers: [
          ...securityHeaders,
          {
            key: "X-API-Medical-Data",
            value: "Protected"
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true"
          },
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NEXT_PUBLIC_APP_URL || "https://autamedica.com"
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS"
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Requested-With"
          }
        ]
      }
    ];
  },
  async redirects() {
    return [
      ...(process.env.NODE_ENV === "production"
        ? [
            {
              source: "/(.*)",
              has: [
                {
                  type: "host",
                  value: "www.autamedica.com"
                }
              ],
              destination: "https://autamedica.com/:path*",
              permanent: true
            }
          ]
        : []),
      {
        source: "/health",
        destination: "/api/health",
        permanent: false
      }
    ];
  },
};

export default nextConfig;
