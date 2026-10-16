export type EstadoReserva = 'Pendiente' | 'Aprobada' | 'Rechazada';

export interface Reserva {
  ID_reserva: number;
  ID_evento: number;
  ID_cliente: number;
  nombre_cliente: string;
  cantidad_entradas: number;
  fecha_solicitud: Date;
  estado: EstadoReserva;
}