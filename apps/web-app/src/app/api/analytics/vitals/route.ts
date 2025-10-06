import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@autamedica/shared';

/**
 * API Route para recibir métricas de Web Vitals
 *
 * Métricas capturadas:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 * - INP (Interaction to Next Paint)
 */

interface WebVitalMetric {
  name: string;
  value: number;
  id: string;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType: string;
}

export async function POST(request: NextRequest) {
  try {
    const metric: WebVitalMetric = await request.json();

    // Validar que la métrica tenga los campos necesarios
    if (!metric.name || typeof metric.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      );
    }

    // Loggear la métrica (en producción, enviar a servicio de analytics)
    logger.info('📊 Web Vital Received:', {
      name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
      id: metric.id,
      navigationType: metric.navigationType
    });

    // TODO: En producción, enviar a servicio de analytics
    // - Google Analytics
    // - Cloudflare Web Analytics
    // - Custom analytics service
    // Ejemplo:
    // await sendToAnalytics(metric);

    return NextResponse.json(
      { success: true, metric: metric.name },
      { status: 200 }
    );

  } catch (error) {
    logger.error('Error processing web vital:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Método GET para health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/analytics/vitals',
    methods: ['POST'],
    description: 'Web Vitals analytics endpoint'
  });
}
