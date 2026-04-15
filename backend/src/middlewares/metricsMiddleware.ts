import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';
import { publishMetric } from '../utils/cloudwatch';

function resolveEndpoint(req: Request): string {
  const base = req.baseUrl || '';
  const routePath = (req as any).route?.path;
  if (routePath) return base && base !== '/' ? `${base}${routePath}` : routePath;
  return req.originalUrl || req.path || '/';
}

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = performance.now();

  res.on('finish', async () => {
    const durationMs = performance.now() - start;
    const status = res.statusCode;
    let statusGroup: string | undefined;
    if (status >= 200 && status <= 299)      statusGroup = '2xx';
    else if (status >= 400 && status <= 499) statusGroup = '4xx';
    else if (status >= 500 && status <= 599) statusGroup = '5xx';

    const endpoint = resolveEndpoint(req);
    try {
      await publishMetric({ metricName: 'HttpResponsesCount', value: 1, unit: 'Count', endpoint, statusGroup });
      await publishMetric({ metricName: 'EndpointLatency', value: durationMs, unit: 'Milliseconds', endpoint });
    } catch (err) {
      console.error('metricsMiddleware error:', (err as Error).message);
    }
  });

  next();
}

export default metricsMiddleware;
