import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-agente.page',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './agente.page.html',
  styleUrl: './agente.page.scss',
})
export class AgentePage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  cerrarSesion(): void {
    this.auth.cerrarSesion();
    void this.router.navigate(['/login']);
  }
}
