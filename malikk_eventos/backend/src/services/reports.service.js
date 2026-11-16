export class ReportsService {
  constructor(db) {
    this.db = db;
  }

  async obtenerResumen() {
    const [
      events,
      reservations,
      users,
      eventLocations,
      reservationsByEventMonth,
      incomeByMonth2026,
      eventsByAgentAndCity,
      customerHistory,
      canceledReservations,
      canceledEvents,
    ] = await Promise.all([
      this.db.query(
        `SELECT e.id_evento AS "ID_evento", e.nombre, e.capacidad_total,
         COALESCE(SUM(r.cantidad_entradas) FILTER (WHERE r.id_estado_reserva IN (1, 2)), 0)::integer AS entradas_solicitadas,
         COUNT(r.id_reserva)::integer AS cantidad_reservas
         FROM eventos e LEFT JOIN reservas r ON r.id_evento = e.id_evento
         GROUP BY e.id_evento ORDER BY e.fecha_inicio DESC`,
      ),
      this.db.query(
        `SELECT er.nombre_estado_reserva AS estado, COUNT(*)::integer AS cantidad
         FROM estados_reserva er LEFT JOIN reservas r ON r.id_estado_reserva = er.id_estado_reserva
         GROUP BY er.id_estado_reserva ORDER BY er.id_estado_reserva`,
      ),
      this.db.query(
        `SELECT 'Cliente' AS tipo_usuario, COUNT(*)::integer AS cantidad FROM clientes
         UNION ALL SELECT 'Agente', COUNT(*)::integer FROM agentes
         UNION ALL SELECT 'Administrador', COUNT(*)::integer FROM administradores`,
      ),
      this.db.query(
        `SELECT e.id_evento AS "ID_evento", e.nombre AS evento, pa.nombre AS pais,
         d.nombre AS departamento, c.nombre AS ciudad
         FROM eventos e
         JOIN ciudades c ON c.id_ciudad = e.id_ciudad
         JOIN departamentos d ON d.id_departamento = c.id_departamento
         JOIN paises pa ON pa.id_pais = d.id_pais
         ORDER BY pa.nombre, d.nombre, c.nombre, e.nombre`,
      ),
      this.db.query(
        `SELECT e.id_evento AS "ID_evento", e.nombre AS evento,
         DATE_TRUNC('month', r.fecha_solicitud AT TIME ZONE 'America/Bogota')::date AS mes,
         COUNT(r.id_reserva)::integer AS cantidad_reservas
         FROM reservas r JOIN eventos e ON e.id_evento = r.id_evento
         WHERE (r.fecha_solicitud AT TIME ZONE 'America/Bogota') >= TIMESTAMP '2026-01-01 00:00:00'
           AND (r.fecha_solicitud AT TIME ZONE 'America/Bogota') < TIMESTAMP '2027-01-01 00:00:00'
         GROUP BY e.id_evento,
           DATE_TRUNC('month', r.fecha_solicitud AT TIME ZONE 'America/Bogota')
         ORDER BY mes, e.nombre`,
      ),
      this.db.query(
        `SELECT DATE_TRUNC('month', e.fecha_inicio)::date AS mes,
         SUM(r.valor_total)::numeric(14, 2) AS ingresos_totales
         FROM reservas r
         JOIN eventos e ON e.id_evento = r.id_evento
         WHERE r.id_estado_reserva = 2
           AND e.fecha_inicio >= DATE '2026-01-01'
           AND e.fecha_inicio < DATE '2027-01-01'
         GROUP BY DATE_TRUNC('month', e.fecha_inicio)
         ORDER BY mes`,
      ),
      this.db.query(
        `SELECT a.identificacion AS "ID_agente", p.nombre AS agente,
         COALESCE(c.nombre, 'Sin eventos') AS ciudad,
         COUNT(e.id_evento)::integer AS cantidad_eventos
         FROM agentes a JOIN personas p ON p.identificacion = a.identificacion
         LEFT JOIN eventos e ON e.id_agente = a.identificacion
         LEFT JOIN ciudades c ON c.id_ciudad = e.id_ciudad
         GROUP BY a.identificacion, p.nombre, c.id_ciudad ORDER BY agente, ciudad`,
      ),
      this.db.query(
        `SELECT p.identificacion AS "ID_cliente", p.nombre AS cliente,
         r.id_reserva AS "ID_reserva", e.nombre AS evento, r.fecha_solicitud,
         r.cantidad_entradas, er.nombre_estado_reserva AS estado,
         r.valor_total, r.causa_cancelacion
         FROM reservas r
         JOIN personas p ON p.identificacion = r.identificacion
         JOIN eventos e ON e.id_evento = r.id_evento
         JOIN estados_reserva er ON er.id_estado_reserva = r.id_estado_reserva
         ORDER BY p.nombre, r.fecha_solicitud DESC`,
      ),
      this.db.query(
        `SELECT r.id_reserva AS "ID_reserva", p.nombre AS cliente, e.nombre AS evento,
         r.fecha_solicitud, r.cantidad_entradas, r.valor_total, r.causa_cancelacion
         FROM reservas r
         JOIN personas p ON p.identificacion = r.identificacion
         JOIN eventos e ON e.id_evento = r.id_evento
         WHERE r.id_estado_reserva = 4
         ORDER BY r.fecha_solicitud DESC`,
      ),
      this.db.query(
        `SELECT e.id_evento AS "ID_evento", e.nombre AS evento, c.nombre AS ciudad,
         e.fecha_inicio, e.causa_cancelacion
         FROM eventos e JOIN ciudades c ON c.id_ciudad = e.id_ciudad
         WHERE e.id_estado_evento = 2
         ORDER BY e.fecha_inicio DESC`,
      ),
    ]);

    const cantidadDePerfil = (perfil) =>
      Number(users.rows.find((row) => row.tipo_usuario === perfil)?.cantidad ?? 0);

    return {
      totales: {
        clientes: cantidadDePerfil('Cliente'),
        agentes: cantidadDePerfil('Agente'),
        administradores: cantidadDePerfil('Administrador'),
        reservas: reservations.rows.reduce((total, row) => total + Number(row.cantidad), 0),
        eventos: events.rows.length,
      },
      eventos: events.rows,
      reservasPorEstado: reservations.rows,
      usuariosPorPerfil: users.rows,
      eventosPorUbicacion: eventLocations.rows,
      reservasPorEventoMes: reservationsByEventMonth.rows,
      ingresosPorMes2026: incomeByMonth2026.rows,
      eventosPorAgenteCiudad: eventsByAgentAndCity.rows,
      historialReservas: customerHistory.rows,
      reservasCanceladas: canceledReservations.rows,
      eventosCancelados: canceledEvents.rows,
    };
  }
}
