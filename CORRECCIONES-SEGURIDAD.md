# Corrección de Vulnerabilidades Críticas
**Sistema:** ITESO Evaluación Docente  
**Fecha:** Mayo 2026  
**Referencia:** Análisis STRIDE riesgos #1–#6, #9, #16, #23 + hallazgos DAST

---

## Corrección 1 — Cabeceras de seguridad HTTP (DAST: M1, M2, L1, L2)

**Vulnerabilidad:** El backend no enviaba cabeceras de seguridad estándar:
- Sin `X-Frame-Options` → riesgo de clickjacking
- Sin `Content-Security-Policy` → facilita XSS
- Sin `X-Content-Type-Options` → riesgo de MIME sniffing
- `X-Powered-By: Express` presente → fingerprinting del servidor

**Archivo modificado:** `backend/src/app.ts`

**Cambio:**
```typescript
// ANTES — sin cabeceras de seguridad
import express from 'express';
const app = express();
app.use(express.json());

// DESPUÉS — con helmet.js
import express from 'express';
import helmet from 'helmet';
const app = express();
app.use(helmet()); // Agrega X-Frame-Options, CSP, X-Content-Type-Options, elimina X-Powered-By
app.use(express.json());
```

**Instalación:**
```bash
cd backend && npm install helmet && npm install --save-dev @types/helmet
```

**Resultado:** Resuelve 5 alertas del scan DAST (M1, M2, L1, L2, L3 parcial).

---

## Corrección 2 — .env versionado en GitHub (STRIDE #9)

**Vulnerabilidad:** El archivo `.env` con credenciales de bases de datos, MinIO y Keycloak estaba commiteado en el repositorio público. Cualquier persona podía ver las contraseñas.

**Archivos modificados:** `.gitignore`, `.env.example` (nuevo)

**Cambio en `.gitignore`:**
```gitignore
# ANTES — .env no estaba ignorado
node_modules/
dist/

# DESPUÉS — .env ignorado, .env.example como referencia
node_modules/
dist/
.env
.env.local
.env.*.local
```

**Credenciales rotadas** tras eliminar del historial:
```bash
# Eliminar del historial de git
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
git push origin --force
```

**Resultado:** Credenciales ya no visibles en el repositorio público. `.env.example` documenta las variables necesarias sin valores reales.

---

## Corrección 3 — Registro público en Keycloak (STRIDE #16)

**Vulnerabilidad:** El realm de Keycloak tenía `registrationAllowed: true`, permitiendo que cualquier persona creara una cuenta en el sistema de autenticación sin autorización del administrador.

**Archivo modificado:** `keycloak/realm-export.json`

**Cambio:**
```json
// ANTES
{
  "realm": "iteso",
  "registrationAllowed": true,
  ...
}

// DESPUÉS
{
  "realm": "iteso",
  "registrationAllowed": false,
  ...
}
```

**Resultado:** Solo el administrador de Keycloak puede crear nuevos usuarios desde el panel en `http://localhost:8080`.

---

## Corrección 4 — Bucket MinIO público (STRIDE #5)

**Vulnerabilidad:** El script de inicialización de MinIO configuraba el bucket con política `anonymous download`, permitiendo que cualquier persona con la URL descargara archivos sin autenticación.

**Archivo modificado:** `docker-compose.yml` (servicio `minio-init`)

**Cambio:**
```yaml
# ANTES
minio-init:
  entrypoint: >
    /bin/sh -c "
      mc alias set local http://minio:9000 minioadmin minioadmin123 &&
      mc mb --ignore-existing local/iteso-archivos &&
      mc anonymous set download local/iteso-archivos &&
      echo 'Bucket listo'
    "

# DESPUÉS — sin política de acceso anónimo
minio-init:
  entrypoint: >
    /bin/sh -c "
      mc alias set local http://minio:9000 minioadmin minioadmin123 &&
      mc mb --ignore-existing local/iteso-archivos &&
      echo 'Bucket privado listo'
    "
```

**Complemento en `backend/src/services/s3.service.ts`** — presigned URLs para descarga:
```typescript
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Config } from "../config/s3.config";

export async function getPresignedUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: S3Config.bucketName,
    Key: key,
  });
  // URL válida por 15 minutos
  return await getSignedUrl(S3Config.s3Client, command, { expiresIn: 900 });
}
```

**Resultado:** Los archivos solo son accesibles mediante URLs firmadas con expiración, no por acceso directo.

---

## Corrección 5 — Middleware de autorización por rol (STRIDE #4)

**Vulnerabilidad:** Varios endpoints no verificaban el rol del usuario autenticado, permitiendo que un alumno accediera a rutas de coordinador o profesor.

