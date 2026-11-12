import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Evento } from '../models/evento.model';

@Injectable()
export abstract class EventosService {
  abstract obtenerEventos(): Observable<Evento[]>;
  abstract obtenerEventoPorId(id: number): Observable<Evento | undefined>;
  abstract registrarEvento(evento: Omit<Evento, 'ID_evento'>): Observable<Evento>;
}
