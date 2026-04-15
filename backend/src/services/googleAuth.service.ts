/**
 * googleAuth.service.ts — VERSIÓN LOCAL (Keycloak)
 *
 * Keycloak habla OIDC igual que Google, así que solo cambia:
 *   - El "audience" (clientId de Keycloak en lugar de Google)
 *   - El issuer (URL de Keycloak en lugar de accounts.google.com)
 *
 * La clase y su firma pública son idénticas al original.
 */
import { googleConfig } from "../config/google.config";

// de cualquier issuer si le pasamos jwksUri o usamos verifyIdToken con audience custom.
// Para Keycloak usamos directamente la librería jose (más flexible).
import * as jose from "jose";

export class GoogleAuthService {
  static async verifyIdToken(idToken: string) {
    // Obtenemos el JWKS desde Keycloak (mismo endpoint que Google usa)
    const JWKS = jose.createRemoteJWKSet(
      new URL(`${googleConfig.issuer}/protocol/openid-connect/certs`)
    );

    const { payload } = await jose.jwtVerify(idToken, JWKS, {
      issuer:   googleConfig.issuer,
      audience: googleConfig.clientId,
    });

    if (!payload) throw new Error("Token inválido");

    return {
      googleId: payload.sub as string,          // sub = identificador único del usuario
      email:    payload.email as string,
      name:     payload.name as string,
      picture:  (payload.picture as string) ?? "",
    };
  }
}
