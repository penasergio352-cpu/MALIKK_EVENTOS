import { asyncHandler } from '../errors.js';

export function createUsersController(service) {
  return {
    listar: asyncHandler(async (_req, res) => res.json(await service.listar())),
    obtener: asyncHandler(async (req, res) => res.json(await service.obtener(req.params.id))),
    crear: asyncHandler(async (req, res) => res.status(201).json(await service.crear(req.body))),
    actualizar: asyncHandler(async (req, res) => res.json(
      await service.actualizar(req.params.id, req.body, req.user),
    )),
    eliminar: asyncHandler(async (req, res) => {
      await service.eliminar(req.params.id, req.user);
      res.status(204).end();
    }),
  };
}
