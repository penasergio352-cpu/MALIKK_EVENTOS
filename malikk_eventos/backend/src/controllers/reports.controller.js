import { asyncHandler } from '../errors.js';

export function createReportsController(service) {
  return {
    obtenerResumen: asyncHandler(async (_req, res) => res.json(await service.obtenerResumen())),
  };
}
