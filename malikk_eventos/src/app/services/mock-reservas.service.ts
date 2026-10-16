import { Injectable } from '@angular/core';
import { EstadoReserva, Reserva } from '../models/reserva.model';

@Injectable({ providedIn: 'root' })
export class MockReservasService {
  private readonly reservas: Reserva[] = [
    {
      ID_reserva: 2,
      ID_evento: 4,
      ID_cliente: 1,
      nombre_cliente: '[Texto de ejemplo] Cliente uno',
      cantidad_entradas: 2,
      fecha_solicitud: new Date(2026, 9, 15),
      estado: 'Pendiente',
    },
    {
      ID_reserva: 3,
      ID_evento: 5,
      ID_cliente: 1,
      nombre_cliente: '[Texto de ejemplo] Cliente uno',
      cantidad_entradas: 2,
      fecha_solicitud: new Date(2026, 9, 15),
      estado: 'Pendiente',
    },
    {
      ID_reserva: 4,
      ID_evento: 6,
      ID_cliente: 1,
      nombre_cliente: '[Texto de ejemplo] Cliente uno',
      cantidad_entradas: 2,
      fecha_solicitud: new Date(2026, 9, 15),
      estado: 'Pendiente',
    },
  ];

  obtenerReservasCliente(clienteId: number): Reserva[] {
    return this.reservas
      .filter((reserva) => reserva.ID_cliente === clienteId)
      .map((reserva) => ({ ...reserva }));
  }

  obtenerTodasLasReservas(): Reserva[] {
    return this.reservas.map((reserva) => ({ ...reserva }));
  }

  registrarReserva(
    nuevaReserva: Pick<Reserva, 'ID_evento' | 'ID_cliente' | 'nombre_cliente' | 'cantidad_entradas'>,
  ): Reserva {
    const reserva: Reserva = {
      ...nuevaReserva,
      ID_reserva: Math.max(0, ...this.reservas.map((item) => item.ID_reserva)) + 1,
      fecha_solicitud: new Date(),
      estado: 'Pendiente',
    };
    this.reservas.push(reserva);
    return { ...reserva };
  }

  actualizarEstado(reservaId: number, estado: EstadoReserva): boolean {
    const reserva = this.reservas.find((item) => item.ID_reserva === reservaId);
    if (!reserva) {
      return false;
    }

    reserva.estado = estado;
    return true;
  }
}