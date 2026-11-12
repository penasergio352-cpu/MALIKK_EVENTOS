import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Evento } from '../models/evento.model';
import { EventosService } from './eventos.service';

type EventoResponse = Omit<Evento, 'fecha_inicio' | 'fecha_fin'> & {
  fecha_inicio: Date | string;
  fecha_fin: Date | string;
};

@Injectable({ providedIn: 'root' })
export class HttpEventosService extends EventosService {
  private readonly http = inject(HttpClient);
  private readonly eventosUrl = `${environment.apiUrl}/eventos`;

  obtenerEventos(): Observable<Evento[]> {
    return this.http
      .get<EventoResponse[]>(this.eventosUrl)
      .pipe(map((eventos) => eventos.map((evento) => this.convertirEvento(evento))));
  }

  obtenerEventoPorId(id: number): Observable<Evento | undefined> {
    return this.http
      .get<EventoResponse | null>(`${this.eventosUrl}/${id}`)
      .pipe(
        map((evento) => (evento ? this.convertirEvento(evento) : undefined)),
        catchError((error: unknown) =>
          error instanceof HttpErrorResponse && error.status === 404
            ? of(undefined)
            : throwError(() => error),
        ),
      );
  }

  registrarEvento(evento: Omit<Evento, 'ID_evento'>): Observable<Evento> {
    return this.http
      .post<EventoResponse>(this.eventosUrl, evento)
      .pipe(map((respuesta) => this.convertirEvento(respuesta)));
  }

  private convertirEvento(evento: EventoResponse): Evento {
    return {
      ...evento,
      fecha_inicio: new Date(evento.fecha_inicio),
      fecha_fin: new Date(evento.fecha_fin),
    };
  }
}
