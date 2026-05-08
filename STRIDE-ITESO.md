# Análisis de Riesgos STRIDE — ITESO Evaluación Docente
**Fecha:** Mayo 2026  
**Metodología:** STRIDE (Spoofing · Tampering · Repudiation · Information Disclosure · Denial of Service · Elevation of Privilege)

---

## Tabla de Riesgos

| # | Componente | Categoría | Amenaza | Prob. | Impacto | Riesgo | Control / Mitigación |
|---|---|---|---|---|---|---|---|
| 1 | Keycloak SSO | S — Spoofing | Credenciales admin por defecto (admin/admin123) expuestas en red local | Alta | Crítico | **Crítico** | Cambiar credenciales admin antes de cualquier demo. Configurar política de contraseña fuerte en el realm. |
| 2 | Frontend Angular | I — Info Disc. | client_secret de Keycloak hardcodeado en environment.ts visible en el bundle JS | Alta | Crítico | **Crítico** | Migrar a Authorization Code Flow + PKCE con cliente público. El secret nunca debe salir del backend. |
| 3 | MySQL | T — Tampering | Inyección SQL si algún query usa concatenación en lugar de prepared statements | Media | Crítico | **Crítico** | Auditar todos los queries en models SQL. Usar únicamente mysql2 prepared statements con parámetros. |
| 4 | Backend Node.js | E — Elevation | Endpoints sin middleware de autorización permiten a un alumno llamar rutas de coordinador | Media | Crítico | **Crítico** | Agregar middleware de rol en cada route group. Verificar rol del JWT antes de ejecutar el controller. |
| 5 | MinIO | I — Info Disc. | Bucket con política "anonymous download" expone todos los archivos sin autenticación | Alta | Alto | **Crítico** | Cambiar bucket a privado. Generar presigned URLs con expiración ≤15 min para cada descarga. |
| 6 | Backend Node.js | T — Tampering | JWT_SECRET débil o predecible permite forjar tokens y suplantar cualquier usuario | Alta | Crítico | **Crítico** | Usar JWT_SECRET de mínimo 64 caracteres aleatorios. Rotar el secret periódicamente. |
| 7 | Keycloak SSO | D — DoS | Falta de rate limiting en el endpoint de token permite ataques de fuerza bruta | Alta | Alto | **Alto** | Activar brute-force policy en el realm: bloqueo tras 5 intentos fallidos, espera exponencial. |
| 8 | Backend Node.js | R — Repudiation | Sin log de auditoría: acciones críticas no quedan registradas | Alta | Alto | **Alto** | Implementar middleware de auditoría que persista usuario + acción + timestamp + IP en MongoDB. |
| 9 | MySQL | I — Info Disc. | Credenciales de BD en texto plano en .env sin cifrado ni rotación | Alta | Alto | **Alto** | No versionar .env. En producción usar Docker secrets o HashiCorp Vault. |
| 10 | MinIO | T — Tampering | Upload sin validación de tipo MIME real: se puede subir un ejecutable disfrazado de PDF | Media | Alto | **Alto** | Validar MIME real con la librería file-type en el middleware de multer. |
| 11 | Backend Node.js | T — Tampering | Sin validación de esquema en el body: datos malformados llegan al ORM | Media | Alto | **Alto** | Agregar validación con Zod o class-validator en cada controller antes de procesar el payload. |
| 12 | Docker / Infra | E — Elevation | Contenedores corriendo como root permiten escape al host ante una vulnerabilidad | Baja | Crítico | **Alto** | Agregar `USER node` en Dockerfiles. Usar imagen distroless en producción. |
| 13 | Frontend Angular | S — Spoofing | Token JWT almacenado en localStorage vulnerable a ataques XSS | Media | Alto | **Alto** | Migrar a httpOnly cookies para el token. Agregar cabecera Content-Security-Policy estricta. |
| 14 | Backend Node.js | I — Info Disc. | Errores del servidor exponen stack traces completos en las respuestas HTTP | Alta | Medio | **Alto** | Centralizar manejo de errores. En producción devolver solo mensaje genérico. |
| 15 | MongoDB | T — Tampering | NoSQL injection en filtros de evaluaciones si el input no se sanitiza | Baja | Alto | **Alto** | Validar y tipar todo input con Zod antes de pasarlo a queries de Mongoose. |
| 16 | Keycloak SSO | E — Elevation | Registro público habilitado en el realm permite que cualquiera cree una cuenta | Alta | Alto | **Alto** | Deshabilitar registrationAllowed en producción. Solo el admin puede crear usuarios. |
| 17 | Backend Node.js | D — DoS | Sin rate limiting en la API: un atacante puede saturar el servidor con requests masivos | Media | Alto | **Alto** | Agregar express-rate-limit con ventana de 1 min y máximo 100 requests por IP. |
| 18 | MySQL | D — DoS | Sin límite de conexiones: un pico de tráfico agota el pool y tumba el backend | Media | Medio | **Medio** | Configurar connectionLimit en el pool de mysql2. |
| 19 | MongoDB | D — DoS | Queries sin índice en evaluaciones degradan performance con volumen alto | Media | Medio | **Medio** | Agregar índice en curso_profesor_alumno_id y curso_profesor_id en el schema de Mongoose. |
| 20 | MinIO | D — DoS | Sin límite de tamaño en uploads: un archivo enorme puede agotar el disco | Media | Medio | **Medio** | Configurar limits.fileSize en multer (ej. 10 MB). |
| 21 | Mailpit / Email | I — Info Disc. | UI de Mailpit sin autenticación en puerto 8025 expone todos los correos del sistema | Alta | Bajo | **Medio** | Bloquear puerto 8025 en producción. Reemplazar con SMTP real autenticado. |
| 22 | Frontend Angular | T — Tampering | Sin cabecera CORS estricta: cualquier origen puede hacer requests a la API | Media | Medio | **Medio** | Configurar CORS en Express con whitelist de orígenes permitidos. |
| 23 | Backend Node.js | I — Info Disc. | Cabeceras HTTP por defecto revelan tecnología (X-Powered-By: Express) | Alta | Bajo | **Medio** | Instalar helmet.js para ocultar cabeceras sensibles y agregar CSP, HSTS, X-Frame-Options. |
| 24 | Docker / Infra | I — Info Disc. | Puertos de administración (Prometheus 9090, Grafana 3001) sin autenticación | Alta | Medio | **Medio** | Limitar Prometheus a red interna de Docker. Mantener autenticación en Grafana. |
| 25 | Keycloak SSO | I — Info Disc. | KC_DB: dev-mem pierde todos los usuarios y config al reiniciar el contenedor | Alta | Medio | **Medio** | En producción usar KC_DB: postgres con volumen persistente. |
| 26 | Backend Node.js | S — Spoofing | Sin validación de que el alumno solo accede a sus propias evaluaciones e inscripciones | Media | Alto | **Alto** | Verificar que el recurso solicitado pertenece al usuario del JWT antes de devolverlo. |
| 27 | MySQL | R — Repudiation | Sin backup automatizado: un fallo del volumen Docker pierde todos los datos | Media | Crítico | **Alto** | Programar mysqldump periódico a un volumen separado. Probar restauración. |
| 28 | MongoDB | R — Repudiation | Sin backup de evaluaciones: pérdida del volumen elimina todo el historial | Media | Alto | **Medio** | Configurar mongodump periódico. Considerar replica set para producción. |
| 29 | Docker / Infra | D — DoS | Sin healthchecks en backend y frontend: un crash no se detecta automáticamente | Baja | Medio | **Bajo** | Agregar healthchecks a los servicios de backend y frontend en el docker-compose. |
| 30 | Frontend Angular | R — Repudiation | Sin manejo de sesión expirada: el usuario sigue navegando con token vencido sin aviso | Alta | Bajo | **Bajo** | En el interceptor HTTP detectar 401, limpiar sesión y redirigir al login con mensaje. |

