import { HttpError } from '../errors.js';
import {
  actualizarReservaSchema,
  cancelarReservaSchema,
  crearReservaSchema,
  reservaSelect,
} from '../models/reserva.model.js';

export class ReservationsService {
  constructor(db) {
    this.db = db;
  }

  async listar(actor) {
    const staff = ['Agente', 'Administrador'].includes(actor.tipo_usuario);
    const query = staff
      ? `SELECT ${reservaSelect} FROM reservas r
         JOIN personas p ON p.identificacion = r.identificacion
         JOIN eventos e ON e.id_evento = r.id_evento
         JOIN estados_reserva er ON er.id_estado_reserva = r.id_estado_reserva
         ORDER BY r.fecha_solicitud DESC`
      : `SELECT ${reservaSelect} FROM reservas r
         JOIN personas p ON p.identificacion = r.identificacion
         JOIN eventos e ON e.id_evento = r.id_evento
         JOIN estados_reserva er ON er.id_estado_reserva = r.id_estado_reserva
         WHERE r.identificacion = $1 ORDER BY r.fecha_solicitud DESC`;
    const { rows } = await this.db.query(query, staff ? [] : [actor.id]);
    return rows;
  }

  async obtener(id, actor, db = this.db) {
    const reservationId = validarId(id);
    const { rows } = await db.query(
      `SELECT ${reservaSelect} FROM reservas r
       JOIN personas p ON p.identificacion = r.identificacion
       JOIN eventos e ON e.id_evento = r.id_evento
       JOIN estados_reserva er ON er.id_estado_reserva = r.id_estado_reserva
       WHERE r.id_reserva = $1`,
      [reservationId],
    );
    const reserva = rows[0];
    if (!reserva) throw new HttpError(404, 'No se encontró la reserva.');
    autorizarReserva(actor, reserva);
    return reserva;
  }

