import { Router } from 'express';
import { createUsersController } from '../controllers/users.controller.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { UsersService } from '../services/users.service.js';

export function createUsersRouter(db) {
  const router = Router();
  const controller = createUsersController(new UsersService(db));
  router.use(requireAuth, requireRoles('Administrador'));

  router.get('/', controller.listar);
  router.get('/:id', controller.obtener);
  router.post('/', controller.crear);
  router.put('/:id', controller.actualizar);
  router.delete('/:id', controller.eliminar);
  return router;
}
