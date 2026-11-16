import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventoCardComponent } from '../../components/evento-card/evento-card.component';
import { EventosService } from '../../services/eventos.service';
import { ReservasService } from '../../services/reservas.service';
import { AuthService } from '../../services/auth.service';
import { mensajeErrorApi } from '../../services/api-error';

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
  private readonly reservasService = inject(ReservasService);
  private readonly authService = inject(AuthService);
  readonly evento = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => Number(params.get('eventoId'))),
      switchMap((eventoId) =>
        Number.isInteger(eventoId)
          ? this.eventosService.obtenerEventoPorId(eventoId)
          : of(undefined),
      ),
      catchError((error: unknown) => {
        this.mensajeError = mensajeErrorApi(error, 'No se pudo cargar el evento.');
        return of(undefined);
      }),
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
    const cliente = this.authService.usuarioActual();
    if (!evento || !cliente || this.cantidadEntradas < 1) {
      this.mensajeError = 'Selecciona un evento y una cantidad valida de entradas.';
      return;
    }

    this.reservasService.registrarReserva({
      ID_evento: evento.ID_evento,
      cantidad_entradas: this.cantidadEntradas,
    }).subscribe({
      next: () => void this.router.navigate(['/cliente/cliente-reserva']),
      error: (error: unknown) => (this.mensajeError = mensajeErrorApi(error, 'No se pudo enviar la solicitud.')),
    });
  }
}