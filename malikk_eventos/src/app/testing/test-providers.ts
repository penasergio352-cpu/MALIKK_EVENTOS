import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { EventosService } from '../services/eventos.service';
import { LocalizacionService } from '../services/localizacion.service';
import { ReportesService } from '../services/reportes.service';
import { ReservasService } from '../services/reservas.service';

export function provideAppTestConfig() {
  return [
    provideRouter([]),
    provideHttpClient(),
    {
      provide: EventosService,
      useValue: {
        obtenerEventos: () => of([]),
        obtenerEventoPorId: () => of(undefined),
        registrarEvento: () => of({}),
        actualizarEvento: () => of({}),
        eliminarEvento: () => of(undefined),
      },
    },
    {
      provide: ReservasService,
      useValue: {
        obtenerReservas: () => of([]),
        obtenerReserva: () => of({}),
        registrarReserva: () => of({}),
        actualizarReserva: () => of({}),
        eliminarReserva: () => of(undefined),
      },
    },
    {
      provide: LocalizacionService,
      useValue: {
        obtenerPaises: () => of([]),
        obtenerDepartamentos: () => of([]),
        obtenerCiudades: () => of([]),
      },
    },
    {
      provide: ReportesService,
      useValue: {
        obtenerReporte: () => of({
          totales: { clientes: 0, agentes: 0, administradores: 0, reservas: 0, eventos: 0 },
          eventos: [],
          reservasPorEstado: [],
          usuariosPorPerfil: [],
          eventosPorUbicacion: [],
          reservasPorEventoMes: [],
          ingresosPorMes2026: [],
          eventosPorAgenteCiudad: [],
          historialReservas: [],
          reservasCanceladas: [],
          eventosCancelados: [],
        }),
      },
    },
  ];
}
