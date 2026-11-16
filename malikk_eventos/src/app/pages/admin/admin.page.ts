import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Usuario, TipoPerfil } from '../../models/usuario.model';
import { Ciudad } from '../../models/localizacion.model';
import { AuthService } from '../../services/auth.service';
import { LocalizacionService } from '../../services/localizacion.service';
import { mensajeErrorApi } from '../../services/api-error';

@Component({
  selector: 'app-admin.page',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin.page.html',
  styleUrl: './admin.page.scss',
})
export class AdminPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly localizacionService = inject(LocalizacionService);
  autenticado = this.authService.tienePerfil('Administrador');
  mensaje = '';
  ciudades: Ciudad[] = [];
  usuarios: Usuario[] = [];
  usuarioEditando: number | null = null;
  readonly perfiles: TipoPerfil[] = ['Cliente', 'Agente', 'Administrador'];
  readonly credenciales = { email: '', password: '' };
  readonly agente = {
    nombre: '',
    email: '',
    telefono: '',
    ID_ciudad: null as number | null,
    password: '',
    confirmarPassword: '',
  };

  ngOnInit(): void {
    this.localizacionService.obtenerCiudades().subscribe({
      next: (ciudades) => (this.ciudades = ciudades),
      error: () => (this.mensaje = 'No se pudieron cargar las ciudades.'),
    });
    if (this.autenticado) this.cargarUsuarios();
  }

  async iniciarSesion(form: NgForm): Promise<void> {
    this.mensaje = '';
    if (form.invalid) return;
    try {
      await this.authService.iniciarSesionAdmin(this.credenciales.email, this.credenciales.password);
      this.autenticado = true;
      this.credenciales.password = '';
      this.cargarUsuarios();
    } catch (error) {
      this.mensaje = this.mensajeDe(error, 'No se pudo iniciar sesión.');
    }
  }

  async registrarAgente(form: NgForm): Promise<void> {
    this.mensaje = '';
    if (form.invalid) return;
    if (this.agente.password !== this.agente.confirmarPassword) {
      this.mensaje = 'Las contraseñas no coinciden.';
      return;
    }
    if (this.agente.ID_ciudad === null) {
      this.mensaje = 'Selecciona la ciudad del agente.';
      return;
    }
    try {
      const { confirmarPassword: _confirmacion, ...datos } = this.agente;
      await this.authService.registrarAgente({
        ...datos,
        ID_ciudad: this.agente.ID_ciudad!,
      });
      this.mensaje = 'Agente registrado.';
      form.resetForm();
    } catch (error) {
      this.mensaje = this.mensajeDe(error, 'No se pudo registrar el agente.');
    }
  }

  editarUsuario(usuario: Usuario): void {
    this.usuarioEditando = usuario.ID_usuario;
  }

  cancelarEdicion(): void {
    this.usuarioEditando = null;
  }

  async guardarUsuario(usuario: Usuario): Promise<void> {
    this.mensaje = '';
    try {
      const actualizado = await firstValueFrom(
        this.authService.actualizarUsuario(usuario.ID_usuario, {
          nombre: usuario.nombre,
          email: usuario.email,
          telefono: usuario.telefono,
          ID_ciudad: usuario.ID_ciudad ?? undefined,
          tipo_usuario: usuario.tipo_usuario,
        }),
      );
      this.usuarios = this.usuarios.map((item) =>
        item.ID_usuario === actualizado.ID_usuario ? actualizado : item,
      );
      this.usuarioEditando = null;
      this.mensaje = 'Cambios guardados.';
    } catch (error) {
      this.mensaje = this.mensajeDe(error, 'No se pudo actualizar el usuario.');
    }
  }

  async eliminarUsuario(usuario: Usuario): Promise<void> {
    if (usuario.ID_usuario === this.authService.usuarioActual()?.ID_usuario) {
      this.mensaje = 'No puedes eliminar tu propia cuenta.';
      return;
    }
    this.mensaje = '';
    try {
      await firstValueFrom(this.authService.eliminarUsuario(usuario.ID_usuario));
      this.usuarios = this.usuarios.filter((item) => item.ID_usuario !== usuario.ID_usuario);
      this.mensaje = 'Usuario eliminado.';
    } catch (error) {
      this.mensaje = this.mensajeDe(error, 'No se pudo eliminar el usuario.');
    }
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.autenticado = false;
    this.usuarios = [];
    this.mensaje = '';
  }

  private cargarUsuarios(): void {
    this.authService.obtenerUsuarios().subscribe({
      next: (usuarios) => (this.usuarios = usuarios),
      error: (error: unknown) => (this.mensaje = this.mensajeDe(error, 'No se pudieron cargar los usuarios.')),
    });
  }

  private mensajeDe(error: unknown, predeterminado: string): string {
    return mensajeErrorApi(error, predeterminado);
  }
}
