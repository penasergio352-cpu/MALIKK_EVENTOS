import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventoCardComponent } from '../../components/evento-card/evento-card.component';
import { Evento } from '../../models/evento.model';
import { EventosService } from '../../services/eventos.service';
import { MockReservasService } from '../../services/mock-reservas.service';

@Component({
  selector: 'app-cliente-evento-reserva-page',
  imports: [EventoCardComponent, RouterLink],
  templateUrl: './cliente-evento-reserva.page.html',
  styleUrl: './cliente-evento-reserva.page.scss',
})
export class ClienteEventoReservaPage {
  private readonly route = inject(ActivatedRoute);
  private readonly eventosService = inject(EventosService);
  private readonly router = inject(Router);
  private readonly reservasService = inject(MockReservasService);
  readonly evento = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => Number(params.get('eventoId'))),
      switchMap((eventoId) =>
        Number.isInteger(eventoId)
          ? this.eventosService.obtenerEventoPorId(eventoId)
          : of(undefined),
      ),
    ),
    { initialValue: undefined },
  );
  cantidadEntradas = 1;
  mensajeError = '';

  actualizarCantidad(event: Event): void {
    const valor = Number((event.target as HTMLInputElement).value);
    const maximo = this.evento()?.capacidad_total ?? 1;
    this.cantidadEntradas = Math.max(1, Math.min(valor || 1, maximo));
  }

  confirmarReserva(): void {
    const evento = this.evento();
    if (!evento || this.cantidadEntradas < 1) {
      this.mensajeError = 'Selecciona un evento y una cantidad valida de entradas.';
      return;
    }

    this.reservasService.registrarReserva({
      ID_evento: evento.ID_evento,
      ID_cliente: 1,
      nombre_cliente: '[Texto de ejemplo] Cliente uno',
      cantidad_entradas: this.cantidadEntradas,
    });

    void this.router.navigate(['/cliente/cliente-reserva']);
  }
}