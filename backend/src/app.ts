import express, { Request, Response } from 'express';
import path from 'path';
import routes from './routes/routes';
import metricsMiddleware from './middlewares/metricsMiddleware';
import { getPrometheusMetrics } from './utils/cloudwatch';

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

// Métricas (reemplaza CloudWatch — Prometheus hace scraping aquí)
app.use(metricsMiddleware);
app.get('/metrics', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(getPrometheusMetrics());
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api', routes);

const angularDistPath = path.join(__dirname, 'public', 'browser');
app.use(express.static(angularDistPath));

app.get(/^(?!\/api).*/, (req: Request, res: Response) => {
  res.sendFile(path.join(angularDistPath, 'index.html'));
});

app.use(/^\/api\/.*/, (req: Request, res: Response) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

export default app;
