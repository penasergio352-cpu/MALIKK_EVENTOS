import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DatosRegistro, MockAuthService } from '../../services/mock-auth.service';

@Component({
  selector: 'app-admin.page',
  imports: [FormsModule],
  templateUrl: './admin.page.html',
  styleUrl: './admin.page.scss',
})
export class AdminPage {
  autenticado: boolean;
  mensaje = '';
  readonly credenciales = { email: '', password: '' };
  readonly agente: DatosRegistro & { confirmarPassword: string } = {
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    confirmarPassword: '',
  };

  constructor(private readonly authService: MockAuthService) {
    this.autenticado = this.authService.tienePerfil('Administrador');
  }

  iniciarSesion(form: NgForm): void {
    this.mensaje = '';
    if (form.invalid) return;

    try {
      this.authService.iniciarSesionAdmin(this.credenciales.email, this.credenciales.password);
      this.autenticado = true;
      this.credenciales.password = '';
    } catch (error) {
      this.mensaje = error instanceof Error ? error.message : 'No se pudo iniciar sesión.';
    }
  }

  async registrarAgente(form: NgForm): Promise<void> {
    this.mensaje = '';
    if (form.invalid) return;

    if (this.agente.password !== this.agente.confirmarPassword) {
      this.mensaje = 'Las contraseñas no coinciden.';
      return;
    }

    try {
      await this.authService.registrarAgente({
        nombre: this.agente.nombre,
        email: this.agente.email,
        telefono: this.agente.telefono,
        password: this.agente.password,
      });
      this.mensaje = 'Agente registrado. Ya puede iniciar sesión.';
      form.resetForm();
    } catch (error) {
      this.mensaje = error instanceof Error ? error.message : 'No se pudo registrar el agente.';
    }
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.autenticado = false;
    this.mensaje = '';
  }
}
