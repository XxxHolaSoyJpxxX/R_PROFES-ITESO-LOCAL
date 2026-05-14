# Reporte SAST — Análisis Estático de Seguridad
**Sistema:** ITESO Evaluación Docente  
**Fecha:** Mayo 2026  
**Herramientas:** TypeScript Compiler (tsc), ESLint Security Plugin, npm audit, Snyk

---

## 1. TypeScript Compiler — tsc --noEmit

El compilador de TypeScript actúa como primera línea de análisis estático. Detecta errores de tipos que pueden causar comportamientos inesperados en tiempo de ejecución.

**Hallazgos resueltos:**

| Archivo | Error | Solución aplicada |
|---|---|---|
| `recursos.model.ts` | `Interface IRecurso extiende Document` con `_id: string` incompatible con `ObjectId` | Cambiado a `extends Omit<Document, '_id'>` para redefinir `_id` como string |

**Estado actual:** ✅ Sin errores de compilación

---

## 2. ESLint Security Plugin

Escanea el código fuente buscando patrones peligrosos comunes en Node.js.

**Reglas aplicadas:**

| Regla | Nivel | Descripción |
|---|---|---|
| `security/detect-eval-with-expression` | Error | Uso de eval() con expresiones dinámicas |
| `security/detect-non-literal-regexp` | Warn | RegExp construidas con strings no literales |
| `security/detect-object-injection` | Warn | Acceso a propiedades de objetos con variables |
| `security/detect-non-literal-fs-filename` | Warn | Rutas de archivo construidas dinámicamente |
| `security/detect-possible-timing-attacks` | Warn | Comparaciones de strings susceptibles a timing |

**Hallazgos identificados en el código:**

| Archivo | Regla | Línea | Descripción | Estado |
|---|---|---|---|---|
| `controllers/googleAuth.controller.ts` | `detect-object-injection` | 45 | Acceso a `req.body[field]` con variable | ⚠️ Pendiente |
| `services/s3.service.ts` | `detect-non-literal-regexp` | 23 | Construcción de regex con input de usuario | ⚠️ Pendiente |
| `middlewares/upload.middleware.ts` | `detect-non-literal-fs-filename` | 15 | Nombre de archivo construido con `req.file.originalname` | ⚠️ Pendiente |

**Sin hallazgos críticos (errores):** ✅ No se detectó uso de `eval()` con expresiones dinámicas.

---

## 3. npm audit

Escanea las dependencias declaradas en `package.json` contra la base de datos de vulnerabilidades de npm (advisories).

### Backend

```
Ejecutado: npm audit --audit-level=critical
Dependencias auditadas: 312 paquetes
```

| Severidad | Cantidad | Paquetes afectados |
|---|---|---|
| Critical | 0 | — |
| High | 0 | — |
| Moderate | 2 | `semver` < 7.5.2 (ReDoS), `word-wrap` < 1.2.4 (ReDoS) |
| Low | 3 | Varios paquetes de desarrollo |

**Estado:** ✅ Sin vulnerabilidades críticas ni altas en dependencias de producción. Las moderadas son en paquetes de desarrollo (devDependencies) y no afectan el runtime.

### Frontend

```
Ejecutado: npm audit --audit-level=critical
Dependencias auditadas: 847 paquetes
```

| Severidad | Cantidad | Notas |
|---|---|---|
| Critical | 0 | — |
| High | 0 | — |
| Moderate | 5 | Paquetes de build (esbuild, rollup) — no afectan runtime |

**Estado:** ✅ Sin vulnerabilidades críticas en dependencias de producción.

---

## 4. Snyk Code (SAST)

Snyk Code analiza el flujo de datos del código fuente buscando vulnerabilidades de seguridad específicas para el stack Node.js/TypeScript.

> **Nota:** Snyk Code requiere el plan Team o superior para análisis completo. Los resultados reflejan el análisis del plan gratuito que cubre Open Source (dependencias).

### Snyk Open Source — Backend

| Paquete | Versión | Vulnerabilidad | Severidad | Fix |
|---|---|---|---|---|
| `jose` | 5.6.3 | Sin CVEs conocidos | — | ✅ Al día |
| `jsonwebtoken` | 9.0.2 | Sin CVEs conocidos | — | ✅ Al día |
| `mongoose` | 8.x | Sin CVEs conocidos | — | ✅ Al día |
| `mysql2` | 3.x | Sin CVEs conocidos | — | ✅ Al día |
| `nodemailer` | 6.x | Sin CVEs conocidos | — | ✅ Al día |

**Estado Snyk OSS backend:** ✅ Sin vulnerabilidades en dependencias directas.

### Snyk Open Source — Frontend

| Paquete | Versión | Vulnerabilidad | Severidad |
|---|---|---|---|
| `@angular/core` | 17.x | Sin CVEs conocidos | — |
| `rxjs` | 7.x | Sin CVEs conocidos | — |

**Estado Snyk OSS frontend:** ✅ Sin vulnerabilidades en dependencias directas.

---

## 5. Revisión manual de código — Patrones de seguridad

### 5.1 Autenticación y autorización

| Patrón | Estado | Archivo |
|---|---|---|
| Todos los endpoints protegidos con `autenticar` middleware | ✅ | `routes/*.ts` |
| Verificación de rol en rutas sensibles | ✅ | `auth.middleware.ts` |
| JWT verificado con secret fuerte | ✅ | `googleAuth.controller.ts` |
| Token de Keycloak verificado contra JWKS | ✅ | `googleAuth.service.ts` |

### 5.2 Manejo de datos

| Patrón | Estado | Archivo |
|---|---|---|
| Queries MySQL con prepared statements | ✅ | `models/sql/*.ts` |
| Input de MongoDB tipado con interfaces | ✅ | `models/mongo/*.ts` |
| Archivos subidos validados por tipo | ⚠️ Solo extensión | `upload.middleware.ts` |

### 5.3 Configuración segura

| Patrón | Estado | Nota |
|---|---|---|
| Variables sensibles en .env | ✅ | No en código fuente |
| .env en .gitignore | ⚠️ .env versionado en repo | **Riesgo #9 — corregir** |
| CORS configurado | ⚠️ Permisivo | Aceptar todos los orígenes en dev |
| Helmet.js instalado | ❌ | Pendiente implementar |

---

## Hallazgos a resolver (priorizados)

| Prioridad | Hallazgo | Acción |
|---|---|---|
| 🔴 Alta | .env con credenciales versionado en GitHub | Eliminar del repo, agregar a .gitignore, rotar credenciales |
| 🔴 Alta | client_secret en environment.ts | Migrar a PKCE |
| 🟡 Media | Validación de MIME en uploads solo por extensión | Agregar file-type |
| 🟡 Media | Sin helmet.js | npm install helmet + app.use(helmet()) |
| 🟢 Baja | detect-object-injection warnings en ESLint | Revisar y tipar accesos a propiedades |
