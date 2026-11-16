-- Ejecutar las consultas por separado, después de cargar datos de prueba.

-- Conteo general de clientes, agentes, administradores, reservas y eventos.
SELECT 'Clientes' AS entidad, COUNT(*)::integer AS cantidad FROM clientes
UNION ALL
SELECT 'Agentes', COUNT(*)::integer FROM agentes
UNION ALL
SELECT 'Administradores', COUNT(*)::integer FROM administradores
UNION ALL
SELECT 'Reservas', COUNT(*)::integer FROM reservas
UNION ALL
SELECT 'Eventos', COUNT(*)::integer FROM eventos;

-- Eventos con país, departamento y ciudad.
SELECT e.id_evento, e.nombre AS evento, pa.nombre AS pais,
  d.nombre AS departamento, c.nombre AS ciudad
FROM eventos e
JOIN ciudades c ON c.id_ciudad = e.id_ciudad
JOIN departamentos d ON d.id_departamento = c.id_departamento
JOIN paises pa ON pa.id_pais = d.id_pais
ORDER BY pa.nombre, d.nombre, c.nombre, e.nombre;

-- Ingresos aprobados agrupados por mes durante 2026.
SELECT DATE_TRUNC('month', e.fecha_inicio)::date AS mes,
  SUM(r.valor_total)::numeric(14, 2) AS ingresos_totales
FROM reservas r
JOIN estados_reserva er ON er.id_estado_reserva = r.id_estado_reserva
JOIN eventos e ON e.id_evento = r.id_evento
WHERE er.nombre_estado_reserva = 'Aprobada'
  AND e.fecha_inicio >= DATE '2026-01-01'
  AND e.fecha_inicio < DATE '2027-01-01'
GROUP BY DATE_TRUNC('month', e.fecha_inicio)
ORDER BY mes;

-- Cantidad de reservas por evento y mes durante 2026.
SELECT e.id_evento, e.nombre AS evento,
  DATE_TRUNC('month', r.fecha_solicitud AT TIME ZONE 'America/Bogota')::date AS mes,
  COUNT(*)::integer AS cantidad_reservas
FROM reservas r
JOIN eventos e ON e.id_evento = r.id_evento
WHERE (r.fecha_solicitud AT TIME ZONE 'America/Bogota') >= TIMESTAMP '2026-01-01 00:00:00'
  AND (r.fecha_solicitud AT TIME ZONE 'America/Bogota') < TIMESTAMP '2027-01-01 00:00:00'
GROUP BY e.id_evento,
  DATE_TRUNC('month', r.fecha_solicitud AT TIME ZONE 'America/Bogota')
ORDER BY mes, e.nombre;

-- Cantidad de eventos creados por agente y ciudad.
SELECT a.identificacion AS id_agente, p.nombre AS agente,
  COALESCE(c.nombre, 'Sin eventos') AS ciudad,
  COUNT(e.id_evento)::integer AS cantidad_eventos
FROM agentes a
JOIN personas p ON p.identificacion = a.identificacion
LEFT JOIN eventos e ON e.id_agente = a.identificacion
LEFT JOIN ciudades c ON c.id_ciudad = e.id_ciudad
GROUP BY a.identificacion, p.nombre, c.id_ciudad
ORDER BY agente, ciudad;

-- Historial de reservas por cliente.
SELECT p.identificacion AS id_cliente, p.nombre AS cliente,
  r.id_reserva, e.nombre AS evento, r.fecha_solicitud,
  r.cantidad_entradas, er.nombre_estado_reserva AS estado,
  r.valor_total, r.causa_cancelacion
FROM reservas r
JOIN personas p ON p.identificacion = r.identificacion
JOIN eventos e ON e.id_evento = r.id_evento
JOIN estados_reserva er ON er.id_estado_reserva = r.id_estado_reserva
ORDER BY p.nombre, r.fecha_solicitud DESC;

-- Reservas canceladas con su causa.
SELECT r.id_reserva, p.nombre AS cliente, e.nombre AS evento,
  r.fecha_solicitud, r.cantidad_entradas, r.valor_total,
  r.causa_cancelacion
FROM reservas r
JOIN personas p ON p.identificacion = r.identificacion
JOIN eventos e ON e.id_evento = r.id_evento
JOIN estados_reserva er ON er.id_estado_reserva = r.id_estado_reserva
WHERE er.nombre_estado_reserva = 'Cancelada'
ORDER BY r.fecha_solicitud DESC;

-- Eventos cancelados con su causa.
SELECT e.id_evento, e.nombre AS evento, c.nombre AS ciudad,
  e.fecha_inicio, e.causa_cancelacion
FROM eventos e
JOIN ciudades c ON c.id_ciudad = e.id_ciudad
JOIN estados_evento ee ON ee.id_estado_evento = e.id_estado_evento
WHERE ee.nombre_estado_evento = 'Cancelado'
ORDER BY e.fecha_inicio DESC;

-- Pendiente: promedios de ingresos por agente y por cliente.
-- No se implementan hasta confirmar si la comisión es porcentaje o valor fijo
-- y qué estados de reserva se consideran ingresos, según instrucción docente.
