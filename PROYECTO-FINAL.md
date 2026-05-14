# Proyecto Final — Seguridad en Cómputo en la Nube
**Sistema:** ITESO Evaluación Docente (versión local con Docker)  
**Repositorio:** https://github.com/XxxHolaSoyJpxxX/R_PROFES-ITESO-LOCAL  
**Fecha:** Mayo 2026

---

## 1. Código del sistema en GitHub

El sistema completo está en el repositorio público. Estructura principal:

```
├── backend/                    # API REST — Node.js 20, Express 5, TypeScript
│   ├── src/                    # Controllers, services, models, middlewares
│   └── tests/                  # 18 tests unitarios con Jest
├── frontend/                   # SPA Angular 17
├── db/
│   ├── init/                   # 01-schema.sql + 02-mockdata.sql (MySQL)
│   └── mongo-init/             # 01-seed.js (MongoDB evaluaciones y recursos)
├── keycloak/                   # realm-export.json con usuarios preconfigurados
├── monitoring/                 # Prometheus + Grafana
├── .zap/                       # rules.tsv para OWASP ZAP
├── .github/workflows/ci.yml    # Pipeline CI/CD con SAST + Tests + Integración + DAST
├── Dockerfile.prod             # Build multi-stage frontend + backend
└── docker-compose.yml          # Orquestación completa (perfiles dev y prod)
```

**Stack tecnológico:**

| Capa | Tecnología | Reemplaza |
|---|---|---|
| Frontend | Angular 17 | — |
| Backend | Node.js 20, Express 5, TypeScript | — |
| BD Relacional | MySQL 8.0 | AWS RDS |
| BD Documental | MongoDB 7.0 | MongoDB Atlas |
| Almacenamiento | MinIO (API S3) | AWS S3 |
| Autenticación | Keycloak 24 (OIDC) | Google OAuth |
| Métricas | Prometheus + Grafana | AWS CloudWatch |
| Email (dev) | Mailpit | Amazon SES |
| CI/CD | GitHub Actions | — |

**Levantar el sistema:**
```bash
docker compose --profile dev up -d --build   # Desarrollo
docker compose --profile prod up -d --build  # Producción
```

---

## 2. Requerimientos del sistema

### Funcionales
- Alumnos se autentican con correo institucional vía Keycloak SSO (OIDC)
- Alumnos evalúan a profesores por curso (una evaluación por inscripción activa)
- Cursos ya evaluados muestran "Ya evaluado" y deshabilitan el botón
- Profesores ven su perfil, cursos impartidos y evaluaciones recibidas
- Profesores suben recursos (PDF/video) almacenados en MinIO
- Coordinador gestiona áreas académicas, departamentos, carreras y cursos
- Sistema notifica por email al crear una evaluación (Mailpit en local)
- Métricas HTTP expuestas en `/metrics` para Prometheus

### No funcionales
- Autenticación OIDC estándar — compatible con Google, Azure AD, Keycloak
- Sistema completamente contenedorizado — un solo comando lo levanta todo
- Pipeline CI/CD con análisis de seguridad en cada push a `main`
- Datos persistentes en volúmenes Docker con inicialización automática

### Arquitectura

```
Browser → Angular (:4200 dev / :3000 prod)
              │ REST /api/* + OIDC token
              ▼
    Backend Express (:3000)
         │        │        │        │        │
         ▼        ▼        ▼        ▼        ▼
       MySQL   MongoDB   MinIO  Keycloak  Mailpit
      (:3306) (:27017)  (:9000)  (:8080)  (:1025)
```

---

## 3. Modelado de amenazas (STRIDE)

Se identificaron **30 amenazas** sobre 8 componentes usando metodología STRIDE. Ver `STRIDE-ITESO.md` para el análisis completo con tabla y plan de mitigación.

**Top 6 amenazas críticas:**

| # | Componente | Amenaza | Estado |
|---|---|---|---|
| 1 | Keycloak | Credenciales admin por defecto | ✅ Cambiadas |
| 2 | Frontend | client_secret expuesto en bundle JS | ⚠️ Pendiente PKCE |
| 3 | MySQL | Inyección SQL posible | ✅ Prepared statements |
| 4 | Backend | Endpoints sin autorización por rol | ✅ Middleware implementado |
| 5 | MinIO | Bucket público sin autenticación | ✅ Privado + presigned URLs |
| 6 | Backend | JWT_SECRET débil | ✅ 64 bytes aleatorios |

**Característica del análisis:** Cada riesgo incluye su nivel en contexto local actual y proyección al desplegarse en nube, para guiar decisiones de hardening.

---

## 4. Pruebas de seguridad (SAST + DAST)

Ver reportes completos en `REPORTE-SAST.md` y `REPORTE-DAST.md`.

### SAST — Resultados reales (GitHub Actions)

| Herramienta | Paquetes auditados | Vulnerabilidades críticas | Estado |
|---|---|---|---|
| npm audit — backend | 684 | 0 | ✅ Limpio |
| npm audit — frontend | 559 | 0 críticas | ✅ (19 moderate/high en devDeps) |
| ESLint Security Plugin | backend/src/ | 0 errores | ✅ Sin eval() peligroso |
| tsc --noEmit | backend/src/ | 0 errores de tipos | ✅ |
| Snyk OSS | backend + frontend | 0 CVEs en deps directas | ✅ |

**Tests unitarios de seguridad — Jest (18/18 pasando):**
- JWT: firma, verificación, rechazo de token expirado/malformado/secret incorrecto (5 tests)
- MinIO/S3Config: configuración correcta de endpoint y bucket (3 tests)
- Métricas Prometheus: publishMetric y formato de salida (4 tests)
- Reglas de negocio: calificaciones, puntuaciones, roles, expedientes (6 tests)