  async crear(payload, actor) {
    const datos = crearReservaSchema.parse(payload);
    const client = await this.db.connect();
    let transactionStarted = false;
    try {
      await client.query('BEGIN');
      transactionStarted = true;
      const eventResult = await client.query(
        `SELECT id_evento, capacidad_total, precio_base_entrada, id_estado_evento
         FROM eventos WHERE id_evento = $1 FOR UPDATE`,
        [datos.ID_evento],
      );
      if (!eventResult.rows[0]) throw new HttpError(404, 'No se encontró el evento.');
      if (eventResult.rows[0].id_estado_evento !== 1) {
        throw new HttpError(409, 'El evento no está disponible para reservas.');
      }
      const reservedResult = await client.query(
        `SELECT COALESCE(SUM(cantidad_entradas), 0)::integer AS ocupadas
         FROM reservas WHERE id_evento = $1 AND id_estado_reserva IN (1, 2)`,
        [datos.ID_evento],
      );
      if (reservedResult.rows[0].ocupadas + datos.cantidad_entradas > eventResult.rows[0].capacidad_total) {
        throw new HttpError(409, 'No hay suficientes entradas disponibles.');
      }
      const { rows } = await client.query(
        `INSERT INTO reservas (id_evento, identificacion, cantidad_entradas, valor_total)
         VALUES ($1, $2, $3, ROUND($4::numeric * $3, 2)) RETURNING id_reserva`,
        [
          datos.ID_evento,
          actor.id,
          datos.cantidad_entradas,
          eventResult.rows[0].precio_base_entrada,
        ],
      );
      await client.query('COMMIT');
      transactionStarted = false;
      return await this.obtener(rows[0].id_reserva, actor, client);
    } catch (error) {
      if (transactionStarted) await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async actualizar(id, payload, actor) {
    const reservationId = validarId(id);
    const datos = actualizarReservaSchema.parse(payload);
    const client = await this.db.connect();
    let transactionStarted = false;
    try {
      await client.query('BEGIN');
      transactionStarted = true;
      const { rows: existingRows } = await client.query(
        `SELECT r.id_reserva AS "ID_reserva", r.identificacion AS "ID_cliente",
          r.id_evento AS "ID_evento", r.cantidad_entradas,
          er.nombre_estado_reserva AS estado, e.capacidad_total, e.precio_base_entrada
         FROM reservas r JOIN eventos e ON e.id_evento = r.id_evento
         JOIN estados_reserva er ON er.id_estado_reserva = r.id_estado_reserva
         WHERE r.id_reserva = $1 FOR UPDATE OF r, e`,
        [reservationId],
      );
      const existing = existingRows[0];
      if (!existing) throw new HttpError(404, 'No se encontró la reserva.');
      autorizarReserva(actor, existing);

      const staff = ['Agente', 'Administrador'].includes(actor.tipo_usuario);
      if (datos.estado !== undefined && !staff) {
        throw new HttpError(403, 'Solo un agente o administrador puede cambiar el estado.');
      }
      if (datos.cantidad_entradas !== undefined && existing.estado !== 'Pendiente') {
        throw new HttpError(409, 'Solo se pueden editar reservas pendientes.');
      }

      const nuevoEstado = datos.estado ?? existing.estado;
      const nuevaCantidad = datos.cantidad_entradas ?? existing.cantidad_entradas;
      if (['Pendiente', 'Aprobada'].includes(nuevoEstado)) {
        const { rows: occupiedRows } = await client.query(
          `SELECT COALESCE(SUM(cantidad_entradas), 0)::integer AS ocupadas
           FROM reservas WHERE id_evento = $1 AND id_estado_reserva IN (1, 2)
             AND id_reserva <> $2`,
          [existing.ID_evento, reservationId],
        );
        if (occupiedRows[0].ocupadas + nuevaCantidad > existing.capacidad_total) {
          throw new HttpError(409, 'No hay suficientes entradas disponibles.');
        }
      }

      const values = [];
      const assignments = [];
      if (datos.cantidad_entradas !== undefined) {
        values.push(nuevaCantidad);
        assignments.push(`cantidad_entradas = $${values.length}`);
        const quantityParameter = values.length;
        values.push(existing.precio_base_entrada);
        assignments.push(`valor_total = ROUND($${values.length}::numeric * $${quantityParameter}, 2)`);
      }
      if (datos.estado !== undefined) {
        values.push(nuevoEstado);
        assignments.push(`id_estado_reserva = (
          SELECT id_estado_reserva FROM estados_reserva WHERE nombre_estado_reserva = $${values.length}
        )`);
        values.push(nuevoEstado === 'Cancelada' ? datos.causa_cancelacion : null);
        assignments.push(`causa_cancelacion = $${values.length}`);
      }
      values.push(reservationId);
      await client.query(
        `UPDATE reservas SET ${assignments.join(', ')} WHERE id_reserva = $${values.length}`,
        values,
      );
      await client.query('COMMIT');
      transactionStarted = false;
      return await this.obtener(reservationId, actor, client);
    } catch (error) {
      if (transactionStarted) await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async eliminar(id, actor, payload) {
    const reservationId = validarId(id);
    const { causa_cancelacion: causa } = cancelarReservaSchema.parse(payload);
    const { rows } = await this.db.query(
      `SELECT r.identificacion AS "ID_cliente", er.nombre_estado_reserva AS estado
       FROM reservas r JOIN estados_reserva er ON er.id_estado_reserva = r.id_estado_reserva
       WHERE r.id_reserva = $1`,
      [reservationId],
    );
    const reserva = rows[0];
    if (!reserva) throw new HttpError(404, 'No se encontró la reserva.');
    autorizarReserva(actor, reserva);
    if (actor.tipo_usuario === 'Cliente' && reserva.estado !== 'Pendiente') {
      throw new HttpError(409, 'Solo se pueden cancelar reservas pendientes.');
    }
    await this.db.query(
      `UPDATE reservas
       SET id_estado_reserva = 4, causa_cancelacion = $1
       WHERE id_reserva = $2`,
      [causa, reservationId],
    );
  }
}

function validarId(id) {
  const value = Number(id);
  if (!Number.isInteger(value) || value < 1) throw new HttpError(400, 'El identificador no es válido.');
  return value;
}

function autorizarReserva(actor, reserva) {
  if (['Agente', 'Administrador'].includes(actor.tipo_usuario)) return;
  if (actor.tipo_usuario !== 'Cliente' || reserva.ID_cliente !== actor.id) {
    throw new HttpError(403, 'No tienes permiso para acceder a esta reserva.');
  }
}
