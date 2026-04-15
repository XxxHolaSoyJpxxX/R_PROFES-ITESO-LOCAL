import { Router } from 'express';
import ProfesoresController from '../controllers/profesores.controller';
import { verificarRol } from '../middlewares/rol.middleware';
import { upload } from '../middlewares/upload.middleware';
import { EvaluacionesController } from '../controllers/evaluaciones.controller';

const router = Router();

// Profesores generales
router.get('/', ProfesoresController.obtenerProfesores);
router.get('/:expediente', ProfesoresController.obtenerProfesor);
router.get('/:expediente/cursos', ProfesoresController.obtenerCursosDeProfesor);
router.get("/:expediente/cursos/:cursoId", ProfesoresController.obtenerCursoDeProfesor);

// Profesores recursos
router.get("/:expediente/recursos", ProfesoresController.obtenerRecursosDeProfesor);
router.post("/:expediente/recursos", verificarRol(['profesor']), upload.any(), ProfesoresController.crearRecursoParaProfesor);
router.get("/:expediente/recursos/:recursoId", ProfesoresController.obtenerRecursoDeProfesor);
router.delete("/:expediente/recursos/:recursoId", verificarRol(['profesor']), ProfesoresController.eliminarRecursoDeProfesor);
router.patch("/:expediente/recursos/:recursoId", verificarRol(['profesor']), ProfesoresController.actualizarRecursoDeProfesor);
router.get("/:expediente/curso/:cursoId/evaluaciones", EvaluacionesController.obtenerEvaluacionesPorIdProfesorYCurso);


// Operaciones CRUD para profesores
router.post("/", verificarRol(['admin']), ProfesoresController.crearProfesor);
router.put("/:expediente", verificarRol(['admin']), ProfesoresController.actualizarProfesor);
router.delete("/:expediente", verificarRol(['admin']), ProfesoresController.eliminarProfesor);

export default router;