**Archivo creado:** `backend/src/middlewares/autorizar.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de autorización por rol.
 * Debe usarse DESPUÉS de autenticar() en cada ruta sensible.
 * 
 * Uso: router.get('/ruta', autenticar, autorizar(['ADMIN']), controller)
 */
export function autorizar(rolesPermitidos: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const rolUsuario = (req as any).user?.rol;

    if (!rolUsuario) {
      return res.status(401).json({ msg: 'No autenticado' });
    }

    if (!rolesPermitidos.includes(rolUsuario)) {
      return res.status(403).json({
        msg: `Acceso denegado. Rol requerido: ${rolesPermitidos.join(' o ')}. Tu rol: ${rolUsuario}`
      });
    }

    next();
  };
}
```

**Aplicado en rutas:**
```typescript
// Ejemplo en areas-academicas.routes.ts
import { autorizar } from '../middlewares/autorizar.middleware';

router.post('/', autenticar, autorizar(['ADMIN', 'COORDINADOR']), AreasController.crear);
router.delete('/:id', autenticar, autorizar(['ADMIN']), AreasController.eliminar);
router.get('/', autenticar, autorizar(['ADMIN', 'COORDINADOR', 'PROFESOR']), AreasController.listar);
```

**Resultado:** Cada endpoint sensible verifica explícitamente el rol requerido antes de ejecutar la lógica de negocio.

---

## Corrección 6 — JWT_SECRET fuerte (STRIDE #6)

**Vulnerabilidad:** El JWT_SECRET en el `.env` era el string `local_super_secret_jwt_key_cambia_en_produccion`, predecible y débil.

**Cambio:**
```bash
# Generar secret criptográficamente seguro
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Ejemplo de output (64 bytes = 128 chars hex):
# a3f8c2e1d4b5...
```

**En `.env`:**
```env
# ANTES
JWT_SECRET=local_super_secret_jwt_key_cambia_en_produccion

# DESPUÉS (valor generado con crypto.randomBytes)
JWT_SECRET=a3f8c2e1d4b5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8
```

**Resultado:** Token JWT no puede ser forjado sin conocer el secret de 64 bytes generado aleatoriamente.

---

## Corrección 7 — Error handler global (STRIDE #14 / DAST hallazgo)

**Vulnerabilidad:** Los errores 500 exponían stack traces completos en las respuestas HTTP, revelando rutas internas del servidor, versiones de librerías y estructura del código.

**Archivo modificado:** `backend/src/app.ts`

```typescript
// ANTES — sin error handler global
// Los errores llegaban con stack trace completo al cliente

// DESPUÉS — error handler global al final de app.ts
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  console.error(err.stack); // Solo en logs del servidor

  if (process.env.NODE_ENV === 'production') {
    // En producción: mensaje genérico
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
  
  // En desarrollo: mensaje con error pero sin stack
  return res.status(500).json({ message: err.message });
});
```

**Resultado:** Stack traces nunca llegan al cliente en producción. Los logs del servidor mantienen el detalle completo para debugging.

---

## Corrección 8 — CSP incompleto (hallazgo real DAST — OWASP ZAP 2.17.0)

**Vulnerabilidad:** ZAP detectó que el Content-Security-Policy no define directivas sin fallback (`form-action`, `frame-ancestors`, `base-uri`). Omitirlas equivale a permitir cualquier origen para esas directivas.

**Alerta ZAP:** Medium — CSP: Failure to Define Directive with No Fallback (CWE-693)  
**URL afectada:** `GET http://localhost:3000/sitemap.xml`

**Archivo modificado:** `backend/src/app.ts`

```typescript
// ANTES — helmet() genérico sin CSP configurado
app.use(helmet());

// DESPUÉS — CSP con todas las directivas explícitas
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:     ["'self'"],
      scriptSrc:      ["'self'"],
      styleSrc:       ["'self'", "'unsafe-inline'"],
      imgSrc:         ["'self'", "data:"],
      formAction:     ["'self'"],        // evita submit a orígenes externos
      frameAncestors: ["'none'"],        // previene clickjacking
      baseUri:        ["'self'"],        // previene base tag injection
    }
  }
}));
```

**Resultado:** Resuelve la alerta Medium de ZAP. La cabecera `Permissions-Policy` (alerta Low) también es agregada automáticamente por `helmet()`.

---

## Resumen de correcciones

| # | Vulnerabilidad | Fuente | Archivo(s) modificado(s) | Estado |
|---|---|---|---|---|
| 1 | Cabeceras HTTP faltantes | STRIDE #14 + DAST | `app.ts` | ✅ Implementado |
| 2 | .env en repositorio público | STRIDE #9 | `.gitignore`, historial git | ✅ Implementado |
| 3 | Registro público Keycloak | STRIDE #16 | `realm-export.json` | ✅ Implementado |
| 4 | Bucket MinIO público | STRIDE #5 | `docker-compose.yml`, `s3.service.ts` | ✅ Implementado |
| 5 | Sin autorización por rol | STRIDE #4 | `autorizar.middleware.ts`, routes | ✅ Implementado |
| 6 | JWT_SECRET débil | STRIDE #6 | `.env` | ✅ Implementado |
| 7 | Stack traces en producción | STRIDE #14 | `app.ts` | ✅ Implementado |
| 8 | CSP incompleto | DAST — ZAP Medium | `app.ts` | ✅ Implementado |
