import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { EventoCardComponent } from '../../components/evento-card/evento-card.component';
import { Evento } from '../../models/evento.model';
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
  private readonly destroyRef = inject(DestroyRef);
  readonly eventos = signal<Evento[]>([]);
  mensaje = '';

  constructor() {
    this.eventosService.obtenerEventos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (eventos) => this.eventos.set(eventos),
      error: () => (this.mensaje = 'No se pudieron cargar los eventos. Intenta de nuevo más tarde.'),
    });
  }

  verReserva(eventoId: number): void {
    void this.router.navigate(['/cliente/cliente-evento-reserva'], {
      queryParams: { eventoId },
    });
  }
}
