'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { logger } from '@autamedica/shared';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log metrics in development
    if (process.env.NODE_ENV === 'development') {
      logger.info('📊 Web Vital:', metric);
    }

    // Send to analytics in production
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Log to console for Cloudflare Web Analytics integration
      // Cloudflare automatically captures Core Web Vitals when script is injected
      logger.info(`📊 ${metric.name}:`, {
        value: Math.round(metric.value),
        rating: metric.rating,
        id: metric.id
      });

      // Optional: Send to external analytics service
      // Example: Google Analytics 4
      // if (window.gtag) {
      //   window.gtag('event', metric.name, {
      //     value: Math.round(metric.value),
      //     metric_id: metric.id,
      //     metric_rating: metric.rating,
      //     metric_delta: metric.delta
      //   });
      // }

      // Example: Custom analytics endpoint (external service)
      // const analyticsUrl = process.env.NEXT_PUBLIC_ANALYTICS_URL;
      // if (analyticsUrl && navigator.sendBeacon) {
      //   const body = JSON.stringify({ name: metric.name, value: metric.value, rating: metric.rating });
      //   navigator.sendBeacon(analyticsUrl, body);
      // }
    }
  });

  return null;
}
