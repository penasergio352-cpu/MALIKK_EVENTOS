import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MockAuthService, TipoPerfil } from './mock-auth.service';

export const perfilGuard: CanActivateFn = (route) => {
  const authService = inject(MockAuthService);
  const router = inject(Router);
  const perfil = route.data['perfil'] as TipoPerfil;

  if (authService.tienePerfil(perfil)) {
    return true;
  }

  return router.createUrlTree([perfil === 'Agente' ? '/login' : '/login']);
};