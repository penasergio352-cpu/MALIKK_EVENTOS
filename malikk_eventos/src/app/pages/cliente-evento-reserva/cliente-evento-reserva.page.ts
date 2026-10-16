import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventoCardComponent } from '../../components/evento-card/evento-card.component';
import { Evento } from '../../models/evento.model';
import { MockEventosService } from '../../services/mock-eventos.service';
import { MockReservasService } from '../../services/mock-reservas.service';

@Component({
  selector: 'app-cliente-evento-reserva-page',
  imports: [EventoCardComponent, RouterLink],
  templateUrl: './cliente-evento-reserva.page.html',
  styleUrl: './cliente-evento-reserva.page.scss',
})
export class ClienteEventoReservaPage {
  readonly evento?: Evento;
  cantidadEntradas = 1;
  mensajeError = '';

  constructor(
    route: ActivatedRoute,
    private readonly router: Router,
    eventosService: MockEventosService,
    private readonly reservasService: MockReservasService,
  ) {
    const eventoId = Number(route.snapshot.queryParamMap.get('eventoId'));
    this.evento = Number.isInteger(eventoId) ? eventosService.obtenerEventoPorId(eventoId) : undefined;
  }

  actualizarCantidad(event: Event): void {
    const valor = Number((event.target as HTMLInputElement).value);
    const maximo = this.evento?.capacidad_total ?? 1;
    this.cantidadEntradas = Math.max(1, Math.min(valor || 1, maximo));
  }

  confirmarReserva(): void {
    if (!this.evento || this.cantidadEntradas < 1) {
      this.mensajeError = 'Selecciona un evento y una cantidad valida de entradas.';
      return;
    }

    this.reservasService.registrarReserva({
      ID_evento: this.evento.ID_evento,
      ID_cliente: 1,
      nombre_cliente: '[Texto de ejemplo] Cliente uno',
      cantidad_entradas: this.cantidadEntradas,
    });

    void this.router.navigate(['/cliente/cliente-reserva']);
  }
}