import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TipoPerfil } from '../models/usuario.model';
import { AuthService } from './auth.service';

export const perfilGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const perfil = route.data['perfil'] as TipoPerfil;

  if (authService.tienePerfil(perfil)) {
    return true;
  }

  return router.createUrlTree(['/login']);
};