import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { EstadoReserva, Reserva } from '../../models/reserva.model';
import { EventosService } from '../../services/eventos.service';
import { MockReservasService } from '../../services/mock-reservas.service';

type SolicitudReservaView = Reserva & { nombre_evento: string };

@Component({
  selector: 'app-agente-reserva.page',
  imports: [DatePipe, FormsModule],
  templateUrl: './agente-reserva.page.html',
  styleUrl: './agente-reserva.page.scss',
})
export class AgenteReservaPage {
  private readonly reservasService = inject(MockReservasService);
  private readonly eventosService = inject(EventosService);
  private readonly eventos = toSignal(this.eventosService.obtenerEventos(), { initialValue: [] });
  readonly reservas = computed<SolicitudReservaView[]>(() => {
    const eventos = this.eventos();
    return this.reservasService.obtenerTodasLasReservas().map((reserva) => ({
      ...reserva,
      nombre_evento:
        eventos.find((evento) => evento.ID_evento === reserva.ID_evento)?.nombre ??
        '[Texto de ejemplo] Evento',
    }));
  });
  readonly estados: EstadoReserva[] = ['Pendiente', 'Aprobada', 'Rechazada'];

  cambiarEstado(reservaId: number, nuevoEstado: EstadoReserva): void {
    if (!this.estados.includes(nuevoEstado)) {
      return;
    }

    this.reservasService.actualizarEstado(reservaId, nuevoEstado);
  }
}
