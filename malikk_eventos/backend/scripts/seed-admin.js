import '../src/config.js';
import bcrypt from 'bcryptjs';
import { createPool } from '../src/db.js';
import { insertarSubtipo, tablaSubtipo } from '../src/services/personas.persistence.js';

const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
  throw new Error('Define ADMIN_EMAIL y una ADMIN_PASSWORD de al menos 8 caracteres en backend/.env.');
}

const db = createPool();
const client = await db.connect();
let transactionStarted = false;
try {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await client.query('BEGIN');
  transactionStarted = true;
  const { rows } = await client.query(
    'SELECT identificacion, tipo_usuario FROM personas WHERE LOWER(email) = LOWER($1) FOR UPDATE',
    [ADMIN_EMAIL],
  );
  let identificacion = rows[0]?.identificacion;

  if (rows[0] && rows[0].tipo_usuario !== 'Administrador') {
    await client.query(
      `DELETE FROM ${tablaSubtipo(rows[0].tipo_usuario)} WHERE identificacion = $1`,
      [identificacion],
    );
    await client.query(
      `UPDATE personas
       SET tipo_usuario = 'Administrador', password_hash = $1
       WHERE identificacion = $2`,
      [passwordHash, identificacion],
    );
  } else if (rows[0]) {
    await client.query(
      'UPDATE personas SET password_hash = $1 WHERE identificacion = $2',
      [passwordHash, identificacion],
    );
  } else {
    const result = await client.query(
      `INSERT INTO personas (nombre, email, password_hash, tipo_usuario)
       VALUES ('Administrador', LOWER($1), $2, 'Administrador')
       RETURNING identificacion`,
      [ADMIN_EMAIL, passwordHash],
    );
    identificacion = result.rows[0].identificacion;
  }

  if (rows[0]?.tipo_usuario !== 'Administrador') {
    await insertarSubtipo(client, identificacion, 'Administrador');
  } else if (!rows[0]) {
    await insertarSubtipo(client, identificacion, 'Administrador');
  }
  await client.query('COMMIT');
  transactionStarted = false;
  console.log(`Cuenta administradora lista: ${ADMIN_EMAIL}`);
} finally {
  if (transactionStarted) await client.query('ROLLBACK');
  client.release();
  await db.end();
}
