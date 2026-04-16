import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UsuarioModel } from "../models/sql/usuarios.model";
import { RolesService } from "../services/roles.service";
import { GoogleAuthService } from "../services/googleAuth.service";

export class GoogleAuthController {

  static async loginGoogle(req: Request, res: Response) {
    try {
      const idToken = req.body.credential || req.body.idToken;

      if (!idToken) {
        return res.status(400).json({ ok: false, msg: "Falta idToken" });
      }

      // 1. Verificar token con Keycloak
      const keycloakUser = await GoogleAuthService.verifyIdToken(idToken);
      const email = keycloakUser.email ?? "";

      // 2. Buscar usuario en MySQL por email
      const usuario = await UsuarioModel.getUsuarioByEmail(email);

      if (!usuario) {
        return res.status(403).json({
          ok: false,
          msg: `No existe una cuenta para ${email}. Contacta al administrador.`
        });
      }

      // 3. Obtener rol completo
      const rol = await RolesService.obtenerRolPorId(usuario.rol);
      if (!rol || "error" in rol) {
        return res.status(500).json({ ok: false, msg: "Error al obtener el rol del usuario." });
      }

      // 4. Firmar JWT propio
      const token = jwt.sign(
        { id: usuario.expediente, rol: rol.rol },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        ok: true,
        token,
        usuario: usuario.expediente,
        rol
      });

    } catch (error: any) {
      console.error("Login Error:", error);
      return res.status(500).json({ ok: false, error: error.message });
    }
  }
}