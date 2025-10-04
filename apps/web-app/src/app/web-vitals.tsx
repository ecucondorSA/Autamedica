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
      const body = JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        rating: metric.rating,
        navigationType: metric.navigationType
      });

      // Send to analytics endpoint (configure as needed)
      const url = '/api/analytics/vitals';

      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, body);
      } else {
        fetch(url, { body, method: 'POST', keepalive: true });
      }
    }
  });

  return null;
}
