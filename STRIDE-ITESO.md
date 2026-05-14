    # Análisis de Riesgos STRIDE — ITESO Evaluación Docente
**Fecha:** Mayo 2026  
**Metodología:** STRIDE  
**Contexto:** Sistema corriendo localmente con Docker Compose. Los riesgos se evalúan en el entorno actual (local) pero con visión hacia un eventual despliegue en nube.

> **Nota de contexto:** En entorno local la superficie de ataque es menor (red privada, acceso físico restringido), pero las malas prácticas documentadas aquí se volverían críticas en cuanto el sistema se exponga a internet. Por eso se mantiene el nivel de riesgo pensando en producción.

---

## Tabla de Riesgos

| # | Componente | Categoría | Amenaza | Contexto local | Riesgo en nube | Control |
|---|---|---|---|---|---|---|
| 1 | Keycloak SSO | S — Spoofing | Credenciales admin por defecto (admin/admin123) | Bajo en red local | **Crítico** | Cambiar antes de cualquier demo. Política de contraseña fuerte en Realm Settings. |
| 2 | Frontend Angular | I — Info Disc. | client_secret hardcodeado en environment.ts, visible en bundle JS | Medio local | **Crítico** | Migrar a PKCE sin secret en el cliente. Secret solo en backend. |
| 3 | MySQL | T — Tampering | Posible inyección SQL por concatenación de strings en queries | Medio local | **Crítico** | Auditar todos los queries. Usar únicamente prepared statements de mysql2. |
| 4 | Backend Node.js | E — Elevation | Endpoints sin middleware de autorización por rol | Medio local | **Crítico** | Middleware `autorizar([roles])` en cada route group sensible. |
| 5 | MinIO | I — Info Disc. | Bucket con política anonymous download expone archivos sin auth | Medio local | **Crítico** | Bucket privado + presigned URLs con expiración de 15 min. |
| 6 | Backend Node.js | T — Tampering | JWT_SECRET débil permite forjar tokens | Medio local | **Crítico** | Secret de 64+ chars aleatorios. Rotar periódicamente. |
| 7 | Keycloak SSO | D — DoS | Sin rate limiting en endpoint de token | Bajo local | **Alto** | Brute-force policy: bloqueo tras 5 intentos, espera exponencial. |
| 8 | Backend Node.js | R — Repudiation | Sin log de auditoría de acciones críticas | Bajo local | **Alto** | Middleware que persiste usuario + acción + timestamp + IP en MongoDB. |
| 9 | MySQL | I — Info Disc. | Credenciales en .env en texto plano y versionado en git | **Alto local** | **Alto** | .env en .gitignore. En producción: Docker secrets o Vault. |
| 10 | MinIO | T — Tampering | Upload sin validación de MIME real (solo extensión) | Medio local | **Alto** | Librería file-type para verificar primeros bytes del archivo. |
| 11 | Backend Node.js | T — Tampering | Sin validación de esquema en body de requests | Medio local | **Alto** | Validación con Zod en cada controller antes de pasar al ORM. |
| 12 | Docker / Infra | E — Elevation | Contenedores corriendo como root | Bajo local | **Alto** | `USER node` en Dockerfiles. Imagen distroless en producción. |
| 13 | Frontend Angular | S — Spoofing | JWT en localStorage vulnerable a XSS | Bajo local | **Alto** | httpOnly cookies + Content-Security-Policy estricta. |
| 14 | Backend Node.js | I — Info Disc. | Stack traces completos en respuestas de error 500 | Medio local | **Alto** | Error handler global: mensaje genérico en producción, detalle solo en logs. |
| 15 | MongoDB | T — Tampering | NoSQL injection si input no se sanitiza antes de Mongoose | Bajo local | **Alto** | Validar y tipar input con Zod antes de cualquier query. |
| 16 | Keycloak SSO | E — Elevation | registrationAllowed: true permite crear cuentas sin autorización | **Alto local** | **Alto** | Deshabilitar en realm-export.json. Solo admin puede crear usuarios. |
| 17 | Backend Node.js | D — DoS | Sin rate limiting en la API REST | Bajo local | **Alto** | express-rate-limit: 100 req/min por IP. |
| 18 | MySQL | D — DoS | Sin límite de conexiones en el pool | Bajo local | Medio | connectionLimit en pool de mysql2. Healthcheck que reporte estado. |
| 19 | MongoDB | D — DoS | Queries sin índice degradan performance con volumen alto | Bajo local | Medio | Índices en curso_profesor_alumno_id y curso_profesor_id. |
| 20 | MinIO | D — DoS | Sin límite de tamaño en uploads | Bajo local | Medio | limits.fileSize: 10MB en multer. |
| 21 | Mailpit | I — Info Disc. | UI sin auth en puerto 8025 expone todos los emails | **Solo local** | N/A en prod | Bloquear puerto en producción. Reemplazar con SES/SendGrid. |
| 22 | Frontend Angular | T — Tampering | CORS sin whitelist de orígenes | Bajo local | Medio | Lista explícita de orígenes en Express. Nunca * en producción. |
| 23 | Backend Node.js | I — Info Disc. | X-Powered-By: Express revela tecnología | Bajo local | Medio | helmet() en app.ts. |
| 24 | Docker / Infra | I — Info Disc. | Prometheus (9090) y Grafana (3001) sin auth expuestos | Bajo local | Medio | En producción: Prometheus solo en red interna Docker. |
| 25 | Keycloak SSO | I — Info Disc. | KC_DB: dev-mem pierde datos al reiniciar contenedor | **Alto local** | N/A en prod | En producción: KC_DB: postgres con volumen persistente. |
| 26 | Backend Node.js | S — Spoofing | Sin validación de ownership: alumno puede ver datos de otro | Medio local | **Alto** | Verificar que recurso pertenece al usuario del JWT antes de devolverlo. |
| 27 | MySQL | R — Repudiation | Sin backup automático del volumen Docker | **Alto local** | **Alto** | mysqldump periódico a volumen separado. Probar restauración. |
| 28 | MongoDB | R — Repudiation | Sin backup de colección evaluaciones | **Alto local** | Medio | mongodump periódico. Replica set en producción. |
| 29 | Docker / Infra | D — DoS | Sin healthchecks en backend y frontend | Bajo local | Bajo | Agregar healthchecks a servicios de app en docker-compose. |
| 30 | Frontend Angular | R — Repudiation | Sin manejo de sesión expirada (token vencido sin aviso) | Medio local | Bajo | Interceptor HTTP: detectar 401, limpiar sesión, redirigir a login. |

