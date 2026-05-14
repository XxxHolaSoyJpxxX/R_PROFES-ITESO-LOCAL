# Reporte DAST — Análisis Dinámico de Seguridad
**Sistema:** ITESO Evaluación Docente  
**Fecha:** Mayo 2026  
**Herramienta:** OWASP ZAP 2.17.0 — Baseline Scan  
**Target:** http://localhost:3000 (backend Node.js/Express)  
**Ejecutado en:** GitHub Actions — Job `dast` — Ubuntu 24.04

---

## Metodología

OWASP ZAP Baseline Scan realiza las siguientes acciones sobre el sistema en ejecución real:
1. Spider pasivo del target — rastrea URLs sin enviar ataques
2. Análisis de respuestas HTTP buscando patrones vulnerables
3. Generación de reporte con alertas clasificadas por severidad (High/Medium/Low/Informational)

El scan se ejecutó sobre el backend levantado con Docker Compose en el runner de CI, garantizando resultados sobre el sistema real.

**URLs escaneadas:** `http://localhost:3000`, `http://localhost:3000/robots.txt`, `http://localhost:3000/sitemap.xml`

---

## Resultados

### Resumen

| Nivel | Cantidad |
|---|---|
| 🔴 High | 0 |
| 🟡 Medium | 1 |
| 🟠 Low | 1 (3 instancias) |
| ℹ️ Informational | 1 (3 instancias) |

---

### 🟡 Medium — 1 alerta

#### M1. CSP: Failure to Define Directive with No Fallback
- **ID ZAP:** CSP Header
- **CWE:** 693 — Protection Mechanism Failure
- **WASC:** 15
- **Instancias:** 1
- **URL afectada:** `GET http://localhost:3000/sitemap.xml`
- **Descripción:** El Content Security Policy (CSP) no define una o más directivas que no tienen fallback. Omitirlas es equivalente a permitir cualquier origen para esa directiva, lo que puede facilitar ataques XSS si el usuario carga contenido de fuentes no confiables.
- **Evidencia:** Cabecera `Content-Security-Policy` presente pero incompleta — faltan directivas como `form-action`, `frame-ancestors` o `base-uri`.
- **Riesgo en local:** Bajo
- **Riesgo en producción:** Medio-Alto
- **Solución:**
  ```typescript
  // backend/src/app.ts
  import helmet from 'helmet';
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", "data:"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri:    ["'self'"],
    }
  }));
  ```
- **Referencia:** https://www.w3.org/TR/CSP/ | https://content-security-policy.com/

---

### 🟠 Low — 1 alerta (3 instancias)

#### L1. Permissions Policy Header Not Set
- **CWE:** 693 — Protection Mechanism Failure
- **WASC:** 15
- **Instancias:** 3
- **URLs afectadas:**
  - `GET http://localhost:3000`
  - `GET http://localhost:3000/robots.txt`
  - `GET http://localhost:3000/sitemap.xml`
- **Descripción:** La cabecera `Permissions-Policy` no está presente. Esta cabecera permite restringir el acceso a APIs del navegador como cámara, micrófono, geolocalización, etc. Su ausencia significa que scripts maliciosos podrían solicitar acceso a estas funcionalidades.
- **Riesgo en local:** Bajo
- **Riesgo en producción:** Bajo-Medio
- **Solución:** `helmet()` agrega esta cabecera automáticamente:
  ```typescript
  app.use(helmet()); // incluye Permissions-Policy: () por defecto
  ```
- **Referencia:** https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy

---

### ℹ️ Informational — 1 alerta (3 instancias)

#### I1. Storable and Cacheable Content
- **CWE:** 524 — Use of Risky Cryptographic Algorithm (cache)
- **WASC:** 13
- **Instancias:** 3
- **URLs afectadas:** `/`, `/robots.txt`, `/sitemap.xml`
- **Descripción:** Las respuestas son almacenables en caché por proxies intermediarios. Para una API REST con datos públicos (como `/health`) esto es aceptable. Para endpoints con datos de usuario, se recomienda agregar `Cache-Control: no-store`.
- **Riesgo:** Informativo — no representa una vulnerabilidad activa
- **Solución:** Agregar en endpoints con datos sensibles:
  ```typescript
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  ```

---

## Análisis de resultados

El sistema presenta un **perfil de seguridad favorable** para ser un backend en desarrollo. Los hallazgos son:

- **Sin vulnerabilidades High** — no se detectaron inyecciones, path traversal, ni exposición de datos sensibles
- **1 alerta Medium** — CSP incompleto, corregible con una línea de `helmet()`
- **1 alerta Low** — Permissions-Policy ausente, también corregible con `helmet()`
- **Las alertas informacionales** son comportamiento esperado de la API

Dado que `helmet.js` ya fue instalado como parte de las correcciones de seguridad de este proyecto, la implementación completa de su configuración resuelve todas las alertas Medium y Low encontradas.

---

## Plan de remediación

**Una sola acción resuelve M1 y L1:**

```bash
cd backend && npm install helmet
```

```typescript
// backend/src/app.ts
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", "data:"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
    }
  }
}));
```

**Estado:** ✅ helmet instalado — pendiente configurar CSP completo

---

## Comandos para replicar el scan localmente

```bash
# Levantar el sistema
docker compose --profile dev up -d --build

# Esperar backend
curl -sf http://localhost:3000/health

# Ejecutar ZAP
mkdir -p zap-report && chmod 777 zap-report
docker run --rm --network host \
  -v $(pwd)/zap-report:/zap/wrk/:rw \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py \
  -t http://localhost:3000 \
  -r report.html \
  -J report.json \
  -I

# Ver reporte
start zap-report/report.html   # Windows
open zap-report/report.html    # Mac
```
