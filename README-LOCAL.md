# ITESO Nube — Versión Local

Corre todo el stack sin ninguna cuenta de nube. Un solo comando levanta todo.

## Equivalencias cloud → local

| Servicio AWS/Nube  | Reemplazo local      | Puerto         |
|--------------------|----------------------|----------------|
| AWS RDS (MySQL)    | MySQL en Docker      | 3306           |
| MongoDB Atlas      | MongoDB en Docker    | 27017          |
| AWS S3             | MinIO                | 9000 (API), 9001 (UI) |
| AWS CloudWatch     | Prometheus + Grafana | 9090 / 3001    |
| Google OAuth       | **Keycloak** (OIDC)  | 8080           |
| Backend            | Node.js (igual)      | 3000           |

## Requisitos

- Docker Desktop (o Docker Engine + Compose v2)
- Node.js 20+ (solo si quieres correr el backend fuera de Docker)

## Levantar todo

```bash
docker compose up -d --build
```

Espera ~60 segundos la primera vez (Keycloak tarda en arrancar).

## URLs de acceso

| Interfaz              | URL                              | Usuario / Contraseña     |
|-----------------------|----------------------------------|--------------------------|
| **App**               | http://localhost:3000            | —                        |
| **Keycloak Admin**    | http://localhost:8080            | admin / admin123         |
| **MinIO Console**     | http://localhost:9001            | minioadmin / minioadmin123 |
| **Grafana**           | http://localhost:3001            | admin / admin123         |
| **Prometheus**        | http://localhost:9090            | —                        |

## Usuarios de prueba (Keycloak)

| Usuario          | Contraseña    | Rol         |
|------------------|---------------|-------------|
| admin@iteso.mx   | Admin123!     | Coordinador |
| profesor@iteso.mx| Profesor123!  | Profesor    |
| alumno@iteso.mx  | Alumno123!    | Alumno      |

## Cómo funciona el login con Keycloak

El flujo es idéntico al de Google OAuth — solo cambia quién emite el token:

```
Frontend → Keycloak (login con email/contraseña)
Keycloak → devuelve id_token OIDC
Frontend → POST /api/auth/google  { credential: "<id_token>" }
Backend  → verifica id_token contra Keycloak JWKS
Backend  → firma su propio JWT y lo devuelve
```

Para agregar más usuarios: entra a http://localhost:8080 → realm "iteso" → Users.

## Desarrollo local (sin Docker para el backend)

```bash
# Levanta solo las bases de datos y servicios
docker compose up -d mysql mongodb minio keycloak

# Corre el backend en tu máquina
cd backend
cp ../.env .env          # ajusta los hosts: mysql→localhost, mongodb→localhost, etc.
npm install
npm run dev
```

Cambios en `.env` para correr el backend fuera de Docker:
```
RDB_HOST=localhost
MONGO_URI=mongodb://root:rootpassword@localhost:27017/iteso_nube?authSource=admin
MINIO_ENDPOINT=http://localhost:9000
KEYCLOAK_ISSUER=http://localhost:8080/realms/iteso
```

## Detener todo

```bash
docker compose down          # detiene contenedores, conserva datos
docker compose down -v       # detiene y borra datos (reset completo)
```

## Archivos modificados vs. original

| Archivo                                      | Cambio                                      |
|----------------------------------------------|---------------------------------------------|
| `backend/src/config/s3.config.ts`            | Agrega `endpoint` y `forcePathStyle` (MinIO)|
| `backend/src/config/google.config.ts`        | Agrega campo `issuer` (Keycloak)            |
| `backend/src/services/googleAuth.service.ts` | Verifica token contra Keycloak JWKS         |
| `backend/src/utils/cloudwatch.ts`            | Métricas en memoria (formato Prometheus)    |
| `backend/src/middlewares/metricsMiddleware.ts`| Sin cambios funcionales                     |
| `backend/src/app.ts`                         | Agrega `GET /metrics` para Prometheus       |
| `backend/package.json`                       | Agrega `jose`, quita SDK de CloudWatch      |
| `docker-compose.yml`                         | Nuevo — define todos los servicios          |
| `.env`                                       | Variables apuntando a servicios locales     |
| `keycloak/realm-export.json`                 | Realm preconfigurado con usuarios de prueba |
| `monitoring/prometheus.yml`                  | Scraping del backend                        |
