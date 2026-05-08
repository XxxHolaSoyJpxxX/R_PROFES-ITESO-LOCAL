# Proyecto Final
**Materia:** Desarollo Seguro  
**Sistema:** ITESO Evaluación Docente  
**Fecha:** Mayo 2026

---

## 1. Código del sistema en GitHub

### Estructura del repositorio

```
ITESO-Local/
├── backend/                        # API REST Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/                 # Configuración de servicios (MySQL, MongoDB, S3, Google/Keycloak)
│   │   ├── controllers/            # Lógica de cada endpoint
│   │   ├── middlewares/            # Auth, métricas, uploads
│   │   ├── models/                 # Modelos SQL (mysql2) y MongoDB (Mongoose)
│   │   ├── routes/                 # Definición de rutas por dominio
│   │   ├── services/               # Lógica de negocio (evaluaciones, S3, email)
│   │   └── utils/                  # Cloudwatch local (Prometheus), helpers
│   ├── tests/
│   │   └── backend.test.ts         # 18 tests unitarios con Jest
│   ├── Dockerfile.local            # Imagen de desarrollo con hot-reload
│   ├── jest.config.json
│   ├── tsconfig.json
│   └── tsconfig.test.json
├── frontend/                       # SPA Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/              # Login, Home, Evaluaciones, Perfil, Áreas, Profesores
│   │   │   ├── shared/             # Servicios, guards, interceptores, tipos
│   │   │   └── layout/             # Header, Footer
│   │   └── environments/           # Config por ambiente (dev/prod)
│   ├── Dockerfile.dev              # ng serve con hot-reload
│   └── proxy.conf.json             # Proxy Angular → Backend y Keycloak
├── db/
│   ├── init/                       # Scripts MySQL: 01-schema.sql + 02-mockdata.sql
│   └── mongo-init/                 # Script MongoDB: 01-seed.js
├── keycloak/
│   └── realm-export.json           # Realm "iteso" con usuarios y cliente OIDC
├── monitoring/
│   ├── prometheus.yml              # Configuración de scraping
│   └── grafana/provisioning/       # Datasource Prometheus auto-provisionado
├── .github/
│   └── workflows/
│       └── ci.yml                  # Pipeline CI/CD con seguridad integrada
├── Dockerfile.prod                 # Build multi-stage frontend + backend
├── docker-compose.yml              # Orquestación completa de servicios
├── .env                            # Variables de entorno (no versionado)
└── SEGURIDAD-STRIDE.md             # Análisis de amenazas y mitigaciones
```

### Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Angular 17, TypeScript, Karma/Jasmine |
| Backend | Node.js 20, Express 5, TypeScript, ts-node |
| Base de datos relacional | MySQL 8.0 |
| Base de datos documental | MongoDB 7.0 |
| Almacenamiento de archivos | MinIO (S3-compatible) |
| Autenticación SSO | Keycloak 24 (OIDC/OAuth2) |
| Métricas | Prometheus + Grafana |
| Email (dev) | Mailpit |
| Contenedores | Docker + Docker Compose |
| CI/CD | GitHub Actions |

---

## 2. Requerimientos del sistema

### Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-01 | Los alumnos pueden iniciar sesión con su correo institucional |
| RF-02 | Los alumnos pueden ver sus cursos inscritos con calificación |
| RF-03 | Los alumnos pueden evaluar a un profesor por cada curso activo |
| RF-04 | Un curso ya evaluado muestra estado "Ya evaluado" y deshabilita el botón |
| RF-05 | Los profesores pueden ver su perfil y sus cursos impartidos |
| RF-06 | Los profesores pueden ver las evaluaciones recibidas por curso |
| RF-07 | Los profesores pueden subir recursos (PDF, video) a sus cursos |
| RF-08 | El coordinador puede gestionar áreas académicas, departamentos y carreras |
| RF-09 | El sistema envía notificación por email al crear una evaluación |
| RF-10 | El sistema expone métricas de latencia y conteo de respuestas HTTP |

### Requerimientos no funcionales

