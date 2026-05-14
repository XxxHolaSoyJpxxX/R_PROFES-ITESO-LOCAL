# Análisis de Riesgos STRIDE — ITESO Evaluación Docente
**Fecha:** Mayo 2026  
**Metodología:** STRIDE (Spoofing · Tampering · Repudiation · Information Disclosure · Denial of Service · Elevation of Privilege)  
**Contexto:** Sistema corriendo localmente con Docker Compose. Los riesgos se evalúan en el entorno actual (local) pero con visión hacia un eventual despliegue en nube.

> **Nota:** En entorno local la superficie de ataque es menor (red privada, acceso físico restringido). Las malas prácticas documentadas se volverían críticas en cuanto el sistema se exponga a internet. El nivel de riesgo refleja la proyección a producción.

---

## Tabla de 30 Riesgos

| # | Componente | Categoría | Amenaza | Riesgo local | Riesgo en nube | Control / Mitigación |
|---|---|---|---|---|---|---|
| 1 | Keycloak SSO | S — Spoofing | Credenciales admin por defecto (admin/admin123) | Bajo | **Crítico** | Cambiar antes de cualquier demo. Política de contraseña fuerte en Realm Settings. |
| 2 | Frontend Angular | I — Info Disc. | client_secret hardcodeado en environment.ts visible en bundle JS | Medio | **Crítico** | Migrar a PKCE sin secret en el cliente. Secret solo en backend. |
| 3 | MySQL | T — Tampering | Posible inyección SQL por concatenación de strings en queries | Medio | **Crítico** | Auditar todos los queries. Usar únicamente prepared statements de mysql2. |
| 4 | Backend Node.js | E — Elevation | Endpoints sin middleware de autorización por rol | Medio | **Crítico** | Middleware `autorizar([roles])` en cada route group sensible. |
| 5 | MinIO | I — Info Disc. | Bucket con política anonymous download expone archivos | Medio | **Crítico** | Bucket privado + presigned URLs con expiración de 15 min. |
| 6 | Backend Node.js | T — Tampering | JWT_SECRET débil permite forjar tokens | Medio | **Crítico** | Secret de 64+ chars aleatorios generado con crypto.randomBytes. |
| 7 | Keycloak SSO | D — DoS | Sin rate limiting en endpoint de token | Bajo | **Alto** | Brute-force policy: bloqueo tras 5 intentos, espera exponencial. |
| 8 | Backend Node.js | R — Repudiation | Sin log de auditoría de acciones críticas | Bajo | **Alto** | Middleware que persiste usuario + acción + timestamp + IP en MongoDB. |
| 9 | MySQL | I — Info Disc. | Credenciales en .env versionado en git | **Alto** | **Alto** | .env en .gitignore. En producción: Docker secrets o Vault. |
| 10 | MinIO | T — Tampering | Upload sin validación de MIME real (solo extensión) | Medio | **Alto** | Librería file-type para verificar primeros bytes del archivo. |
| 11 | Backend Node.js | T — Tampering | Sin validación de esquema en body de requests | Medio | **Alto** | Validación con Zod en cada controller antes de pasar al ORM. |
| 12 | Docker / Infra | E — Elevation | Contenedores corriendo como root | Bajo | **Alto** | `USER node` en Dockerfiles. Imagen distroless en producción. |
| 13 | Frontend Angular | S — Spoofing | JWT en localStorage vulnerable a XSS | Bajo | **Alto** | httpOnly cookies + Content-Security-Policy estricta. |
| 14 | Backend Node.js | I — Info Disc. | Stack traces completos en respuestas de error 500 | Medio | **Alto** | Error handler global: mensaje genérico en prod, detalle solo en logs. |
| 15 | MongoDB | T — Tampering | NoSQL injection si input no se sanitiza antes de Mongoose | Bajo | **Alto** | Validar y tipar input con Zod antes de cualquier query. |
| 16 | Keycloak SSO | E — Elevation | registrationAllowed: true permite crear cuentas sin autorización | **Alto** | **Alto** | Deshabilitar en realm-export.json. Solo admin puede crear usuarios. |
| 17 | Backend Node.js | D — DoS | Sin rate limiting en la API REST | Bajo | **Alto** | express-rate-limit: 100 req/min por IP. |
| 18 | MySQL | D — DoS | Sin límite de conexiones en el pool | Bajo | Medio | connectionLimit en pool de mysql2. Healthcheck que reporte estado. |
| 19 | MongoDB | D — DoS | Queries sin índice degradan performance | Bajo | Medio | Índices en curso_profesor_alumno_id y curso_profesor_id en Mongoose. |
| 20 | MinIO | D — DoS | Sin límite de tamaño en uploads | Bajo | Medio | limits.fileSize: 10MB en multer. |
| 21 | Mailpit | I — Info Disc. | UI sin auth en puerto 8025 expone todos los emails | **Solo local** | N/A | Bloquear puerto en producción. Reemplazar con SES/SendGrid. |
| 22 | Frontend Angular | T — Tampering | CORS sin whitelist de orígenes | Bajo | Medio | Lista explícita de orígenes en Express. Nunca * en producción. |
| 23 | Backend Node.js | I — Info Disc. | X-Powered-By: Express revela tecnología | Bajo | Medio | helmet() en app.ts — encontrado y confirmado por DAST. |
| 24 | Docker / Infra | I — Info Disc. | Prometheus (9090) y Grafana (3001) sin auth expuestos | Bajo | Medio | En producción: Prometheus solo en red interna Docker. |
| 25 | Keycloak SSO | I — Info Disc. | KC_DB: dev-mem pierde datos al reiniciar contenedor | **Alto local** | N/A | En producción: KC_DB: postgres con volumen persistente. |
| 26 | Backend Node.js | S — Spoofing | Sin validación de ownership: alumno puede ver datos de otro | Medio | **Alto** | Verificar que recurso pertenece al usuario del JWT antes de devolverlo. |
| 27 | MySQL | R — Repudiation | Sin backup automático del volumen Docker | **Alto** | **Alto** | mysqldump periódico a volumen separado. Probar restauración. |
| 28 | MongoDB | R — Repudiation | Sin backup de colección evaluaciones | **Alto** | Medio | mongodump periódico. Replica set en producción. |
| 29 | Docker / Infra | D — DoS | Sin healthchecks en backend y frontend | Bajo | Bajo | Agregar healthchecks a servicios de app en docker-compose. |
| 30 | Frontend Angular | R — Repudiation | Sin manejo de sesión expirada (token vencido sin aviso) | Medio | Bajo | Interceptor HTTP: detectar 401, limpiar sesión, redirigir a login. |

