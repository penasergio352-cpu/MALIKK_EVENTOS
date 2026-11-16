import { Router } from 'express';
import { createReservationsController } from '../controllers/reservations.controller.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { ReservationsService } from '../services/reservations.service.js';

export function createReservationsRouter(db) {
  const router = Router();
  const controller = createReservationsController(new ReservationsService(db));
  router.use(requireAuth);

  router.get('/', controller.listar);
  router.get('/:id', controller.obtener);
  router.post('/', requireRoles('Cliente'), controller.crear);
  router.put('/:id', controller.actualizar);
  router.delete('/:id', controller.eliminar);
  return router;
}
