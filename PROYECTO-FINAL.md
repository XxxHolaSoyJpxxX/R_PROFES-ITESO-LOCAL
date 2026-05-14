# Proyecto Final — Seguridad en Cómputo en la Nube
**Sistema:** ITESO Evaluación Docente (versión local con Docker)  
**Repositorio:** https://github.com/XxxHolaSoyJpxxX/R_PROFES-ITESO-LOCAL  
**Fecha:** Mayo 2026

---

## 1. Código del sistema en GitHub

El sistema completo está en el repositorio público. Estructura principal:

```
├── backend/          # API REST — Node.js 20, Express 5, TypeScript
│   ├── src/          # Código fuente (controllers, services, models, middlewares)
│   └── tests/        # 18 tests unitarios con Jest
├── frontend/         # SPA Angular 17
├── db/               # Scripts SQL y MongoDB de inicialización automática
├── keycloak/         # Realm preconfigurado con usuarios de prueba
├── monitoring/       # Prometheus + Grafana
├── .github/workflows/ci.yml  # Pipeline CI/CD con SAST + Tests + DAST
└── docker-compose.yml        # Orquestación completa
```

**Stack:** Angular + Node.js/Express + MySQL + MongoDB + MinIO + Keycloak + Prometheus/Grafana

Para levantar:
```bash
docker compose --profile dev up -d --build   # Desarrollo
docker compose --profile prod up -d --build  # Producción
```

---

## 2. Requerimientos del sistema

### Funcionales
- Alumnos se autentican con correo institucional vía Keycloak (SSO)
- Alumnos evalúan a profesores por curso (una evaluación por inscripción)
- Cursos ya evaluados muestran estado "Ya evaluado" y deshabilitan el botón
- Profesores ven su perfil, cursos impartidos y evaluaciones recibidas
- Profesores suben recursos (PDF/video) almacenados en MinIO
- Coordinador gestiona áreas académicas, departamentos, carreras y cursos
- Sistema envía notificación email al crear una evaluación (Mailpit en local)
- Métricas de latencia y conteo HTTP expuestas en `/metrics` para Prometheus

### No funcionales
- Autenticación OIDC estándar (compatible con cualquier proveedor: Keycloak, Google, Azure AD)
- Sistema completamente contenedorizado — corre con un solo comando
- Pipeline CI/CD con análisis de seguridad en cada push a main
- Datos persistentes en volúmenes Docker

### Arquitectura

```
Browser → Angular (:4200 dev)
             │ REST /api/* + OIDC
             ▼
    Backend Express (:3000) ─── Keycloak (:8080) SSO
             │
    ┌────────┼────────┬──────────┐
    ▼        ▼        ▼          ▼
  MySQL   MongoDB   MinIO    Mailpit
  (SQL)  (NoSQL)  (Files)   (Email)
```

---

## 3. Modelado de amenazas (STRIDE)

Se identificaron **30 amenazas** sobre 8 componentes usando la metodología STRIDE. Ver `STRIDE-ITESO.md` para el análisis completo.

**Resumen crítico:**

| # | Amenaza | Riesgo | Estado |
|---|---|---|---|
| 1 | Credenciales Keycloak por defecto | Crítico | ✅ Documentado, cambiar antes de demo |
| 2 | client_secret expuesto en frontend | Crítico | ⚠️ Pendiente migración a PKCE |
| 3 | Inyección SQL posible | Crítico | ✅ Prepared statements implementados |
| 4 | Endpoints sin autorización por rol | Crítico | ✅ Middleware implementado |
| 5 | Bucket MinIO público | Crítico | ✅ Privado + presigned URLs |
| 6 | JWT_SECRET débil | Crítico | ✅ 64 bytes aleatorios |

**Característica del análisis:** Cada riesgo incluye su nivel en contexto local actual y su proyección al desplegarse en la nube, para guiar las decisiones de hardening.

---

## 4. Pruebas de seguridad (SAST + DAST)

Ver reportes completos en `REPORTE-SAST.md` y `REPORTE-DAST.md`.

### SAST — Análisis estático
- **TypeScript compiler:** Sin errores de tipos ✅
- **ESLint Security Plugin:** 0 errores críticos, 3 warnings de bajo riesgo
- **npm audit backend:** 0 vulnerabilidades críticas/altas ✅
- **npm audit frontend:** 0 vulnerabilidades críticas/altas ✅
- **Snyk OSS:** Sin CVEs en dependencias directas ✅

### Tests unitarios de seguridad — Jest (18 tests)
- JWT: firma, verificación, rechazo de token expirado/malformado/secret incorrecto ✅
- Métricas: publishMetric y formato Prometheus ✅
- S3Config: configuración de MinIO ✅
- Reglas de negocio: calificaciones (0-100), puntuaciones (1-5), roles, expedientes ✅

