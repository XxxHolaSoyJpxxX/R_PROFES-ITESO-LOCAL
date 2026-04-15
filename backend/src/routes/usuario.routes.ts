import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';
import { verificarRol } from '../middlewares/rol.middleware';

const router = Router();

router.get('/', UsuarioController.getUsuarios);
router.get('/rol/:rolId', UsuarioController.getUsuariosByRol);
router.get('/:id', UsuarioController.getUsuarioById);
router.post('/', verificarRol(['admin']), UsuarioController.createUsuario);
router.put('/:id', verificarRol(['admin']), UsuarioController.updateUsuario);
router.delete('/:id', verificarRol(['admin']), UsuarioController.deleteUsuario);

export default router;
