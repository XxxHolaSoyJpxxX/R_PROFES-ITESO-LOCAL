/**
 * cloudwatch.ts — VERSIÓN LOCAL
 *
 * Reemplaza AWS CloudWatch por métricas en memoria expuestas en formato
 * Prometheus text (GET /metrics).  El middleware metricsMiddleware.ts
 * llama exactamente las mismas funciones; no necesita cambios.
 */

export interface PublishMetricOptions {
  metricName:   string;
  value:        number;
  unit:         string;
  endpoint:     string;
  statusGroup?: string;
}

// ── Almacén en memoria ────────────────────────────────────────────────────────
const counters:  Record<string, number>   = {};
const latencies: Record<string, number[]> = {};

export async function publishMetric(opts: PublishMetricOptions): Promise<void> {
  const key = `${opts.metricName}|${opts.endpoint}|${opts.statusGroup ?? 'all'}`;

  if (opts.metricName === 'HttpResponsesCount') {
    counters[key] = (counters[key] ?? 0) + opts.value;
  } else if (opts.metricName === 'EndpointLatency') {
    if (!latencies[key]) latencies[key] = [];
    latencies[key].push(opts.value);
  }
}

/** Texto en formato Prometheus scrape para el endpoint GET /metrics */
export function getPrometheusMetrics(): string {
  const lines: string[] = [];

  lines.push('# HELP http_responses_total Respuestas HTTP por endpoint y código');
  lines.push('# TYPE http_responses_total counter');
  for (const [key, count] of Object.entries(counters)) {
    const [, endpoint, status] = key.split('|');
    lines.push(`http_responses_total{endpoint="${endpoint}",status="${status}"} ${count}`);
  }

  lines.push('# HELP endpoint_latency_ms Latencia promedio (ms) por endpoint');
  lines.push('# TYPE endpoint_latency_ms gauge');
  for (const [key, vals] of Object.entries(latencies)) {
    const [, endpoint] = key.split('|');
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    lines.push(`endpoint_latency_ms{endpoint="${endpoint}"} ${avg.toFixed(2)}`);
  }

  return lines.join('\n') + '\n';
}

export default publishMetric;
