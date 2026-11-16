import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-cliente.page',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './cliente.page.html',
  styleUrl: './cliente.page.scss',
})
export class ClientePage {
  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  cerrarSesion(): void {
    this.auth.cerrarSesion();
    void this.router.navigate(['/login']);
  }
}
