import { z } from 'zod';

export const reservaSelect = `r.id_reserva AS "ID_reserva", r.id_evento AS "ID_evento",
  r.identificacion AS "ID_cliente", p.nombre AS nombre_cliente, e.nombre AS nombre_evento,
  r.cantidad_entradas, r.fecha_solicitud, er.nombre_estado_reserva AS estado,
  r.valor_total, r.causa_cancelacion`;

export const crearReservaSchema = z.object({
  ID_evento: z.coerce.number().int().positive(),
  cantidad_entradas: z.coerce.number().int().positive(),
}).strict();

export const actualizarReservaSchema = z.object({
  cantidad_entradas: z.coerce.number().int().positive().optional(),
  estado: z.enum(['Pendiente', 'Aprobada', 'Rechazada', 'Cancelada']).optional(),
  causa_cancelacion: z.string().trim().min(1).max(500).optional(),
}).strict()
  .refine((data) => Object.keys(data).length > 0, 'Indica los campos a actualizar.')
  .refine((data) => data.estado !== 'Cancelada' || Boolean(data.causa_cancelacion), {
    message: 'Indica la causa de cancelación.',
    path: ['causa_cancelacion'],
  })
  .refine((data) => !data.causa_cancelacion || data.estado === 'Cancelada', {
    message: 'La causa solo se acepta al cancelar la reserva.',
    path: ['causa_cancelacion'],
  });

export const cancelarReservaSchema = z.object({
  causa_cancelacion: z.string().trim().min(1).max(500),
}).strict();
