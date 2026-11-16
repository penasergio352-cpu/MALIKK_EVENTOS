import pg from 'pg';
import { HttpError } from './errors.js';

const { Pool } = pg;

export function createPool(env = process.env) {
  if (!env.DATABASE_URL && (!env.PGHOST || !env.PGDATABASE || !env.PGUSER)) {
    throw new Error('Configura DATABASE_URL o PGHOST, PGDATABASE y PGUSER en backend/.env.');
  }

  return new Pool({
    connectionString: env.DATABASE_URL,
    host: env.PGHOST,
    port: env.PGPORT ? Number(env.PGPORT) : undefined,
    database: env.PGDATABASE,
    user: env.PGUSER,
    password: env.PGPASSWORD,
    ssl: env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });
}

export async function verificarConexion(db) {
  try {
    await db.query('SELECT 1');
  } catch {
    throw new HttpError(503, 'No hay conexión con PostgreSQL. Revisa la configuración del backend.');
  }
}
