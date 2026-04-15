import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define el tipo del payload que contendrá el token
export interface JwtPayload {
  id: string;
  rol: 'admin' | 'profesor' | 'estudiante' | 'coordinador';
  [key: string]: any;
}

// Extiende Request para incluir la propiedad `user`
declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload;
  }
}

const SECRET_KEY = process.env.JWT_SECRET || 'clave_secreta';

export const autenticar = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    req.user = decoded; // Guardamos el usuario en la request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};
