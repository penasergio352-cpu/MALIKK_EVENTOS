import { perfilFrom, perfilSelect } from '../models/usuario.model.js';

const roleTables = {
  Cliente: 'clientes',
  Agente: 'agentes',
  Administrador: 'administradores',
};

export async function crearPersona(db, datos, passwordHash, tipoUsuario) {
  const client = await db.connect();
  let transactionStarted = false;
  try {
    await client.query('BEGIN');
    transactionStarted = true;
    const { rows } = await client.query(
      `INSERT INTO personas (nombre, email, password_hash, tipo_usuario, id_ciudad)
       VALUES ($1, LOWER($2), $3, $4, $5) RETURNING identificacion`,
      [datos.nombre, datos.email, passwordHash, tipoUsuario, datos.ID_ciudad ?? null],
    );
    const identificacion = rows[0].identificacion;

    await insertarSubtipo(client, identificacion, tipoUsuario);
    if (datos.telefono) {
      await client.query(
        'INSERT INTO persona_telefonos (identificacion, telefono, principal) VALUES ($1, $2, TRUE)',
        [identificacion, datos.telefono],
      );
    }

    await client.query('COMMIT');
    transactionStarted = false;
    return identificacion;
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function obtenerPerfil(db, identificacion) {
  const { rows } = await db.query(
    `SELECT ${perfilSelect} ${perfilFrom} WHERE p.identificacion = $1`,
    [identificacion],
  );
  return rows[0];
}

export async function insertarSubtipo(db, identificacion, tipoUsuario) {
  const table = roleTables[tipoUsuario];
  if (!table) throw new Error(`Perfil no soportado: ${tipoUsuario}`);
  await db.query(`INSERT INTO ${table} (identificacion) VALUES ($1)`, [identificacion]);
}

export async function guardarTelefonoPrincipal(db, identificacion, telefono) {
  await db.query(
    'DELETE FROM persona_telefonos WHERE identificacion = $1 AND principal',
    [identificacion],
  );
  if (telefono) {
    await db.query(
      'INSERT INTO persona_telefonos (identificacion, telefono, principal) VALUES ($1, $2, TRUE)',
      [identificacion, telefono],
    );
  }
}

export function tablaSubtipo(tipoUsuario) {
  return roleTables[tipoUsuario];
}
