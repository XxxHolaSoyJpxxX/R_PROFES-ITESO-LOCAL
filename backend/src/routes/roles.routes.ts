import { Router } from 'express';
import { RolesController } from '../controllers/roles.controller';
import { verificarRol } from '../middlewares/rol.middleware';

const router = Router();

router.get('/', RolesController.getRoles);
router.get('/:id', RolesController.getRolById);
router.post('/', verificarRol(['admin']), RolesController.createRol);
router.put('/:id', verificarRol(['admin']), RolesController.updateRol);

export default router;
