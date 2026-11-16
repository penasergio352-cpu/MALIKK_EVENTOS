import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstadoReserva, Reserva } from '../../models/reserva.model';
import { ReservasService } from '../../services/reservas.service';
import { mensajeErrorApi } from '../../services/api-error';

@Component({
  selector: 'app-agente-reserva.page',
  imports: [DatePipe, FormsModule],
  templateUrl: './agente-reserva.page.html',
  styleUrl: './agente-reserva.page.scss',
})
export class AgenteReservaPage implements OnInit {
  private readonly reservasService = inject(ReservasService);
  readonly reservas = signal<Reserva[]>([]);
  readonly estados: EstadoReserva[] = ['Pendiente', 'Aprobada', 'Rechazada'];
  mensaje = '';

  ngOnInit(): void {
    this.cargar();
  }

  cambiarEstado(reservaId: number, nuevoEstado: EstadoReserva): void {
    if (!this.estados.includes(nuevoEstado)) return;
    this.reservasService.actualizarReserva(reservaId, { estado: nuevoEstado }).subscribe({
      next: (actualizada) => {
        this.reservas.update((reservas) => reservas.map((item) =>
          item.ID_reserva === actualizada.ID_reserva ? actualizada : item,
        ));
        this.mensaje = 'Estado de reserva actualizado.';
      },
      error: (error: unknown) => (this.mensaje = this.mensajeDe(error)),
    });
  }

  private cargar(): void {
    this.reservasService.obtenerReservas().subscribe({
      next: (reservas) => this.reservas.set(reservas),
      error: (error: unknown) => (this.mensaje = this.mensajeDe(error)),
    });
  }

  private mensajeDe(error: unknown): string {
    return mensajeErrorApi(error, 'No se pudo completar la operación.');
  }
}
