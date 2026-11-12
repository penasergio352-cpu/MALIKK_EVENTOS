import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { EventosService } from './services/eventos.service';
import { HttpEventosService } from './services/http-eventos.service';
import { MockEventosService } from './services/mock-eventos.service';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    // Para conectar el backend, cambiar MockEventosService por HttpEventosService.
    { provide: EventosService, useClass: MockEventosService },
  ]
};
