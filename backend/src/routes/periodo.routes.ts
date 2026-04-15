import { Router } from 'express';
import { PeriodoController } from '../controllers/periodo.controller';
import { verificarRol } from '../middlewares/rol.middleware';

const router = Router();

router.get('/', PeriodoController.getPeriodos);
router.get('/:id', PeriodoController.getPeriodoById);
router.post('/', verificarRol(['admin']), PeriodoController.createPeriodo);
router.put('/:id', verificarRol(['admin']), PeriodoController.updatePeriodo);

export default router;
