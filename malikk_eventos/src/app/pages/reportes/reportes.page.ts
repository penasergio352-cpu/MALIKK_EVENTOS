import { Component, OnInit, inject } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReporteAdministrador } from '../../models/reporte.model';
import { ReportesService } from '../../services/reportes.service';
import { mensajeErrorApi } from '../../services/api-error';

@Component({
  selector: 'app-reportes-page',
  imports: [RouterLink, SlicePipe],
  templateUrl: './reportes.page.html',
  styleUrl: './reportes.page.scss',
})
export class ReportesPage implements OnInit {
  private readonly service = inject(ReportesService);
  reporte: ReporteAdministrador | null = null;
  mensaje = '';

  ngOnInit(): void {
    this.service.obtenerReporte().subscribe({
      next: (reporte) => (this.reporte = reporte),
      error: (error: unknown) => (this.mensaje = mensajeErrorApi(error, 'No se pudo cargar el reporte.')),
    });
  }
}
