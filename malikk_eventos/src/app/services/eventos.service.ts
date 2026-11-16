import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Evento } from '../models/evento.model';

@Injectable()
export abstract class EventosService {
  abstract obtenerEventos(): Observable<Evento[]>;
  abstract obtenerEventoPorId(id: number): Observable<Evento | undefined>;
  abstract registrarEvento(evento: Omit<Evento, 'ID_evento'>): Observable<Evento>;
  abstract actualizarEvento(id: number, evento: Partial<Omit<Evento, 'ID_evento'>>): Observable<Evento>;
  abstract eliminarEvento(id: number, causa_cancelacion: string): Observable<void>;
}
