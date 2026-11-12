import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Reserva } from '../../models/reserva.model';
import { EventosService } from '../../services/eventos.service';
import { MockReservasService } from '../../services/mock-reservas.service';

type ReservaClienteView = Reserva & { nombre_evento: string };

@Component({
  selector: 'app-cliente-reserva.page',
  imports: [DatePipe],
  templateUrl: './cliente-reserva.page.html',
  styleUrl: './cliente-reserva.page.scss',
})
export class ClienteReservaPage {
  private readonly reservasService = inject(MockReservasService);
  private readonly eventosService = inject(EventosService);
  private readonly eventos = toSignal(this.eventosService.obtenerEventos(), { initialValue: [] });
  readonly reservas = computed<ReservaClienteView[]>(() => {
    const eventos = this.eventos();
    return this.reservasService.obtenerReservasCliente(1).map((reserva) => ({
      ...reserva,
      nombre_evento:
        eventos.find((evento) => evento.ID_evento === reserva.ID_evento)?.nombre ??
        '[Texto de ejemplo] Evento',
    }));
  });
}