---

## Plan de Mitigación

### Riesgos Críticos — Atender de inmediato

#### 1. Credenciales por defecto en Keycloak (#1)
El realm "iteso" arranca con `admin / admin123`. Cualquier persona con acceso a la red local puede tomar control total del sistema de identidad.

**Solución:** Antes de cualquier demo o entrega, cambiar la contraseña del admin desde `http://localhost:8080`. Configurar una política de contraseña fuerte en el realm: mínimo 8 caracteres, al menos una mayúscula, un número y un símbolo. Esto se hace en Keycloak → Realm Settings → Password Policy.

#### 2. client_secret expuesto en el frontend (#2)
El archivo `environment.ts` contiene el `client_secret` de Keycloak. Al compilar el bundle de Angular, ese valor queda visible en el JavaScript que descarga cualquier usuario en el navegador.

**Solución:** Migrar al flujo Authorization Code + PKCE con un cliente público en Keycloak. El frontend inicia el flujo redirigiendo al login de Keycloak; Keycloak devuelve un `code` que el **backend** intercambia por el token usando el secret, que nunca sale del servidor. En el `realm-export.json` cambiar `publicClient: true` para `iteso-frontend` y quitar el secret del environment de Angular.

#### 3. Elevación de privilegios sin autorización por rol (#4)
Varios endpoints del backend no verifican el rol del usuario autenticado. Un alumno podría llamar rutas diseñadas solo para coordinadores si conoce la URL.

