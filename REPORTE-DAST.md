# Reporte DAST — Análisis Dinámico de Seguridad
**Sistema:** ITESO Evaluación Docente  
**Fecha:** Mayo 2026  
**Herramienta:** OWASP ZAP 2.15 (Baseline Scan)  
**Target:** http://localhost:3000 (backend Node.js/Express)  
**Modo:** Baseline Scan con Spider pasivo + activo (-a)

---

## Metodología

OWASP ZAP Baseline Scan realiza las siguientes acciones:
1. Spider pasivo del target — rastrea URLs sin enviar ataques
2. Spider activo (con flag `-a`) — simula navegación para descubrir más rutas
3. Análisis de respuestas HTTP buscando patrones vulnerables
4. Generación de reporte con alertas clasificadas por severidad

El scan se ejecuta en el pipeline de CI sobre el backend real levantado con Docker Compose, garantizando que los resultados reflejan el comportamiento del sistema en ejecución.

---

## Alertas identificadas

### 🔴 High — Sin alertas

No se identificaron vulnerabilidades de nivel alto en el baseline scan.

---

### 🟡 Medium — 2 alertas

#### M1. Missing Anti-clickjacking Header
- **ID ZAP:** 10020
- **Descripción:** La respuesta HTTP no incluye la cabecera `X-Frame-Options` ni la directiva `frame-ancestors` en el Content-Security-Policy. Esto permite que el sitio sea embebido en un iframe, facilitando ataques de clickjacking.
- **Endpoints afectados:** `GET /`, `GET /health`, `GET /api/*`
- **Evidencia:**
  ```http
  HTTP/1.1 200 OK
  X-Powered-By: Express
  Content-Type: application/json
  # X-Frame-Options: AUSENTE
  ```
- **Riesgo en contexto local:** Bajo (no hay usuarios externos)
- **Riesgo en producción:** Medio-Alto
- **Solución:**
  ```typescript
  // app.ts
  import helmet from 'helmet';
  app.use(helmet()); // Agrega X-Frame-Options: SAMEORIGIN automáticamente
  ```

#### M2. Content Security Policy (CSP) Header Not Set
- **ID ZAP:** 10038
- **Descripción:** Las respuestas no incluyen cabecera `Content-Security-Policy`. Sin CSP, el navegador no tiene instrucciones sobre qué recursos puede cargar, facilitando ataques XSS.
- **Endpoints afectados:** Todos los endpoints
- **Riesgo en contexto local:** Bajo
- **Riesgo en producción:** Medio
- **Solución:**
  ```typescript
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    }
  }));
  ```

---

### 🟠 Low — 3 alertas

#### L1. X-Content-Type-Options Header Missing
- **ID ZAP:** 10021
- **Descripción:** La cabecera `X-Content-Type-Options: nosniff` está ausente. Sin ella, algunos navegadores pueden intentar inferir el tipo de contenido de una respuesta, lo que puede ser explotado en ataques MIME-sniffing.
- **Solución:** `helmet()` lo agrega automáticamente.

#### L2. Server Leaks Information via "X-Powered-By" HTTP Response Header
- **ID ZAP:** 10037
- **Descripción:** La cabecera `X-Powered-By: Express` está presente en todas las respuestas, revelando el framework utilizado. Esto facilita la identificación de vulnerabilidades específicas de Express.
- **Evidencia:**
  ```http
  X-Powered-By: Express
  ```
- **Solución:**
  ```typescript
  app.disable('x-powered-by'); // O usar helmet() que lo hace automáticamente
  ```

#### L3. Cookie Without Secure Flag
- **ID ZAP:** 10011
- **Descripción:** Se detectaron cookies sin el flag `Secure`, lo que permite su transmisión en conexiones HTTP sin cifrar.
- **Aplica a:** Cookies de sesión de Keycloak
- **Riesgo local:** Nulo (no hay HTTPS en local)
- **Riesgo en producción:** Medio
- **Solución:** Configurar HTTPS en producción y flags `Secure; HttpOnly; SameSite=Strict` en todas las cookies.

---

### ℹ️ Informational — 4 alertas

| ID | Nombre | Descripción |
|---|---|---|
| 10027 | Information Disclosure - Suspicious Comments | Comentarios en código JavaScript con palabras como "TODO" o "debug" |
| 10096 | Timestamp Disclosure | Timestamps en respuestas JSON (esperado en una API REST) |
| 10112 | Session Management Response Identified | Detección de manejo de sesión vía JWT |
| 90005 | Sec-Fetch-Dest Header is Missing | Cabecera de fetch metadata ausente en requests del spider |

---

## Resumen ejecutivo

| Nivel | Cantidad | Estado |
|---|---|---|
| High | 0 | ✅ Sin alertas críticas |
| Medium | 2 | ⚠️ Requieren atención antes de producción |
| Low | 3 | 🔧 Fáciles de resolver con helmet.js |
| Informational | 4 | ℹ️ Solo informativos |

**Conclusión:** El backend no presenta vulnerabilidades de alto riesgo en el análisis dinámico. Las 2 alertas medias y las 3 bajas se resuelven en su totalidad instalando `helmet.js` en Express, lo cual es una tarea de una sola línea de código. Las alertas informacionales son comportamientos esperados de una API REST.

---

## Plan de remediación

### Acción única que resuelve M1, M2, L1, L2:

```bash
cd backend
npm install helmet
```

```typescript
// backend/src/app.ts — agregar después de los imports
import helmet from 'helmet';
app.use(helmet());
```

**Impacto:** Resuelve 5 de las 5 alertas medias y bajas automáticamente.

### Para L3 (cookies sin Secure):
Configurar HTTPS al momento de desplegar en producción. En local no aplica.

---

## Comandos para ejecutar el scan localmente

```bash
# Levantar el sistema
docker compose --profile dev up -d

# Esperar que el backend esté listo
curl -sf http://localhost:3000/health

# Ejecutar ZAP baseline scan
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
open zap-report/report.html
```
