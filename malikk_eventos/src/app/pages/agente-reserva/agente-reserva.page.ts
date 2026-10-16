import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Evento } from '../../models/evento.model';
import { EstadoReserva, Reserva } from '../../models/reserva.model';
import { MockEventosService } from '../../services/mock-eventos.service';
import { MockReservasService } from '../../services/mock-reservas.service';

type SolicitudReservaView = Reserva & { nombre_evento: string };

@Component({
  selector: 'app-agente-reserva.page',
  imports: [DatePipe, FormsModule],
  templateUrl: './agente-reserva.page.html',
  styleUrl: './agente-reserva.page.scss',
})
export class AgenteReservaPage {
  reservas: SolicitudReservaView[];
  readonly estados: EstadoReserva[] = ['Pendiente', 'Aprobada', 'Rechazada'];

  constructor(
    private readonly reservasService: MockReservasService,
    private readonly eventosService: MockEventosService,
  ) {
    this.reservas = this.obtenerReservasConEvento();
  }

  cambiarEstado(reservaId: number, nuevoEstado: EstadoReserva): void {
    if (!this.estados.includes(nuevoEstado)) {
      return;
    }

    this.reservasService.actualizarEstado(reservaId, nuevoEstado);
    this.reservas = this.obtenerReservasConEvento();
  }

  private obtenerReservasConEvento(): SolicitudReservaView[] {
    const eventos = this.eventosService.obtenerEventos();
    return this.reservasService.obtenerTodasLasReservas().map((reserva) => ({
      ...reserva,
      nombre_evento:
        eventos.find((evento: Evento) => evento.ID_evento === reserva.ID_evento)?.nombre ??
        '[Texto de ejemplo] Evento',
    }));
  }
}