**Cobertura de código (archivos de seguridad):**

| Archivo | Statements | Branches |
|---|---|---|
| `s3.config.ts` | 100% | — |
| `cloudwatch.ts` | 85% | 70% |
| **Total** | **87%** | **70%** |

### DAST — Resultados reales (OWASP ZAP 2.17.0)

Scan ejecutado contra `http://localhost:3000` con Docker Compose en el runner de CI.

| Nivel | Cantidad | Descripción |
|---|---|---|
| 🔴 High | **0** | Sin vulnerabilidades críticas |
| 🟡 Medium | **1** | CSP sin directivas de fallback (CWE-693) |
| 🟠 Low | **1** (3 instancias) | Permissions-Policy header ausente (CWE-693) |
| ℹ️ Informational | **1** (3 instancias) | Contenido cacheable (comportamiento esperado) |

Ambas alertas Medium y Low se resuelven con `app.use(helmet())` correctamente configurado.

### Pruebas de integración en CI (6 tests)

| Test | Endpoint | Resultado esperado | Estado |
|---|---|---|---|
| Health check | GET /health | 200 | ✅ |
| Métricas | GET /metrics | 200 | ✅ |
| Auth sin token | POST /api/auth/google {} | 400 | ✅ |
| Keycloak OIDC | GET /realms/iteso/.well-known/... | 200 | ✅ |
| MinIO health | GET /minio/health/live | 200 | ✅ |
| Ruta inexistente | GET /api/no-existe | 404 | ✅ |

---

## 5. Corrección de vulnerabilidades

Ver `CORRECCIONES-SEGURIDAD.md` para detalle completo con código antes/después.

| # | Vulnerabilidad | Archivos modificados | Estado |
|---|---|---|---|
| 1 | Cabeceras HTTP faltantes (DAST M1, L1) | `app.ts` + `helmet` | ✅ |
| 2 | .env en repositorio público (STRIDE #9) | `.gitignore`, historial git | ✅ |
| 3 | Registro público Keycloak (STRIDE #16) | `realm-export.json` | ✅ |
| 4 | Bucket MinIO público (STRIDE #5) | `docker-compose.yml`, `s3.service.ts` | ✅ |
| 5 | Sin autorización por rol (STRIDE #4) | `autorizar.middleware.ts`, routes | ✅ |
| 6 | JWT_SECRET débil (STRIDE #6) | `.env` | ✅ |
| 7 | Stack traces en producción (STRIDE #14) | `app.ts` | ✅ |

**Correcciones de migración cloud → local:**
- Google OAuth → Keycloak OIDC (mismo protocolo, cero cambio en frontend)
- AWS S3 → MinIO (`forcePathStyle: true`, API idéntica)
- AWS CloudWatch → Prometheus + métricas en memoria
- Amazon SES → Nodemailer + Mailpit
- MongoDB Atlas → MongoDB local con seed automático
- AWS RDS → MySQL local con schema e init automático

---

## 6. Seguridad en el pipeline CI/CD

El pipeline `.github/workflows/ci.yml` implementa DevSecOps con 6 jobs:

```
validate-compose
      │
      ├──── sast (npm audit + ESLint Security + Snyk)
      ├──── backend (tsc + Jest 18 tests + build)
      ├──── frontend (ng build)
      │
      ▼
  integration (Docker Compose + 6 curl tests)
      │
      ▼
    dast (OWASP ZAP Baseline Scan)
```

**Seguridad integrada en el pipeline:**

| Etapa | Herramienta | Falla el pipeline si... |
|---|---|---|
| SAST | npm audit | Hay CVEs críticos en dependencias |
| SAST | ESLint Security | Se detecta `eval()` con expresión dinámica |
| SAST | tsc --noEmit | Hay errores de tipos TypeScript |
| Tests | Jest | Alguno de los 18 tests falla |
| Integración | curl tests | Algún endpoint no responde correctamente |
| DAST | OWASP ZAP | Genera reporte — no bloquea (alertas son informativas) |

Los reportes SAST (`npm-audit-report.json`) y DAST (`report.html`, `report.json`, `report.xml`) se guardan como artifacts descargables en cada ejecución de GitHub Actions.

---

## Usuarios de prueba

| Email | Contraseña | Rol |
|---|---|---|
| admin@iteso.mx | Admin123! | Coordinador |
| profesor@iteso.mx | Profesor123! | Profesor |
| profesor2@iteso.mx | Profesor2123! | Profesor |
| alumno@iteso.mx | Alumno123! | Alumno |
| alumno2@iteso.mx | Alumno2123! | Alumno |
| alumno3@iteso.mx | Alumno3123! | Alumno |

## URLs de acceso

| Servicio | URL | Credenciales |
|---|---|---|
| App (dev) | http://localhost:4200 | Ver tabla arriba |
| Keycloak Admin | http://localhost:8080 | admin / Admin123! |
| MinIO Console | http://localhost:9001 | minioadmin / minioadmin123 |
| Grafana | http://localhost:3001 | admin / admin123 |
| Prometheus | http://localhost:9090 | — |
| Mailpit | http://localhost:8025 | — |

## Documentos del proyecto

| Archivo | Contenido |
|---|---|
| `STRIDE-ITESO.md` | 30 amenazas con análisis local vs nube + plan de mitigación |
| `REPORTE-SAST.md` | Resultados reales: tsc, ESLint, npm audit, Snyk, cobertura |
| `REPORTE-DAST.md` | Resultados reales OWASP ZAP 2.17.0: 0 High, 1 Medium, 1 Low |
| `CORRECCIONES-SEGURIDAD.md` | 7 correcciones documentadas con código antes/después |
| `PROYECTO-FINAL.md` | Este documento — resumen ejecutivo del proyecto |
