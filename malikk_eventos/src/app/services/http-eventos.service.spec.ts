import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { EventosService } from './eventos.service';
import { HttpEventosService } from './http-eventos.service';
import { environment } from '../../environments/environment';
import { Evento } from '../models/evento.model';

describe('HttpEventosService', () => {
  let service: EventosService;
  let http: HttpTestingController;
  const evento: Evento = {
    ID_evento: 12,
    nombre: 'Festival',
    teatro: 'Teatro Central',
    fecha_inicio: new Date('2026-12-12T00:00:00.000Z'),
    fecha_fin: new Date('2026-12-13T00:00:00.000Z'),
    hora_inicio: 20,
    hora_fin: 2,
    descripcion: 'Concierto',
    precio_base_entrada: 35,
    precio_base: 10,
    capacidad_total: 500,
    observaciones: '',
    ID_ciudad: 1,
  };
  const url = `${environment.apiUrl}/eventos`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: EventosService, useClass: HttpEventosService },
      ],
    });
    service = TestBed.inject(EventosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads events from the API and converts date strings', () => {
    let response: Evento[] | undefined;
    service.obtenerEventos().subscribe((eventos) => (response = eventos));

    http.expectOne(url).flush([{ ...evento, fecha_inicio: '2026-12-12', fecha_fin: '2026-12-13' }]);

    expect(response?.[0].fecha_inicio instanceof Date).toBeTrue();
    expect(response?.[0].ID_evento).toBe(evento.ID_evento);
  });

  it('sends updates and deletes to the matching event endpoints', () => {
    let updated = false;
    service.actualizarEvento(evento.ID_evento, { nombre: 'Festival actualizado' }).subscribe(() => {
      updated = true;
    });
    http.expectOne(`${url}/${evento.ID_evento}`).flush(evento);
    expect(updated).toBeTrue();

    let deleted = false;
    service.eliminarEvento(evento.ID_evento, 'Cambio de planes').subscribe(() => {
      deleted = true;
    });
    http.expectOne(`${url}/${evento.ID_evento}`).flush(null);
    expect(deleted).toBeTrue();
  });
});
