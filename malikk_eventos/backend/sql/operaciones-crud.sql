-- Plantillas CRUD para ejecutar por separado.
-- Sustituya los valores de ejemplo por valores reales y use hashes bcrypt
-- generados por el backend; no almacene contraseñas en texto plano.
-- Los ID -1 son marcadores seguros: reemplácelos por el ID deseado antes de
-- ejecutar UPDATE o DELETE. No ejecute el archivo completo como una migración.

-- Países
INSERT INTO paises (nombre) VALUES ('Colombia') RETURNING id_pais, nombre;
SELECT id_pais, nombre FROM paises ORDER BY nombre;
UPDATE paises SET nombre = 'Colombia' WHERE id_pais = -1;
DELETE FROM paises WHERE id_pais = -1;

-- Departamentos
INSERT INTO departamentos (id_pais, nombre) VALUES (1, 'Valle del Cauca')
RETURNING id_departamento, id_pais, nombre;
SELECT id_departamento, id_pais, nombre FROM departamentos ORDER BY nombre;
UPDATE departamentos SET nombre = 'Valle del Cauca' WHERE id_departamento = -1;
DELETE FROM departamentos WHERE id_departamento = -1;

-- Ciudades
INSERT INTO ciudades (id_departamento, nombre) VALUES (1, 'Tuluá')
RETURNING id_ciudad, id_departamento, nombre;
SELECT id_ciudad, id_departamento, nombre FROM ciudades ORDER BY nombre;
UPDATE ciudades SET nombre = 'Tuluá' WHERE id_ciudad = -1;
DELETE FROM ciudades WHERE id_ciudad = -1;

-- Persona y subtipo Cliente. El teléfono se almacena en la tabla multivaluada.
BEGIN;
WITH nueva_persona AS (
  INSERT INTO personas (id_ciudad, nombre, email, password_hash, tipo_usuario)
  VALUES (1, 'Ana Pérez', 'ana@example.com', '<hash_bcrypt>', 'Cliente')
  RETURNING identificacion
)
INSERT INTO clientes (identificacion)
SELECT identificacion FROM nueva_persona;
INSERT INTO persona_telefonos (identificacion, telefono, principal)
SELECT identificacion, '3001234567', TRUE
FROM personas WHERE email = 'ana@example.com';
COMMIT;
SELECT p.identificacion, p.nombre, p.email, p.id_ciudad, pt.telefono
FROM personas p LEFT JOIN persona_telefonos pt
  ON pt.identificacion = p.identificacion AND pt.principal
WHERE p.tipo_usuario = 'Cliente';
UPDATE personas SET nombre = 'Ana Pérez Actualizada'
WHERE email = 'usuario-a-modificar@example.invalid';
DELETE FROM personas WHERE email = 'usuario-a-eliminar@example.invalid';

-- Agente: primero debe existir la persona con tipo_usuario = 'Agente'.
INSERT INTO agentes (identificacion, experiencia, comision)
VALUES (2, 0, 0);
SELECT p.identificacion, p.nombre, a.experiencia, a.comision
FROM agentes a JOIN personas p ON p.identificacion = a.identificacion;
UPDATE agentes SET experiencia = 1, comision = 0 WHERE identificacion = -1;
DELETE FROM agentes WHERE identificacion = -1;

-- Administrador: la cuenta inicial se crea con `npm --prefix backend run db:seed-admin`.
INSERT INTO administradores (identificacion, salario, horario)
VALUES (3, 0, '');
SELECT p.identificacion, p.nombre, a.salario, a.horario
FROM administradores a JOIN personas p ON p.identificacion = a.identificacion;
UPDATE administradores SET salario = 0, horario = 'Lunes a viernes'
WHERE identificacion = -1;
DELETE FROM administradores WHERE identificacion = -1;

-- Estados: los identificadores iniciales están reservados por el sistema.
SELECT id_estado_reserva, nombre_estado_reserva FROM estados_reserva ORDER BY id_estado_reserva;
INSERT INTO estados_reserva (nombre_estado_reserva) VALUES ('En revisión')
RETURNING id_estado_reserva, nombre_estado_reserva;
UPDATE estados_reserva SET nombre_estado_reserva = 'Estado personalizado'
WHERE id_estado_reserva > 4;
DELETE FROM estados_reserva WHERE id_estado_reserva > 4;
SELECT id_estado_evento, nombre_estado_evento FROM estados_evento ORDER BY id_estado_evento;
INSERT INTO estados_evento (nombre_estado_evento) VALUES ('Estado personalizado')
RETURNING id_estado_evento, nombre_estado_evento;
UPDATE estados_evento SET nombre_estado_evento = 'Otro estado personalizado'
WHERE id_estado_evento > 3;
DELETE FROM estados_evento WHERE id_estado_evento > 3;

-- Eventos: requiere ciudad existente y, opcionalmente, un agente existente.
INSERT INTO eventos (
  id_ciudad, id_agente, nombre, teatro, fecha_inicio, fecha_fin,
  hora_inicio, hora_fin, descripcion, precio_base_entrada, precio_base,
  capacidad_total
)
VALUES (1, 2, 'Festival de prueba', 'Teatro', '2026-12-01', '2026-12-01',
  18, 22, 'Evento de ejemplo', 25000, 0, 100)
RETURNING id_evento, nombre;
SELECT id_evento, nombre, fecha_inicio, capacidad_total FROM eventos ORDER BY fecha_inicio;
UPDATE eventos SET nombre = 'Festival actualizado' WHERE id_evento = -1;
-- Los eventos se cancelan con causa para conservar el historial.
UPDATE eventos SET id_estado_evento = 2, causa_cancelacion = 'Causa de ejemplo'
WHERE id_evento = -1;

-- Reservas: cliente y evento deben existir; el total es precio por entradas.
INSERT INTO reservas (identificacion, id_evento, cantidad_entradas, valor_total)
VALUES (1, 1, 2, 50000)
RETURNING id_reserva, identificacion, id_evento, valor_total;
SELECT id_reserva, identificacion, id_evento, cantidad_entradas,
  id_estado_reserva, valor_total FROM reservas ORDER BY fecha_solicitud DESC;
UPDATE reservas SET cantidad_entradas = 3, valor_total = 75000
WHERE id_reserva = -1;
-- Las reservas se cancelan con causa y no se borran físicamente.
UPDATE reservas SET id_estado_reserva = 4, causa_cancelacion = 'Causa de ejemplo'
WHERE id_reserva = -1;
