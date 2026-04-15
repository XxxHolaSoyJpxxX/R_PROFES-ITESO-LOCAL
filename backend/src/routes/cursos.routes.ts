import { Router } from 'express';
import { CursosController } from '../controllers/cursos.controller';
import { verificarRol } from '../middlewares/rol.middleware';

const router = Router();

router.get('/', CursosController.getCursos);
router.get('/:id', CursosController.getCursoById);
router.get('/:id/profesores', CursosController.getProfesoresByCurso);
router.post('/', verificarRol(['admin']), CursosController.createCurso);
router.put('/:id', verificarRol(['admin']), CursosController.updateCurso);
router.delete('/:id', verificarRol(['admin']), CursosController.deleteCurso);

export default router;
