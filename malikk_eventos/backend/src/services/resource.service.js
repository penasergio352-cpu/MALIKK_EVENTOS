import { HttpError } from '../errors.js';

export class ResourceService {
  constructor(db, definition) {
    this.db = db;
    this.definition = definition;
  }

  async listar(actor) {
    const { table, projection, orderBy } = this.definition;
    const where = !actor && this.definition.publicWhere
      ? `WHERE ${this.definition.publicWhere}`
      : '';
    const { rows } = await this.db.query(
      `SELECT ${projection} FROM ${table} ${where} ORDER BY ${orderBy}`,
    );
    return rows;
  }

  async obtener(id, actor) {
    const { table, idColumn, projection } = this.definition;
    const where = !actor && this.definition.publicWhere
      ? `AND ${this.definition.publicWhere}`
      : '';
    const { rows } = await this.db.query(
      `SELECT ${projection} FROM ${table} WHERE ${idColumn} = $1 ${where}`,
      [this.validarId(id)],
    );
    if (!rows[0]) {
      throw new HttpError(404, 'No se encontró el registro.');
    }
    return rows[0];
  }

  async crear(payload, actor) {
    const data = this.validarPayload(payload, true);
    const entries = Object.entries(data);
    if (this.definition.createdBy && actor?.tipo_usuario === 'Agente') {
      entries.push([this.definition.createdBy, actor.id]);
    }
    const columns = entries.map(([key]) => this.definition.fields[key]);
    const values = entries.map(([, value]) => value);
    const placeholders = values.map((_, index) => `$${index + 1}`);
    const { table, projection } = this.definition;
    const { rows } = await this.db.query(
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING ${projection}`,
      values,
    );
    return rows[0];
  }

  async actualizar(id, payload) {
    const data = this.validarPayload(payload, false);
    const resourceId = this.validarId(id);
    if (this.definition.lockedIds?.includes(resourceId)) {
      throw new HttpError(409, 'No se puede modificar un estado reservado por el sistema.');
    }
    const entries = Object.entries(data);
    if (entries.length === 0) {
      throw new HttpError(400, 'Indica al menos un campo para actualizar.');
    }
    await this.definition.beforeUpdate?.(this.db, resourceId, data);
    const assignments = entries.map(([key], index) => `${this.definition.fields[key]} = $${index + 1}`);
    const values = entries.map(([, value]) => value);
    values.push(resourceId);
    const { table, idColumn, projection } = this.definition;
    const { rows } = await this.db.query(
      `UPDATE ${table} SET ${assignments.join(', ')} WHERE ${idColumn} = $${values.length} RETURNING ${projection}`,
      values,
    );
    if (!rows[0]) {
      throw new HttpError(404, 'No se encontró el registro.');
    }
    return rows[0];
  }

  async eliminar(id, payload) {
    const resourceId = this.validarId(id);
    const { table, idColumn, softDelete } = this.definition;
    if (this.definition.lockedIds?.includes(resourceId)) {
      throw new HttpError(409, 'No se puede eliminar un estado reservado por el sistema.');
    }
    let result;
    if (softDelete) {
      const cause = payload?.[softDelete.causeField];
      if (typeof cause !== 'string' || !cause.trim() || cause.trim().length > 500) {
        throw new HttpError(400, 'Indica una causa de cancelación de hasta 500 caracteres.');
      }
      result = await this.db.query(
        `UPDATE ${table}
         SET ${softDelete.stateColumn} = $1, ${softDelete.causeField} = $2
         WHERE ${idColumn} = $3 AND ${softDelete.stateColumn} <> $1`,
        [softDelete.stateId, cause.trim(), resourceId],
      );
    } else {
      result = await this.db.query(
        `DELETE FROM ${table} WHERE ${idColumn} = $1`,
        [resourceId],
      );
    }
    if (!result.rowCount) {
      throw new HttpError(404, 'No se encontró el registro.');
    }
  }

  validarPayload(payload, crear) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new HttpError(400, 'El cuerpo de la solicitud debe ser un objeto.');
    }
    const allowed = Object.keys(this.definition.fields).filter((key) => key !== this.definition.createdBy);
    const unknown = Object.keys(payload).filter((key) => !allowed.includes(key));
    if (unknown.length) {
      throw new HttpError(400, `Campos no permitidos: ${unknown.join(', ')}.`);
    }
    if (crear) {
      const missing = this.definition.required.filter((key) => payload[key] === undefined || payload[key] === '');
      if (missing.length) {
        throw new HttpError(400, `Faltan campos requeridos: ${missing.join(', ')}.`);
      }
    }
    for (const [key, value] of Object.entries(payload)) {
      if (value === null && !this.definition.nullable?.includes(key)) {
        throw new HttpError(400, `${key} no puede estar vacío.`);
      }
    }
    this.definition.validate?.(payload);
    return payload;
  }

  validarId(id) {
    const parsed = Number(id);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new HttpError(400, 'El identificador debe ser un entero positivo.');
    }
    return parsed;
  }
}
