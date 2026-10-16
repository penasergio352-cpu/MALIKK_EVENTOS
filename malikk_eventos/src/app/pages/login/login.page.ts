import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MockAuthService } from '../../services/mock-auth.service';

@Component({
  selector: 'app-login.page',
  imports: [FormsModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  readonly formulario: { email: string; password: string };
  readonly mensajeRegistro: boolean;
  mensajeError = '';

  constructor(
    route: ActivatedRoute,
    private readonly authService: MockAuthService,
    private readonly router: Router,
  ) {
    this.formulario = {
      email: route.snapshot.queryParamMap.get('email') ?? '',
      password: '',
    };
    this.mensajeRegistro = route.snapshot.queryParamMap.get('registrado') === '1';
  }

  async iniciarSesion(form: NgForm): Promise<void> {
    this.mensajeError = '';
    if (form.invalid) {
      return;
    }

    try {
      const perfil = await this.authService.iniciarSesion(
        this.formulario.email,
        this.formulario.password,
      );
      await this.router.navigate([perfil.tipo_usuario === 'Agente' ? '/agente' : '/cliente']);
    } catch (error) {
      this.mensajeError = error instanceof Error ? error.message : 'No se pudo iniciar sesión.';
    }
  }
}