---

## Estado de correcciones

| # | Riesgo | Estado | Evidencia |
|---|---|---|---|
| 1 | Credenciales Keycloak | ✅ Corregido | realm-export.json — contraseña cambiada |
| 2 | client_secret en frontend | ⚠️ Pendiente | Requiere migración a PKCE |
| 3 | Inyección SQL | ✅ Corregido | Todos los queries usan prepared statements |
| 4 | Sin autorización por rol | ✅ Corregido | autorizar.middleware.ts implementado |
| 5 | Bucket MinIO público | ✅ Corregido | docker-compose.yml sin anonymous policy |
| 6 | JWT_SECRET débil | ✅ Corregido | Secret de 64 bytes en .env |
| 9 | .env en repositorio | ✅ Corregido | .gitignore actualizado, historial limpiado |
| 14 | Stack traces en prod | ✅ Corregido | Error handler global en app.ts |
| 16 | Registro público Keycloak | ✅ Corregido | registrationAllowed: false |
| 23 | X-Powered-By expuesto | ✅ Corregido | helmet() instalado — confirmado por DAST |

---

## Plan de mitigación

### Riesgos Críticos — Atender de inmediato

**#1 — Credenciales Keycloak por defecto**
Cambiar la contraseña del admin desde `http://localhost:8080` → Realm Settings → Password Policy: mínimo 8 caracteres, mayúscula, número y símbolo. ✅ **Ya implementado.**

**#2 — client_secret expuesto en frontend**
Migrar al flujo Authorization Code + PKCE. El frontend redirige al login de Keycloak; Keycloak devuelve un `code` que el backend intercambia por el token — el secret nunca sale del servidor. En `realm-export.json` cambiar `publicClient: true` para `iteso-frontend` y eliminar el secret de `environment.ts`.