**Solución:** Crear un middleware de autorización que reciba los roles permitidos:
```typescript
router.get('/coordinador/reportes', autenticar, autorizar(['ADMIN', 'COORDINADOR']), controller);
```
Auditar todos los archivos de rutas para asegurarse de que ningún endpoint sensible quede sin este middleware.

#### 4. Inyección SQL (#3)
Si algún query en los modelos SQL usa concatenación de strings con datos del usuario, es vulnerable a inyección SQL.

**Solución:** Revisar todos los archivos en `backend/src/models/sql/`. Todos los queries deben usar la forma parametrizada de mysql2:
```typescript
// Correcto
pool.query('SELECT * FROM usuario WHERE email = ?', [email])

// Nunca hacer esto
pool.query('SELECT * FROM usuario WHERE email = "' + email + '"')
```

#### 5. JWT_SECRET débil (#6)
Si el JWT_SECRET en el `.env` es corto o predecible, un atacante puede forjar tokens y autenticarse como cualquier usuario.

**Solución:** Generar un secret de al menos 64 caracteres aleatorios:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Reemplazar el valor en `.env` y nunca versionar ese archivo en git.

#### 6. Bucket de MinIO público (#5)
El script de inicialización configura el bucket con política `anonymous download`, lo que significa que cualquier persona con la URL puede descargar cualquier archivo.

**Solución:** Eliminar la línea `mc anonymous set download` del `docker-compose.yml`. Implementar presigned URLs en el `s3.service.ts`:
```typescript
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const url = await getSignedUrl(
  s3Client,
  new GetObjectCommand({ Bucket, Key }),
  { expiresIn: 900 } // 15 minutos
);
```

---

### Riesgos Altos — Atender antes de producción