---

## Riesgos críticos resueltos en este proyecto

Los siguientes riesgos críticos **ya fueron implementados** como parte del desarrollo:

| # | Riesgo | Estado | Dónde |
|---|---|---|---|
| 1 | Credenciales Keycloak | ✅ Documentado y configurado | keycloak/realm-export.json |
| 2 | client_secret en frontend | ⚠️ Pendiente PKCE | environment.ts aún tiene secret |
| 3 | Inyección SQL | ✅ Prepared statements en todos los modelos | backend/src/models/sql/ |
| 4 | Autorización por rol | ✅ Middleware implementado | auth.middleware.ts |
| 5 | Bucket MinIO público | ✅ Configurado privado | docker-compose.yml + s3.service.ts |
| 6 | JWT_SECRET débil | ✅ Generado con crypto.randomBytes | .env |
| 16 | Registro público Keycloak | ✅ Deshabilitado | realm-export.json |

---

## Prioridad de implementación

| Prioridad | Riesgos | Cuándo |
|---|---|---|
| **Inmediata** | #1, #2, #5, #6, #9, #16 | Antes de cualquier demo o push a repo público |
| **Antes de producción** | #3, #4, #7, #8, #10, #11, #12, #14, #17, #26, #27 | Sprint de hardening |
| **Mediano plazo** | #13, #19, #20, #22, #23, #24, #25, #28 | Backlog de seguridad |
| **Mejoras continuas** | #15, #18, #29, #30 | Deuda técnica |
