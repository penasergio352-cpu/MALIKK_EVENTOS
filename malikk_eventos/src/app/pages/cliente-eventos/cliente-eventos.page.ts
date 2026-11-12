import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { EventoCardComponent } from '../../components/evento-card/evento-card.component';
import { EventosService } from '../../services/eventos.service';

@Component({
  selector: 'app-cliente-eventos.page',
  imports: [EventoCardComponent, RouterLink],
  templateUrl: './cliente-eventos.page.html',
  styleUrl: './cliente-eventos.page.scss',
})
export class ClienteEventosPage {
  private readonly eventosService = inject(EventosService);
  private readonly router = inject(Router);
  readonly eventos = toSignal(this.eventosService.obtenerEventos(), { initialValue: [] });

  verReserva(eventoId: number): void {
    void this.router.navigate(['/cliente/cliente-evento-reserva'], {
      queryParams: { eventoId },
    });
  }
}