### DAST — Análisis dinámico (OWASP ZAP)
- **High:** 0 alertas ✅
- **Medium:** 2 (X-Frame-Options y CSP ausentes — resuelto con helmet.js)
- **Low:** 3 (X-Content-Type-Options, X-Powered-By, cookies sin Secure)
- **Informational:** 4 (comportamientos esperados de la API)

**Acción aplicada:** `npm install helmet` + `app.use(helmet())` resuelve 5 de las 5 alertas medias/bajas.

### Pruebas de integración en CI (6 tests con Docker Compose)
- GET /health → 200 ✅
- GET /metrics → 200 ✅
- POST /api/auth/google sin token → 400 ✅
- Keycloak OIDC discovery → 200 ✅
- MinIO health → 200 ✅
- Ruta inexistente → 404 ✅

---

## 5. Corrección de vulnerabilidades

Ver `CORRECCIONES-SEGURIDAD.md` para detalle completo de cada corrección.

**Resumen de lo implementado:**

| Corrección | Archivos modificados | Resuelve STRIDE |
|---|---|---|
| Helmet.js — cabeceras HTTP | `app.ts` | #14 + alertas DAST |
| .env fuera del repositorio | `.gitignore`, historial git | #9 |
| Registro Keycloak deshabilitado | `realm-export.json` | #16 |
| Bucket MinIO privado + presigned URLs | `docker-compose.yml`, `s3.service.ts` | #5 |
| Middleware de autorización por rol | `autorizar.middleware.ts`, routes | #4 |
| JWT_SECRET con crypto.randomBytes | `.env` | #6 |
| Error handler global | `app.ts` | #14 |

**Correcciones realizadas antes del pipeline:**
- Google OAuth reemplazado por Keycloak (OIDC local)
- AWS S3 reemplazado por MinIO (API idéntica, local)
- AWS CloudWatch reemplazado por Prometheus + métricas en memoria
- AWS SES reemplazado por Nodemailer + Mailpit
- Lookup de usuario por email en lugar de sub de Keycloak
- Validación de evaluaciones ya realizadas (evita duplicate key en MongoDB)
- Proxy Angular corregido para nombres de servicio Docker (no localhost)

---

## 6. Seguridad en el pipeline CI/CD

El pipeline `.github/workflows/ci.yml` implementa DevSecOps con 6 jobs en secuencia:

```
validate-compose → sast + backend + frontend → integration → dast
```

### Jobs de seguridad

**SAST (Job 2):**
- `npm audit --audit-level=critical` en backend y frontend — falla si hay CVEs críticos reales
- ESLint Security Plugin — falla si hay uso de `eval()` con expresiones dinámicas
- Snyk Code + Snyk OSS — análisis de código y dependencias

**Tests (Job 3):**
- `tsc --noEmit` — análisis de tipos como SAST básico
- Jest 18 tests incluyendo 5 tests específicos de seguridad JWT

**Integración (Job 5):**
- Test que verifica que API rechaza requests sin token (→ 400)
- Test que verifica manejo correcto de rutas no encontradas (→ 404)

**DAST (Job 6):**
- OWASP ZAP Baseline Scan contra backend real en Docker
- Genera reporte HTML + JSON descargable como artifact
- Resumen de alertas por nivel en el log del pipeline

### Política del pipeline
- El pipeline **falla** ante CVEs críticos reales en dependencias
- El pipeline **falla** si los tests unitarios no pasan
- El pipeline **falla** si los endpoints de integración no responden correctamente
- El DAST genera reporte pero no bloquea el pipeline (alertas son informativas)
- Los reportes SAST y DAST se guardan como artifacts descargables en cada ejecución

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

## URLs

| Servicio | URL | Credenciales |
|---|---|---|
| App | http://localhost:4200 | Ver tabla arriba |
| Keycloak | http://localhost:8080 | admin / Admin123! |
| MinIO | http://localhost:9001 | minioadmin / minioadmin123 |
| Grafana | http://localhost:3001 | admin / admin123 |
| Prometheus | http://localhost:9090 | — |
| Mailpit | http://localhost:8025 | — |

## Documentación incluida

| Archivo | Contenido |
|---|---|
| `STRIDE-ITESO.md` | 30 amenazas con análisis local vs nube |
| `REPORTE-SAST.md` | Resultados de tsc, ESLint, npm audit, Snyk |
| `REPORTE-DAST.md` | Resultados OWASP ZAP con alertas y remediaciones |
| `CORRECCIONES-SEGURIDAD.md` | 7 correcciones con código antes/después |
| `PROYECTO-FINAL.md` | Este documento — resumen ejecutivo del proyecto |
