import { Router } from 'express';
import alumnosRoutes from './alumnos.routes';
import profesoresRoutes from './profesores.routes';
import inscripcionesRoutes from "./inscripciones.routes";
import { autenticar } from '../middlewares/auth.middleware';
import googleAuthRoutes from "./googleAuth.routes";
import carrerasRoutes from './carreras.routes';
import cursosRoutes from './cursos.routes';
import usuarioRoutes from './usuario.routes';
import areasAcademicasRoutes from './areas-academicas.routes';
import departamentosAcademicosRoutes from './departamentos-academicos.routes';
import modalidadRoutes from './modalidad.routes';
import periodoRoutes from './periodo.routes';
import rolesRoutes from './roles.routes';

const router = Router();

// Rutas principales solicitadas
router.use("/alumnos", autenticar, alumnosRoutes);
router.use('/profesores', autenticar, profesoresRoutes);
router.use("/inscripciones", inscripcionesRoutes);
router.use("/carreras", autenticar, carrerasRoutes);
router.use("/cursos", autenticar, cursosRoutes);

// Rutas adicionales
router.use("/usuarios", autenticar, usuarioRoutes);
router.use("/areas-academicas", autenticar, areasAcademicasRoutes);
router.use("/departamentos-academicos", autenticar, departamentosAcademicosRoutes);
router.use("/modalidades", autenticar, modalidadRoutes);
router.use("/periodos", autenticar, periodoRoutes);
router.use("/roles", autenticar, rolesRoutes);

// Autenticación
router.use("/auth", googleAuthRoutes);



export default router;
