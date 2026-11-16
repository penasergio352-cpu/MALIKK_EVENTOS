import '../src/config.js';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createPool } from '../src/db.js';

const db = createPool();
try {
  const schemaPath = new URL('../sql/schema.sql', import.meta.url);
  const schema = await readFile(fileURLToPath(schemaPath), 'utf8');
  await db.query(schema);
  console.log('Esquema de Malikk Eventos aplicado correctamente.');
} finally {
  await db.end();
}
