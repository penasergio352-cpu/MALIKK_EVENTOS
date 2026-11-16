import { Router } from 'express';
import { createReportsController } from '../controllers/reports.controller.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { ReportsService } from '../services/reports.service.js';

export function createReportsRouter(db) {
  const router = Router();
  const controller = createReportsController(new ReportsService(db));
  router.use(requireAuth, requireRoles('Administrador'));
  router.get('/', controller.obtenerResumen);
  return router;
}
