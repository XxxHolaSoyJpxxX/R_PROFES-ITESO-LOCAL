import { Router } from 'express';
import { DepartamentosAcademicosController } from '../controllers/departamentos-academicos.controller';
import { verificarRol } from '../middlewares/rol.middleware';

const router = Router();

router.get('/', DepartamentosAcademicosController.getDepartamentosAcademicos);
router.get('/:id', DepartamentosAcademicosController.getDepartamentoAcademicoById);
router.post('/', verificarRol(['admin']), DepartamentosAcademicosController.createDepartamentoAcademico);
router.put('/:id', verificarRol(['admin']), DepartamentosAcademicosController.updateDepartamentoAcademico);
router.delete('/:id', verificarRol(['admin']), DepartamentosAcademicosController.deleteDepartamentoAcademico);

export default router;
