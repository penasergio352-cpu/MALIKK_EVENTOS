import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ReporteAdministrador } from '../models/reporte.model';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly http = inject(HttpClient);

  obtenerReporte(): Observable<ReporteAdministrador> {
    return this.http.get<ReporteAdministrador>(`${environment.apiUrl}/admin/reportes`);
  }
}
