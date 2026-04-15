import dotenv from "dotenv";
dotenv.config();

/**
 * google.config.ts — VERSIÓN LOCAL
 *
 * En producción apunta a Google.
 * En local apunta a Keycloak, que habla el mismo protocolo OIDC.
 * El resto del código(googleAuth.service.ts) no cambia.
 */
export const googleConfig = {
  clientId:     process.env.GOOGLE_CLIENT_ID     || "iteso-backend",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "iteso-secret-local",
  redirectUri:  process.env.GOOGLE_REDIRECT_URI  || "http://localhost:3000/auth/google/callback",

  // Keycloak expone el mismo endpoint de discovery que Google
  issuer: process.env.KEYCLOAK_ISSUER || "http://localhost:8080/realms/iteso",
};
