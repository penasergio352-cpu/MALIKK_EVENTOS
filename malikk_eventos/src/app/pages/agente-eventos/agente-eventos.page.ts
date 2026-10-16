import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { EventoCardComponent } from '../../components/evento-card/evento-card.component';
import { Evento } from '../../models/evento.model';
import { MockEventosService } from '../../services/mock-eventos.service';

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
}

@Component({
  selector: 'app-agente-eventos.page',
  imports: [EventoCardComponent, FormsModule],
  templateUrl: './agente-eventos.page.html',
  styleUrl: './agente-eventos.page.scss',
})
export class AgenteEventosPage {
  eventos: Evento[];
  eventoForm: EventoFormValues = this.formularioVacio();
  mensaje = '';
  mensajeImagen = '';
  nombreImagen = '';
  imagenArrastrada = false;

  constructor(private readonly eventosService: MockEventosService) {
    this.eventos = eventosService.obtenerEventos();
  }

  registrarEvento(form: NgForm): void {
    if (!form.valid || !this.formFechasYHorasValidas()) {
      this.mensaje = 'Revisa los datos y el rango de fechas y horas.';
      return;
    }

    const fechaInicio = new Date(`${this.eventoForm.fecha_inicio}T00:00:00`);
    const fechaFin = new Date(`${this.eventoForm.fecha_fin}T00:00:00`);

    this.eventosService.registrarEvento({
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
    });

    this.eventos = this.eventosService.obtenerEventos();
    this.mensaje = 'Evento registrado.';
    form.resetForm();
    this.eventoForm = this.formularioVacio();
    this.mensajeImagen = '';
    this.nombreImagen = '';
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
    };
  }
}
