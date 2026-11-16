export interface ReporteEvento {
  ID_evento: number;
  nombre: string;
  capacidad_total: number;
  entradas_solicitadas: number;
  cantidad_reservas: number;
}

export interface FilaReporte {
  estado?: string;
  tipo_usuario?: string;
  cantidad: number;
}

export interface ReporteEventoUbicacion {
  ID_evento: number;
  evento: string;
  pais: string;
  departamento: string;
  ciudad: string;
}

export interface ReporteReservasPorMes {
  ID_evento: number;
  evento: string;
  mes: string;
  cantidad_reservas: number;
}

export interface ReporteIngresosPorMes {
  mes: string;
  ingresos_totales: number;
}

export interface ReporteEventosAgenteCiudad {
  ID_agente: number | null;
  agente: string;
  ciudad: string;
  cantidad_eventos: number;
}

export interface ReporteHistorialReserva {
  ID_cliente: number;
  cliente: string;
  ID_reserva: number;
  evento: string;
  fecha_solicitud: Date | string;
  cantidad_entradas: number;
  estado: string;
  valor_total: number;
  causa_cancelacion: string | null;
}

export interface ReporteReservaCancelada {
  ID_reserva: number;
  cliente: string;
  evento: string;
  fecha_solicitud: Date | string;
  cantidad_entradas: number;
  valor_total: number;
  causa_cancelacion: string;
}

export interface ReporteEventoCancelado {
  ID_evento: number;
  evento: string;
  ciudad: string;
  fecha_inicio: Date | string;
  causa_cancelacion: string;
}

export interface ReporteAdministrador {
  totales: {
    clientes: number;
    agentes: number;
    administradores: number;
    reservas: number;
    eventos: number;
  };
  eventos: ReporteEvento[];
  reservasPorEstado: FilaReporte[];
  usuariosPorPerfil: FilaReporte[];
  eventosPorUbicacion: ReporteEventoUbicacion[];
  reservasPorEventoMes: ReporteReservasPorMes[];
  ingresosPorMes2026: ReporteIngresosPorMes[];
  eventosPorAgenteCiudad: ReporteEventosAgenteCiudad[];
  historialReservas: ReporteHistorialReserva[];
  reservasCanceladas: ReporteReservaCancelada[];
  eventosCancelados: ReporteEventoCancelado[];
}
