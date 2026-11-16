import { ZodError } from 'zod';
import { HttpError } from '../errors.js';

export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) {
    return res.status(400).json({ error: { message: error.issues[0]?.message ?? 'Los datos enviados no son válidos.' } });
  }
  if (error?.code === '23505') {
    return res.status(409).json({ error: { message: 'Ya existe un registro con esos datos.' } });
  }
  if (error?.code === '23503' || error?.code === '23514') {
    return res.status(409).json({ error: { message: 'La operación no es válida por las relaciones o reglas de datos.' } });
  }

  const status = error instanceof HttpError ? error.status : 500;
  const message = error instanceof HttpError ? error.message : 'Ocurrió un error interno.';
  if (status === 500) {
    console.error(error);
  }
  return res.status(status).json({ error: { message } });
}
