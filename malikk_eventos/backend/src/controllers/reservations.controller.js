import { asyncHandler } from '../errors.js';

export function createReservationsController(service) {
  return {
    listar: asyncHandler(async (req, res) => res.json(await service.listar(req.user))),
    obtener: asyncHandler(async (req, res) => res.json(await service.obtener(req.params.id, req.user))),
    crear: asyncHandler(async (req, res) => res.status(201).json(
      await service.crear(req.body, req.user),
    )),
    actualizar: asyncHandler(async (req, res) => res.json(
      await service.actualizar(req.params.id, req.body, req.user),
    )),
    eliminar: asyncHandler(async (req, res) => {
      await service.eliminar(req.params.id, req.user, req.body);
      res.status(204).end();
    }),
  };
}
