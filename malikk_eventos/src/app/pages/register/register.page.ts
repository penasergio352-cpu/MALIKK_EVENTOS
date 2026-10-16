import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { MockAuthService } from '../../services/mock-auth.service';

@Component({
  selector: 'app-register.page',
  imports: [FormsModule],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss',
})
export class RegisterPage {
  readonly formulario = {
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    confirmarPassword: '',
  };
  mensaje = '';

  constructor(
    private readonly authService: MockAuthService,
    private readonly router: Router,
  ) {}

  async registrar(form: NgForm): Promise<void> {
    this.mensaje = '';
    if (form.invalid) {
      return;
    }

    if (this.formulario.password !== this.formulario.confirmarPassword) {
      this.mensaje = 'Las contraseñas no coinciden.';
      return;
    }

    try {
      await this.authService.registrar({
        nombre: this.formulario.nombre,
        email: this.formulario.email,
        telefono: this.formulario.telefono,
        password: this.formulario.password,
      });

      await this.router.navigate(['/login'], {
        queryParams: { registrado: '1', email: this.formulario.email.trim() },
      });
    } catch (error) {
      this.mensaje = error instanceof Error ? error.message : 'No se pudo crear la cuenta.';
    }
  }
}
