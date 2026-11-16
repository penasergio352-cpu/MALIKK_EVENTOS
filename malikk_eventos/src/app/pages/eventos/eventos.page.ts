import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { EventoCardComponent } from '../../components/evento-card/evento-card.component';
import { Evento } from '../../models/evento.model';
import { EventosService } from '../../services/eventos.service';

@Component({
  selector: 'app-eventos.page',
  imports: [EventoCardComponent, RouterLink],
  templateUrl: './eventos.page.html',
  styleUrl: './eventos.page.scss',
})
export class EventosPage {
  private readonly eventosService = inject(EventosService);
  private readonly destroyRef = inject(DestroyRef);
  readonly eventos = signal<Evento[]>([]);
  mensaje = '';

  constructor() {
    this.eventosService.obtenerEventos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (eventos) => this.eventos.set(eventos),
      error: () => (this.mensaje = 'No se pudieron cargar los eventos. Intenta de nuevo más tarde.'),
    });
  }
}
