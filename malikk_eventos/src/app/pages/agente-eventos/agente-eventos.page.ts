import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { EventoCardComponent } from '../../components/evento-card/evento-card.component';
import { Evento } from '../../models/evento.model';
import { EventosService } from '../../services/eventos.service';
import { Ciudad } from '../../models/localizacion.model';
import { LocalizacionService } from '../../services/localizacion.service';
import { mensajeErrorApi } from '../../services/api-error';

interface EventoFormValues {
  nombre: string;
  teatro: string;
  imagenUrl: string;
  fecha_inicio: string;
  fecha_fin: string;
  hora_inicio: number | null;
  hora_fin: number | null;
  descripcion: string;
  precio_base_entrada: number | null;
  precio_base: number | null;
  capacidad_total: number | null;
  observaciones: string;
  ID_ciudad: number | null;
}

@Component({
  selector: 'app-agente-eventos.page',
  imports: [EventoCardComponent, FormsModule],
  templateUrl: './agente-eventos.page.html',
  styleUrl: './agente-eventos.page.scss',
})
export class AgenteEventosPage {
  private readonly eventosService = inject(EventosService);
  private readonly localizacionService = inject(LocalizacionService);
  private readonly destroyRef = inject(DestroyRef);
  readonly eventos = signal<Evento[]>([]);
  readonly ciudades = signal<Ciudad[]>([]);
  eventoForm: EventoFormValues = this.formularioVacio();
  eventoEditando: number | null = null;
  mensaje = '';
  mensajeImagen = '';
  nombreImagen = '';
  imagenArrastrada = false;

