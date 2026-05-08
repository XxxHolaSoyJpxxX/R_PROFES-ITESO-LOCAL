import jwt, { SignOptions } from 'jsonwebtoken';

// ── Helpers ───────────────────────────────────────────────────────────────────
const JWT_SECRET = 'test-secret-jest';

function signToken(payload: object, options: SignOptions = { expiresIn: '1h' }) {
  return jwt.sign(payload, JWT_SECRET, options);
}

function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as any;
}

// ── Tests: JWT ────────────────────────────────────────────────────────────────
describe('JWT — firma y verificación', () => {
  it('firma un token con id y rol', () => {
    const token = signToken({ id: '200', rol: 'ALUMNO' });
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('verifica correctamente el payload', () => {
    const token = signToken({ id: '101', rol: 'PROFESOR' });
    const payload = verifyToken(token);
    expect(payload.id).toBe('101');
    expect(payload.rol).toBe('PROFESOR');
  });

  it('rechaza un token con secret incorrecto', () => {
    const token = jwt.sign({ id: '200' }, 'secret-incorrecto');
    expect(() => verifyToken(token)).toThrow();
  });

  it('rechaza un token expirado', () => {
    const token = signToken({ id: '200', rol: 'ALUMNO' }, { expiresIn: 0 });
    expect(() => verifyToken(token)).toThrow(/expired/);
  });

  it('rechaza un token malformado', () => {
    expect(() => verifyToken('esto.no.es.un.jwt')).toThrow();
  });
});

// ── Tests: Métricas locales (cloudwatch replacement) ──────────────────────────
describe('Métricas locales — publishMetric y getPrometheusMetrics', () => {
  let publishMetric: Function;
  let getPrometheusMetrics: Function;

  beforeEach(() => {
    jest.resetModules();
    const mod = require('../src/utils/cloudwatch');
    publishMetric = mod.publishMetric;
    getPrometheusMetrics = mod.getPrometheusMetrics;
  });

  it('publishMetric no lanza error para HttpResponsesCount', async () => {
    await expect(
      publishMetric({ metricName: 'HttpResponsesCount', value: 1, unit: 'Count', endpoint: '/api/test', statusGroup: '2xx' })
    ).resolves.toBeUndefined();
  });

  it('publishMetric no lanza error para EndpointLatency', async () => {
    await expect(
      publishMetric({ metricName: 'EndpointLatency', value: 42, unit: 'Milliseconds', endpoint: '/api/test' })
    ).resolves.toBeUndefined();
  });

  it('getPrometheusMetrics devuelve texto con cabeceras HELP y TYPE', async () => {
    await publishMetric({ metricName: 'HttpResponsesCount', value: 1, unit: 'Count', endpoint: '/api/health', statusGroup: '2xx' });
    const output = getPrometheusMetrics();
    expect(output).toContain('# HELP');
    expect(output).toContain('# TYPE');
    expect(output).toContain('http_responses_total');
  });

  it('getPrometheusMetrics incluye el endpoint registrado', async () => {
    await publishMetric({ metricName: 'HttpResponsesCount', value: 1, unit: 'Count', endpoint: '/api/alumnos', statusGroup: '2xx' });
    const output = getPrometheusMetrics();
    expect(output).toContain('/api/alumnos');
  });
});

// ── Tests: S3 Config (MinIO) ──────────────────────────────────────────────────
describe('S3Config — configuración de MinIO', () => {
  beforeEach(() => {
    process.env.AWS_REGION = 'us-east-1';
    process.env.MINIO_ENDPOINT = 'http://localhost:9000';
    process.env.AWS_ACCESS_KEY_ID = 'minioadmin';
    process.env.AWS_SECRET_ACCESS_KEY = 'minioadmin123';
    process.env.AWS_BUCKET_NAME = 'iteso-archivos';
    jest.resetModules();
  });

  it('exporta s3Client y bucketName', () => {
    const { S3Config } = require('../src/config/s3.config');
    expect(S3Config).toHaveProperty('s3Client');
    expect(S3Config).toHaveProperty('bucketName');
  });

  it('bucketName toma el valor del env', () => {
    const { S3Config } = require('../src/config/s3.config');
    expect(S3Config.bucketName).toBe('iteso-archivos');
  });

  it('usa bucket por defecto si no hay env', () => {
    delete process.env.AWS_BUCKET_NAME;
    jest.resetModules();
    const { S3Config } = require('../src/config/s3.config');
    expect(S3Config.bucketName).toBe('iteso-archivos');
  });
});

// ── Tests: Validaciones de negocio ────────────────────────────────────────────
describe('Reglas de negocio — calificaciones y roles', () => {
  const ROLES_VALIDOS = ['ADMIN', 'PROFESOR', 'ALUMNO', 'COORDINADOR'];

  it('calificación válida está entre 0 y 100', () => {
    const esValida = (cal: number) => cal >= 0 && cal <= 100;
    expect(esValida(95)).toBe(true);
    expect(esValida(0)).toBe(true);
    expect(esValida(100)).toBe(true);
    expect(esValida(-1)).toBe(false);
    expect(esValida(101)).toBe(false);
  });

  it('puntuación de evaluación válida está entre 1 y 5', () => {
    const esValida = (p: number) => p >= 1 && p <= 5;
    expect(esValida(1)).toBe(true);
    expect(esValida(5)).toBe(true);
    expect(esValida(3)).toBe(true);
    expect(esValida(0)).toBe(false);
    expect(esValida(6)).toBe(false);
  });

  it('rol ALUMNO está en la lista de roles válidos', () => {
    expect(ROLES_VALIDOS).toContain('ALUMNO');
  });

  it('rol COORDINADOR está en la lista de roles válidos', () => {
    expect(ROLES_VALIDOS).toContain('COORDINADOR');
  });

  it('un rol inventado no está en la lista', () => {
    expect(ROLES_VALIDOS).not.toContain('SUPERADMIN');
  });

  it('expediente de alumno es string numérico', () => {
    const esExpedienteValido = (e: string) => /^\d+$/.test(e);
    expect(esExpedienteValido('200')).toBe(true);
    expect(esExpedienteValido('101')).toBe(true);
    expect(esExpedienteValido('abc')).toBe(false);
    expect(esExpedienteValido('')).toBe(false);
  });
});