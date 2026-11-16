import cors from 'cors';
import express from 'express';
import { createApiRouter } from './routes/api.routes.js';
import { errorHandler } from './middleware/error.js';

export function createApp(db) {
  const app = express();
  const allowedOrigins = (process.env.CLIENT_ORIGIN ?? 'http://localhost:4200')
    .split(',')
    .map((origin) => origin.trim());

  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json({ limit: '8mb' }));
  app.use('/api', createApiRouter(db));
  app.use((_req, res) => res.status(404).json({ error: { message: 'Ruta no encontrada.' } }));
  app.use(errorHandler);
  return app;
}
