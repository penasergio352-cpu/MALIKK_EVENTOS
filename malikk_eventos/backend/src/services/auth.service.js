import bcrypt from 'bcryptjs';
import { HttpError } from '../errors.js';
import { credencialesSchema, perfilFrom, perfilSelect, registroSchema } from '../models/usuario.model.js';
import { crearToken } from '../middleware/auth.js';
import { crearPersona, obtenerPerfil } from './personas.persistence.js';

export class AuthService {
  constructor(db) {
    this.db = db;
  }

  async registrar(payload) {
    const datos = registroSchema.parse(payload);
    const passwordHash = await bcrypt.hash(datos.password, 12);
    const identificacion = await crearPersona(this.db, datos, passwordHash, 'Cliente');
    const usuario = await obtenerPerfil(this.db, identificacion);
    return { usuario, token: crearToken(usuario) };
  }

  async iniciarSesion(payload) {
    const datos = credencialesSchema.parse(payload);
    const { rows } = await this.db.query(
      `SELECT ${perfilSelect}, p.password_hash ${perfilFrom} WHERE LOWER(p.email) = LOWER($1)`,
      [datos.email],
    );
    const usuario = rows[0];
    if (!usuario || !(await bcrypt.compare(datos.password, usuario.password_hash))) {
      throw new HttpError(401, 'Correo o contraseña incorrectos.');
    }
    const { password_hash: _passwordHash, ...perfil } = usuario;
    return { usuario: perfil, token: crearToken(perfil) };
  }

  async obtenerPerfil(id) {
    const usuario = await obtenerPerfil(this.db, id);
    if (!usuario) {
      throw new HttpError(401, 'La cuenta asociada a esta sesión ya no existe.');
    }
    return usuario;
  }
}
