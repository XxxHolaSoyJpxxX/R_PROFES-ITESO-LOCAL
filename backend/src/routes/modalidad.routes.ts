import { Router } from 'express';
import { ModalidadController } from '../controllers/modalidad.controller';
import { verificarRol } from '../middlewares/rol.middleware';

const router = Router();

router.get('/', ModalidadController.getModalidades);
router.get('/:id', ModalidadController.getModalidadById);
router.post('/', verificarRol(['admin']), ModalidadController.createModalidad);
router.put('/:id', verificarRol(['admin']), ModalidadController.updateModalidad);
router.delete('/:id', verificarRol(['admin']), ModalidadController.deleteModalidad);

export default router;
