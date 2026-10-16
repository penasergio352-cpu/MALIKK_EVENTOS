import { Routes } from '@angular/router';
import { AdminPage } from './pages/admin/admin.page';
import { AgentePage } from './pages/agente/agente.page';
import { AgenteEventosPage } from './pages/agente-eventos/agente-eventos.page';
import { AgenteReservaPage } from './pages/agente-reserva/agente-reserva.page';
import { ClientePage } from './pages/cliente/cliente.page';
import { ClienteEventosPage } from './pages/cliente-eventos/cliente-eventos.page';
import { LoginPage } from './pages/login/login.page';
import { RegisterPage } from './pages/register/register.page';
import { ClienteReservaPage } from './pages/cliente-reserva/cliente-reserva.page';
import { ClienteEventoReservaPage } from './pages/cliente-evento-reserva/cliente-evento-reserva.page';
import { EventosPage } from './pages/eventos/eventos.page';
import { ReservasPage } from './pages/reservas/reservas.page';
import { perfilGuard } from './services/perfil.guard';

export const routes: Routes = [
  { path: 'admin', component: AdminPage },
  {
    path: 'agente',
    component: AgentePage,
    canActivate: [perfilGuard],
    data: { perfil: 'Agente' },
    children: [
      { path: '', redirectTo: 'evento-agente', pathMatch: 'full' },
      { path: 'evento-agente', component: AgenteEventosPage },
      { path: 'agente-reserva', component: AgenteReservaPage },
    ],
  },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  {
    path: 'cliente',
    component: ClientePage,
    canActivate: [perfilGuard],
    data: { perfil: 'Cliente' },
    children: [
      { path: '', redirectTo: 'cliente-evento', pathMatch: 'full' },
      { path: 'cliente-reserva', component: ClienteReservaPage },
      { path: 'cliente-evento', component: ClienteEventosPage },
      { path: 'cliente-evento-reserva', component: ClienteEventoReservaPage },
    ],
  },
  { path: 'eventos', component: EventosPage },
  { path: 'reservas', component: ReservasPage },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];