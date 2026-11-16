import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';

test('health endpoint returns database status when the query succeeds', async () => {
  const app = createApp({ query: async () => ({ rows: [{ '?column?': 1 }] }) });
  const response = await request(app).get('/api/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.database, 'connected');
});

test('API returns a JSON 404 for unknown paths', async () => {
  const app = createApp({ query: async () => ({ rows: [] }) });
  const response = await request(app).get('/api/no-existe');
  assert.equal(response.status, 404);
  assert.equal(response.body.error.message, 'Ruta no encontrada.');
});

test('public event reads work while writes require a session', async () => {
  const app = createApp({
    query: async () => ({ rows: [{ ID_evento: 3, nombre: 'Festival' }] }),
  });
  const events = await request(app).get('/api/eventos');
  const create = await request(app).post('/api/eventos').send({ nombre: 'Nuevo' });

  assert.equal(events.status, 200);
  assert.equal(events.body[0].nombre, 'Festival');
  assert.equal(create.status, 401);
});

test('invalid request schemas return a client error instead of an internal error', async () => {
  const app = createApp({ query: async () => ({ rows: [] }) });
  const response = await request(app).post('/api/auth/register').send({
    nombre: 'A',
    email: 'no-es-correo',
    password: 'short',
  });

  assert.equal(response.status, 400);
  assert.equal(typeof response.body.error.message, 'string');
});

test('location endpoints implement protected create, read, update, and delete operations', async () => {
  process.env.JWT_SECRET = 'test-secret-for-api-tests';
  const app = createApp({
    query: async (sql) => {
      if (sql.startsWith('DELETE')) return { rowCount: 1, rows: [] };
      return { rows: [{ ID_pais: 9, nombre: 'Colombia' }], rowCount: 1 };
    },
  });
  const token = jwt.sign(
    { tipo_usuario: 'Administrador', email: 'admin@example.com' },
    process.env.JWT_SECRET,
    { subject: '1' },
  );
  const authorization = { Authorization: `Bearer ${token}` };

  const list = await request(app).get('/api/paises').set(authorization);
  const create = await request(app).post('/api/paises').set(authorization).send({ nombre: 'Colombia' });
  const update = await request(app).put('/api/paises/9').set(authorization).send({ nombre: 'Colombia' });
  const remove = await request(app).delete('/api/paises/9').set(authorization);

  assert.equal(list.status, 200);
  assert.equal(create.status, 201);
  assert.equal(update.status, 200);
  assert.equal(remove.status, 204);
});
