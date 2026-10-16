import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EventoCardComponent } from '../../components/evento-card/evento-card.component';
import { Evento } from '../../models/evento.model';
import { MockEventosService } from '../../services/mock-eventos.service';

@Component({
  selector: 'app-cliente-eventos.page',
  imports: [EventoCardComponent],
  templateUrl: './cliente-eventos.page.html',
  styleUrl: './cliente-eventos.page.scss',
})
export class ClienteEventosPage {
  eventos: Evento[];

  constructor(
    private readonly eventosService: MockEventosService,
    private readonly router: Router,
  ) {
    this.eventos = this.eventosService.obtenerEventos();
  }

  verReserva(eventoId: number): void {
    void this.router.navigate(['/cliente/cliente-evento-reserva'], {
      queryParams: { eventoId },
    });
  }
}
