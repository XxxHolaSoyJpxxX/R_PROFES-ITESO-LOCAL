import { Request, Response, NextFunction } from 'express';

type Rol = 'admin' | 'profesor' | 'alumno' | 'coordinador';

// Este middleware asume que `req.user` fue agregado por el middleware de autenticación y que contiene el campo `rol`.
export const verificarRol = (rolesPermitidos: Rol[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const usuario = req.user as { id: string; rol: Rol } | undefined;

    if (!usuario) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }
    const rolUsuario = usuario.rol.toLowerCase() as Rol;
    if (!rolesPermitidos.includes(rolUsuario)) {
      return res.status(403).json({ message: 'Acceso denegado: rol no autorizado' });
    }

    next();
  };
};
