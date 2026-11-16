import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Ciudad } from '../../models/localizacion.model';
import { AuthService } from '../../services/auth.service';
import { LocalizacionService } from '../../services/localizacion.service';
import { mensajeErrorApi } from '../../services/api-error';

@Component({
  selector: 'app-register.page',
  imports: [FormsModule],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss',
})
export class RegisterPage implements OnInit {
  private readonly localizacionService = inject(LocalizacionService);
  ciudades: Ciudad[] = [];
  readonly formulario = {
    nombre: '',
    email: '',
    telefono: '',
    ID_ciudad: null as number | null,
    password: '',
    confirmarPassword: '',
  };
  mensaje = '';
  mensajeCiudades = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.localizacionService.obtenerCiudades().subscribe({
      next: (ciudades) => (this.ciudades = ciudades),
      error: () => (this.mensajeCiudades = 'No se pudieron cargar las ciudades.'),
    });
  }

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
        ID_ciudad: this.formulario.ID_ciudad!,
        password: this.formulario.password,
      });

      await this.router.navigate(['/login'], {
        queryParams: { registrado: '1', email: this.formulario.email.trim() },
      });
    } catch (error) {
      this.mensaje = mensajeErrorApi(error, 'No se pudo crear la cuenta.');
    }
  }
}
