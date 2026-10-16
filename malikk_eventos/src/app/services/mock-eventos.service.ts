import { Injectable } from '@angular/core';
import { Evento } from '../models/evento.model';

@Injectable({ providedIn: 'root' })
export class MockEventosService {
  private readonly eventos: Evento[] = [
    {
      ID_evento: 6,
      nombre: 'africansound',
      teatro: ' Teatro por confirmar',
      imagenUrl: '/imagenes/shimza.jpg',
      fecha_inicio: new Date(2026, 11, 12),
      descripcion: '[Texto de ejemplo] Evento de musica electronica.',
      precio_base_entrada: 35,
      capacidad_total: 1200,
      precio_base: 10,
      hora_fin: 2,
      observaciones: '[Texto de ejemplo] Detalles del evento por confirmar.',
      fecha_fin: new Date(2026, 11, 13),
      hora_inicio: 20,
    },
     {
      ID_evento: 5,
      nombre: 'harvibal',
      teatro: 'Teatro por confirmar',
      imagenUrl: '/imagenes/harvie.webp',
      fecha_inicio: new Date(2026, 11, 12),
      descripcion: ' Evento de musica electronica.',
      precio_base_entrada: 35,
      capacidad_total: 1200,
      precio_base: 10,
      hora_fin: 2,
      observaciones: ' Detalles del evento por confirmar.',
      fecha_fin: new Date(2026, 11, 13),
      hora_inicio: 20,
    },
   
    {
      ID_evento: 4,
      nombre: 'elementas-fest',
      teatro: ' Teatro por confirmar',
      imagenUrl: '/imagenes/carlcox.jpeg',
      fecha_inicio: new Date(2026, 11, 12),
      descripcion: ' Evento de musica electronica.',
      precio_base_entrada: 35,
      capacidad_total: 1200,
      precio_base: 10,
      hora_fin: 2,
      observaciones: ' Detalles del evento por confirmar.',
      fecha_fin: new Date(2026, 11, 13),
      hora_inicio: 20,
    },
   
  ];

  obtenerEventos(): Evento[] {
    return this.eventos.map((evento) => ({ ...evento }));
  }

  obtenerEventoPorId(id: number): Evento | undefined {
    const evento = this.eventos.find((item) => item.ID_evento === id);
    return evento ? { ...evento } : undefined;
  }

  registrarEvento(evento: Omit<Evento, 'ID_evento'>): Evento {
    const nuevoEvento: Evento = {
      ...evento,
      ID_evento: Math.max(0, ...this.eventos.map((item) => item.ID_evento)) + 1,
    };
    this.eventos.push(nuevoEvento);
    return { ...nuevoEvento };
  }
}