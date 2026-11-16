import { Router } from 'express';
import { asyncHandler } from '../errors.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { resources } from '../models/resource.model.js';
import { createAuthRouter } from './auth.routes.js';
import { createReportsRouter } from './reports.routes.js';
import { createReservationsRouter } from './reservations.routes.js';
import { createResourceRouter } from './resources.routes.js';
import { createUsersRouter } from './users.routes.js';

export function createApiRouter(db) {
  const router = Router();
  router.get('/health', asyncHandler(async (_req, res) => {
    await db.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  }));
  router.use('/auth', createAuthRouter(db));
  router.use('/usuarios', createUsersRouter(db));
  const staffRoles = ['Agente', 'Administrador'];
  const readLocationOptions = { publicRead: true };
  router.use('/paises', createResourceRouter(db, resources.paises, ['Administrador'], readLocationOptions));
  router.use('/departamentos', createResourceRouter(db, resources.departamentos, ['Administrador'], readLocationOptions));
  router.use('/ciudades', createResourceRouter(db, resources.ciudades, ['Administrador'], readLocationOptions));
  router.use('/estados-reserva', createResourceRouter(db, resources.estadosReserva, ['Administrador']));
  router.use('/estados-evento', createResourceRouter(db, resources.estadosEvento, ['Administrador']));
  router.use('/eventos', createResourceRouter(db, resources.eventos, staffRoles, { publicRead: true }));
  router.use('/reservas', createReservationsRouter(db));
  router.use('/admin/reportes', createReportsRouter(db));
  router.get('/admin', requireAuth, requireRoles('Administrador'), (_req, res) => {
    res.json({ message: 'Acceso de administrador autorizado.' });
  });
  return router;
}
