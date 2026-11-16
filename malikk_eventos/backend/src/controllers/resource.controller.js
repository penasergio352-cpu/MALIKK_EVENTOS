import { asyncHandler } from '../errors.js';
import { ResourceService } from '../services/resource.service.js';

export function createResourceController(db, definition) {
  const service = new ResourceService(db, definition);
  return {
    listar: asyncHandler(async (req, res) => res.json(await service.listar(req.user))),
    obtener: asyncHandler(async (req, res) => res.json(await service.obtener(req.params.id, req.user))),
    crear: asyncHandler(async (req, res) => res.status(201).json(await service.crear(req.body, req.user))),
    actualizar: asyncHandler(async (req, res) => res.json(await service.actualizar(req.params.id, req.body))),
    eliminar: asyncHandler(async (req, res) => {
      await service.eliminar(req.params.id, req.body);
      res.status(204).end();
    }),
  };
}