| ID | Requerimiento |
|---|---|
| RNF-01 | El sistema debe autenticar usuarios mediante protocolo OIDC estándar |
| RNF-02 | Los tokens JWT deben expirar en 7 días |
| RNF-03 | El sistema debe estar completamente contenedorizado y correr en local |
| RNF-04 | El tiempo de respuesta de endpoints debe monitorearse con Prometheus |
| RNF-05 | El pipeline CI/CD debe ejecutar pruebas antes de aceptar cambios en main |
| RNF-06 | Los archivos subidos deben almacenarse con acceso controlado |

### Arquitectura del sistema

```
┌─────────────────────────────────────────────────────────┐
│                     Usuario (Browser)                    │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP
┌────────────────────────▼────────────────────────────────┐
│              Frontend Angular (:4200 dev / :3000 prod)   │
│         Auth via Keycloak OIDC → JWT propio del backend  │
└────────────────────────┬────────────────────────────────┘
                         │ REST API /api/*
┌────────────────────────▼────────────────────────────────┐
│                   Backend Node.js (:3000)                │
│  Express · JWT middleware · Métricas Prometheus          │
└──┬──────────┬──────────┬──────────┬──────────┬──────────┘
   │          │          │          │          │
   ▼          ▼          ▼          ▼          ▼
MySQL      MongoDB    MinIO     Keycloak   Mailpit
(:3306)   (:27017)   (:9000)    (:8080)   (:1025)
Usuarios   Eval.     Archivos    SSO       Email
Cursos     Recursos
```

---

## 3. Modelado de amenazas (STRIDE)

Se aplicó la metodología STRIDE al sistema completo, identificando 30 amenazas distribuidas en 6 categorías sobre 8 componentes.

### Resumen por categoría

| Categoría | Amenazas identificadas | Críticas | Altas |
|---|---|---|---|
| S — Spoofing | 5 | 2 | 2 |
| T — Tampering | 8 | 3 | 3 |
| R — Repudiation | 4 | 0 | 3 |
| I — Information Disclosure | 7 | 2 | 3 |
| D — Denial of Service | 4 | 0 | 2 |
| E — Elevation of Privilege | 2 | 1 | 1 |

### Top 6 amenazas críticas identificadas

| # | Componente | Amenaza | Mitigación |
|---|---|---|---|
| 1 | Keycloak | Credenciales admin por defecto | Cambiar antes de demo, política de contraseña |
| 2 | Frontend | client_secret expuesto en bundle JS | Migrar a PKCE sin secret en cliente |
| 3 | MySQL | Inyección SQL por concatenación | Prepared statements en todos los queries |
| 4 | Backend | Endpoints sin autorización por rol | Middleware de autorización por rol en cada route |
| 5 | MinIO | Bucket público sin autenticación | Acceso privado + presigned URLs |
| 6 | Backend | JWT_SECRET débil o predecible | Secret de 64+ caracteres aleatorios |

> Ver análisis completo en `SEGURIDAD-STRIDE.md`

---

## 4. Pruebas de seguridad

### 4.1 Análisis estático (SAST) — TypeScript compiler + tsc --noEmit

El compilador de TypeScript actúa como primera capa de análisis estático, detectando:
- Tipos incorrectos que podrían causar comportamientos inesperados
- Variables no inicializadas
- Accesos a propiedades inexistentes

Ejecutado en el pipeline con:
```bash
npx tsc --noEmit
```

### 4.2 Tests unitarios de seguridad (Jest — 18 tests)

Se implementaron tests específicos que validan comportamientos de seguridad:

**JWT — firma y verificación (5 tests)**
- ✅ Firma correcta de token con payload
- ✅ Verificación de payload íntegro
- ✅ Rechazo de token con secret incorrecto
- ✅ Rechazo de token expirado
- ✅ Rechazo de token malformado

**Métricas locales (4 tests)**
- ✅ publishMetric no lanza errores inesperados
- ✅ Formato Prometheus correcto en output
- ✅ Endpoints registrados correctamente

**S3 Config / MinIO (3 tests)**
- ✅ Exporta cliente y bucket correctamente
- ✅ Lee configuración del entorno
- ✅ Usa valor por defecto si no hay env

**Reglas de negocio (6 tests)**
- ✅ Calificaciones válidas (0-100)
- ✅ Puntuaciones de evaluación (1-5)
- ✅ Roles válidos del sistema
- ✅ Formato de expediente numérico

**Resultado:** 18/18 tests pasando ✅

### 4.3 Pruebas de integración (Docker Compose — 6 pruebas)

