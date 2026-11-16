import { z } from 'zod';

export const perfilSelect = `p.identificacion AS "ID_usuario", p.id_ciudad AS "ID_ciudad",
  p.nombre, p.email, COALESCE(t.telefono, '') AS telefono, p.tipo_usuario`;
export const perfilFrom = `FROM personas p LEFT JOIN LATERAL (
  SELECT pt.telefono FROM persona_telefonos pt
  WHERE pt.identificacion = p.identificacion
  ORDER BY pt.principal DESC, pt.telefono
  LIMIT 1
) t ON TRUE`;

export const registroSchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  telefono: z.string().trim().max(30).default(''),
  ID_ciudad: z.coerce.number().int().positive(),
  password: z.string().min(8).max(128),
}).strict();

export const credencialesSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
}).strict();

export const crearUsuarioSchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  telefono: z.string().trim().max(30).default(''),
  ID_ciudad: z.coerce.number().int().positive(),
  password: z.string().min(8).max(128),
  tipo_usuario: z.enum(['Cliente', 'Agente']),
}).strict();

export const actualizarUsuarioSchema = z.object({
  nombre: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email().max(254).optional(),
  telefono: z.string().trim().max(30).optional(),
  ID_ciudad: z.coerce.number().int().positive().optional(),
  password: z.string().min(8).max(128).optional(),
  tipo_usuario: z.enum(['Cliente', 'Agente', 'Administrador']).optional(),
}).strict().refine((data) => Object.keys(data).length > 0, 'Indica los campos a actualizar.');
