import test from 'node:test';
import assert from 'node:assert/strict';
import { ReservationsService } from '../src/services/reservations.service.js';

test('reservation creation rolls back when the event has no remaining capacity', async () => {
  const statements = [];
  const client = {
    query: async (sql) => {
      statements.push(sql);
      if (sql.startsWith('SELECT id_evento')) {
        return { rows: [{ id_evento: 5, capacidad_total: 10, precio_base_entrada: 100, id_estado_evento: 1 }] };
      }
      if (sql.includes('SUM(cantidad_entradas)')) {
        return { rows: [{ ocupadas: 9 }] };
      }
      return { rows: [] };
    },
    release: () => statements.push('RELEASE'),
  };
  const db = {
    connect: async () => client,
    query: async () => ({ rows: [] }),
  };
  const service = new ReservationsService(db);

  await assert.rejects(
    service.crear({ ID_evento: 5, cantidad_entradas: 2 }, { id: 8, tipo_usuario: 'Cliente' }),
    { status: 409, message: 'No hay suficientes entradas disponibles.' },
  );
  assert.ok(statements.includes('ROLLBACK'));
  assert.ok(!statements.some((sql) => sql.startsWith('INSERT INTO reservas')));
  assert.equal(statements.at(-1), 'RELEASE');
});

test('updating a pending reservation recalculates its total using the event price', async () => {
  const statements = [];
  const client = {
    query: async (sql, values = []) => {
      statements.push({ sql, values });
      if (sql.includes('FOR UPDATE OF r, e')) {
        return {
          rows: [{
            ID_reserva: 8,
            ID_cliente: 12,
            ID_evento: 5,
            cantidad_entradas: 2,
            estado: 'Pendiente',
            capacidad_total: 10,
            precio_base_entrada: '50.00',
          }],
        };
      }
      if (sql.includes('SUM(cantidad_entradas)')) return { rows: [{ ocupadas: 0 }] };
      if (sql.startsWith('SELECT r.id_reserva AS')) {
        return {
          rows: [{
            ID_reserva: 8,
            ID_evento: 5,
            ID_cliente: 12,
            nombre_cliente: 'Ana',
            nombre_evento: 'Concierto',
            cantidad_entradas: 4,
            estado: 'Pendiente',
            valor_total: '200.00',
          }],
        };
      }
      return { rows: [] };
    },
    release: () => {},
  };
  const service = new ReservationsService({ connect: async () => client });

  const reserva = await service.actualizar(
    8,
    { cantidad_entradas: 4 },
    { id: 12, tipo_usuario: 'Cliente' },
  );

  const update = statements.find(({ sql }) => sql.startsWith('UPDATE reservas SET'));
  assert.match(update.sql, /valor_total = ROUND\(\$2::numeric \* \$1, 2\)/);
  assert.deepEqual(update.values, [4, '50.00', 8]);
  assert.equal(reserva.valor_total, '200.00');
});
