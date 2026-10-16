import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Reserva } from '../../models/reserva.model';
import { MockEventosService } from '../../services/mock-eventos.service';
import { MockReservasService } from '../../services/mock-reservas.service';

type ReservaClienteView = Reserva & { nombre_evento: string };

@Component({
  selector: 'app-cliente-reserva.page',
  imports: [DatePipe],
  templateUrl: './cliente-reserva.page.html',
  styleUrl: './cliente-reserva.page.scss',
})
export class ClienteReservaPage {
  readonly reservas: ReservaClienteView[];

  constructor(reservasService: MockReservasService, eventosService: MockEventosService) {
    this.reservas = reservasService.obtenerReservasCliente(1).map((reserva) => ({
      ...reserva,
      nombre_evento:
        eventosService.obtenerEventoPorId(reserva.ID_evento)?.nombre ?? '[Texto de ejemplo] Evento',
    }));
  }
}
