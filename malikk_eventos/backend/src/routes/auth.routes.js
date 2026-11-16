import { Router } from 'express';
import { createAuthController } from '../controllers/auth.controller.js';
import { AuthService } from '../services/auth.service.js';
import { requireAuth } from '../middleware/auth.js';

export function createAuthRouter(db) {
  const router = Router();
  const controller = createAuthController(new AuthService(db));

  router.post('/register', controller.registrar);
  router.post('/login', controller.iniciarSesion);
  router.get('/me', requireAuth, controller.obtenerPerfil);
  return router;
}
