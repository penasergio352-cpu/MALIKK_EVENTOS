import jwt from 'jsonwebtoken';
import { HttpError } from '../errors.js';

export function requireAuth(req, _res, next) {
  const authorization = req.get('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    return next(new HttpError(401, 'Inicia sesión para continuar.'));
  }

  try {
    const payload = jwt.verify(token, secret);
    if (typeof payload !== 'object' || !payload.sub || !payload.tipo_usuario) {
      throw new Error('Token incompleto.');
    }

    req.user = {
      id: Number(payload.sub),
      tipo_usuario: payload.tipo_usuario,
      email: payload.email,
    };
    if (!Number.isInteger(req.user.id)) {
      throw new Error('Identificador de usuario inválido.');
    }
    return next();
  } catch {
    return next(new HttpError(401, 'La sesión expiró o no es válida.'));
  }
}

export function requireRoles(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new HttpError(401, 'Inicia sesión para continuar.'));
    }
    if (!roles.includes(req.user.tipo_usuario)) {
      return next(new HttpError(403, 'No tienes permiso para realizar esta acción.'));
    }
    return next();
  };
}

export function crearToken(usuario) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new HttpError(500, 'Falta configurar JWT_SECRET en backend/.env.');
  }
  return jwt.sign(
    { email: usuario.email, tipo_usuario: usuario.tipo_usuario },
    secret,
    { subject: String(usuario.ID_usuario), expiresIn: '8h' },
  );
}
