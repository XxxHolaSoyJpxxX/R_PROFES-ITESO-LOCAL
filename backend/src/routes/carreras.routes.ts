import { Router } from 'express';
import { CarrerasController } from '../controllers/carreras.controller';
import { verificarRol } from '../middlewares/rol.middleware';

const router = Router();

router.get('/', CarrerasController.getCarreras);
router.get('/:id', CarrerasController.getCarreraById);
router.post('/', verificarRol(['admin']), CarrerasController.createCarrera);
router.put('/:id', verificarRol(['admin']), CarrerasController.updateCarrera);
router.delete('/:id', verificarRol(['admin']), CarrerasController.deactivateCarrera);

export default router;