**Fuerza bruta en Keycloak (#7):** Activar Brute Force Detection en Keycloak → Realm Settings → Security Defenses: máximo 5 intentos fallidos, bloqueo de 5 minutos, espera exponencial.

**Falta de auditoría (#8):** Implementar un middleware de auditoría en Express que guarde en MongoDB cada acción sensible (login, crear evaluación, subir recurso) con usuario, acción, timestamp e IP.

**Datos sensibles en .env (#9):** Agregar `.env` al `.gitignore`. En producción usar Docker secrets o HashiCorp Vault para inyectar credenciales sin exponerlas en archivos de texto plano.

**Validación de archivos en upload (#10):** Agregar la librería `file-type` para leer los primeros bytes del archivo y verificar el tipo MIME real antes de guardarlo en MinIO. No confiar en la extensión ni en el Content-Type declarado por el cliente.

**Validación de schema en requests (#11):** Instalar `zod` y crear un schema de validación para cada endpoint que reciba datos. Nunca pasar `req.body` directamente al ORM sin validar estructura y tipos.

**Contenedores como root (#12):** Agregar `USER node` al final de cada Dockerfile de Node.js. En producción usar imágenes distroless que no incluyen shell ni herramientas de sistema.

**JWT en localStorage (#13):** Migrar a `httpOnly cookies` para el almacenamiento del token. El navegador nunca expone estas cookies a JavaScript, eliminando el vector de robo por XSS.

**Stack traces en producción (#14):** Crear un middleware de manejo de errores global en Express que en producción devuelva solo `{ message: "Error interno" }` y escriba el detalle completo únicamente en los logs del servidor.

**Registro público en Keycloak (#16):** Cambiar `registrationAllowed: false` en `keycloak/realm-export.json` antes de ir a producción.

**Rate limiting en la API (#17):**
```typescript
import rateLimit from 'express-rate-limit';
app.use(rateLimit({ windowMs: 60_000, max: 100 }));
```

**Autorización a nivel de recurso (#26):** En cada endpoint verificar que el recurso solicitado pertenece al usuario del JWT antes de devolverlo. Un alumno no debe poder leer las evaluaciones de otro alumno cambiando el ID en la URL.

**Sin backups de MySQL (#27):** Agregar un servicio de backup en el docker-compose que ejecute `mysqldump` periódicamente y guarde el resultado en un volumen separado. Probar la restauración regularmente.

---

### Riesgos Medios — Mejoras recomendadas

**CORS sin whitelist (#22):** Configurar el middleware de CORS en Express con una lista explícita de orígenes. En producción nunca usar `*`.

**Cabeceras HTTP reveladoras (#23):** Instalar `helmet` en Express con una sola línea: `app.use(helmet())`. Oculta `X-Powered-By` y agrega CSP, HSTS y X-Frame-Options automáticamente.

**Puertos de monitoreo expuestos (#24):** En producción eliminar el mapeo de puertos de Prometheus al host y restringirlo a la red interna de Docker. Grafana es el único punto de acceso a métricas para usuarios.

**Keycloak con DB en memoria (#25):** `KC_DB: dev-mem` pierde todos los datos al reiniciar. En producción configurar una base de datos PostgreSQL persistente para Keycloak.

**Índices faltantes en MongoDB (#19):** Agregar índices en el schema de Mongoose para `curso_profesor_alumno_id` y `curso_profesor_id` antes de que la colección crezca.

**Límite de tamaño en uploads (#20):** Configurar `limits: { fileSize: 10 * 1024 * 1024 }` en multer (10 MB máximo por archivo).

**Mailpit en producción (#21):** Reemplazar con un proveedor SMTP real (Amazon SES, SendGrid) con credenciales propias. El puerto 8025 de Mailpit debe estar bloqueado fuera del entorno de desarrollo.

**Backup de MongoDB (#28):** Programar `mongodump` periódico para proteger el historial completo de evaluaciones. Considerar un replica set para alta disponibilidad.

---

### Riesgos Bajos — Mejoras de calidad

**Sesión expirada sin aviso (#30):** En el `auth-interceptor.ts` de Angular, interceptar los errores 401, limpiar la sesión con `tokenService.clearSession()` y redirigir al login con el mensaje "Tu sesión ha expirado".

**Restart automático (#29):** Ya configurado con `restart: unless-stopped` en todos los servicios. Como mejora adicional, agregar healthchecks a los contenedores de backend y frontend para que Docker los reinicie si dejan de responder correctamente.

---

## Prioridad de implementación

| Prioridad | Riesgos | Esfuerzo estimado |
|---|---|---|
| **Inmediata** (antes de demo) | #1, #2, #5, #6, #16 | 2–4 horas |
| **Corto plazo** (antes de producción) | #3, #4, #7, #8, #9, #10, #11, #12, #14, #17, #26, #27 | 1–2 días |
| **Mediano plazo** | #13, #19, #20, #22, #23, #24, #25, #28 | 2–3 días |
| **Mejoras continuas** | #15, #18, #29, #30 | 1 día |
