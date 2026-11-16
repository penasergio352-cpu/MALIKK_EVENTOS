import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EstadoReserva, Reserva } from '../models/reserva.model';

@Injectable({ providedIn: 'root' })
export class ReservasService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/reservas`;

  obtenerReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.url);
  }

  obtenerReserva(id: number): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.url}/${id}`);
  }

  registrarReserva(datos: Pick<Reserva, 'ID_evento' | 'cantidad_entradas'>): Observable<Reserva> {
    return this.http.post<Reserva>(this.url, datos);
  }

  actualizarReserva(
    id: number,
    cambios: { cantidad_entradas?: number; estado?: EstadoReserva },
  ): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.url}/${id}`, cambios);
  }

  eliminarReserva(id: number, causa_cancelacion: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`, { body: { causa_cancelacion } });
  }
}