  constructor() {
    this.localizacionService.obtenerCiudades().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (ciudades) => this.ciudades.set(ciudades),
      error: () => (this.mensaje = 'No se pudieron cargar las ciudades.'),
    });
    this.eventosService.obtenerEventos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (eventos) => this.eventos.set(eventos),
      error: () => {
        this.mensaje = 'No se pudieron cargar los eventos.';
      },
    });
  }

  guardarEvento(form: NgForm): void {
    if (!form.valid || !this.formFechasYHorasValidas()) {
      this.mensaje = 'Revisa los datos y el rango de fechas y horas.';
      return;
    }

    const fechaInicio = new Date(`${this.eventoForm.fecha_inicio}T00:00:00`);
    const fechaFin = new Date(`${this.eventoForm.fecha_fin}T00:00:00`);

    const datos = {
      nombre: this.eventoForm.nombre.trim(),
      teatro: this.eventoForm.teatro.trim(),
      imagenUrl: this.eventoForm.imagenUrl || undefined,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      hora_inicio: this.eventoForm.hora_inicio!,
      hora_fin: this.eventoForm.hora_fin!,
      descripcion: this.eventoForm.descripcion.trim(),
      precio_base_entrada: this.eventoForm.precio_base_entrada!,
      precio_base: this.eventoForm.precio_base!,
      capacidad_total: this.eventoForm.capacidad_total!,
      observaciones: this.eventoForm.observaciones.trim(),
      ID_ciudad: this.eventoForm.ID_ciudad,
    };
    const request = this.eventoEditando === null
      ? this.eventosService.registrarEvento(datos)
      : this.eventosService.actualizarEvento(this.eventoEditando, datos);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (evento) => {
        this.eventos.update((eventos) => this.eventoEditando === null
          ? [...eventos, evento]
          : eventos.map((item) => item.ID_evento === evento.ID_evento ? evento : item));
        this.mensaje = this.eventoEditando === null ? 'Evento registrado.' : 'Evento actualizado.';
        this.limpiarFormulario(form);
      },
      error: (error: unknown) => {
        this.mensaje = this.mensajeDe(error, 'No se pudo guardar el evento.');
      },
    });
  }

  editarEvento(evento: Evento): void {
    this.eventoEditando = evento.ID_evento;
    this.eventoForm = {
      nombre: evento.nombre,
      teatro: evento.teatro,
      imagenUrl: evento.imagenUrl ?? '',
      fecha_inicio: this.fechaInput(evento.fecha_inicio),
      fecha_fin: this.fechaInput(evento.fecha_fin),
      hora_inicio: evento.hora_inicio,
      hora_fin: evento.hora_fin,
      descripcion: evento.descripcion,
      precio_base_entrada: evento.precio_base_entrada,
      precio_base: evento.precio_base,
      capacidad_total: evento.capacidad_total,
      observaciones: evento.observaciones,
      ID_ciudad: evento.ID_ciudad ?? null,
    };
    this.mensaje = '';
  }

  eliminarEvento(evento: Evento): void {
    const causa = window.prompt('Indica la causa de cancelación del evento:');
    if (!causa?.trim()) {
      this.mensaje = 'Debes indicar una causa para cancelar el evento.';
      return;
    }

    this.eventosService.eliminarEvento(evento.ID_evento, causa.trim()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.eventos.update((eventos) => eventos.filter((item) => item.ID_evento !== evento.ID_evento));
        this.mensaje = 'Evento cancelado.';
      },
      error: (error: unknown) => {
        this.mensaje = this.mensajeDe(error, 'No se pudo eliminar el evento.');
      },
    });
  }

  limpiarFormulario(form?: NgForm): void {
    form?.resetForm();
    this.eventoEditando = null;
    this.eventoForm = this.formularioVacio();
    this.mensajeImagen = '';
    this.nombreImagen = '';
  }

  private fechaInput(fecha: Date | string): string {
    return typeof fecha === 'string' ? fecha.slice(0, 10) : fecha.toISOString().slice(0, 10);
  }

  private mensajeDe(error: unknown, predeterminado: string): string {
    return mensajeErrorApi(error, predeterminado);
  }

  seleccionarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.procesarImagen(input.files?.[0]);
    input.value = '';
  }

  permitirSoltarImagen(event: DragEvent): void {
    event.preventDefault();
    this.imagenArrastrada = true;
  }

  dejarDeArrastrarImagen(event: DragEvent): void {
    event.preventDefault();
    this.imagenArrastrada = false;
  }

  soltarImagen(event: DragEvent): void {
    event.preventDefault();
    this.imagenArrastrada = false;
    this.procesarImagen(event.dataTransfer?.files[0]);
  }

  pegarImagen(event: ClipboardEvent): void {
    const item = Array.from(event.clipboardData?.items ?? []).find((clipboardItem) =>
      clipboardItem.type.startsWith('image/'),
    );
    const archivo = item?.getAsFile();
    if (archivo) {
      event.preventDefault();
      this.procesarImagen(archivo);
    }
  }

  quitarImagen(): void {
    this.eventoForm.imagenUrl = '';
    this.nombreImagen = '';
    this.mensajeImagen = '';
  }

  private procesarImagen(archivo?: File | null): void {
    if (!archivo) {
      return;
    }

    const formatosPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!formatosPermitidos.includes(archivo.type)) {
      this.mensajeImagen = 'Usa una imagen JPG, PNG, WebP o GIF.';
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      this.mensajeImagen = 'La imagen debe pesar 5 MB o menos.';
      return;
    }

    const lector = new FileReader();
    lector.onload = () => {
      if (typeof lector.result !== 'string') {
        this.mensajeImagen = 'No se pudo leer la imagen.';
        return;
      }

      this.eventoForm.imagenUrl = lector.result;
      this.nombreImagen = archivo.name || 'Imagen pegada';
      this.mensajeImagen = 'Imagen lista para el evento.';
    };
    lector.onerror = () => {
      this.mensajeImagen = 'No se pudo leer la imagen.';
    };
    lector.readAsDataURL(archivo);
  }

  private formFechasYHorasValidas(): boolean {
    const { fecha_inicio, fecha_fin, hora_inicio, hora_fin } = this.eventoForm;
    return Boolean(
      fecha_inicio &&
        fecha_fin &&
        fecha_inicio <= fecha_fin &&
        hora_inicio !== null &&
        hora_inicio >= 0 &&
        hora_inicio <= 23 &&
        hora_fin !== null &&
        hora_fin >= 0 &&
        hora_fin <= 23,
    );
  }

  private formularioVacio(): EventoFormValues {
    return {
      nombre: '',
      teatro: '',
      imagenUrl: '',
      fecha_inicio: '',
      fecha_fin: '',
      hora_inicio: null,
      hora_fin: null,
      descripcion: '',
      precio_base_entrada: null,
      precio_base: null,
      capacidad_total: null,
      observaciones: '',
      ID_ciudad: null,
    };
  }
}
