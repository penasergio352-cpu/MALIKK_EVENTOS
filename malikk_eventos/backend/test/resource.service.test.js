import test from 'node:test';
import assert from 'node:assert/strict';
import { ResourceService } from '../src/services/resource.service.js';
import { resources } from '../src/models/resource.model.js';

test('resource service maps safe fields and keeps SQL identifiers from the definition', async () => {
  const calls = [];
  const db = {
    query: async (sql, values) => {
      calls.push({ sql, values });
      return { rows: [{ ID_pais: 1, nombre: 'Colombia' }] };
    },
  };
  const service = new ResourceService(db, resources.paises);
  const created = await service.crear({ nombre: 'Colombia' });
  assert.equal(created.nombre, 'Colombia');
  assert.match(calls[0].sql, /INSERT INTO paises/);
  assert.deepEqual(calls[0].values, ['Colombia']);
});

test('resource service rejects unknown fields before querying the database', async () => {
  const db = { query: async () => assert.fail('No debe ejecutar SQL con campos desconocidos.') };
  const service = new ResourceService(db, resources.paises);
  await assert.rejects(service.crear({ nombre: 'Colombia', table: 'usuarios' }), {
    status: 400,
    message: 'Campos no permitidos: table.',
  });
});

test('resource service validates ids and required fields', async () => {
  const db = { query: async () => assert.fail('No debe ejecutar SQL con datos inválidos.') };
  const service = new ResourceService(db, resources.paises);
  await assert.rejects(service.obtener('0'), { status: 400 });
  await assert.rejects(service.crear({}), { status: 400, message: 'Faltan campos requeridos: nombre.' });
});

test('resource service updates and deletes a record using parameterized values', async () => {
  const calls = [];
  const db = {
    query: async (sql, values) => {
      calls.push({ sql, values });
      return sql.startsWith('DELETE')
        ? { rowCount: 1 }
        : { rows: [{ ID_pais: 5, nombre: 'Ecuador' }] };
    },
  };
  const service = new ResourceService(db, resources.paises);

  const updated = await service.actualizar(5, { nombre: 'Ecuador' });
  await service.eliminar(5);

  assert.equal(updated.nombre, 'Ecuador');
  assert.deepEqual(calls[0].values, ['Ecuador', 5]);
  assert.deepEqual(calls[1].values, [5]);
  assert.match(calls[1].sql, /DELETE FROM paises/);
});
