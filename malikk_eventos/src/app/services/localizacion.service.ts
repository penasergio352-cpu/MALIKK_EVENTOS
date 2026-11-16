import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Ciudad, Departamento, Pais } from '../models/localizacion.model';

@Injectable({ providedIn: 'root' })
export class LocalizacionService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;

  obtenerPaises(): Observable<Pais[]> {
    return this.http.get<Pais[]>(`${this.url}/paises`);
  }

  guardarPais(datos: Pick<Pais, 'nombre'>): Observable<Pais> {
    return this.http.post<Pais>(`${this.url}/paises`, datos);
  }

  actualizarPais(id: number, datos: Pick<Pais, 'nombre'>): Observable<Pais> {
    return this.http.put<Pais>(`${this.url}/paises/${id}`, datos);
  }

  eliminarPais(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/paises/${id}`);
  }

  obtenerDepartamentos(): Observable<Departamento[]> {
    return this.http.get<Departamento[]>(`${this.url}/departamentos`);
  }

  guardarDepartamento(datos: Pick<Departamento, 'nombre' | 'ID_pais'>): Observable<Departamento> {
    return this.http.post<Departamento>(`${this.url}/departamentos`, datos);
  }

  actualizarDepartamento(id: number, datos: Pick<Departamento, 'nombre' | 'ID_pais'>): Observable<Departamento> {
    return this.http.put<Departamento>(`${this.url}/departamentos/${id}`, datos);
  }

  eliminarDepartamento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/departamentos/${id}`);
  }

  obtenerCiudades(): Observable<Ciudad[]> {
    return this.http.get<Ciudad[]>(`${this.url}/ciudades`);
  }

  guardarCiudad(datos: Pick<Ciudad, 'nombre' | 'ID_departamento'>): Observable<Ciudad> {
    return this.http.post<Ciudad>(`${this.url}/ciudades`, datos);
  }

  actualizarCiudad(id: number, datos: Pick<Ciudad, 'nombre' | 'ID_departamento'>): Observable<Ciudad> {
    return this.http.put<Ciudad>(`${this.url}/ciudades/${id}`, datos);
  }

  eliminarCiudad(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/ciudades/${id}`);
  }
}
