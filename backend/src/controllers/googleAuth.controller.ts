import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UsuarioService } from "../services/usuario.service";
import { GoogleAuthService } from "../services/googleAuth.service";
import { AlumnoModel } from "../models/sql/alumno.model";

export class GoogleAuthController {

  static async loginGoogle(req: Request, res: Response) {
    try {
      const idToken = req.body.credential || req.body.idToken;

      if (!idToken) {
        return res.status(400).json({ ok: false, msg: "Falta idToken" });
      }

      // 1. Verificar token Google
      const googleUser = await GoogleAuthService.verifyIdToken(idToken);

      const googleId = googleUser.googleId;
      const email = googleUser.email ?? "";
      const nombre = googleUser.name ?? "";
      const avatar = googleUser.picture ?? "";

      // 2. Buscar usuario existente
      let resultado: any;
      try {
        resultado = await UsuarioService.obtenerUsuarioPorId(googleId);
      } catch {
        resultado = { error: true };
      }

      let usuarioFinal: any;

      if (!resultado || "error" in resultado) {
        // 3. Crear usuario nuevo (sin apellidos)
        usuarioFinal = await UsuarioService.crearUsuario({
          expediente: googleId,
          nombre: nombre,
          apellido_paterno: "",    
          apellido_materno: "",
          fecha_de_nacimiento: "2000-01-01",
          email: email,
          rol: "3",
          activo: true,
          imagen: avatar
        });

        // Crear registro en tabla alumnos
        await AlumnoModel.createAlumno({
          expediente: googleId,
          carrera: "1",
          status: "Alumno"
        }).catch((err) => {
          console.error("Error al crear alumno para usuario Google:", err);
        });

      } else {
        usuarioFinal = Array.isArray(resultado) ? resultado[0] : resultado;
      }

      // 4. JWT
      const token = jwt.sign(
        {
          id: usuarioFinal.expediente,
          rol: usuarioFinal.rol.rol
        },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        ok: true,
        token,
        usuario: usuarioFinal.expediente,
        rol: usuarioFinal.rol
      });

    } catch (error: any) {
      console.error("Google Login Error:", error);
      return res.status(500).json({ ok: false, error: error.message });
    }
  }
}
