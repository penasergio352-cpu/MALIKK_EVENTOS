import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { mensajeErrorApi } from '../../services/api-error';

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
    private readonly authService: AuthService,
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
      const destino = {
        Administrador: '/admin',
        Agente: '/agente',
        Cliente: '/cliente',
      }[perfil.tipo_usuario];
      await this.router.navigate([destino]);
    } catch (error) {
      this.mensajeError = mensajeErrorApi(error, 'No se pudo iniciar sesión.');
    }
  }
}
