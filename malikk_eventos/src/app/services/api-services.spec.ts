import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';
import { LocalizacionService } from './localizacion.service';
import { ReservasService } from './reservas.service';
import { environment } from '../../environments/environment';

describe('API services', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.removeItem('malikk-session-token');
    sessionStorage.removeItem('malikk-session-user');
  });

  it('sends authenticated reservation changes and deletes to the API', () => {
    sessionStorage.setItem('malikk-session-token', 'token-de-prueba');
    const service = TestBed.inject(ReservasService);
    service.actualizarReserva(8, { estado: 'Aprobada' }).subscribe();
    const update = http.expectOne(`${environment.apiUrl}/reservas/8`);
    expect(update.request.method).toBe('PUT');
    expect(update.request.headers.get('Authorization')).toBe('Bearer token-de-prueba');
    update.flush({});

    service.eliminarReserva(8, 'Cambio de planes').subscribe();
    const remove = http.expectOne(`${environment.apiUrl}/reservas/8`);
    expect(remove.request.method).toBe('DELETE');
    remove.flush(null);
  });

  it('uses the database-backed location endpoints for CRUD requests', () => {
    const service = TestBed.inject(LocalizacionService);
    service.guardarCiudad({ nombre: 'Palmira', ID_departamento: 4 }).subscribe();
    const create = http.expectOne(`${environment.apiUrl}/ciudades`);
    expect(create.request.method).toBe('POST');
    create.flush({ ID_ciudad: 2, nombre: 'Palmira', ID_departamento: 4 });

    service.actualizarCiudad(2, { nombre: 'Cali', ID_departamento: 4 }).subscribe();
    const update = http.expectOne(`${environment.apiUrl}/ciudades/2`);
    expect(update.request.method).toBe('PUT');
    update.flush({ ID_ciudad: 2, nombre: 'Cali', ID_departamento: 4 });
  });

  it('registers a user through the API and keeps it separate from a demo account', async () => {
    const service = TestBed.inject(AuthService);
    const registration = service.registrar({
      nombre: 'Ana Pérez',
      email: 'ana@example.com',
      telefono: '3001234567',
      ID_ciudad: 1,
      password: 'clave-segura-123',
    });
    const request = http.expectOne(`${environment.apiUrl}/auth/register`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body.email).toBe('ana@example.com');
    request.flush({ usuario: {}, token: 'token' });
    await registration;
    expect(service.usuarioActual()).toBeNull();
  });
});
