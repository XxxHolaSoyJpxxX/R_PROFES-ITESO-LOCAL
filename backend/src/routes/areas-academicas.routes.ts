import { Router } from 'express';
import { AreasAcademicasController } from '../controllers/areas-academicas.controller';
import { verificarRol } from '../middlewares/rol.middleware';

const router = Router();

router.get('/', AreasAcademicasController.getAreasAcademicas);
router.get('/:id', AreasAcademicasController.getAreaAcademicaById);
router.post('/', verificarRol(['admin']), AreasAcademicasController.createAreaAcademica);
router.put('/:id', verificarRol(['admin']), AreasAcademicasController.updateAreaAcademica);
router.delete('/:id', verificarRol(['admin']), AreasAcademicasController.deleteAreaAcademica);

export default router;