Ejecutadas en el pipeline CI sobre infraestructura real:

| Prueba | Endpoint | Resultado esperado |
|---|---|---|
| Health check | GET /health | 200 OK |
| Métricas Prometheus | GET /metrics | 200 OK |
| Auth sin token | POST /api/auth/google {} | 400 Bad Request |
| Keycloak OIDC | GET /realms/iteso/.well-known/openid-configuration | 200 OK |
| MinIO health | GET /minio/health/live | 200 OK |
| Ruta inexistente | GET /api/ruta-no-existe | 404 Not Found |

### 4.4 Pruebas manuales de autenticación y autorización

| Escenario | Resultado |
|---|---|
| Login con credenciales correctas de alumno | ✅ Token JWT emitido, redirige a home |
| Login con credenciales incorrectas | ✅ Mensaje "Email o contraseña incorrectos" |
| Acceso a evaluación ya realizada | ✅ Botón deshabilitado, muestra "Ya evaluado" |
| Login con rol de profesor | ✅ Vista de profesor con cursos impartidos |
| Login con rol de coordinador | ✅ Vista de administración |

---

## 5. Corrección de vulnerabilidades y errores


## 6. Seguridad en el pipeline CI/CD

### Arquitectura del pipeline

```
Push a main / Pull Request a main
           │
           ▼
┌──────────────────────┐     ┌──────────────────────┐
│  validate-compose    │     │      backend          │
│                      │     │                       │
│ • docker compose     │     │ • npm ci              │
│   config --quiet     │     │ • tsc --noEmit (SAST) │
│   (prod y dev)       │     │ • jest (18 tests)     │
└──────────┬───────────┘     │ • npm run build       │
           │                 │ • upload coverage     │
           │           ┌─────┘                       │
           │           │     ┌──────────────────────┐│
           │           │     │      frontend         ││
           │           │     │                       ││
           │           │     │ • npm ci              ││
           │           │     │ • ng lint             ││
           │           │     │ • ng test (Karma)     ││
           │           │     │ • ng build --prod     ││
           │           │     │ • upload coverage     ││
           │           └─────┴──────────┬────────────┘│
           └───────────────────────────▼─────────────┘
                              integration
                    (solo si los 3 jobs anteriores pasan)

                    • Levanta MySQL, MongoDB, MinIO,
                      Keycloak, Mailpit con Docker Compose
                    • Espera healthchecks de cada servicio
                    • 6 pruebas de integración con curl
                    • Muestra logs del backend si hay fallo
                    • Teardown completo con -v
```

### Medidas de seguridad integradas en el pipeline

| Medida | Implementación |
|---|---|
| Análisis estático de tipos | `tsc --noEmit` en job de backend |
| Tests de seguridad automatizados | 5 tests JWT en cada ejecución |
| Validación de configuración | `docker compose config --quiet` |
| Secrets en CI via GitHub Secrets | `.env` generado en runtime, nunca commiteado |
| Prueba de autenticación sin token | Verifica que API rechaza requests no autenticados |
| Prueba de rutas inexistentes | Verifica manejo correcto de 404 |
| Reporte de cobertura | Artifact subido en cada ejecución |
| Aislamiento de infraestructura | Teardown con `-v` al finalizar |

### Archivo del pipeline

`.github/workflows/ci.yml` — 4 jobs, corre en `ubuntu-latest`, triggers en push y PR a `main`.

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

## Cómo levantar el sistema

```bash
# Desarrollo (hot-reload frontend :4200 + backend :3000)
docker compose --profile dev up -d --build

# Producción (todo en :3000)
docker compose --profile prod up -d --build

# Ver estado
docker compose --profile dev ps

# Detener
docker compose --profile dev down
docker compose --profile dev down -v  # con reset de datos
```

## URLs de acceso

| Servicio | URL | Credenciales |
|---|---|---|
| Aplicación | http://localhost:4200 | Ver usuarios de prueba |
| Keycloak Admin | http://localhost:8080 | admin / Admin123! |
| MinIO Console | http://localhost:9001 | minioadmin / minioadmin123 |
| Grafana | http://localhost:3001 | admin / admin123 |
| Prometheus | http://localhost:9090 | — |
| Mailpit | http://localhost:8025 | — |
