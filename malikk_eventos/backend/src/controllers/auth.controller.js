import { asyncHandler } from '../errors.js';

export function createAuthController(service) {
  return {
    registrar: asyncHandler(async (req, res) => res.status(201).json(await service.registrar(req.body))),
    iniciarSesion: asyncHandler(async (req, res) => res.json(await service.iniciarSesion(req.body))),
    obtenerPerfil: asyncHandler(async (req, res) => res.json(await service.obtenerPerfil(req.user.id))),
  };
}
