/**
 * Redirect validation to prevent open redirect vulnerabilities
 * Validates URLs against whitelist patterns
 */

/**
 * Get allowed redirect patterns from environment
 * Example: "https://autamedica-*.pages.dev,https://*.autamedica.com"
 */
function getAllowedPatterns(): string[] {
  const envPatterns = process.env.NEXT_PUBLIC_ALLOWED_REDIRECTS || '';
  const patterns = envPatterns
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  // Always include our known Cloudflare Pages URLs
  const defaultPatterns = [
    process.env.NEXT_PUBLIC_BASE_URL_PATIENTS,
    process.env.NEXT_PUBLIC_BASE_URL_DOCTORS,
    process.env.NEXT_PUBLIC_BASE_URL_COMPANIES,
    process.env.NEXT_PUBLIC_BASE_URL_ADMIN,
    process.env.NEXT_PUBLIC_BASE_URL_WEB_APP,
  ].filter((url): url is string => Boolean(url));

  return [...patterns, ...defaultPatterns];
}

/**
 * Check if a URL is allowed for redirect
 * Prevents open redirect vulnerabilities
 */
export function isAllowedRedirect(urlStr?: string | null): boolean {
  if (!urlStr) {
    return false;
  }

  try {
    const url = new URL(urlStr);
    const patterns = getAllowedPatterns();

    return patterns.some(pattern => {
      if (!pattern) return false;

      // Exact match
      if (url.origin === pattern || url.href.startsWith(pattern)) {
        return true;
      }

      // Wildcard pattern match (e.g., https://autamedica-*.pages.dev)
      if (pattern.includes('*')) {
        const regexPattern = pattern
          .replace(/\./g, '\\.')
          .replace(/\*/g, '.*');
        const regex = new RegExp(`^${regexPattern}`);
        return regex.test(url.origin) || regex.test(url.href);
      }

      return false;
    });
  } catch {
    // Invalid URL
    return false;
  }
}

/**
 * Get safe redirect URL or fallback
 * Use this for all redirect operations
 */
export function safeRedirectOrFallback(
  urlStr: string | null | undefined,
  fallback: string
): string {
  return isAllowedRedirect(urlStr) ? urlStr! : fallback;
}

/**
 * Build safe login redirect URL
 * Ensures returnTo parameter is validated
 */
export function buildSafeLoginUrl(
  portal: string,
  returnTo?: string | null,
  error?: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_WEB_APP || 'http://localhost:3000';
  const loginUrl = new URL('/auth/login', baseUrl);

  loginUrl.searchParams.set('portal', portal);

  if (returnTo && isAllowedRedirect(returnTo)) {
    loginUrl.searchParams.set('returnTo', returnTo);
  }

  if (error) {
    loginUrl.searchParams.set('error', error);
  }

  return loginUrl.toString();
}

/**
 * Check if two URLs are from the same origin
 * Used for security checks in redirects
 */
export function isSameOrigin(url1: string, url2: string): boolean {
  try {
    const urlA = new URL(url1);
    const urlB = new URL(url2);
    return urlA.origin === urlB.origin;
  } catch {
    return false;
  }
}

/**
 * Sanitize return URL by validating and normalizing
 * Returns null if URL is invalid or not allowed
 */
export function sanitizeReturnUrl(urlStr?: string | null): string | null {
  if (!urlStr) {
    return null;
  }

  // Trim whitespace
  const trimmed = urlStr.trim();

  // Must be absolute URL or relative path starting with /
  if (!trimmed.startsWith('http') && !trimmed.startsWith('/')) {
    return null;
  }

  // If absolute URL, check if allowed
  if (trimmed.startsWith('http')) {
    return isAllowedRedirect(trimmed) ? trimmed : null;
  }

  // Relative URL - ensure it's safe (no protocol-relative URLs)
  if (trimmed.startsWith('//')) {
    return null;
  }

  return trimmed;
}