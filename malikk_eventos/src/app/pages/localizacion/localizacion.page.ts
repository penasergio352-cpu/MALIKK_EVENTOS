import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Ciudad, Departamento, Pais } from '../../models/localizacion.model';
import { LocalizacionService } from '../../services/localizacion.service';
import { mensajeErrorApi } from '../../services/api-error';

@Component({
  selector: 'app-localizacion-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './localizacion.page.html',
  styleUrl: './localizacion.page.scss',
})
export class LocalizacionPage implements OnInit {
  private readonly service = inject(LocalizacionService);
  paises: Pais[] = [];
  departamentos: Departamento[] = [];
  ciudades: Ciudad[] = [];
  mensaje = '';
  editandoPais: number | null = null;
  editandoDepartamento: number | null = null;
  editandoCiudad: number | null = null;
  readonly pais = { nombre: '' };
  readonly departamento: { nombre: string; ID_pais: number | null } = { nombre: '', ID_pais: null };
  readonly ciudad: { nombre: string; ID_departamento: number | null } = { nombre: '', ID_departamento: null };

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    forkJoin({
      paises: this.service.obtenerPaises(),
      departamentos: this.service.obtenerDepartamentos(),
      ciudades: this.service.obtenerCiudades(),
    }).subscribe({
      next: (datos) => {
        this.paises = datos.paises;
        this.departamentos = datos.departamentos;
        this.ciudades = datos.ciudades;
      },
      error: (error: unknown) => (this.mensaje = this.mensajeDe(error)),
    });
  }

  guardarPais(form: NgForm): void {
    const request = this.editandoPais === null
      ? this.service.guardarPais(this.pais)
      : this.service.actualizarPais(this.editandoPais, this.pais);
    request.subscribe({
      next: () => {
        form.resetForm();
        this.editandoPais = null;
        this.mensaje = 'País guardado.';
        this.cargar();
      },
      error: (error: unknown) => (this.mensaje = this.mensajeDe(error)),
    });
  }

  editarPais(pais: Pais): void {
    this.editandoPais = pais.ID_pais;
    this.pais.nombre = pais.nombre;
  }

  eliminarPais(id: number): void {
    this.service.eliminarPais(id).subscribe({
      next: () => {
        this.mensaje = 'País eliminado.';
        this.cargar();
      },
      error: (error: unknown) => (this.mensaje = this.mensajeDe(error)),
    });
  }

  guardarDepartamento(form: NgForm): void {
    if (this.departamento.ID_pais === null) return;
    const datos = { ...this.departamento, ID_pais: Number(this.departamento.ID_pais) };
    const request = this.editandoDepartamento === null
      ? this.service.guardarDepartamento(datos)
      : this.service.actualizarDepartamento(this.editandoDepartamento, datos);
    request.subscribe({
      next: () => {
        form.resetForm();
        this.editandoDepartamento = null;
        this.departamento.ID_pais = null;
        this.mensaje = 'Departamento guardado.';
        this.cargar();
      },
      error: (error: unknown) => (this.mensaje = this.mensajeDe(error)),
    });
  }

  editarDepartamento(departamento: Departamento): void {
    this.editandoDepartamento = departamento.ID_departamento;
    this.departamento.nombre = departamento.nombre;
    this.departamento.ID_pais = departamento.ID_pais;
  }

  eliminarDepartamento(id: number): void {
    this.service.eliminarDepartamento(id).subscribe({
      next: () => {
        this.mensaje = 'Departamento eliminado.';
        this.cargar();
      },
      error: (error: unknown) => (this.mensaje = this.mensajeDe(error)),
    });
  }

  guardarCiudad(form: NgForm): void {
    if (this.ciudad.ID_departamento === null) return;
    const datos = { ...this.ciudad, ID_departamento: Number(this.ciudad.ID_departamento) };
    const request = this.editandoCiudad === null
      ? this.service.guardarCiudad(datos)
      : this.service.actualizarCiudad(this.editandoCiudad, datos);
    request.subscribe({
      next: () => {
        form.resetForm();
        this.editandoCiudad = null;
        this.ciudad.ID_departamento = null;
        this.mensaje = 'Ciudad guardada.';
        this.cargar();
      },
      error: (error: unknown) => (this.mensaje = this.mensajeDe(error)),
    });
  }

  editarCiudad(ciudad: Ciudad): void {
    this.editandoCiudad = ciudad.ID_ciudad;
    this.ciudad.nombre = ciudad.nombre;
    this.ciudad.ID_departamento = ciudad.ID_departamento;
  }

  eliminarCiudad(id: number): void {
    this.service.eliminarCiudad(id).subscribe({
      next: () => {
        this.mensaje = 'Ciudad eliminada.';
        this.cargar();
      },
      error: (error: unknown) => (this.mensaje = this.mensajeDe(error)),
    });
  }

  nombrePais(id: number): string {
    return this.paises.find((item) => item.ID_pais === id)?.nombre ?? 'País no disponible';
  }

  nombreDepartamento(id: number): string {
    return this.departamentos.find((item) => item.ID_departamento === id)?.nombre ?? 'Departamento no disponible';
  }

  private mensajeDe(error: unknown): string {
    return mensajeErrorApi(error, 'No se pudo completar la operación.');
  }
}
