import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Reserva } from '../../models/reserva.model';
import { ReservasService } from '../../services/reservas.service';
import { mensajeErrorApi } from '../../services/api-error';

@Component({
  selector: 'app-cliente-reserva.page',
  imports: [DatePipe, FormsModule],
  templateUrl: './cliente-reserva.page.html',
  styleUrl: './cliente-reserva.page.scss',
})
export class ClienteReservaPage implements OnInit {
  private readonly reservasService = inject(ReservasService);
  readonly reservas = signal<Reserva[]>([]);
  mensaje = '';

  ngOnInit(): void {
    this.cargar();
  }

  actualizarCantidad(reservaId: number, event: Event): void {
    const cantidad = Number((event.target as HTMLInputElement).value);
    if (Number.isInteger(cantidad) && cantidad > 0) {
      this.reservas.update((reservas) => reservas.map((reserva) =>
        reserva.ID_reserva === reservaId ? { ...reserva, cantidad_entradas: cantidad } : reserva,
      ));
    }
  }

  guardarCantidad(reserva: Reserva): void {
    this.reservasService.actualizarReserva(reserva.ID_reserva, {
      cantidad_entradas: reserva.cantidad_entradas,
    }).subscribe({
      next: (actualizada) => {
        this.reemplazar(actualizada);
        this.mensaje = 'Reserva actualizada.';
      },
      error: (error: unknown) => (this.mensaje = this.mensajeDe(error, 'No se pudo actualizar la reserva.')),
    });
  }

  eliminarReserva(reserva: Reserva): void {
    const causa = window.prompt('Indica la causa de cancelación de la reserva:');
    if (!causa?.trim()) {
      this.mensaje = 'Debes indicar una causa para cancelar la reserva.';
      return;
    }

    this.reservasService.eliminarReserva(reserva.ID_reserva, causa.trim()).subscribe({
      next: () => {
        this.reservas.update((reservas) => reservas.filter((item) => item.ID_reserva !== reserva.ID_reserva));
        this.mensaje = 'Reserva cancelada.';
      },
      error: (error: unknown) => (this.mensaje = this.mensajeDe(error, 'No se pudo cancelar la reserva.')),
    });
  }

  private cargar(): void {
    this.reservasService.obtenerReservas().subscribe({
      next: (reservas) => this.reservas.set(reservas),
      error: (error: unknown) => (this.mensaje = this.mensajeDe(error, 'No se pudieron cargar las reservas.')),
    });
  }

  private reemplazar(actualizada: Reserva): void {
    this.reservas.update((reservas) => reservas.map((item) =>
      item.ID_reserva === actualizada.ID_reserva ? actualizada : item,
    ));
  }

  private mensajeDe(error: unknown, predeterminado: string): string {
    return mensajeErrorApi(error, predeterminado);
  }
}