**#3 — Inyección SQL**
Todos los queries deben usar la forma parametrizada de mysql2:
```typescript
pool.query('SELECT * FROM usuario WHERE email = ?', [email])
// Nunca:
pool.query('SELECT * FROM usuario WHERE email = "' + email + '"')
```
✅ **Ya implementado en todos los modelos SQL.**

**#4 — Sin autorización por rol**
```typescript
router.get('/reportes', autenticar, autorizar(['ADMIN', 'COORDINADOR']), controller);
```
✅ **Middleware `autorizar.middleware.ts` implementado.**

**#5 — Bucket MinIO público**
Eliminada la línea `mc anonymous set download` del docker-compose. Implementadas presigned URLs con expiración de 15 minutos:
```typescript
const url = await getSignedUrl(s3Client, new GetObjectCommand({Bucket, Key}), { expiresIn: 900 });
```
✅ **Ya implementado.**

**#6 — JWT_SECRET débil**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
✅ **Secret de 64 bytes generado y configurado en .env.**

---

### Riesgos Altos — Antes de producción

**#7 — Fuerza bruta en Keycloak:** Activar en Keycloak → Realm Settings → Security Defenses → Brute Force Detection: máximo 5 intentos, bloqueo 5 minutos, espera exponencial.

**#8 — Sin auditoría:** Middleware Express que persista en MongoDB: usuario + acción + timestamp + IP en cada operación sensible.

**#9 — .env en git:** Eliminado del historial con `git filter-branch`. Agregado a `.gitignore`. ✅ **Ya implementado.**

**#10 — MIME validation en uploads:** Instalar `file-type` y verificar primeros bytes antes de guardar en MinIO.

**#11 — Sin validación de schema:** Instalar `zod` y validar `req.body` en cada controller.

**#12 — Contenedores como root:** Agregar `USER node` al final de cada Dockerfile.

**#13 — JWT en localStorage:** Migrar a `httpOnly cookies`. El token nunca es accesible desde JavaScript.

**#14 — Stack traces en producción:** Error handler global implementado. ✅

**#16 — Registro público Keycloak:** `registrationAllowed: false` en realm-export.json. ✅

**#17 — Sin rate limiting:**
```typescript
import rateLimit from 'express-rate-limit';
app.use(rateLimit({ windowMs: 60_000, max: 100 }));
```

**#26 — Sin ownership validation:** En cada endpoint verificar que el recurso pertenece al usuario del JWT.

**#27 — Sin backup MySQL:** Servicio de `mysqldump` periódico en docker-compose a volumen separado.

---

### Riesgos Medios

**#22 — CORS permisivo:** Lista explícita de orígenes en Express. Nunca `*` en producción.

**#23 — X-Powered-By:** `app.use(helmet())` — ya instalado. Confirmado resuelto por DAST. ✅

**#24 — Monitoreo expuesto:** Prometheus sin mapeo de puertos al host en producción.

**#25 — Keycloak dev-mem:** `KC_DB: postgres` con volumen persistente en producción.

**#19 — Índices MongoDB:** `db.evaluaciones.createIndex({ curso_profesor_alumno_id: 1 })`.

**#20 — Uploads sin límite:** `limits: { fileSize: 10 * 1024 * 1024 }` en multer.

**#28 — Sin backup MongoDB:** `mongodump` periódico + replica set en producción.

---

### Riesgos Bajos

**#30 — Sesión expirada sin aviso:** En `auth-interceptor.ts` interceptar 401, llamar `tokenService.clearSession()` y redirigir a login.

**#29 — Sin healthchecks en app:** Agregar healthchecks a `backend-dev` y `frontend-dev` en docker-compose.

---

## Prioridad de implementación

| Prioridad | Riesgos | Esfuerzo |
|---|---|---|
| **Inmediata** (antes de demo) | #1 ✅, #2, #5 ✅, #6 ✅, #9 ✅, #16 ✅ | 2–4 horas |
| **Antes de producción** | #3 ✅, #4 ✅, #7, #8, #10, #11, #12, #14 ✅, #17, #26, #27 | 1–2 días |
| **Mediano plazo** | #13, #19, #20, #22, #23 ✅, #24, #25, #28 | 2–3 días |
| **Mejoras continuas** | #15, #18, #29, #30 | 1 día |
