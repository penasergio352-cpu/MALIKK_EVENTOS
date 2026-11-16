import { Router } from 'express';
import { createResourceController } from '../controllers/resource.controller.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';

export function createResourceRouter(db, definition, roles, options = {}) {
  const router = Router();
  const controller = createResourceController(db, definition);
  const { publicRead = false, readRoles = roles } = options;
  const readAccess = publicRead ? [] : [requireAuth, requireRoles(...readRoles)];

  router.get('/', ...readAccess, controller.listar);
  router.get('/:id', ...readAccess, controller.obtener);
  router.post('/', requireAuth, requireRoles(...roles), controller.crear);
  router.put('/:id', requireAuth, requireRoles(...roles), controller.actualizar);
  router.delete('/:id', requireAuth, requireRoles(...roles), controller.eliminar);
  return router;
}
