import bcrypt from 'bcryptjs';
import { HttpError } from '../errors.js';
import {
  actualizarUsuarioSchema,
  crearUsuarioSchema,
  perfilFrom,
  perfilSelect,
} from '../models/usuario.model.js';
import {
  crearPersona,
  guardarTelefonoPrincipal,
  insertarSubtipo,
  obtenerPerfil,
  tablaSubtipo,
} from './personas.persistence.js';

export class UsersService {
  constructor(db) {
    this.db = db;
  }

  async listar() {
    const { rows } = await this.db.query(
      `SELECT ${perfilSelect} ${perfilFrom} ORDER BY p.nombre`,
    );
    return rows;
  }

  async obtener(id) {
    const usuario = await obtenerPerfil(this.db, validarId(id));
    if (!usuario) throw new HttpError(404, 'No se encontró el usuario.');
    return usuario;
  }

  async crear(payload) {
    const datos = crearUsuarioSchema.parse(payload);
    const passwordHash = await bcrypt.hash(datos.password, 12);
    const identificacion = await crearPersona(this.db, datos, passwordHash, datos.tipo_usuario);
    return obtenerPerfil(this.db, identificacion);
  }

  async actualizar(id, payload, actor) {
    const identificacion = validarId(id);
    const datos = actualizarUsuarioSchema.parse(payload);
    if (identificacion === actor.id && datos.tipo_usuario && datos.tipo_usuario !== 'Administrador') {
      throw new HttpError(400, 'No puedes cambiar el rol de tu propia cuenta de administrador.');
    }

    const passwordHash = datos.password ? await bcrypt.hash(datos.password, 12) : undefined;
    const client = await this.db.connect();
    let transactionStarted = false;
    try {
      await client.query('BEGIN');
      transactionStarted = true;
      const { rows: existingRows } = await client.query(
        'SELECT tipo_usuario FROM personas WHERE identificacion = $1 FOR UPDATE',
        [identificacion],
      );
      const existing = existingRows[0];
      if (!existing) throw new HttpError(404, 'No se encontró el usuario.');

      const tipoUsuario = datos.tipo_usuario ?? existing.tipo_usuario;
      if (tipoUsuario !== existing.tipo_usuario) {
        await client.query(
          `DELETE FROM ${tablaSubtipo(existing.tipo_usuario)} WHERE identificacion = $1`,
          [identificacion],
        );
      }

      const assignments = [];
      const values = [];
      const fields = {
        nombre: 'nombre',
        email: 'email',
        ID_ciudad: 'id_ciudad',
        tipo_usuario: 'tipo_usuario',
      };
      for (const [key, column] of Object.entries(fields)) {
        if (datos[key] !== undefined) {
          values.push(key === 'email' ? datos[key].toLowerCase() : datos[key]);
          assignments.push(`${column} = $${values.length}`);
        }
      }
      if (passwordHash) {
        values.push(passwordHash);
        assignments.push(`password_hash = $${values.length}`);
      }
      if (assignments.length) {
        values.push(identificacion);
        await client.query(
          `UPDATE personas SET ${assignments.join(', ')} WHERE identificacion = $${values.length}`,
          values,
        );
      }
      if (datos.telefono !== undefined) {
        await guardarTelefonoPrincipal(client, identificacion, datos.telefono);
      }
      if (tipoUsuario !== existing.tipo_usuario) {
        await insertarSubtipo(client, identificacion, tipoUsuario);
      }

      await client.query('COMMIT');
      transactionStarted = false;
      return await obtenerPerfil(client, identificacion);
    } catch (error) {
      if (transactionStarted) await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async eliminar(id, actor) {
    const identificacion = validarId(id);
    if (identificacion === actor.id) throw new HttpError(400, 'No puedes eliminar tu propia cuenta.');
    const { rowCount } = await this.db.query(
      'DELETE FROM personas WHERE identificacion = $1',
      [identificacion],
    );
    if (!rowCount) throw new HttpError(404, 'No se encontró el usuario.');
  }
}

function validarId(id) {
  const value = Number(id);
  if (!Number.isInteger(value) || value < 1) throw new HttpError(400, 'El identificador no es válido.');
  return value;
}
